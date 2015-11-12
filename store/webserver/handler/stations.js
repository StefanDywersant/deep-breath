var Stations = require('../../models/stations'),
	entitize = require('../entitize/station'),
	q = require('q');

module.exports = function(app) {
	app.get('/stations/all', function(req, res) {
		Stations.findAll().then(function(stations) {
			return q.all(stations.map(entitize));
		}).done(function(stations) {
			res.send(stations);
		}, function(error) {
			res.status(500).send(error.message);
		});
	});

	app.get('/stations/nearest/:latitude,:longitude/:distance?/:limit?', function(req, res) {
		Stations.findNearest(
			{
				latitude: req.params.latitude,
				longitude: req.params.longitude
			},
			req.params.distance,
			req.params.limit
		).then(function(stations) {
			return q.all(stations.map(entitize));
		}).done(function(stations) {
			res.send(stations);
		}, function(error) {
			res.status(500).send(error.message);
		});
	});

	app.get('/stations/uuid/:uuid', function(req, res) {
		Stations.findByUUID(req.params.uuid).then(entitize).done(function(station) {
			if (!station) {
				res.status(404).send('Station not found: ' + req.params.uuid);
				return;
			}

			res.send(station);
		}, function(error) {
			res.status(500).send(error.message);
		});
	});
};
