var requests = require('./requests');


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
	nearest: nearest
};
