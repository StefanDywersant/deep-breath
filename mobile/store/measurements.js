var requests = require('./requests');


var lastByChannels = function(channels) {
	var path = [
		'/measurements',
		channels.map(function(channel) {
			return channel.uuid;
		}).join(','),
		'last'
	];

	return requests.get(path.join('/')).then(function(result) {
		return JSON.parse(result);
	});
};


module.exports = {
	lastByChannels: lastByChannels
};
