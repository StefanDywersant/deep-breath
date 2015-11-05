var configuration = require('./configuration'),
	q = require('q');


var entitize = function(apiChannel) {
	return {
		id: apiChannel.channel_id,
		param_id: apiChannel.param_id,
		unit_id: apiChannel.unit_id,
		station_id: apiChannel.station_id,
		method: apiChannel.method
	};
};


var byStationId = function(stationId) {
	return configuration.get().then(function(configuration) {
		return q.all(configuration.channels.filter(function(channel) {
			return channel.station_id == stationId;
		}).map(entitize));
	});
};


var byId = function(id) {
	return configuration.get().then(function(configuration) {
		var channels = configuration.channels.filter(function(channel) {
			return channel.channel_id == id;
		});

		if (!channels.length)
			throw new Error('Channel id=' + id + ' no found');

		return entitize(channels[0]);
	});
};


var all = function() {
	return configuration.get().then(function(configuration) {
		return q.all(configuration.channels.map(entitize));
	});
};


module.exports = {
	byStationId: byStationId,
	byId: byId,
	all: all
};