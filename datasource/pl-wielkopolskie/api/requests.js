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

		logger.debug('[api.requests:get] Request http://' + host + path);

		http.request({
			host: host,
			path: path
		}, function(response) {
			logger.debug('[api.requests:get] Response http://' + host + path + ' (' + response.statusCode + ', ' + (Date.now() - startTime) + 'ms)');

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
		}).end();

		return deferred.promise;
	});
};


var post = function(path, data) {
	return rateLimit().then(function() {
		var deferred = q.defer(),
			postData = querystring.stringify(data),
			host = config.api.host,
			startTime = Date.now();

		logger.debug('[api.requests:post] Request http://' + host + path);

		var request = http.request({
			host: host,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		}, function(response) {
			logger.debug('[api.requests:post] Response http://' + host + path + ' (' + response.statusCode + ', ' + (Date.now() - startTime) + 'ms)');

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

		return deferred.promise;
	});
};


module.exports = {
	get: get,
	post: post
};