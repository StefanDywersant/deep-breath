var outbound = require('../outbound'),
	types = require('../../../../types/types'),
	code = require('../../const/code'),
	entitizeMeasurement = require('../entitize/measurement'),
	measurements = require('../../api/measurements'),
	q = require('q');


var envelope = function(measurements, station) {
	return q.all(measurements.map(function(measurement) {
		return entitizeMeasurement(measurement, station);
	})).then(function(mqMeasurements) {
		return {
			type: types.MQ.MEASUREMENT,
			datasource_code: code.DATASOURCE,
			payload: mqMeasurements
		};
	});
};


var measurement = function(date, channels, station) {
	return measurements.byDate(
		date,
		channels,
		station
	).then(function(measurements) {
		return envelope(measurements, station);
	}).then(function(envelope) {
		if (!envelope.payload.length)
			return false;

		return outbound.send(envelope);
	});
};


module.exports = measurement;