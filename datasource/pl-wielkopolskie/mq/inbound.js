var config = require('config').datasource['pl-wielkopolskie'],
	rabbitmq = require('../../../service/rabbitmq')(config.rabbitmq),
	logger = require('../../../service/logger'),
	os = require('os'),
	req_measurements = require('../controller/req_measurements'),
	start_updates = require('../controller/start_updates'),
	types = require('../../../types/types.js'),
	q = require('q');


var consumerTag = [
	'datasource',
	'pl-wielkopolskie',
	os.hostname(),
	process.pid
].join(':');


module.exports = rabbitmq.then(function(connection) {
	return connection.createChannel().then(function(channel) {
		var receive = function(message) {
			try {
				var envelope = JSON.parse(message.content.toString());

				logger.silly('[mq:inbound] Received message:', envelope);

				(function() {
					switch (envelope.type) {
						case types.MQ.REQ_MEASUREMENTS:
							return req_measurements(envelope.payload);

						case types.MQ.START_UPDATES:
							return start_updates(envelope.payload);

						default:
							logger.error('[mq.inbound] Unknown message type %s', envelope.type);
							return q(false);
					}
				})().done(function() {
					channel.ack(message);
				}, function(error) {
					channel.nack(message, null, true)
					logger.error('[mq:inbound] Error: ' + error.message, error.stack);
				});
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
						'datasource:pl-wielkopolskie'
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
