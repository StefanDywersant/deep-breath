var configuration = require('./configuration'),
	q = require('q');


var entitize = function(apiChannel) {
	return {
		id: apiChannel.channel_id,
		param_code: apiChannel.param_id,
		unit_code: apiChannel.unit_id
	};
};


var byStationId = function(stationId) {
	return configuration.get().then(function(configuration) {
		return q.all(configuration.channels.filter(function(channel) {
			return channel.station_id == stationId;
		}).map(entitize));
	});
};


module.exports = {
	byStationId: byStationId
};