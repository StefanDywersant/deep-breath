var sequelize = require('../service/sequelize'),
	Sequelize = require('sequelize');

var Countries = sequelize.define(
	'country',
	{
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},
		name: {
			type: Sequelize.STRING(256)
		},
		code: {
			type: Sequelize.STRING(2)
		}
	},
	{
		tableName: 'countries',
		timestamps: false,
		comment: 'Available countries'
	}
);

module.exports = Countries;