'use strict';

var http = require('http'),
	q = require('q'),
	express = require('express'),
	exec = require('child_process').exec,
	bodyParser = require('body-parser'),
	stationsHandler = require('./handler/stations'),
	config = require('config').mobile,
	logger = require('../../service/logger'),
	winstonRequestLogger = require('winston-request-logger');


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

stationsHandler(app);

var instance = http.createServer(app);

var init = function() {
	instance.listen(config.webserver.port);
	logger.info('[webserver:init] Webserver listening on port %d', config.webserver.port);
	return q(true);
};

module.exports = {
	init: init
};