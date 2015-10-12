var sequelize = require('../service/sequelize'),
	logger = require('../../service/logger'),
	Countries = require('./countries'),
	Stations = require('./stations'),
	Units = require('./units'),
	Parameters = require('./parameters'),
	Channels = require('./channels'),
	Measurements = require('./measurements');

sequelize.sync().done(function() {
	logger.debug('[sequelize] Models synchronized');
}, function(error) {
	logger.error('[sequelize] Error synchronising models: ' + error.message);
});

module.exports = true;