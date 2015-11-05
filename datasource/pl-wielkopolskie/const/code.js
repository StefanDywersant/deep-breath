var map = {
	'bap_pm10': 'pm10_bap',
	'as_pm10': 'pm10_as',
	'cd_pm10': 'pm10_cd',
	'ni_pm10': 'pm10_ni'
};

module.exports = {
	DATASOURCE: 'pl-wielkopolskie',
	STATION: function(stationId) {
		return this.DATASOURCE + ':' + stationId;
	},
	CHANNEL: function(stationId, channelId) {
		return this.STATION(stationId) + ':' + channelId;
	},
	PARAM: function(paramCode) {
		if (paramCode in map)
			return map[paramCode];

		return paramCode;
	}
};