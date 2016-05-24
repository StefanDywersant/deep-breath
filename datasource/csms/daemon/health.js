var stations = require('../api/stations'),
	channels = require('../api/channels'),
	measurements = require('../api/measurements'),
	logger = require('../../../service/logger'),
	types = require('../../../types/types'),
	emitChannelHealth = require('../mq/emitter/channel_health'),
	q = require('q'),
	config = require('config').datasource.csms;


var HOUR = 60 * 60 * 1000,
	DAY = 24 * HOUR;


var channelStatuses = {},
	watched = {};


var last = function(measurement) {
	return measurement.values.reduce(function(maxEndTime, value) {
		return value.end > maxEndTime
			? value.end
			: maxEndTime;
	}, 0);
};


var emit = function(channelId, healthy) {
	return channels.byId(channelId).then(function(channel) {
		if (!channel)
			throw new Error('Channel having id=%s not found', channelId);

		if (channel.id in channelStatuses) {
			if (channelStatuses[channel.id] != healthy) {
				return emitChannelHealth(channel, healthy);
			}

			return false;
		} else {
			return emitChannelHealth(channel, healthy);
		}
	}).then(function() {
		channelStatuses[channelId] = healthy;
	});
};


var refresh = function() {
	return q.all(Object.keys(watched).map(function(stationId) {
		var automaticChannels = watched[stationId].channels.filter(function(channel) {
				return channel.flags == types.STATION.METHOD.AUTOMATIC;
			}),
			manualChannels = watched[stationId].channels.filter(function(channel) {
				return channel.flags == types.STATION.METHOD.MANUAL;
			});

		return q.all([
			measurements.byDate(
				new Date(Date.now() - DAY),
				manualChannels,
				watched[stationId].station
			),
			measurements.byDate(
				new Date(),
				automaticChannels,
				watched[stationId].station
			)
		]).spread(function(manualMeasurements, automaticMeasurements) {
			manualMeasurements.forEach(function(manualMeasurement) {
				var lastTime = last(manualMeasurement);

				if (lastTime + DAY > Date.now()) {
					logger.verbose('[health:refresh] Manual channel %d is healthy', manualMeasurement.channel_id);
					emit(manualMeasurement.channel_id, true);
				} else {
					logger.verbose('[health:refresh] Manual channel %d is faulty', manualMeasurement.channel_id);
					emit(manualMeasurement.channel_id, false);
				}
			});

			automaticMeasurements.forEach(function(automaticMeasurement) {
				var lastTime = last(automaticMeasurement);

				if (lastTime + DAY > Date.now()) {
					logger.verbose('[health:refresh] Automatic channel %d is healthy', automaticMeasurement.channel_id);
					emit(automaticMeasurement.channel_id, true);
				} else {
					logger.verbose('[health:refresh] Automatic channel %d is faulty', automaticMeasurement.channel_id);
					emit(automaticMeasurement.channel_id, false);
				}
			});
		});
	})).fail(function(error) {
		logger.error('Error during channels health check: %s', error.stack);
	});
};


var init = function() {
	refresh();
	setInterval(refresh, config.health.interval);
};


var start = function(channel) {
	logger.verbose('[health:start] Started health monitoring on channel %s', channel.id);

	return stations.byChannel(channel).then(function(station) {
		if (station.id in watched) {
			watched[station.id].channels.push(channel);
		} else {
			watched[station.id] = {
				station: station,
				channels: [channel]
			};
		}

		return true;
	});
};


module.exports = {init, start};