var DAY = 24 * 60 * 60 * 1000;


var station = function(station) {
	return station.channels.length > 0;
};


var channel = function(channel) {
	return channel.last_measurement.end.getTime() + DAY > Date.now();
};


module.exports = {
	channel: channel,
	station: station
};