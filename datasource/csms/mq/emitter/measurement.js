var outbound = require('../outbound'),
	types = require('../../../../types/types'),
	code = require('../../const/code'),
	entitizeMeasurement = require('../entitize/measurement'),
	measurements = require('../../api/measurements'),
	q = require('q');


var envelope = function(measurements, station) {
	return q.all(measurements.map((measurement) => entitizeMeasurement(measurement, station)))
		.then((mqMeasurements) => ({type: types.MQ.MEASUREMENT, datasource_code: code.DATASOURCE, payload: mqMeasurements}));
};


var measurement = function(date, channels, station) {
	return measurements.byDate(date, channels, station)
		.then((measurements) => envelope(measurements, station))
		.then((envelope) => {
			if (!envelope.payload.length)
				return false;

			return outbound.send(envelope);
		});
};


module.exports = measurement;