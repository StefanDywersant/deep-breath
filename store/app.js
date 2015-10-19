var sync = require('./models/sync')(),
	inbound = require('./mq/inbound'),
	logger = require('../service/logger'),
	webserver = require('./webserver/webserver'),
	cluster = require('cluster'),
	os = require('os'),
	config = require('config').store;


var childsNo = function() {
	return config.webserver.childs == 'auto'
		? os.cpus().length
		: config.webserver.childs;
};

if (cluster.isMaster) {
	// spawn given number of children processes
	for (var i = 0; i < childsNo(); i++) {
		cluster.fork();
	}

	inbound.init().done(function() {
		logger.info('[app] MQ process initialised: %d', process.pid)
	}, function(error) {
		logger.error('[app] Error while initializing MQ process: %s', error.message);
	});
} else {
	webserver.init().done(function() {
		logger.info('[app] Webserver process initialised: %d', process.pid)
	}, function(error) {
		logger.error('[app] Error while initializing webserver process %d: %s', process.pid, error.message);
	});
}