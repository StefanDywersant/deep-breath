var requests = require('./requests');


var byUUID = function(uuid) {
	var path = [
		'/channels',
		'uuid',
		uuid
	].join('/');

	return requests.get(path).then(function(result) {
		return JSON.parse(result);
	});
};


var byStation = function(station) {
	var path = [
		'/stations',
		'uuid',
		station.uuid,
		'channels'
	].join('/');

	return requests.get(path).then(function(result) {
		return JSON.parse(result);
	});
};


module.exports = {
	byUUID: byUUID,
	byStation: byStation
};
