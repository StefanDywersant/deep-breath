var origin = require('../config/origin');

var map = {
	'bap_pm10': 'pm10_bap',
	'as_pm10': 'pm10_as',
	'cd_pm10': 'pm10_cd',
	'ni_pm10': 'pm10_ni',
	'pb_pm10': 'pm10_pb',
	'baa_pm10': 'pm10_baa',
	'bbf_pm10': 'pm10_bbf',
	'bjf_pm10': 'pm10_bjf',
	'bkf_pm10': 'pm10_bkf',
	'dbaha_pm10': 'pm10_dbaha',
	'ip_pm10': 'pm10_ip'
};

module.exports = {
	DATASOURCE: origin.code,
	STATION: (function(stationId) {
		return this.DATASOURCE + ':' + stationId;
	}),
	CHANNEL: (function(stationId, channelId) {
		return this.STATION(stationId) + ':' + channelId;
	}),
	PARAM: function(paramCode) {
		if (paramCode in map)
			return map[paramCode];

		return paramCode;
	}
};