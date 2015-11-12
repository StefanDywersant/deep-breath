var requests = require('./requests'),
	config = require('config').datasource['pl-wielkopolskie'],
	redis = require('../../../service/redis'),
	qthrottle = require('qthrottle')(1),
	q = require('q'),
	types = require('../../../types/types');


var CONFIGURATION_CACHE_KEY = 'api:configuration';


var merge = function(key, a, b) {
	return b.reduce(function(merged, b) {
		var found = merged.filter(function(m) {
			return m[key] == b[key];
		});

		if (!found.length)
			merged.push(b);

		return merged;
	}, a.slice(0));
};


var fetch = function() {
	return q.all([
			requests.post(
				config.api.paths.configuration,
				{measType: 'Auto'}
			),
			requests.post(
				config.api.paths.configuration,
				{measType: 'Manual'}
			)
		]).spread(function(auto, manual) {
		auto = JSON.parse(auto);
		manual = JSON.parse(manual);

		return {
			params: merge(
				'id',
				auto.config.params,
				manual.config.params
			),
			channels: merge(
				'channel_id',
				auto.config.channels.map(function(channel) {
					channel.flags = types.STATION.METHOD.AUTOMATIC;
					return channel;
				}),
				manual.config.channels.map(function(channel) {
					channel.flags = types.STATION.METHOD.MANUAL;
					return channel;
				})
			),
			stations: merge(
				'id',
				auto.config.stations,
				manual.config.stations
			)
		}
	});
};


var get = function() {
	return redis.get(CONFIGURATION_CACHE_KEY).then(function(result) {
		if (result)
			return result;

		return fetch().then(function(configuration) {
			return redis.set(
				CONFIGURATION_CACHE_KEY,
				configuration,
				config.configuration.cache_ttl
			);
		});
	});
};


module.exports = {
	get: function() {
		// cache slam defense
		return qthrottle.fcall(get, null);
	}
};