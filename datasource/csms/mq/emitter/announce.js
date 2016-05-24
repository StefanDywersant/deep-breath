var outbound = require('../outbound'),
	stations = require('../../api/stations'),
	types = require('../../../../types/types'),
	code = require('../../const/code'),
	entitizeStation = require('../entitize/station'),
	q = require('q');


var envelope = function(stations) {
	return q.all(stations.map(entitizeStation))
		.then((mqStations) => ({type: types.MQ.ANNOUNCE, datasource_code: code.DATASOURCE, payload: mqStations}));
};


var filter = function(stations) {
	return q(stations.filter((station) => !!station.location));
};


var announce = function() {
	return stations.all()
		.then(filter)
		.then(envelope)
		.then(outbound.send);
};


module.exports = announce;