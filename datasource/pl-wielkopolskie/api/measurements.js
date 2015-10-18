var http = require('http'),
	config = require('config').datasource['pl-wielkopolskie'],
	requests = require('./requests'),
	logger = require('../../../service/logger'),
	startDateFinder = require('../../../service/startdatefinder'),
	stations = require('./stations');


var entitize = function(apiMeasurements, station) {
	return apiMeasurements.series.map(function(serie) {
		return {
			channel_id: station.channels.reduce(function(found, channel) {
				if (found)
					return found;

				if (channel.param_id == serie.paramId)
					return channel.id;

				return null;
			}, null),
			values: serie.data.reduce(function(values, apiMeasurement) {
				values[parseInt(apiMeasurement[0]) * 1000] = parseFloat(apiMeasurement[1]);
				return values;
			}, {})
		};
	});
};


var formatDate = function(date) {
	var yyyy = date.getFullYear().toString();
	var mm = (date.getMonth()+1).toString();
	var dd = date.getDate().toString();

	return [
		(dd[1] ? dd : '0' + dd[0]),
		(mm[1] ? mm : '0' + mm[0]),
		yyyy
	].join('.');
};


var byDate = function(date, channelIds, station) {
	var query = {
		query: JSON.stringify({
			measType: 'Auto',
			viewType: 'Station',
			dateRange: 'Day',
			date: formatDate(date),
			viewTypeEntityId: '' + station.id,
			channels: channelIds
		})
	};

	return requests.post(
		config.api.paths.measurements,
		query
	).then(function(data) {
		return entitize(JSON.parse(data).data, station);
	}).then(function(measurements) {
		if (isEmpty(measurements)) {
			logger.debug('[measurements:byDate] Measurements not found date=%s channelIds=[%s] station.id=%d', date.toString(), channelIds.join(','), station.id);
			return null;
		}

		logger.debug('[measurements:byDate] Measurements found date=%s channelIds=[%s] station.id=%d', date.toString(), channelIds.join(','), station.id);

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


var startDate = function(date, channelIds, station) {
	return startDateFinder(
		function(date) {
			return byDate(date, channelIds, station).then(function(measurements) {
				return !!measurements;
			});
		},
		date,
		config.measurements.start_date_epsilon
	).then(function(startDate) {
		logger.verbose('[measurements:startDate] Found start date %s for channelIds [%s]', startDate, channelIds.join(','));

		return startDate;
	});
};


module.exports = {
	byDate: byDate,
	startDate: startDate
};