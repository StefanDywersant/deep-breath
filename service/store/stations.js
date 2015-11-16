var config = require('config'),
	requests = require('../requests')({hostname: config.store.webserver.hostname, port: config.store.webserver.port});


var byUUID = function(uuid) {
	var path = [
		'/stations',
		'uuid',
		uuid
	].join('/');

	return requests.get(path).then(function(result) {
		return JSON.parse(result);
	});
};


var nearest = function(location, distance, limit) {
	var path = [
		'/stations',
		'nearest',
		location.latitude + ',' + location.longitude
	];

	if (distance)
		path.push(distance);

	if (limit)
		path.push(limit);

	return requests.get(path.join('/')).then(function(result) {
		return JSON.parse(result);
	});
};


module.exports = {
	byUUID: byUUID,
	nearest: nearest
};
