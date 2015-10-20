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

Channels.findByDatasource = function(datasource) {
	return sequelize.query(
		'SELECT c.* ' +
			'FROM channels c ' +
			'LEFT JOIN stations s ON c.station_uuid = s.uuid ' +
			'WHERE ' +
				's.datasource_uuid = ?' +
				'AND c.deleted_at IS NULL',
		{
			replacements: [datasource.uuid],
			model: Channels
		}
	);
};

Channels.findByCode = function(code) {
	return this.findOne({where: {code: code}});
};

Channels.findByStation = function(station) {
	return Channels.findAll({where: {station_uuid: station.uuid}});
};

Channels.findByUUID = function(uuid) {
	return Channels.findOne({where: {uuid: uuid}});
};

module.exports = Channels;
