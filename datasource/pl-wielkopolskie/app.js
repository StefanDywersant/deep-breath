var redis = require('../../service/redis'),
	config = require('config').datasource['pl-wielkopolskie'],
	logger = require('../../service/logger'),
	mqInbound = require('./mq/inbound'),
	updates = require('./daemon/updates'),
	emitAnnounce = require('./mq/emitter/announce');


if (process.env.NODE_ENV !== 'production')
	require('longjohn');

// setup node environment
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

process.title = 'deep-breath-datasource: pl-wielkopolskie';

redis.init(config.redis);

mqInbound()
	.then(emitAnnounce)
	.then(updates.init)
	.done(function() {
		logger.info('[app] Initialized pl-wielkopolskie datasource');
	}, function(error) {
		logger.error('[app] Error during initialization: %s', error.stack);
	});
