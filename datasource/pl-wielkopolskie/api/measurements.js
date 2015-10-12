var http = require('http'),
	config = require('config').datasource['pl-wielkopolskie'],
	requests = require('./requests'),
	logger = require('../../../service/logger'),
	startDateFinder = require('../../../service/startdatefinder'),
	redis = require('../../../service/redis');


var DAY = 24 * 60 * 60 * 1000;


var entitize = function(apiMeasurements) {
	return apiMeasurements.series.map(function(serie) {
		return {
			paramId: serie.paramId,
			values: serie.data.map(function(apiMeasurement) {
				return {
					date: new Date(parseInt(apiMeasurement[0]) * 1000),
					value: parseFloat(apiMeasurement[1])
				};
			})
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


var byDate = function(date, station) {
	var key = 'api:measurements:' + station.id + ':' + formatDate(date),
		fetch = function() {
			var query = {
				query: JSON.stringify({
					measType: 'Auto',
					viewType: 'Station',
					dateRange: 'Day',
					date: formatDate(date),
					viewTypeEntityId: '' + station.id,
					channels: station.channels.map(function(channel) {
						return channel.id;
					})
				})
			};

			return requests.post(
				config.api.paths.measurements,
				query
			).then(function(data) {
				return entitize(JSON.parse(data).data);
			}).then(function(measurements) {
				if (isEmpty(measurements))
					return null;

				return measurements;
			});
		};

	// caching rules
	return redis.get(key).then(function(measurements) {
		if (measurements)
			return measurements;

		return fetch().then(function(measurements) {
			if (!measurements)
				return measurements;

			return redis.set(
				key,
				measurements,
				config.measurements.cache_ttl
			);
		});
	});
};


var isEmpty = function(measurements) {
	return !measurements.reduce(function(notEmpty, measurement) {
		if (measurement.values.length > 0)
			notEmpty = true;

		return notEmpty;
	}, false);
};


var fromDate = function(date, station) {
	return startDateFinder(
		function(date) {
			return byDate(date, station).then(function(measurements) {
				return !!measurements;
			});
		},
		date,
		config.measurements.start_date_epsilon
	).then(function(startDate) {
		var daysCount = Math.floor((Date.now() - startDate.getTime()) / (DAY)),
			days = [];

		for (var i = 0; i < daysCount; i++) {
			days.push(new Date(startDate.getTime() + i * DAY));
		}

		console.log(days.length);
	});
};


module.exports = {
	byDate: byDate,
	fromDate: fromDate
};