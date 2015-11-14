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
		begin: {
			type: Sequelize.DATE,
			allowNull: false
		},
		end: {
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
				fields: ['channel_uuid', 'begin']
			},
			{
				unique: true,
				fields: ['channel_uuid', 'end']
			}
		]
	}
);

Measurements.belongsTo(Channels, {foreignKey: {allowNull: false}, onDelete: 'RESTRICT'});

Measurements.maxEndTime = function(channel) {
	return this.max(
		'end',
		{
			where: {
				channel_uuid: channel.uuid
			}
		}
	);
};

Measurements.findByEndTime = function(end, channel) {
	return this.findOne({
		where: {
			end: end,
			channel_uuid: channel.uuid
		}
	});
};

Measurements.findByRange = function(begin, end, channel) {
	return this.findAll({
		where: {
			channel_uuid: channel.uuid,
			begin: {
				$gt: begin
			},
			end: {
				$lte: end
			}
		},
		order: [['end', 'DESC']]
	});
};

Measurements.findLast = function(channel) {
	return this.findAll({
		where: {
			channel_uuid: channel.uuid
		},
		order: [['end', 'DESC']],
		limit: 1
	});
};

module.exports = Measurements;
