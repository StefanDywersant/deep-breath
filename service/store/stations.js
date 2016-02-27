var config = require('config'),
	requests = require('../requests')({hostname: config.store.webserver.hostname, port: config.store.webserver.port});


var byUUID = function(uuid) {
	var path = [
		'/stations',
		'uuid',
		uuid
	].join('/');

	return requests.get(path).then(
		result => JSON.parse(result)
	);
};


var nearest = function(location, distance, limit) {
	var path = ['/stations', 'nearest', location.latitude + ',' + location.longitude];

	//@todo: fix
	if (distance)
		path.push(distance);

	//@todo: fix
	if (limit)
		path.push(limit);

	return requests.get(path.join('/')).then(
		result => JSON.parse(result)
	);
};


var search = function(query, offset, limit) {
	var path = ['/stations', 'search', query];

	//@todo: fix
	if (offset)
		path.push(offset);

	//@todo: fix
	if (limit)
		path.push(limit);

	return requests.get(path.join('/')).then(
		result => JSON.parse(result)
	);
};


module.exports = {
	byUUID: byUUID,
	nearest: nearest,
	search: search
};
