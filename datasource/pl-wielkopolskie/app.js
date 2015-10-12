var stations = require('./api/stations'),
	measurements = require('./api/measurements'),
	redis = require('../../service/redis'),
	config = require('config');


redis.init(config.datasource['pl-wielkopolskie'].redis);

stations.all().done(function(stations) {
	console.log(stations);

/*	measurements.byDate(new Date('07/21/2004'), stations[6]).done(function(measurements) {
		console.log(JSON.stringify(measurements));
	}, function(error) {
		console.log(error);
	});
*/
	measurements.fromDate(new Date(0), stations[6]).then(function(date) {
		console.log('BEGIN DATE', date);
	});
}, function(error) {
	console.log(error);
});