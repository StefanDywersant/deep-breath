var http = require('http'),
	q = require('q'),
	logger = require('./logger');


module.exports = function(config) {
	var get = function(path) {
		var deferred = q.defer(),
			hostname = config.hostname,
			port = config.port,
			startTime = Date.now();

		logger.silly('[requests:get] Request http://' + hostname + path);

		var request = http.request({
			host: hostname,
			path: path,
			port: port
		}, function(response) {
			logger.silly('[requests:get] Response http://%s:%d%s (%d, %dms)', hostname, port, path, response.statusCode, (Date.now() - startTime));

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
			logger.error('[requests:get] Error while processing http://%s:%d%s: %s', hostname, port, path, error);
			deferred.reject(error);
		});

		request.end();

		return deferred.promise;
	};


	var post = function(path, data) {
		var deferred = q.defer(),
			postData = JSON.stringify(data),
			hostname = config.hostname,
			port = config.port,
			startTime = Date.now();

		logger.silly('[requests:post] Request http://%s:%d%s', hostname, port, path);

		var request = http.request({
			host: hostname,
			port: port,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(postData)
			}
		}, function(response) {
			logger.silly('[requests:post] Response http://%s:%d%s (%d, %dms)', hostname, port, path, response.statusCode, (Date.now() - startTime));

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
			logger.error('[requests:post] Error while processing http://%s%s: %s, payload: %s', hostname, path, error, postData);
			deferred.reject(error);
		});

		return deferred.promise;
	};


	return {
		get: get,
		post: post
	};
};