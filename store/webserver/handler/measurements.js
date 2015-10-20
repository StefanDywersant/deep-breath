var router = require('express').Router(),
	Channels = require('../../models/channels'),
	Measurements = require('../../models/measurements'),
	entitize = require('../entitize/measurements'),
	q = require('q');


module.exports = function(app) {
	app.get('/measurements/:uuids/:begin/:end?', function(req, res) {
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
				return Measurements.findByBeginEnd(begin, end, channel).then(function(measurements) {
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
