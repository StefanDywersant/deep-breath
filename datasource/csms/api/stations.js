'use strict';

var requests = require('./requests'),
	cheerio = require('cheerio'),
	q = require('q'),
	types = require('../../../types/types'),
	logger = require('../../../service/logger'),
	retry = require('../../../service/retry'),
	entities = require('entities'),
	redis = require('../../../service/redis'),
	rateLimit = require('q-ratelimit')(2000),
	config = require('config').datasource.csms;


var entitize = function(attributes) {
	var classification = function() {
		switch (attributes['Typ stacji']) {
			case 'tła miejskiego':
				return types.STATION.CLASSIFICATION.BACKGROUND_CITY;

			case 'komunikacyjna':
				return types.STATION.CLASSIFICATION.COMMUNICATION;

			case 'tła regionalnego':
				return types.STATION.CLASSIFICATION.BACKGROUND_REGIONAL;

			case 'w strefie oddziaływania przemysł':
				return types.STATION.CLASSIFICATION.INDUSTRIAL_ZONE;

			default:
				logger.warn(
					'[api.stations:classification] Unknown classification \'%s\' of station %s',
					attributes['Typ stacji'],
					attributes['Nazwa stacji']
				);
				return 0;
		}
	};


	var address = function() {
		if (!attributes['Adres'].trim())
			return {
				voivodeship: 'mazowieckie'
			};

		var address = {
				voivodeship: 'mazowieckie'
			},
			parts = attributes['Adres'].replace(/\r\n/g, ',')
				.replace(/\t/g, '')
				.replace(/<br>/g, ',')
				.split(',')
				.map((part) => part.trim());

		// extract city code
		for (let i = 0; i < parts.length; i++) {
			var matches = parts[i].match(/([0-9]{2}-[0-9]{3}) ([a-zA-Ząćęłńóżź ]+)/);

			if (matches) {
				address.code = matches[1];
				address.city = matches[2];
				parts.splice(i, 1);
				break;
			}
		}

		// extract street
		for (let i = 0; i < parts.length; i++) {
			if (parts[i].match(/ [0-9]+|[uU][lL]\./)) {
				address.street = parts[i].replace(/ul\. ?/, '');
				parts.splice(i, 1);

				break;
			}
		}

		return address;
	};


	var method = function() {
		return attributes['Sieć pomiarowa'].split(',').reduce(function(sum, m) {
			switch (m.trim()) {
				case 'Monitoring automatyczny':
					return sum | types.STATION.METHOD.AUTOMATIC;

				case 'Pomiary manualne':
					return sum | types.STATION.METHOD.MANUAL;

				default:
					logger.warn(
						'[api.stations:method] Unknown method \'%s\' of station %s',
						attributes['Sieć pomiarowa'],
						attributes['Nazwa stacji']
					);
					return sum;
			}
		}, 0);
	};


	var owner = function() {
		var o = entities.decodeHTML(attributes['Właściciel']),
			parts = o.split('<br>');

		return parts.map(function(p) {
			return p.replace(/\n/, '')
				.replace(/<a href="mailto:([a-zA-Z@\.]*)">([a-zA-Z@\.]*)<\/a>/, '$1')
				.trim();
		}).filter(function(p) {
			return !!p;
		}).join(', ');
	};

	var areaType = function() {
		switch (attributes['Typ obszaru']) {
			case 'miejski':
				return types.STATION.AREA_TYPE.URBAN;

			case 'podmiejski':
				return types.STATION.AREA_TYPE.SUBURBAN;

			case 'pozamiejski':
				return types.STATION.AREA_TYPE.EXTRA_URBAN;

			case 'pozamiejski - oddalony':
				return types.STATION.AREA_TYPE.FAR_EXTRA_URBAN;

			case 'wiejski':
				return types.STATION.AREA_TYPE.RURAL;

			default:
				logger.warn(
					'[api.stations:areaType] Unknown area type \'%s\' of station %s',
					attributes['Typ obszaru'],
					attributes['Nazwa stacji']
				);
				return 0;
		}
	};


	var location = function() {
		return {
			longitude: parseFloat(attributes.xml.long),
			latitude: parseFloat(attributes.xml.lat),
			altitude: (attributes['Wysokość n.p.m'] && attributes['Wysokość n.p.m'].trim())
				? parseInt(attributes['Wysokość n.p.m'])
				: null
		}
	};

	return {
		id: attributes.id,
		name: attributes['Nazwa stacji'].split('. ')[1],
		shortName: attributes['Krótka nazwa stacji'] || null,
		code: {
			country: attributes['Krajowy kod stacji'] || null,
			international: attributes['Międzynarodowy kod stacji'] || null
		},
		zone: attributes['Strefa'],
		address: address(),
		owner: owner(),
		location: location(),
		flags: method() | classification() | areaType()
	};
};


var stationsList = function() {
	return rateLimit()
		.then(() => requests.get(config.api.paths.stations))
		.then((xml) => {
			let $ = cheerio.load(xml);

			return $('station').map(function() {
				let properties = {};

				$(this).children().each(function() {
					properties[this.tagName] = $(this).text();
				});

				return properties;
			});
		})
		.then((stations) => Array.prototype.slice.call(stations))
		.then((stations) => {
			return stations.reduce((stations, station) => {
				if (!stations.find((s) => s.site_id == station.site_id))
					stations.push(station);

				return stations;
			}, [])
		})
};


var stationPage = function(stationXML) {
	var path = config.api.paths.station.replace('<id>', stationXML.site_id);

	var readAttributes = function(page, path, tab) {
		var $ = cheerio.load(page),
			attributes = {};

		if ($('#table ul.chs li.curr a').text() != tab)
			throw new Error(`Got different page than requested ;-) station_id=${stationXML.site_id} tab=${tab}`);

		$(path).each(function() {
			var $el = $(this),
				name = $el.text().trim();

			if (!name)
				return;

			if (name == 'Właściciel') {
				attributes[name] = $el.next('td').html().trim();
				return;
			}

			attributes[name] = $el.next('td').text().trim();
		});

		return attributes;
	};

	return q.all([
			rateLimit().then(() => requests.get(path.replace('<tab>', 1))),
			rateLimit().then(() => requests.get(path.replace('<tab>', 2)))
		])
		.spread(function(general, environment) {
			var attributes = {
				id: parseInt(stationXML.site_id),
				xml: stationXML
			};

			var generalAttributes = readAttributes(general, '#dscC tbody th', 'ogólnie'),
				environmentAttributes = readAttributes(environment, '#dscE tbody th', 'otoczenie');

			Object.keys(generalAttributes).forEach((key) => attributes[key] = generalAttributes[key]);
			Object.keys(environmentAttributes).forEach((key) => attributes[key] = environmentAttributes[key]);

			return entitize(attributes);
		});
};


var all = function() {
	return redis.get('api:stations')
		.then(function(stations) {
			if (stations)
				return stations;

			return stationsList()
				.then((stationsXML) => q.all(stationsXML.map((stationXML) => retry(() => stationPage(stationXML), 10))))
				.then((stations) => redis.set('api:stations', stations, config.stations.cache_ttl));
		});
};


var byId = function(id) {
	return all().then(function(stations) {
		return stations.reduce(function(found, station) {
			if (found)
				return found;

			return station.id == id ? station : null;
		}, null);
	});
};


var byChannel = function(channel) {
	return byId(channel.station_id);
};


module.exports = {all, byId, byChannel};