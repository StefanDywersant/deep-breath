var redis = require('redis'),
	q = require('q'),
	logger = require('./logger');


var client,
	prefix;


var init = function(config) {
	prefix = config.prefix;
	client = redis.createClient(config.port, config.host);
};


var get = function(key) {
	if (!client)
		throw new Error('Redis not initialized');

	return q.ninvoke(
		client,
		'get',
		prefix + key
	).then(function(value) {
		logger.silly('[redis:get] key=%s exists=%s', prefix + key, (value ? 'true' : 'false'));

		if (value)
			return JSON.parse(value);

		return null;
	});
};


var set = function(key, value, expire) {
	if (!client)
		throw new Error('Redis not initialized');

	return q.ninvoke(
		client,
		'set',
		prefix + key,
		JSON.stringify(value)
	).then(function() {
		if (!expire)
			return value;

		return q.ninvoke(
			client,
			'expire',
			prefix + key,
			Math.floor(expire / 1000)
		);
	}).then(function() {
		logger.silly('[redis:set] key=%s ttl=%s', prefix + key, expire ? (expire + 'ms') : '-');
		return value;
	});
};


module.exports = {
	init: init,
	get: get,
	set: set
};