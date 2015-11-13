var http = require('http'),
	q = require('q'),
	config = require('config').mobile,
	logger = require('../../service/logger');


var get = function(path) {
	var deferred = q.defer(),
		host = config.store.hostname,
		port = config.store.port,
		startTime = Date.now();

	logger.silly('[store.requests:get] Request http://' + host + path);

	var request = http.request({
		host: host,
		path: path,
		port: port
	}, function(response) {
		logger.silly('[store.requests:get] Response http://' + host + path + ' (' + response.statusCode + ', ' + (Date.now() - startTime) + 'ms)');

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
		logger.error('[store.requests:get] Error while processing http://%s%s: %s', host, path, error);
		deferred.reject(error);
	});

	request.end();

	return deferred.promise;
};


module.exports = {
	get: get
};