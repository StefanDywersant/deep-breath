var config = require('config').datasource.dacsystem,
	logger = require('../../../service/logger'),
	measurements = require('../api/measurements'),
	stations = require('../api/stations'),
	q = require('q'),
	emitMeasurement = require('../mq/emitter/measurement');


var channelsMap = {};


var init = function() {
	setInterval(function() {
		var start = Date.now();

		logger.verbose('[updates:init] Starting update loop on active channels');

		q.all(Object.keys(channelsMap).map(function(key) {
			return emitMeasurement(new Date(), channelsMap[key].channels, channelsMap[key].station);
		})).done(function() {
			logger.verbose('[updates:init] Finished update loop on active channels, took %dms', Date.now() - start);
		}, function(error) {
			logger.error('[updates:init] Error during channels update loop: %s', error.message);
		});
	}, config.measurements.update_interval);
};


var start = function(channel) {
	logger.verbose('[updates:start] Starting updates for channel=%s', channel.id);

	return stations.byChannel(channel).then(function(station) {
		if (!station)
			throw new Error('No such station for channel.id=%d', channel.id);

		if (station.id in channelsMap) {
			channelsMap[station.id].channels.push(channel);
		} else {
			channelsMap[station.id] = {
				station: station,
				channels: [channel]
			}
		}
	});
};


module.exports = {
	init: init,
	start: start
};