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
			var allChannels = channels.map(function (channel) {
				var measurement = measurements.reduce(function (found, measurement) {
					if (found)
						return found;

					return measurement.channel_uuid == channel.uuid
							? measurement
							: null;
				}, null);

				if (measurement) {
					channel.last_measurement = measurement.measurements[0];
				}

				return channel;
			}).filter(useful.channel);

			var channelGroups = allChannels.reduce(function(channelGroups, channel) {
				var key = channel.last_measurement.begin.getTime() + '_' + channel.last_measurement.end.getTime();

				if (key in channelGroups) {
					channelGroups[key].channels.push(channel);
				} else {
					channelGroups[key] = {
						begin: channel.last_measurement.begin.getTime(),
						end: channel.last_measurement.end.getTime(),
						channels: [channel]
					};
				}

				return channelGroups;
			}, {});

			station.channel_groups = Object.keys(channelGroups).map(function(key) {
				return channelGroups[key];
			});

			// add parameter groups map
			station.parameter_groups = config.parameter_groups;

			return station;
		});
	}).then(function(station) {
		return q.all(station.channel_groups.map(function(channel_group) {
			var channelValues = channel_group.channels.filter(function(channel) {
				return !!channel.last_measurement;
			}).map(function(channel) {
				return {
					channel_uuid: channel.uuid,
					value: channel.last_measurement.value
				};
			});

			return aqi.compute(channelValues).then(function(channelIndexes) {
				channelIndexes.channels.forEach(function(channelIndex) {
					channel_group.channels.filter(function(channel) {
						return channel.uuid == channelIndex.channel_uuid;
					}).forEach(function(channel) {
						channel.index = channelIndex.index;
					});
				});

				channel_group.index = channelIndexes.index;

				return channel_group;
			});
		})).then(function() {
			return station;
		});
	});
};