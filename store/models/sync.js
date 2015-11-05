var sequelize = require('../service/sequelize'),
	logger = require('../../service/logger'),
	Countries = require('./countries'),
	Datasources = require('./datasources'),
	Stations = require('./stations'),
	Units = require('./units'),
	Parameters = require('./parameters'),
	Channels = require('./channels'),
	Measurements = require('./measurements'),
	q = require('q');

module.exports = function() {
	sequelize.sync().done(function() {
		logger.debug('[sequelize] Models synchronized');
	}, function(error) {
		logger.error('[sequelize] Error synchronizing models: ' + error.message);
	});
};

/*
setTimeout(function() {
	Measurements.drop().then(function() {
		return Channels.drop();
	}).then(function() {
		return Parameters.drop();
	}).then(function() {
		return Units.drop()
	}).then(function() {
		return Stations.drop();
	}).then(function() {
		return Datasources.drop();
	}).then(function() {
		return Countries.drop();
	}).then(function() {
		return sequelize.sync();
	}).then(function() {
		return Countries.create({
			code: 'pl',
			name: 'Poland'
		});
	}).then(function() {
		return Datasources.create({
			code: 'pl-wielkopolskie'
		});
	}).then(function() {
		return Units.create({
			format: '%.2f µg/m³'
		}).then(function(unit) {
			return q.all([
				Parameters.create({
					name: 'Pył zawieszony PM₁₀',
					code: 'pm10',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Pył zawieszony PM₂.₅',
					code: 'pm2.5',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Dwutlenek siarki SO₂',
					code: 'so2',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Tlenek węgla CO',
					code: 'co',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Dwutlenek azotu NO₂',
					code: 'no2',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Tlenki azotu NOₓ',
					code: 'nox',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Tlenek azotu NO',
					code: 'no',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Ozon O₃',
					code: 'o3',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Benzen C₆H₆',
					code: 'bzn',
					unit_uuid: unit.uuid
				})
			]);
		});
	}).then(function() {
		return Units.create({
			format: '%.2f ⁰C'
		}).then(function(unit) {
			return Parameters.create({
				name: 'Temperatura',
				code: 'temp',
				unit_uuid: unit.uuid
			});
		});
	}).then(function() {
		return Units.create({
			format: '%.2f hPa'
		}).then(function(unit) {
			return Parameters.create({
				name: 'Ciśnienie atmosferyczne',
				code: 'press',
				unit_uuid: unit.uuid
			});
		});
	}).then(function() {
		return Units.create({
			format: '%.2f \\%'
		}).then(function(unit) {
			return Parameters.create({
				name: 'Wilgotność względna',
				code: 'humid',
				unit_uuid: unit.uuid
			});
		});
	}).then(function() {
		return Units.create({
			format: '%.2f m/s'
		}).then(function(unit) {
			return Parameters.create({
				name: 'Prędkość wiatru',
				code: 'ws',
				unit_uuid: unit.uuid
			});
		});
	}).then(function() {
		return Units.create({
			format: '%.2f ⁰'
		}).then(function(unit) {
			return Parameters.create({
				name: 'Kierunek wiatru',
				code: 'wd',
				unit_uuid: unit.uuid
			});
		});
	}).then(function() {
		return Units.create({
			format: '%.2f ng/m³'
		}).then(function(unit) {
			return q.all([
				Parameters.create({
					name: 'Benzo(a)piren w PM₁₀',
					code: 'pm10_bap',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Arsen w PM₁₀',
					code: 'pm10_as',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Kadm w PM₁₀',
					code: 'pm10_cd',
					unit_uuid: unit.uuid
				}),
				Parameters.create({
					name: 'Nikiel w PM₁₀',
					code: 'pm10_ni',
					unit_uuid: unit.uuid
				})
			]);
		});
	}).then(function() {
		return Units.create({
			format: '%.2f ppb'
		}).then(function(unit) {
			return Parameters.create({
				name: 'Ołów',
				code: 'pb',
				unit_uuid: unit.uuid
			});
		});
	});
}, 2000);
*/