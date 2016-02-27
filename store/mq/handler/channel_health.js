var logger = require('../../../service/logger'),
	types = require('../../../types/types'),
	Channels = require('../../models/channels');

module.exports = function(payload) {

	logger.verbose(
		'[channel_health] Channel %s status changed to %s',
		payload.channel_code, (payload.health ? 'healthy' : 'faulty')
	);

	return Channels.findByCode(payload.channel_code).then(function(channel) {
		if (!channel)
			throw new Error('Cannot find channel having code: %s', payload.channel_code);

		if (payload.health)
			channel.flags |= types.CHANNEL.HEALTH.HEALTHY;
		else
			channel.flags &= ~types.CHANNEL.HEALTH.HEALTHY;

		return channel.save();
	});
};