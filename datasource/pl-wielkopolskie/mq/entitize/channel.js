var code = require('../../const/code');


var entitize = function(channel, station) {
	return {
		code: code.CHANNEL(station.id, channel.id),
		parameter_code: code.PARAM(channel.param_id)
	};
};


module.exports = entitize;