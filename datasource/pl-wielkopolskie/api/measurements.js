var config = require('config').datasource['pl-wielkopolskie'],
	requests = require('./requests'),
	logger = require('../../../service/logger'),
	startDateFinder = require('../../../service/startdatefinder'),
	channels = require('./channels'),
	types = require('../../../types/types'),
	q = require('q');


var MEASUREMENTS_BEGIN = new Date('01/01/2000'),
	HOUR = 60 * 60 * 1000,
	DAY = 24 * HOUR;


var entitize = function(apiMeasurements) {
	return apiMeasurements.series.map(function(serie) {
		var channel = apiMeasurements.channels.reduce(function(found, channel) {
			if (found)
				return found;

			if (channel.param_id == serie.paramId)
				return channel;

			return null;
		}, null);

		if (!channel)
			throw new Error('Channel for param_id=%s not found', serie.paramId);

		return {
			channel_id: channel.id,
			values: serie.data.map(function(apiMeasurement) {
				var begin = channel.flags & types.STATION.METHOD.AUTOMATIC
					? parseInt(apiMeasurement[0]) * 1000 - HOUR
					: parseInt(apiMeasurement[0]) * 1000 - DAY;

				return {
					begin: begin,
					end: parseInt(apiMeasurement[0]) * 1000,
					value: parseFloat(apiMeasurement[1])
				};
			})
		};
	});
};


var formatDay = function(date) {
	var yyyy = date.getFullYear().toString();
	var mm = (date.getMonth()+1).toString();
	var dd = date.getDate().toString();

	return [
		(dd[1] ? dd : '0' + dd[0]),
		(mm[1] ? mm : '0' + mm[0]),
		yyyy
	].join('.');
};


var formatMonth = function(date) {
	var yyyy = date.getFullYear().toString();
	var mm = (date.getMonth()+1).toString();

	return [
		(mm[1] ? mm : '0' + mm[0]),
		yyyy
	].join('.');
};


var fetchAutomatic = function(date, channels, station) {
	return requests.post(
		config.api.paths.measurements,
		{
			query: JSON.stringify({
				measType: 'Auto',
				viewType: 'Station',
				dateRange: 'Day',
				date: formatDay(date),
				viewTypeEntityId: '' + station.id,
				channels: channels.map(function(channel) {
					return channel.id;
				})
			})
		}
	).then(function(result) {
		return JSON.parse(result).data;
	}).then(function(data) {
		data.channels = channels;
		return data;
	});
};


var fetchManual = function(date, channels, station) {
	return requests.post(
		config.api.paths.measurements,
		{
			query: JSON.stringify({
				measType: 'Manual',
				viewType: 'Station',
				dateRange: 'Month',
				date: formatMonth(date),
				viewTypeEntityId: '' + station.id,
				channels: channels.map(function(channel) {
					return channel.id;
				})
			})
		}
	).then(function(result) {
		return JSON.parse(result).data;
	}).then(function(data) {
		data.channels = channels;
		return data;
	});
};


var byDate = function(date, channels, station) {
	var automaticChannels = channels.filter(function(channel) {
			return channel.flags == types.STATION.METHOD.AUTOMATIC;
		}),
		manualChannels = channels.filter(function(channel) {
			return channel.flags == types.STATION.METHOD.MANUAL;
		});

	var queue = [];

	if (automaticChannels.length)
		queue.push(fetchAutomatic(date, automaticChannels, station));

	if (manualChannels.length)
		queue.push(fetchManual(date, manualChannels, station));

	if (!queue.length)
		return [];

	return q.all(queue).then(function(dataList) {
		return q.all(dataList.map(function(data) {
			return entitize(data);
		})).then(function(measurementsList) {
			return measurementsList.reduce(function(all, measurements) {
				return all.concat(measurements);
			}, []);
		});
	}).then(function(measurements) {
		if (isEmpty(measurements)) {
			logger.debug('[measurements:byDate] Measurements not found date=%s channelIds=[%s] station.id=%d', date.toString(), channels.map(function(channel) { return channel.id }).join(','), station.id);
			return [];
		}

		logger.debug('[measurements:byDate] Measurements found date=%s channelIds=[%s] station.id=%d', date.toString(), channels.map(function(channel) { return channel.id }).join(','), station.id);

		return measurements;
	});
};


var isEmpty = function(measurements) {
	return !measurements.reduce(function(notEmpty, measurement) {
		if (Object.keys(measurement.values).length > 0)
			notEmpty = true;

		return notEmpty;
	}, false);
};


var startDate = function(date, channel, station) {
	if (date.getTime() < MEASUREMENTS_BEGIN.getTime())
		date = MEASUREMENTS_BEGIN;

	var find = function() {
		var interval = (function() {
			if ((channel.flags & types.STATION.METHOD.AUTOMATIC))
				return DAY;

			if ((channel.flags & types.STATION.METHOD.MANUAL))
				return 27 * DAY;

			throw new Error('Unknown measurements method: ' + (channel.flags & types.STATION.METHOD._MASK));
		})();

		return startDateFinder.accurate(
				function(date) {
					return byDate(date, [channel], station).then(function(measurements) {
						return !!measurements.length;
					});
				},
				date,
				interval
		);
	};

	return find().then(function(startDate) {
		logger.verbose('[measurements:startDate] Found start date %s for channel %d', startDate, channel.id);
		return startDate;
	});
};


module.exports = {
	byDate: byDate,
	startDate: startDate
};