var DAY = 24 * 60 * 60 * 1000;


var station = function(station) {
	return !!station.channel_groups.reduce(function(sum, channelGroup) {
		return sum + channelGroup.channels.length;
	}, 0);
};


var channel = function(channel) {
	return channel.last_measurement.end.getTime() + DAY > Date.now();
};


module.exports = {
	channel: channel,
	station: station
};