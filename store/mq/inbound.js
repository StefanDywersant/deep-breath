var config = require('config').store,
	rabbitmq = require('../../service/rabbitmq')(config.rabbitmq),
	logger = require('../../service/logger'),
	os = require('os'),
	announce = require('../controller/announce'),
	types = require('../../types/types.js');


var consumerTag = [
	'store',
	os.hostname(),
	process.pid
].join(':');


module.exports = rabbitmq.then(function(connection) {
	return connection.createChannel().then(function(channel) {
		var receive = function(message) {
			try {
				var envelope = JSON.parse(message.content.toString());

				logger.silly('[mq:inbound] Received message: ', envelope);

				if (envelope.type == types.MQ.ANNOUNCE) {
					announce(envelope.payload, envelope.datasource_code).done(function() {
						channel.ack(message);
					}, function() {
						channel.nack(message, null, true);
					});
				}
			} catch (error) {
				logger.error('[mq:inbound] Error: ', error.message);
				channel.nack(message, null, true);
			}
		};

		return channel.assertExchange(
			config.rabbitmq.exchange,
			'topic',
			{durable: true}
		).then(function() {
			return channel.assertQueue(config.rabbitmq.queue);
		}).then(function(queue) {
			return channel.bindQueue(
				queue.queue,
				config.rabbitmq.exchange,
				'store'
			).then(function() {
				logger.info('[mq:inbound] Setting consumer tag to: %s', consumerTag);

				// start consuming messages from queue
				return channel.consume(
					queue.queue,
					receive,
					{
						noAck: false,
						consumerTag: consumerTag
					}
				);
			});
		});
	}).then(function() {
		return true;
	});
});
