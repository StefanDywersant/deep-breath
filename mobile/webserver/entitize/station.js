var channels = require('../../store/channels'),
	measurements = require('../../store/measurements'),
	config = require('config').mobile;

module.exports = function(station) {
	return channels.byStation(station).then(function(channels) {
		return measurements.lastByChannels(channels).then(function(measurements) {

			// add available station channels
			station.channels = channels.map(function(channel) {
				var measurement = measurements.reduce(function(found, measurement) {
					if (found)
						return found;

					return measurement.channel_uuid == channel.uuid
						? measurement
						: null;
				}, null);

				if (measurement) {
					channel.last_measurement = {
						timestamp: parseInt(Object.keys(measurement.measurements)[0]),
						value: measurement.measurements[Object.keys(measurement.measurements)[0]]
					}
				}

				return channel;
			});

			// add parameter groups map
			station.parameter_groups = config.parameter_groups;

			return station;
		});
	});
};