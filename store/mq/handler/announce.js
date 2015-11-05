var Stations = require('../../models/stations'),
	Countries = require('../../models/countries'),
	Datasources = require('../../models/datasources'),
	Parameters = require('../../models/parameters'),
	Channels = require('../../models/channels'),
	Measurements = require('../../models/measurements'),
	q = require('q'),
	logger = require('../../../service/logger'),
	mqOutbound = require('../outbound'),
	types = require('../../../types/types');


var deleteChannels = function(announcedChannels, existingChannels) {
	return q.all(existingChannels.filter(function(existingChannel) {
		return !announcedChannels.filter(function(announcedChannel) {
			return existingChannel.code == announcedChannel.code;
		}).length;
	}).map(function(deleteChannel) {
		logger.verbose('[announce:deleteChannels] Removing channel code=' + deleteChannel.code);
		return deleteChannel.destroy();
	}));
};


var upsertChannels = function(announcedChannels, station) {
	return q.all(announcedChannels.map(function(announcedChannel) {
		return Parameters.findOne({where: {code: announcedChannel.parameter_code}}).then(function(parameter) {
			if (!parameter) {
				logger.warn('[announce:upsertChannels] Parameter not found code=%s station.code=%s', announcedChannel.parameter_code, station.code);
				return null;
			}

			var dbChannel = {
				code: announcedChannel.code,
				station_uuid: station.uuid,
				parameter_uuid: parameter.uuid
			};

			return Channels.findOne({
				where: {code: announcedChannel.code, station_uuid: station.uuid},
				paranoid: false
			}).then(function(channel) {
				if (!channel) {
					logger.verbose('[announce:upsertChannels] Creating channel code=%s', dbChannel.code);
					return Channels.create(dbChannel);
				}

				if (channel.deleted_at) {
					logger.verbose('[announce:upsertChannels] Restoring channel code=%s', dbChannel.code);

					return channel.restore().then(function() {
						logger.verbose('[announce:upsertChannels] Updating channel code=%s', dbChannel.code);
						return channel.update(dbChannel);
					});
				}

				logger.verbose('[announce:upsertChannels] Updating channel code=%s', dbChannel.code);
				return channel.update(dbChannel);
			});
		});
	}));
};


var deleteStations = function(announcedStations, existingStations) {
	return q.all(existingStations.filter(function(existingStation) {
		return !announcedStations.filter(function(announcedStation) {
			return existingStation.code == announcedStation.code;
		}).length;
	}).map(function(deleteStation) {
		logger.verbose('[announce:deleteStations] Removing station code=' + deleteStation.code);
		return deleteStation.destroy();
	}));
};


var upsertStations = function(announcedStations, datasource) {
	return q.all(announcedStations.map(function(announcedStation) {
		return Countries.findOne({where: {code: announcedStation.country_code}}).then(function(country) {
			if (!country)
				throw new Error('No such country having code: ' + announcedStation.country_code);

			var dbStation = {
				code: announcedStation.code,
				name: announcedStation.name,
				address: announcedStation.address,
				country_uuid: country.uuid,
				datasource_uuid: datasource.uuid,
				flags: announcedStation.flags,
				location: {
					type: 'Point',
					coordinates: [
						announcedStation.location.longitude,
						announcedStation.location.latitude
					]
				}
			};

			return Stations.findOne({
				where: {code: announcedStation.code},
				paranoid: false
			}).then(function(station) {
				if (!station) {
					logger.verbose('[announce:upsertStations] Creating station code=%s', dbStation.code);
					return Stations.create(dbStation);
				}

				if (station.deleted_at) {
					logger.verbose('[announce:upsertStations] Restoring station code=%s', dbStation.code);

					return station.restore().then(function() {
						logger.verbose('[announce:upsertStations] Updating station code=%s', dbStation.code);
						return station.update(dbStation);
					});
				}

				logger.verbose('[announce:upsertStations] Updating station code=%s', dbStation.code);
				return station.update(dbStation);
			}).then(function(station) {
				return Channels.findAll({where: {station_uuid: station.uuid}}).then(function(existingChannels) {
					return upsertChannels(announcedStation.channels, station).then(function() {
						return deleteChannels(announcedStation.channels, existingChannels);
					});
				});
			});
		});
	}));
};


var reqMeasurements = function(datasource) {
	return Channels.findByDatasource(
		datasource
	).then(function(channels) {
		return q.all(channels.map(function(channel) {
			return Measurements.maxTimestamp(
				channel
			).then(function(timestamp) {
				return mqOutbound.send(
					{
						type: types.MQ.REQ_MEASUREMENTS,
						payload: {
							channel_code: channel.code,
							timestamp: timestamp ? timestamp : 0
						}
					},
					'datasource:' + datasource.code
				);
			});
		}));
	});
};


module.exports = function(announcedStations, datasourceCode) {
	return Datasources.findOne({where: {code: datasourceCode}}).then(function(datasource) {
		if (!datasource)
			throw new Error('Cannot find datasource with code: ' + datasourceCode);

		return Stations.findByDatasource(datasource).then(function(existingStations) {
			return upsertStations(announcedStations, datasource).then(function() {
				return deleteStations(announcedStations, existingStations);
			});
		}).then(function() {
			return reqMeasurements(datasource);
		});
	});
};