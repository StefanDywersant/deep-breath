var amqp = require('amqplib'),
	logger = require('./logger');


var promise;


var init = function(config) {
	if (promise)
		return promise;

	logger.info('[rabbitmq:init] Connecting to %s...', config.url);

	return promise = amqp.connect(
		config.url
	).then(function(connection) {
		// close connection on process termination
		process.once('SIGINT', function() {
			connection.close();
		});

		logger.info('[rabbitmq:init] Connected to %s', config.url);
		return connection;
	});
};

module.exports = init;
