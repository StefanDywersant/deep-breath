var requests = require('./requests');


var byStation = function(station) {
	var path = [
		'/stations',
		'uuid',
		station.uuid,
		'channels'
	];

	return requests.get(path.join('/')).then(function(result) {
		return JSON.parse(result);
	});
};


module.exports = {
	byStation: byStation
};
