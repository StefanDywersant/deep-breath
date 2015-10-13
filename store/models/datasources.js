var sequelize = require('../service/sequelize'),
	Sequelize = require('sequelize');

var Datasources = sequelize.define(
	'datasource',
	{
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},
		code: {
			type: Sequelize.STRING(64),
			allowNull: false
		}
	},
	{
		tableName: 'datasources',
		timestamps: false,
		comment: 'Available datasources'
	}
);

module.exports = Datasources;
