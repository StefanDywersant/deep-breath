'use strict';

var http = require('http'),
	q = require('q'),
	express = require('express'),
	bodyParser = require('body-parser'),
	config = require('config').aqi,
	logger = require('../../service/logger'),
	winstonRequestLogger = require('winston-request-logger');

var indexHandler = require('./handler/index');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(winstonRequestLogger.create(logger, {
	ip: ':ip',
	status: ':statusCode',
	method: ':method',
	url: ':url[pathname]',
	responseTime: ':responseTimems',
	message: '[webserver]'
}));

indexHandler(app);

var instance = http.createServer(app);

var init = function() {
	instance.listen(config.webserver.port, config.webserver.hostname);
	logger.info('[webserver:init] Webserver listening on %s:%d', config.webserver.hostname, config.webserver.port);
	return q(true);
};

module.exports = {
	init: init
};