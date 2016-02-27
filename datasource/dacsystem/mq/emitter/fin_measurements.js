var outbound = require('../outbound'),
	types = require('../../../../types/types'),
	code = require('../../const/code'),
	q = require('q');


var envelope = function(station, channel) {
	return q({
		type: types.MQ.FIN_MEASUREMENTS,
		datasource_code: code.DATASOURCE,
		payload: {
			channel_code: code.CHANNEL(station.id, channel.id)
		}
	});
};


var fin_measurements = function(station, channel) {
	return envelope(station, channel)
		.then(outbound.send);
};


module.exports = fin_measurements;