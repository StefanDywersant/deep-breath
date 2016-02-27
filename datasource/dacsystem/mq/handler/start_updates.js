var q = require('q'),
	logger = require('../../../../service/logger'),
	channels = require('../../api/channels'),
	updates = require('../../daemon/updates'),
	health = require('../../daemon/health');


module.exports = function(payload) {
	var channelId = parseInt(payload.channel_code.split(':')[2]);

	logger.verbose('[start_updates] Starting updates for channel=%s', payload.channel_code);

	return channels.byId(channelId).then(function(channel) {
		if (!channel) {
			logger.error('[mq.handler.start_updates] Channel %s doesn\'t exists', channelId);
			return null;
		}

		return q.all([
			updates.start(channel),
			health.start(channel)
		]);
	});
};