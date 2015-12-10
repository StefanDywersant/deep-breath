var channels = require('../../../service/store/channels'),
	measurements = require('../../../service/store/measurements'),
	aqi = require('../../../service/aqi'),
	config = require('config').mobile,
	useful = require('../../service/useful'),
	q = require('q');


module.exports = function(station) {
	return channels.byStation(station).then(function(channels) {
		return measurements.lastByChannels(channels).then(function (measurements) {

			// add available station channels
			station.channels = channels.map(function (channel) {
				var measurement = measurements.reduce(function (found, measurement) {
					if (found)
						return found;

					return measurement.channel_uuid == channel.uuid
							? measurement
							: null;
				}, null);

				if (measurement) {
					channel.last_measurement = measurement.measurements[0]
				}

				return channel;
			}).filter(useful.channel);

			// add parameter groups map
			station.parameter_groups = config.parameter_groups;

			return station;
		});
	}).then(function(station) {
		var channelValues = station.channels.filter(function(channel) {
			return !!channel.last_measurement;
		}).map(function(channel) {
			return {
				channel_uuid: channel.uuid,
				value: channel.last_measurement.value
			};
		});

		return aqi.compute(channelValues).then(function(channelIndexes) {
			channelIndexes.channels.forEach(function(channelIndex) {
				station.channels.filter(function(channel) {
					return channel.uuid == channelIndex.channel_uuid;
				}).forEach(function(channel) {
					channel.index = channelIndex.index;
				});
			});

			station.index = channelIndexes.index;

			return station;
		});
	});
};