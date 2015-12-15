var q = require('q'),
	measurements = require('../../api/measurements'),
	channels = require('../../api/channels'),
	stations = require('../../api/stations'),
	emitMeasurement = require('../emitter/measurement'),
	emitFinMeasurements = require('../emitter/fin_measurements'),
	types = require('../../../../types/types'),
	logger = require('../../../../service/logger');


var addDay = function(date) {
	date.setDate(date.getDate() + 1);
	return date;
};


var addMonth = function(date) {
	date.setMonth(date.getMonth() + 1);
	return date;
};


module.exports = function(payload) {
	var channelId = parseInt(payload.channel_code.split(':')[2]),
		since = new Date(payload.timestamp);

	return channels.byId(channelId).then(function(channel) {
		return stations.byChannel(channel).then(function(station) {
			return measurements.startDate(
				since,
				channel,
				station
			).then(function(startDate) {
				var step = function(date) {
					return emitMeasurement(
						date,
						[channel],
						station
					).then(function() {
						if (date.getTime() > Date.now())
							return true;

						return step(
							(channel.flags & types.STATION.METHOD.MANUAL)
								? addMonth(date)
								: addDay(date)
						);
					});
				};

				if (!startDate) {
					logger.warn(
						'[mq.handler.req_measurements] Channel %d of station %d has no new measurements since %s',
						channel.id,
						station.id,
						since
					);
					return null;
				}

				return step(startDate);
			}).then(function() {
				return emitFinMeasurements(station, channel);
			});
		});
	});
};