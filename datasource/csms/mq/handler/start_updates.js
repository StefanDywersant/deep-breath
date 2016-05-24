var q = require('q'),
	logger = require('../../../../service/logger'),
	channels = require('../../api/channels'),
	updates = require('../../daemon/updates'),
	health = require('../../daemon/health');


module.exports = function(payload) {
	const channelId = payload.channel_code.split(':')[2],
		stationId = parseInt(payload.channel_code.split(':')[1]);

	logger.verbose('[start_updates] Starting updates for channel=%s', payload.channel_code);

	return channels.byId(channelId, stationId)
		.then((channel) => {
			if (!channel) {
				logger.error('[mq.handler.start_updates] Channel %s doesn\'t exists', payload.channel_code);
				return null;
			}

			return q.all([updates.start(channel), health.start(channel)]);
		});
};