var sequelize = require('../service/sequelize'),
	Sequelize = require('sequelize'),
	Countries = require('./countries'),
	Datasources = require('./datasources'),
	config = require('config').store;

var Stations = sequelize.define(
	'station',
	{
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},
		code: {
			type: Sequelize.STRING(256),
			allowNull: false
		},
		name: {
			type: Sequelize.STRING(256),
			allowNull: false
		},
		address: {
			type: Sequelize.JSON
		},
		location: {
			type: Sequelize.GEOMETRY('POINT'),
			allowNull: false
		},
		flags: {
			type: Sequelize.INTEGER,
			allowNull: false
		}
	},
	{
		tableName: 'stations',
		paranoid: true,
		underscored: true,
		comment: 'Measurement stations'
	}
);

Stations.belongsTo(Countries, {foreignKey: { allowNull: false }, onDelete: 'RESTRICT'});
Stations.belongsTo(Datasources, {foreignKey: { allowNull: false }, onDelete: 'RESTRICT'});

Stations.findByDatasource = function(datasource) {
	return this.findAll({where: {datasource_uuid: datasource.uuid}});
};

Stations.findNearest = function(location, distance, limit) {
	limit = limit ? limit : config.stations.nearest.limit;
	distance = distance ? distance : config.stations.nearest.distance;

	return sequelize.query(
		'SELECT * ' +
			'FROM stations ' +
			'WHERE ST_Distance_Sphere(location, st_makepoint(?, ?)) < ? ' +
			'ORDER BY location <-> st_setsrid(st_makepoint(?, ?), 4326) ' +
			'LIMIT ?',
		{
			replacements: [
				location.longitude,
				location.latitude,
				distance,
				location.longitude,
				location.latitude,
				limit
			],
			model: Stations
		}
	);
};

Stations.findByUUID = function(uuid) {
	return Stations.findOne({where: {uuid: uuid}});
};

module.exports = Stations;
