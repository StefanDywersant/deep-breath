var router = require('express').Router(),
	Stations = require('../../models/stations'),
	Channels = require('../../models/channels'),
	entitize = require('../entitize/channel'),
	q = require('q');


module.exports = function(app) {
	app.get('/stations/uuid/:uuid/channels', function(req, res) {
		Stations.findByUUID(req.params.uuid).then(function(station) {
			if (!station) {
				res.status(404).send('Station not found: ' + req.params.uuid);
				return false;
			}

			return Channels.findByStation(station).then(function(channels) {
				return q.all(channels.map(entitize));
			}).done(function(channels) {
				res.send(channels);
			}, function(error) {
				res.status(500).send(error.message);
			});
		});
	});
};
