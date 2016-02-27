var stationsStore = require('../../../service/store/stations'),
	entitize = require('../entitize/station'),
	useful = require('../../service/useful'),
	q = require('q');

module.exports = function(app) {

	app.get('/stations/nearest/:latitude,:longitude', function(req, res) {
		stationsStore.nearest(
			{
				latitude: req.params.latitude,
				longitude: req.params.longitude
			},
			req.query.distance,
			req.query.limit
		).then(
			stations => q.all(stations.map(
				station => entitize(station, {useful: !!parseInt(req.query.useful)})
			))
		).then(
			stations => stations.filter(useful.station)
		).done(
			stations => res.send(stations),
			error => res.status(500).send(error.stack)
		);
	});

	app.get('/stations/search/*?', function(req, res) {
		stationsStore.search(
			req.params[0],
			req.query.offset,
			req.query.limit
		).then(
			stations => q.all(stations.map(
				station => entitize(station, {useful: !!parseInt(req.query.useful)})
			))
		).then(
			stations => stations.filter(useful.station)
		).done(
			stations => res.send(stations),
			error => res.status(500).send(error.stack)
		);
	});

	app.get('/stations/uuid/:uuid', function(req, res) {
		stationsStore.byUUID(req.params.uuid).then(
			entitize
		).done(
			station => res.send(station),
			error => res.status(500).send(error.stack)
		);
	});

};
