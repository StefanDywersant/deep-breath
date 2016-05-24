const channel = require('./channel');


module.exports = {
	DATASOURCE: 'pl-mazowieckie',
	STATION: (function(stationId) {
		return this.DATASOURCE + ':' + stationId;
	}),
	CHANNEL: (function(stationId, channelId) {
		return this.STATION(stationId) + ':' + channelId;
	}),
	PARAM: function(paramCode) {
		var def = channel.BY_ID(paramCode);

		if (def)
			return def.code;

		return paramCode;
	}
};