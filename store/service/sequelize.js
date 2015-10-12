var config = require('config'),
	Sequelize = require('sequelize');

var sequelize = new Sequelize(config.store.database.url);

module.exports = sequelize;
