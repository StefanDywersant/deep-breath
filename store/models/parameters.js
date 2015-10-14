var sequelize = require('../service/sequelize'),
	Sequelize = require('sequelize'),
	Units = require('./units');

var Parameters = sequelize.define(
	'parameter',
	{
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},
		name: {
			type: Sequelize.STRING(256),
			allowNull: false
		},
		code: {
			type: Sequelize.STRING(16),
			allowNull: false
		}
	},
	{
		tableName: 'parameters',
		paranoid: true,
		underscored: true,
		comment: 'Measured parameters'
	}
);

Parameters.belongsTo(Units, {foreignKey: { allowNull: false }, onDelete: 'RESTRICT'});

module.exports = Parameters;