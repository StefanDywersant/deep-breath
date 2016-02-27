var DAY = 24 * 60 * 60 * 1000;


var station = function(station) {
	return !!station.channel_groups.reduce(function(sum, channelGroup) {
		return sum + channelGroup.channels.length;
	}, 0);
};


var channel = function(channel) {
	if (!channel.last_measurement)
		return false;

	if (channel.last_measurement.end.getTime() + DAY < Date.now())
		return false;

	return true;
};


module.exports = {
	channel: channel,
	station: station
};