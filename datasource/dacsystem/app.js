var redis = require('../../service/redis'),
	config = require('config').datasource.dacsystem,
	origin = require('./config/origin'),
	logger = require('../../service/logger'),
	mqInbound = require('./mq/inbound'),
	updates = require('./daemon/updates'),
	emitAnnounce = require('./mq/emitter/announce'),
	health = require('./daemon/health');


if (process.env.NODE_ENV !== 'production')
	require('longjohn');

// setup node environment
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

process.title = 'deep-breath-datasource: dacsystem.' + origin.code;

config.redis.prefix += origin.code + ':';

redis.init(config.redis);

mqInbound()
	.then(emitAnnounce)
	.then(updates.init)
	.then(health.init)
	.done(function() {
		logger.info('[app] Initialized dacsystem(%s) datasource', origin.code);
	}, function(error) {
		logger.error('[app] Error during initialization: %s', error.stack);
	});
