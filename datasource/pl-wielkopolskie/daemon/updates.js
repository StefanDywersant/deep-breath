var config = require('config').datasource['pl-wielkopolskie'],
	logger = require('../../../service/logger'),
	measurements = require('../api/measurements'),
	stations = require('../api/stations'),
	mqOutbound = require('../mq/outbound'),
	types = require('../../../types/types'),
	q = require('q');


var channelsMap = {};


var update = function(mapEntry) {
	return measurements.byDate(
		new Date(),
		mapEntry.channels.map(function(channel) {
			return channel.id;
		}),
		mapEntry.station
	).then(function(measurements) {
		return mqOutbound.send({
			type: types.MQ.MEASUREMENT,
			datasource_code: 'pl-wielkopolskie',
			payload: {
				measurements: measurements.map(function(measurement) {
					return {
						channel_code: 'pl-wielkopolskie:' + mapEntry.station.id + ':' + measurement.channel_id,
						values: measurement.values
					};
				})
			}
		});
	}).fail(function(error) {
		logger.error('Error while updating channels: %s', error.message);
	});
};


var init = function() {
	setInterval(function() {
		var start = Date.now();

		logger.verbose('[updates:init] Starting update loop on active channels');

		q.all(Object.keys(channelsMap).map(function(key) {
			return update(channelsMap[key]);
		})).done(function() {
			logger.verbose('[updates:init] Finished update loop on active channels, took %dms', Date.now() - start);
		});
	}, config.measurements.update_interval);
};


var start = function(channel) {
	logger.verbose('[updates:start] Starting updates for channel=%s', channel.id);

	return stations.byChannelId(channel.id).then(function(station) {
		if (!station)
			throw new Error('No such station for channel.id=%d', channel.id);

		if (station.id in channelsMap) {
			channelsMap[station.id].channels.push(channel);
		} else {
			channelsMap[station.id] = {
				station: station,
				channels: [channel]
			}
		}
	});
};


module.exports = {
	init: init,
	start: start
};