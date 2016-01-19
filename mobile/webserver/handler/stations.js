var stationsStore = require('../../../service/store/stations'),
	entitize = require('../entitize/station'),
	useful = require('../../service/useful'),
	q = require('q');

module.exports = function(app) {

	app.get('/stations/nearest/:latitude,:longitude/:distance?/:limit?', function(req, res) {
		stationsStore.nearest(
			{
				latitude: req.params.latitude,
				longitude: req.params.longitude
			},
			req.params.distance,
			req.params.limit
		).then(function(stations) {
			return q.all(stations.map(entitize));
		}).then(function(stations) {
			return stations.filter(useful.station);
		}).done(function(stations) {
			res.send(stations);
		}, function(error) {
			res.status(500).send(error.stack);
		});
	});

	app.get('/stations/search/*?', function(req, res) {
		var args = req.params[0].split('/');

		stationsStore.search(
			args[0], // query
			args[1], // offset
			args[2] // limit
		).then(function(stations) {
			return q.all(stations.map(entitize));
		}).done(function(stations) {
			res.send(stations);
		}, function(error) {
			res.status(500).send(error.stack);
		});
	});

};
