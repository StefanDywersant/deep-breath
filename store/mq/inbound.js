var config = require('config').store,
	rabbitmq = require('../../service/rabbitmq'),
	logger = require('../../service/logger'),
	os = require('os'),
	announce = require('./handler/announce'),
	measurement = require('./handler/measurement'),
	fin_measurements = require('./handler/fin_measurements'),
	types = require('../../types/types.js'),
	q = require('q');


var consumerTag = [
	'store',
	os.hostname(),
	process.pid
].join(':');


var init = function() {
	return rabbitmq(config.rabbitmq).then(function(connection) {
		return connection.createChannel().then(function(channel) {
			var receive = function(message) {
				try {
					var envelope = JSON.parse(message.content.toString());

					logger.silly('[mq.inbound] Received message', envelope);

					(function() {
						switch (envelope.type) {
							case types.MQ.ANNOUNCE:
								return announce(envelope.payload, envelope.datasource_code);

							case types.MQ.MEASUREMENT:
								return measurement(envelope.payload);

							case types.MQ.FIN_MEASUREMENTS:
								return fin_measurements(envelope.payload, envelope.datasource_code);

							default:
								logger.error('[mq.inbound] Unknown message type %s', envelope.type);
								return q(false);
						}
					})().done(function() {
						channel.ack(message);
					}, function(error) {
						channel.nack(message, null, true)
						logger.error('[mq.inbound] Error: ' + error.message, error.stack);
					});
				} catch (error) {
					logger.error('[mq.inbound] Error: ', error.message);
					channel.nack(message, null, true);
				}
			};

			return channel.assertExchange(
				config.rabbitmq.exchange,
				'topic',
				{durable: true}
			).then(function() {
				return channel.prefetch(config.rabbitmq.prefetch);
			}).then(function() {
				return channel.assertQueue(config.rabbitmq.queue);
			}).then(function(queue) {
				return channel.bindQueue(
					queue.queue,
					config.rabbitmq.exchange,
					'store'
				).then(function() {
					logger.info('[mq.inbound] Setting consumer tag to: %s', consumerTag);

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
			logger.info('[mq.inbound] Initialized MQ inbound service');
			return true;
		});
	});
};


module.exports = {
	init: init
};
