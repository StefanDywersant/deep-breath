var sequelize = require('../service/sequelize'),
	Sequelize = require('sequelize'),
	Channels = require('./channels');

var Measurements = sequelize.define(
	'measurement',
	{
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},
		timestamp: {
			type: Sequelize.DATE,
			allowNull: false
		},
		value: {
			type: Sequelize.FLOAT
		}
	},
	{
		tableName: 'measurements',
		paranoid: true,
		underscored: true,
		comment: 'Station channel measurements'
	}
);

Measurements.belongsTo(Channels, {foreignKey: { allowNull: false }, onDelete: 'RESTRICT'});

module.exports = Measurements;
