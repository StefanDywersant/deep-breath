var config = require('config'),
	requests = require('../requests')({hostname: config.store.webserver.hostname, port: config.store.webserver.port});


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
