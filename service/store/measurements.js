var config = require('config'),
	requests = require('../requests')({hostname: config.store.webserver.hostname, port: config.store.webserver.port});


var entitize = function(channelMeasurements) {
	return {
		channel_uuid: channelMeasurements.channel_uuid,
		measurements: channelMeasurements.measurements.map(function(measurement) {
			return {
				begin: new Date(measurement.begin),
				end: new Date(measurement.end),
				value: measurement.value
			};
		})
	}
};


var lastByChannels = function(channels) {
	var path = [
		'/measurements',
		channels.map(function(channel) {
			return channel.uuid;
		}).join(','),
		'last'
	].join('/');

	return requests.get(path).then(function(result) {
		return JSON.parse(result);
	}).then(function(measurements) {
		return measurements.map(entitize);
	});
};


var averageByChannels = function(channels, begin, end) {
	var path = [
		'/measurements',
		channels.map(function(channel) {
			return channel.uuid;
		}).join(','),
		'average',
		begin.getTime(),
		end.getTime()
	].join('/');

	return requests.get(path).then(function(result) {
		return JSON.parse(result);
	});
};


module.exports = {
	lastByChannels: lastByChannels,
	averageByChannels: averageByChannels
};
