var outbound = require('../outbound'),
	types = require('../../../../types/types'),
	stations = require('../../api/stations'),
	code = require('../../const/code');


var envelope = function(channel, health) {
	return stations.byChannel(channel)
		.then((station) => {
			return {
				type: types.MQ.CHANNEL_HEALTH,
				datasource_code: code.DATASOURCE,
				payload: {
					channel_code: code.CHANNEL(station.id, channel.id),
					health: health
				}
			};
	});
};


var channel_health = function(channel, health) {
	return envelope(channel, health)
		.then(outbound.send);
};


module.exports = channel_health;