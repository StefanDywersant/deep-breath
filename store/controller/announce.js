var Stations = require('../models/stations'),
	Countries = require('../models/countries'),
	Datasources = require('../models/datasources'),
	q = require('q'),
	logger = require('../../service/logger');


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
				longitude: announcedStation.longitude,
				latitude: announcedStation.latitude,
				country_uuid: country.uuid,
				datasource_uuid: datasource.uuid
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
			});
		});
	}));
};

module.exports = function(announcedStations, datasourceCode) {
	return Datasources.findOne({where: {code: datasourceCode}}).then(function(datasource) {
		if (!datasource)
			throw new Error('Cannot find datasource with code: ' + datasourceCode);

		return Stations.findAll({
			where: {
				datasource_uuid: datasource.uuid
			}
		}).then(function(existingStations) {
			return upsertStations(announcedStations, datasource).then(function() {
				return deleteStations(announcedStations, existingStations);
			});
		});
	});
};