var router = require('express').Router(),
	Channels = require('../../models/channels'),
	Measurements = require('../../models/measurements'),
	entitize = require('../entitize/measurements'),
	q = require('q');


module.exports = function(app) {
	app.get('/measurements/:uuids/range/:begin/:end?', function(req, res) {
		var begin = new Date(parseInt(req.params.begin)),
			end = 'end' in req.params
				? new Date(parseInt(req.params.end))
				: new Date();

		q.all(
			req.params.uuids
				.split(',')
				.map(Channels.findByUUID)
		).then(function(channels) {
			return q.all(channels.map(function(channel) {
				return Measurements.findByRange(begin, end, channel).then(function(measurements) {
					return entitize(measurements, channel);
				});
			}));
		}).done(function(result) {
			res.send(result);
		}, function(error) {
			res.status(500).send(error.stack);
		});
	});

	app.get('/measurements/:uuids/last', function(req, res) {
		q.all(
			req.params.uuids.split(',').map(Channels.findByUUID)
		).then(function(channels) {
			return q.all(channels.map(function(channel) {
				return Measurements.findLast(channel).then(function(measurements) {
					return entitize(measurements, channel);
				});
			}));
		}).done(function(result) {
			res.send(result);
		}, function(error) {
			res.status(500).send(error.stack);
		});
	});
};
