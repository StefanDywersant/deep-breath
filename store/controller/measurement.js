var q = require('q'),
	Measurements = require('../models/measurements'),
	Channels = require('../models/channels'),
	logger = require('../../service/logger');

module.exports = function(payload) {
	return q.all(payload.measurements.map(function(measurement) {
		return Channels.findByCode(measurement.channel_code).then(function(channel) {
			return q.all(Object.keys(measurement.values).map(function(timestamp) {
				return Measurements.findByTimestamp(
					new Date(parseInt(timestamp)),
					channel
				).then(function(existingMeasurement) {
					if (!existingMeasurement) {
						return Measurements.create({
							timestamp: new Date(parseInt(timestamp)),
							value: measurement.values[timestamp],
							channel_uuid: channel.uuid
						}).then(function(measurement) {
							logger.silly('[measurement] Created measurement uuid=%s timestamp=%s', measurement.uuid, measurement.timestamp.toString());
							return measurement;
						});
					}

					return existingMeasurement.update({
						value: measurement.values[timestamp]
					}).then(function(measurement) {
						logger.silly('[measurement] Updated measurement uuid=%s timestamp=%s', measurement.uuid, measurement.timestamp.toString());
						return measurement;
					});
				});
			}));
		});
	}));
};