var sequelize = require('../service/sequelize'),
	Sequelize = require('sequelize');

var Units = sequelize.define(
	'unit',
	{
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},
		format: {
			type: Sequelize.STRING(64),
			allowNull: false
		}
	},
	{
		tableName: 'units',
		timestamps: false,
		comment: 'Measurement units'
	}
);

module.exports = Units;
