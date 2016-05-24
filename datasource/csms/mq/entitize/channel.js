var code = require('../../const/code');


var entitize = function(channel, station) {
	return {
		code: code.CHANNEL(station.id, channel.id),
		parameter_code: code.PARAM(channel.id),
		flags: channel.flags
	};
};


module.exports = entitize;