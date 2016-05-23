'use strict';

var config = require('config').datasource.csms,
	requests = require('./requests'),
	logger = require('../../../service/logger'),
	startDateFinder = require('../../../service/startdatefinder'),
	channels = require('./channels'),
	types = require('../../../types/types'),
	q = require('q'),
	CHANNEL = require('../const/channel'),
	cheerio = require('cheerio');


var MEASUREMENTS_BEGIN = new Date('01/01/2000'),
	HOUR = 60 * 60 * 1000,
	DAY = 24 * HOUR;


var entitize = function(dataSet) {
	return Object.keys(dataSet).map(channelId => {
		return {
			channel_id: channelId,
			values: Object.keys(dataSet[channelId]).reduce((values, date) => {
				if (!dataSet[channelId][date])
					return values;

				let begin = new Date(date),
					end = new Date(date);

				begin.setHours(begin.getHours() - 1);

				values.push({
					begin: begin,
					end: end,
					value: parseFloat(dataSet[channelId][date])
				});

				return values;
			}, [])
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
	].join('-');
};


var formatMonth = function(date) {
	var yyyy = date.getFullYear().toString();
	var mm = (date.getMonth()+1).toString();

	return [
		(mm[1] ? mm : '0' + mm[0]),
		yyyy
	].join('.');
};


var constructPath = function(dateFrom, dateTo, station, method, channels) {
	return config.api.paths.measurements
		.replace('<date_from>', formatDay(dateFrom))
		.replace('<date_to>', formatDay(dateTo))
		.replace('<station_id>', station.id)
		.replace('<method>', method == types.CHANNEL.METHOD.AUTOMATIC ? 1 : 3)
		.replace('<channels>', channels.map((channel) => `jspar_type_id%5B%5D=${CHANNEL.BY_ID(channel.id).param_id}`).join('&'));
};


var fetchAutomatic = function(date, channels, station) {
	const CHUNK_SZ = 6;

	// only CHUNK_SZ channels can be requested at once
	let chunks = [];
	for (let i = 0, j = channels.length; i < j; i += CHUNK_SZ)
		chunks.push(channels.slice(i, i + CHUNK_SZ));

	return q.all(chunks.map((channels) => requests.get(constructPath(date, date, station, types.CHANNEL.METHOD.AUTOMATIC, channels))))
		.then((pages) => {
			let $s = pages.map(page => cheerio.load(page)),
				dataSet = {};

			$s.forEach(($) => {
				let channelIds = Array.prototype.slice.call($('#table thead tr:first-child th')
					.slice(1)
					.map(function () {
						return $(this).text().replace(/^[a-zA-Z]+-/, '');
					}));

				$('#table tbody tr').each(function() {
					let cols = $(this).children(),
						date = $(cols.get(0)).text(),
						dataCols = cols.slice(1);

					dataCols.each(function(i) {
						if (!(channelIds[i] in dataSet))
							dataSet[channelIds[i]] = {};

						dataSet[channelIds[i]][date] = $(this).text();
					});
				});
			});

			return dataSet;
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
					channels: channels.map(channel => channel.id)
				})
			}
		)
		.then((result) => JSON.parse(result).data)
		.then((data) => {
			data.channels = channels;
			return data;
		});
};


var byDate = function(date, channels, station) {
	var automaticChannels = channels.filter((channel) => channel.flags == types.STATION.METHOD.AUTOMATIC),
		manualChannels = channels.filter((channel) => channel.flags == types.STATION.METHOD.MANUAL);

	var queue = [];

	if (automaticChannels.length)
		queue.push(fetchAutomatic(date, automaticChannels, station));

	if (manualChannels.length)
		queue.push(fetchManual(date, manualChannels, station));

	if (!queue.length)
		return [];

	return q.all(queue)
		.then((dataList) => q.all(dataList.map(entitize)))
		.then((measurements) => measurements.reduce((all, measurements) => all.concat(measurements), []))
		.then((measurements) => {
			if (isEmpty(measurements)) {
				logger.debug('[measurements:byDate] Measurements not found date=%s channelIds=[%s] station.id=%d', date.toString(), channels.map(channel => channel.id).join(','), station.id);
				return [];
			}

			logger.debug('[measurements:byDate] Measurements found date=%s channelIds=[%s] station.id=%d', date.toString(), channels.map(channel => channel.id).join(','), station.id);

			return measurements;
		});
};


var isEmpty = function(measurements) {
	return !measurements.reduce((notEmpty, measurement) => {
		if (Object.keys(measurement.values).length > 0)
			notEmpty = true;

		return notEmpty;
	}, false);
};


var startDate = function(date, channel, station) {
	if (date.getTime() < MEASUREMENTS_BEGIN.getTime())
		date = MEASUREMENTS_BEGIN;

	var find = function() {
		let interval = (() => {
			if ((channel.flags & types.STATION.METHOD.AUTOMATIC))
				return DAY;

			if ((channel.flags & types.STATION.METHOD.MANUAL))
				return 27 * DAY;

			throw new Error('Unknown measurements method: ' + (channel.flags & types.STATION.METHOD._MASK));
		})();

		return startDateFinder.heuristic(
			(date) => byDate(date, [channel], station)
				.then((measurements) => !!measurements.length),
			date,
			86400000
		);
	};

	return find()
		.then((startDate) => {
			logger.verbose('[measurements:startDate] Found start date %s for channel %s', startDate, channel.id);
			return startDate;
		});
};


module.exports = {byDate, startDate, fetchAutomatic};