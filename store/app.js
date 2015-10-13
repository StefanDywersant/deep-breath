var sync = require('./models/sync')(),
	inbound = require('./mq/inbound'),
	logger = require('../service/logger');

inbound.done(function() {
	logger.info('[app] Initialized MQ inbound service');
}, function(error) {
	logger.error('[app] Error while initializing MQ inbound service: %s', error.message);
});

