var channels = require('../../api/channels'),
	entitizeChannel = require('./channel'),
	code = require('../../const/code'),
	q = require('q');


var entitize = function(station) {
	return channels.byStationId(station.id).then(function(channels) {
		return q.all(channels.map(function(channel) {
			return entitizeChannel(channel, station);
		})).then(function(mqChannels) {
			return {
				code: code.STATION(station.id),
				name: station.name,
				address: station.address,
				location: station.location,
				country_code: 'pl',
				channels: mqChannels,
				flags: station.flags
			};
		});
	});
};


module.exports = entitize;