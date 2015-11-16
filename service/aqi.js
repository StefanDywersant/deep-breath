var config = require('config'),
	requests = require('./requests')({hostname: config.aqi.webserver.hostname, port: config.aqi.webserver.port});


var compute = function(channelValues) {
	return requests.post(
		'/index/compute',
		channelValues
	).then(function(result) {
		return JSON.parse(result);
	});
};


module.exports = {
	compute: compute
};