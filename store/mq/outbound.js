var config = require('config').store,
	rabbitmq = require('../../service/rabbitmq'),
	logger = require('../../service/logger');


var promise;


var initialized = function() {
	if (promise)
		return promise;

	return promise = rabbitmq(config.rabbitmq).then(function(connection) {
		return connection.createChannel().then(function(channel) {
			return channel.assertExchange(
				config.rabbitmq.exchange,
				'topic',
				{durable: true}
			).then(function() {
					return channel;
				});
		});
	});
};


var send = function(message, target) {
	return initialized().then(function(channel) {
		return channel.publish(
			config.rabbitmq.exchange,
			target,
			new Buffer(JSON.stringify(message))
		);
	}).then(function() {
		logger.silly('[mq:outbound] Sent message', message);
		return message;
	});
};


module.exports = {
	send: send
};