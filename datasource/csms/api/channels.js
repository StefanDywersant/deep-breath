'use strict';


var requests = require('./requests'),
	config = require('config').datasource.csms,
	q = require('q'),
	redis = require('../../../service/redis'),
	rateLimit = require('q-ratelimit')(2500),
	cheerio = require('cheerio'),
	types = require('../../../types/types'),
	logger = require('../../../service/logger'),
	retry = require('../../../service/retry');


const CHANNELS_SET_SUBSTANCES = 1414,
	CHANNELS_SET_WEATHER = 1415,
	CHANNELS_SET_CARBOHYDRATES = 1416;


var entitize = function(channelId, stationId) {
	return {
		id: channelId,
		station_id: stationId,
		flags: types.STATION.METHOD.AUTOMATIC
	};
};


var formatDay = function(date) {
	var yyyy = date.getFullYear().toString();
	var mm = (date.getMonth() + 1).toString();
	var dd = date.getDate().toString();

	return [
		(dd[1] ? dd : '0' + dd[0]),
		(mm[1] ? mm : '0' + mm[0]),
		yyyy
	].join('-');
};


var fetchStationChannels = function(stationId) {
	let path = config.api.paths.channels
		.replace('<date>', formatDay(new Date()))
		.replace('<station_id>', stationId);

	return q.all([
			rateLimit().then(() => requests.get(path.replace('<channels_set>', CHANNELS_SET_SUBSTANCES))),
			rateLimit().then(() => requests.get(path.replace('<channels_set>', CHANNELS_SET_WEATHER))),
			rateLimit().then(() => requests.get(path.replace('<channels_set>', CHANNELS_SET_CARBOHYDRATES)))
		])
		.then((pages) => {
			let $s = pages.map((page) => cheerio.load(page));

			if ($s[0]('#i3 option:checked').val() != CHANNELS_SET_SUBSTANCES)
				throw new Error(`Got different page than requested ;-) station_id=${stationId} channels_set=${CHANNELS_SET_SUBSTANCES}`);

			if ($s[1]('#i3 option:checked').val() != CHANNELS_SET_WEATHER)
				throw new Error(`Got different page than requested ;-) station_id=${stationId} channels_set=${CHANNELS_SET_WEATHER}`);

			if ($s[2]('#i3 option:checked').val() != CHANNELS_SET_CARBOHYDRATES)
				throw new Error(`Got different page than requested ;-) station_id=${stationId} channels_set=${CHANNELS_SET_CARBOHYDRATES}`);

			return $s.reduce((channels, $) => {
					let _channels = $('table.rpt thead tr:first-child th')
						.slice(1)
						.map(function() { return $(this).text(); });

					return channels.concat(Array.prototype.slice.call(_channels));
				}, [])
				.map(channelId => entitize(channelId, stationId));
		});
};


var byStationId = function(stationId) {
	return redis.get(`api:channels:${stationId}`)
		.then((channels) => {
			if (channels)
				return channels;

			return retry(() => fetchStationChannels(stationId), 10)
				.then((channels) => redis.set(`api:channels:${stationId}`, channels, config.channels.cache_ttl))
		})
};


/*var byId = function(id) {
	return configuration.get().then(function(configuration) {
		var channels = configuration.channels.filter(function(channel) {
			return channel.channel_id == id;
		});

		if (!channels.length)
			return null;

		return entitize(channels[0]);
	});
};


var all = function() {
	return configuration.get().then(
		(configuration) => q.all(configuration.channels.map(entitize))
	);
};
*/

module.exports = {
	byStationId,
//	byId: byId,
//	all: all
};