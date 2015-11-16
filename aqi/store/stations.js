var requests = require('./requests');


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


module.exports = {
	byUUID: byUUID
};
