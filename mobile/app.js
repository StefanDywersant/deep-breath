var logger = require('../service/logger'),
	webserver = require('./webserver/webserver'),
	cluster = require('cluster'),
	os = require('os'),
	config = require('config').mobile;


// setup node environment
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';


var childsNo = function() {
	return config.webserver.childs == 'auto'
		? os.cpus().length
		: config.webserver.childs;
};

if (cluster.isMaster) {
	process.title = 'deep-breath-mobile: master';

	// spawn given number of children processes
	for (var i = 0; i < childsNo(); i++) {
		cluster.fork();
	}
} else {
	process.title = 'deep-breath-mobile: webserver';

	webserver.init().done(function() {
		logger.info('[app] Webserver process initialised: %d', process.pid)
	}, function(error) {
		logger.error('[app] Error while initializing webserver process %d: %s', process.pid, error.message);
	});
}
