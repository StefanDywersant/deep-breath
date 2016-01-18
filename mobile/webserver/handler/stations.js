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

	app.get('/stations/search/:query?/:offset?/:limit?', function(req, res) {
		stationsStore.search(
			req.params.query,
			req.params.offset,
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

};
