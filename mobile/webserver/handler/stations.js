var stationsStore = require('../../store/stations'),
	entitize = require('../entitize/station'),
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
		}).done(function(stations) {
			res.send(stations);
		}, function(error) {
			res.status(500).send(error.stack);
		});
	});

};
