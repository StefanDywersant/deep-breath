var stations = require('./api/stations'),
	measurements = require('./api/measurements'),
	redis = require('../../service/redis'),
	config = require('config'),
	outbound = require('./mq/outbound'),
	logger = require('../../service/logger'),
	types = require('../../types/types.js');


redis.init(config.datasource['pl-wielkopolskie'].redis);

stations.all().then(function(stations) {
	return outbound.send({
		type: types.MQ.ANNOUNCE,
		datasource_code: 'pl-wielkopolskie',
		payload: stations.map(function(station) {
			return {
				code: 'pl-wielkopolskie:' + station.id,
				name: station.name,
				address: station.address,
				longitude: station.position.lng,
				latitude: station.position.lat,
				country_code: 'pl',
				channels: station.channels.map(function(channel) {
					return {
						code: 'pl-wielkopolskie:' + station.id + ':' + channel.id,
						parameter_code: channel.param_id
					}
				})
			};
		})
	});
}).fail(function(error) {
	console.log(error.stack);
});
