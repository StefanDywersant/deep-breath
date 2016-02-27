var q = require('q'),
	Measurements = require('../../models/measurements'),
	Channels = require('../../models/channels'),
	logger = require('../../../service/logger');

module.exports = function(measurements) {
	return q.all(measurements.map(function(measurement) {
		return Channels.findByCode(measurement.channel_code).then(function(channel) {
			return q.all(measurement.values.map(function(value) {
				return Measurements.findByEndTime(
					new Date(parseInt(value.end)),
					channel
				).then(function(existingMeasurement) {
					if (!existingMeasurement) {
						return Measurements.create({
							begin: new Date(parseInt(value.begin)),
							end: new Date(parseInt(value.end)),
							value: value.value,
							channel_uuid: channel.uuid
						}).then(function(measurement) {
							logger.silly('[measurement] Created measurement uuid=%s timestamp=%s', measurement.uuid, measurement.end.toString());
							return measurement;
						});
					}

					return existingMeasurement.update({
						value: value.value
					}).then(function(measurement) {
						logger.silly('[measurement] Updated measurement uuid=%s timestamp=%s', measurement.uuid, measurement.end.toString());
						return measurement;
					});
				});
			}));
		});
	}));
};