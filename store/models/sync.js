var sequelize = require('../service/sequelize'),
	logger = require('../../service/logger'),
	Countries = require('./countries'),
	Datasources = require('./datasources'),
	Stations = require('./stations'),
	Units = require('./units'),
	Parameters = require('./parameters'),
	Channels = require('./channels'),
	Measurements = require('./measurements'),
	q = require('q');

module.exports = function() {
	sequelize.sync().done(function() {
		logger.debug('[sequelize] Models synchronized');
	}, function(error) {
		logger.error('[sequelize] Error synchronising models: ' + error.message);
	});
};


/*setTimeout(function() {
	Measurements.drop().then(function() {
		return Channels.drop();
	}).then(function() {
		return Parameters.drop();
	}).then(function() {
		return Units.drop()
	}).then(function() {
		return Stations.drop();
	}).then(function() {
		return Datasources.drop();
	}).then(function() {
		return Countries.drop();
	}).then(function() {
		return sequelize.sync();
	}).then(function() {
		return Countries.create({
			code: 'pl',
			name: 'Poland'
		});
	}).then(function() {
		return Datasources.create({
			code: 'pl-wielkopolskie'
		});
	});
}, 2000);*/