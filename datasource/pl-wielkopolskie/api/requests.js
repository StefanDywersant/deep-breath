var http = require('http'),
	q = require('q'),
	querystring = require('querystring'),
	config = require('config').datasource['pl-wielkopolskie'],
	logger = require('../../../service/logger'),
	rateLimit = require('q-ratelimit')(config.api.ratelimit);


var get = function(path) {
	return rateLimit().then(function() {
		var deferred = q.defer(),
			host = config.api.host,
			startTime = Date.now();

		logger.silly('[api.requests:get] Request http://' + host + path);

		var request = http.request({
			host: host,
			path: path
		}, function(response) {
			logger.silly('[api.requests:get] Response http://' + host + path + ' (' + response.statusCode + ', ' + (Date.now() - startTime) + 'ms)');

			if (response.statusCode != 200) {
				deferred.reject('Invalid status: ' + response.statusCode);
				return;
			}

			var str = '';

			response.on('data', function (chunk) {
				str += chunk;
			});

			response.on('end', function () {
				deferred.resolve(str);
			});
		});

		request.on('error', function(error) {
			logger.error('[api.requests:get] Error while processing http://%s%s: %s', host, path, error);
			deferred.reject(error);
		});

		request.end();

		return deferred.promise;
	});
};


var post = function(path, data) {
	return rateLimit().then(function() {
		var deferred = q.defer(),
			postData = querystring.stringify(data),
			host = config.api.host,
			startTime = Date.now();

		logger.silly('[api.requests:post] Request http://' + host + path);

		var request = http.request({
			host: host,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(postData)
			}
		}, function(response) {
			logger.silly('[api.requests:post] Response http://' + host + path + ' (' + response.statusCode + ', ' + (Date.now() - startTime) + 'ms)');

			if (response.statusCode != 200) {
				deferred.reject('Invalid status: ' + response.statusCode);
				return;
			}

			var str = '';

			response.on('data', function (chunk) {
				str += chunk;
			});

			response.on('end', function () {
				deferred.resolve(str);
			});
		});

		request.write(postData);

		request.end();

		request.on('error', function(error) {
			logger.error('[requests:post] Error while processing http://%s%s: %s, payload: %s', host, path, error, JSON.stringify(postData));
			deferred.reject(error);
		});

		return deferred.promise;
	});
};


module.exports = {
	get: function() {
		var args = arguments;

		return retry(function() {
			return get.apply(this, args);
		}, config.api.retries);
	},
	post: function() {
		var args = arguments;

		return retry(function() {
			return post.apply(this, args);
		}, config.api.retries);
	}
};