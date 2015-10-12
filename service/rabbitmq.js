var amqp = require('amqplib'),
	config = require('config'),
	logger = require('./logger');


/**
 * Initializes RabbitMQ connection.
 *
 * @author Karol Maciaszek <karol.maciaszek@contractors.roche.com>
 * @returns {!!Promise}
 */
var init = function() {
	logger.info('[rabbitmq] Initializing RabbitMQ connection...');

	return amqp.connect(
		config.rabbitmq.url
	).then(function(connection) {
		// close connection on process termination
		process.once('SIGINT', function() {
			connection.close();
		});

		logger.info('[rabbitmq] Initialized RabbitMQ connection');
		return connection;
	});
};

module.exports = init();
