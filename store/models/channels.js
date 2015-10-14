var sequelize = require('../service/sequelize'),
	Sequelize = require('sequelize'),
	Stations = require('./stations'),
	Parameters = require('./parameters');

var Channels = sequelize.define(
	'channel',
	{
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},
		code: {
			type: Sequelize.STRING(32),
			allowNull: false
		}
	},
	{
		tableName: 'channels',
		paranoid: true,
		underscored: true,
		comment: 'Station channels'
	}
);

Channels.belongsTo(Stations, {foreignKey: { allowNull: false }, onDelete: 'CASCADE'});
Channels.belongsTo(Parameters, {foreignKey: { allowNull: false }, onDelete: 'RESTRICT'});

module.exports = Channels;
