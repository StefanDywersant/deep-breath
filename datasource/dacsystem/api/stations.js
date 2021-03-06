'use strict';

var requests = require('./requests'),
	cheerio = require('cheerio'),
	q = require('q'),
	types = require('../../../types/types'),
	logger = require('../../../service/logger'),
	entities = require('entities'),
	redis = require('../../../service/redis'),
	config = require('config').datasource.dacsystem,
	channels = require('./channels'),
	origin = require('../config/origin');


var entitize = function(attributes) {
	var classification = function() {
		switch (attributes['Klasyfikacja stacji']) {
			case 'tła':
				return types.STATION.CLASSIFICATION.BACKGROUND;

			case 'komunikacyjna':
				return types.STATION.CLASSIFICATION.COMMUNICATION;

			default:
				logger.warn(
					'[api.stations:classification] Unknown classification \'%s\' of station %s',
					attributes['Klasyfikacja stacji'],
					attributes['Nazwa stacji']
				);
				return 0;
		}
	};


	var address = function() {
		if (!attributes['Adres'].trim())
			return {
				voivodeship: origin.voivodeship
			};

		var address = {
				voivodeship: origin.voivodeship
			},
			parts = attributes['Adres'].split(',').map(function(part) {
				return part.trim();
			});

		// extract city code
		for (let i = 0; i < parts.length; i++) {
			if (parts[i].match(/[0-9]{2}-[0-9]{3}/)) {
				address.code = parts[i];
				parts.splice(i, 1);
				break;
			}
		}

		// extract street
		for (let i = 0; i < parts.length; i++) {
			if (parts[i].match(/ [0-9]+|[uU][lL]\./)) {
				address.street = parts[i].replace(/ul\. ?/, '');
				parts.splice(i, 1);

				// extract city
				if (parts.length == 1) {
					address.city = parts[0];
					return address;
				}

				break;
			}
		}

		// guess city
		for (let i = 0; i < parts.length; i++) {
			if (config.address.cities.indexOf(parts[i]) > -1) {
				address.city = parts[i]
					.replace('Wroc��aw', 'Wrocław')
					.replace('Gorzow Wlkp', 'Gorzów Wlkp')
					.replace('Zielona Gora', 'Zielona Góra');
				parts.splice(i, 1);

				// extract street
				if (parts.length == 1) {
					address.street = parts[0];
					return address;
				}

				break;
			}
		}

		return address;
	};


	var method = function() {
		return attributes['Metoda pomiaru'].split(',').reduce(function(sum, m) {
			switch (m.trim()) {
				case 'automatyczny':
					return sum | types.STATION.METHOD.AUTOMATIC;

				case 'manualny':
					return sum | types.STATION.METHOD.MANUAL;

				default:
					logger.warn(
						'[api.stations:method] Unknown method \'%s\' of station %s',
						attributes['Metoda pomiaru'],
						attributes['Nazwa stacji']
					);
					return sum;
			}
		}, 0);
	};


	var owner = function() {
		var o = entities.decodeHTML(attributes['Właściciel']),
			parts = o.split('<div class="a-spacer"></div>');

		return parts.reduce(function(owner, p) {
			return owner.concat(p.split('<br>'));
		}, []).map(function(p) {
			return p.replace(/\n/, '').trim();
		}).filter(function(p) {
			return !!p;
		}).join(', ');
	};


	var purpose = function() {
		switch (attributes['Cel pomiarowy']) {
			case 'ochrona zdrowia ludzi':
			case 'zdrowie ludzkie':
				return types.STATION.PURPOSE.HUMAN_HEALTH_PROTECTION;

			case 'ochrona roślin':
				return types.STATION.PURPOSE.PLANT_PROTECTION;

			default:
				logger.warn(
					'[api.stations:purpose] Unknown purpose \'%s\' of station %s',
					attributes['Cel pomiarowy'],
					attributes['Nazwa stacji']
				);
				return 0;
		}
	};


	var localDispersionConditions = function() {
		switch (attributes['Lokalne warunki dyspersji']) {
			case 'Miejska':
				return types.STATION.LOCAL_DISPERSION_CONDITIONS.CITY;

			case 'Lesna':
				return types.STATION.LOCAL_DISPERSION_CONDITIONS.WOODS;

			case 'Rolnicza':
				return types.STATION.LOCAL_DISPERSION_CONDITIONS.AGRICULTURAL;

			default:
				logger.warn(
					'[api.stations:localDispersionCondition] Unknown local dispersion condition \'%s\' of station %s',
					attributes['Lokalne warunki dyspersji'],
					attributes['Nazwa stacji']
				);
				return 0;
		}
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

			default:
				logger.warn(
					'[api.stations:areaType] Unknown area type \'%s\' of station %s',
					attributes['Typ obszaru'],
					attributes['Nazwa stacji']
				);
				return 0;
		}
	};


	var areaRepresentativeness = function() {
		return null;
	};


	var location = function() {
		var longitudeParam = attributes['Długość geograficzna'],
			latitudeParam = attributes['Szerokość geograficzna'];

		if (!longitudeParam) {
			logger.warn(
				'[api.stations:location] Missing longitude attribute for station %s',
				attributes['Nazwa stacji']
			);
			return null;
		}

		if (!latitudeParam) {
			logger.warn(
				'[api.stations:location] Missing latitude attribute for station %s',
				attributes['Nazwa stacji']
			);
			return null;
		}

		var longitudeMatch = longitudeParam.match(/^([EW]) ([0-9\.]+)$/),
			latitudeMatch = latitudeParam.match(/^([NS]) ([0-9\.]+)$/);

		if (!longitudeMatch || !latitudeMatch) {
			logger.warn(
				'[api.stations:location] Invalid location of station %s: \'%s\', \'%s\'',
				attributes['Nazwa stacji'],
				longitudeParam,
				latitudeParam
			);
			return null;
		}

		return {
			longitude: parseFloat(longitudeMatch[2]) * (longitudeMatch[1] == 'E' ? 1 : -1),
			latitude: parseFloat(latitudeMatch[2]) * (latitudeMatch[1] == 'N' ? 1 : -1),
			altitude: (attributes['Wysokość m n.p.m.'] && attributes['Wysokość m n.p.m.'].trim())
				? parseInt(attributes['Wysokość m n.p.m.'])
				: null
		}
	};


	return {
		id: parseInt(attributes.infoPath.match(/^\/stacje\/stacja\/([0-9]+)$/i)[1]),
		paths: {
			info: attributes.infoPath,
			measurements: attributes.measurementsPath
		},
		name: attributes['Nazwa stacji'],
		shortName: attributes['Krótka nazwa stacji'] || null,
		code: {
			country: attributes['Krajowy kod stacji'] || null,
			international: attributes['Międzynarodowy kod stacji'] || null
		},
		zone: attributes['Strefa'],
		address: address(),
		owner: owner(),
		location: location(),
		flags: classification() | method() | purpose() | localDispersionConditions() | areaRepresentativeness() | areaType()
	};
};


var listPage = function() {
	return requests.get(config.api.paths.stations).then(function(html) {
		var $ = cheerio.load(html),
			paths = $('.station-list tr td a.link').map(function() {
				return $(this).attr('href');
			});

		return Array.prototype.slice.call(paths);
	});
};


var stationPage = function(path) {
	return requests.get(path).then(function(html) {
		var $ = cheerio.load(html),
			attributes = {
				infoPath: path,
				measurementsPath: $('.place-right a.image-button').attr('href')
			};

		$('.a-station-desc th').each(function() {
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

		return entitize(attributes);
	});
};


var all = function() {
	var fetchAll = function() {
		return listPage().then(function(paths) {
			return q.all(paths.map(stationPage));
		});
	};

	return redis.get('api:stations').then(function(stations) {
		if (stations)
			return stations;

		return fetchAll().then(function(stations) {
			return redis.set(
				'api:stations',
				stations,
				config.stations.cache_ttl
			);
		});
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


module.exports = {
	all: all,
	byId: byId,
	byChannel: byChannel
};
