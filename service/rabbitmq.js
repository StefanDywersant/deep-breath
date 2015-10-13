var amqp = require('amqplib'),
	logger = require('./logger');


var init = function(config) {
	logger.info('[rabbitmq:init] Connectiong to %s...', config.url);

	return amqp.connect(
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
