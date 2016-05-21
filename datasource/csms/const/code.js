var map = {
	'PM10': 'pm10',
	'NO2': 'no2',
	'SO2': 'so2',
	'O3': 'o3',
	'CO': 'co',
	'PM25': 'pm2.5',
	'temp': 'temp',
	'wilg': 'humid',
	'kier': 'wd',
	'pred': 'ws',
	'Cisn.atm.': 'press',
	'opad atm.': 'rain',
	'prom': 'rad',
	'Benzen': 'bzn',
	'Toluen': 'tln',
	'o-Ksylen': 'oxy',
	'm,p-Ksylen': 'mpxy',
	'Etylobenzen': 'ebzn'
};

module.exports = {
	DATASOURCE: 'pl-mazowieckie',
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