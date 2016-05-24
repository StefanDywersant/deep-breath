var redis = require('../../service/redis'),
	config = require('config').datasource.csms,
	logger = require('../../service/logger'),
	mqInbound = require('./mq/inbound'),
	updates = require('./daemon/updates'),
	emitAnnounce = require('./mq/emitter/announce'),
	health = require('./daemon/health');


if (process.env.NODE_ENV !== 'production')
	require('longjohn');

// setup node environment
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

process.title = 'deep-breath-datasource: csms.pl-mazowieckie';

config.redis.prefix += 'pl-mazowieckie:';

redis.init(config.redis);

mqInbound()
	.then(emitAnnounce)
	.then(updates.init)
	.then(health.init)
	.done(function() {
		logger.info('[app] Initialized CSMS(pl-mazowieckie) datasource');
	}, function(error) {
		logger.error('[app] Error during initialization: %s', error.stack);
	});
