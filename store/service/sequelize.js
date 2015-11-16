var config = require('config'),
	Sequelize = require('sequelize');

var sequelize = new Sequelize(config.store.database.url, {logging: console.log});

module.exports = sequelize;
