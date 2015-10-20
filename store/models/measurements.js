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
		comment: 'Station channel measurements',
		indexes: [
			{
				unique: true,
				fields: ['timestamp', 'channel_uuid']
			}
		]
	}
);

Measurements.belongsTo(Channels, {foreignKey: { allowNull: false }, onDelete: 'RESTRICT'});

Measurements.maxTimestamp = function(channel) {
	return this.max(
		'timestamp',
		{
			where: {
				channel_uuid: channel.uuid
			}
		}
	);
};

Measurements.findByTimestamp = function(timestamp, channel) {
	return this.findOne({
		where: {
			timestamp: timestamp,
			channel_uuid: channel.uuid
		}
	});
};

Measurements.findByBeginEnd = function(begin, end, channel) {
	return this.findAll({
		where: {
			channel_uuid: channel.uuid,
			timestamp: {
				$gte: begin,
				$lte: end
			}
		},
		order: [['timestamp', 'DESC']]
	});
};

module.exports = Measurements;
