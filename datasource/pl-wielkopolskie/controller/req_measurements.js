var q = require('q'),
	measurements = require('../api/measurements'),
	mqOutbound = require('../mq/outbound'),
	types = require('../../../types/types'),
	stations = require('../api/stations');

var DAY = 24 * 60 * 60 * 1000;

var processDate = function(date, channelId, station) {
	return measurements.byDate(
		date,
		[channelId],
		station
	).then(function(measurements) {
		if (!measurements)
			return false;

		return mqOutbound.send({
			type: types.MQ.MEASUREMENT,
			datasource_code: 'pl-wielkopolskie',
			payload: {
				measurements: measurements.map(function(measurement) {
					return {
						channel_code: 'pl-wielkopolskie:' + station.id + ':' + measurement.channel_id,
						values: measurement.values
					};
				})
			}
		});
	});
};

module.exports = function(payload) {
	var channelId = parseInt(payload.channel_code.split(':')[2]);

	return stations.byChannelId(channelId).then(function(station) {
		return measurements.startDate(
			new Date(payload.timestamp),
			[channelId],
			station
		).then(function(startDate) {
			var step = function(date) {
				return processDate(
					date,
					channelId,
					station
				).then(function() {
					if (date.getTime() > Date.now())
						return true;

					return step(new Date(date.getTime() + DAY));
				});
			};

			return step(startDate);
		});
	}).then(function() {
		return mqOutbound.send({
			type: types.MQ.FIN_MEASUREMENTS,
			datasource_code: 'pl-wielkopolskie',
			payload: {
				channel_code: payload.channel_code
			}
		});
	});
};