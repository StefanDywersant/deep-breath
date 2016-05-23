const map = [
	{code: 'pm10', param_id: 2, id: 'PM10'},
	{code: 'no2', param_id: 4, id: 'NO2'},
	{code: 'so2', param_id: 1, id: 'SO2'},
	{code: 'o3', param_id: 7, id: 'O3'},
	{code: 'co', param_id: 6, id: 'CO'},
	{code: 'pm2,5', param_id: 12, id: 'PM25'},
	{code: 'temp', param_id: 34, id: 'temp'},
	{code: 'humparam_id', param_id: 35, id: 'wilg'},
	{code: 'wd', param_id: 29, id: 'kier'},
	{code: 'ws', param_id: 32, id: 'pred'},
	{code: 'press', param_id: 28, id: 'Cisn.atm.'},
	{code: 'rain', param_id: 30, id: 'opad atm.'},
	{code: 'rad', param_id: 31, id: 'prom'},
	{code: 'bzn', param_id: 9, id: 'Benzen'},
	{code: 'tln', param_id: 24, id: 'Toluen'},
	{code: 'oxy', param_id: 27, id: 'o-Ksylen'},
	{code: 'mpxy', param_id: 26, id: 'm,p-Ksylen'},
	{code: 'ebzn', param_id: 39, id: 'Etylobenzen'}
];


const find = function(field, value) {
	return map.find((channel) => channel[field] == value);
};


module.exports = {
	BY_PARAM_ID: (param_id) => find('param_id', param_id),
	BY_CODE: (code) => find('code', code),
	BY_ID: (id) => find('id', id)
};