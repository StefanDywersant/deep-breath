var code = require('../../const/code');


var entitize = function(measurement, station) {
	return {
		channel_code: code.CHANNEL(station.id, measurement.channel_id),
		values: measurement.values
	};
};


module.exports = entitize;