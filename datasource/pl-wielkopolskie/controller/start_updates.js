var q = require('q'),
	logger = require('../../../service/logger'),
	channels = require('../api/channels'),
	updates = require('../daemon/updates');


module.exports = function(payload) {
	var channelId = parseInt(payload.channel_code.split(':')[2]);

	logger.verbose('[start_updates] Starting updates for channel=%s', payload.channel_code);

	return channels.byId(channelId).then(function(channel) {
		if (!channel)
			throw new Error('Channel not found for id=%s', channel.id);

		return updates.start(channel);
	});
};