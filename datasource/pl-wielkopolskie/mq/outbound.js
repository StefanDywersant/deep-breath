var config = require('config').datasource['pl-wielkopolskie'],
	rabbitmq = require('../../../service/rabbitmq')(config.rabbitmq),
	logger = require('../../../service/logger');


var initialized = rabbitmq.then(function(connection) {
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


var send = function(message) {
	return initialized.then(function(channel) {
		return channel.publish(
			config.rabbitmq.exchange,
			'store',
			new Buffer(JSON.stringify(message))
		);
	}).then(function() {
		logger.info('[mq:outbound] Sent message', message);
		return message;
	});
};


module.exports = {
	send: send
};