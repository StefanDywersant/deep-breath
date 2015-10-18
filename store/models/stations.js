var sequelize = require('../service/sequelize'),
	Sequelize = require('sequelize'),
	Countries = require('./countries'),
	Datasources = require('./datasources');

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
		longitude: {
			type: Sequelize.FLOAT,
			allowNull: false,
			validate: {
				min: -180,
				max: 180
			}
		},
		latitude: {
			type: Sequelize.FLOAT,
			allowNull: false,
			validate: {
				min: -90,
				max: 90
			}
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

module.exports = Stations;
