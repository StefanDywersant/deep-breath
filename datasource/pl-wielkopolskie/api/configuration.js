var requests = require('./requests'),
	config = require('config').datasource['pl-wielkopolskie'],
	redis = require('../../../service/redis'),
	qthrottle = require('qthrottle')(1);


var CONFIGURATION_CACHE_KEY = 'api:configuration';


var get = function() {
	return redis.get(CONFIGURATION_CACHE_KEY).then(function(result) {
		if (result)
			return result;

		return requests.post(
			config.api.paths.configuration,
			{measType: 'Auto'}
		).then(function(data) {
			return JSON.parse(data).config;
		}).then(function(configuration) {
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