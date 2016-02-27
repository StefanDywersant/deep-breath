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


setTimeout(function() {
	q.all([
		Units.findOne({where: {format: '%.2f µg/m³'}}).then(function(unit) {
			if (unit)
				return unit;

			return Units.create({
				format: '%.2f µg/m³'
			});
		}).then(function(unit) {
			return q.all([
				Parameters.findOne({where: {code: 'pm10_pb'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Ołów w PM₁₀',
						code: 'pm10_pb',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'ebzn'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Etylobenzen C₈H₁₀',
						code: 'ebzn',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'tln'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Toluen C₇H₈',
						code: 'tln',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'oxy'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'O-Ksylen C₈H₁₀',
						code: 'oxy',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'mpxy'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'M-P-Ksylen C₈H₁₀',
						code: 'mpxy',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'hcho'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Formaldehyd',
						code: 'hcho',
						unit_uuid: unit.uuid
					});
				})
			]);
		}),
		Units.findOne({where: {format: '%.2f ng/m³'}}).then(function(unit) {
			if (unit)
				return unit;

			return Units.create({
				format: '%.2f ng/m³'
			});
		}).then(function(unit) {
			return q.all([
				Parameters.findOne({where: {code: 'pm10_baa'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Benzo(a)antracen w PM₁₀',
						code: 'pm10_baa',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'pm10_bbf'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Benzo(b)fluoranten w PM₁₀',
						code: 'pm10_bbf',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'pm10_bjf'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Benzo(j)fluoranten w PM₁₀',
						code: 'pm10_bjf',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'pm10_bkf'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Benzo(k)fluoranten w PM₁₀',
						code: 'pm10_bkf',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'pm10_dbaha'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Dibenzo(a,h)antracen w PM₁₀',
						code: 'pm10_dbaha',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'pm10_ip'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Indeno(1,2,3-cd)piren w PM₁₀',
						code: 'pm10_ip',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'hg'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Rtęć gazowa',
						code: 'hg',
						unit_uuid: unit.uuid
					});
				})
			]);
		}),
		Units.findOne({where: {format: '%d mm'}}).then(function(unit) {
			if (unit)
				return unit;

			return Units.create({
				format: '%d mm'
			});
		}).then(function(unit) {
			return q.all([
				Parameters.findOne({where: {code: 'rain'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Opad atmosferyczny',
						code: 'rain',
						unit_uuid: unit.uuid
					});
				})
			]);
		}),
		Units.findOne({where: {format: '%d W/m²'}}).then(function(unit) {
			if (unit)
				return unit;

			return Units.create({
				format: '%d W/m²'
			});
		}).then(function(unit) {
			return q.all([
				Parameters.findOne({where: {code: 'rad'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Promieniowanie globalne',
						code: 'rad',
						unit_uuid: unit.uuid
					});
				}),
				Parameters.findOne({where: {code: 'uvb'}}).then(function(parameter) {
					if (parameter)
						return parameter;

					return Parameters.create({
						name: 'Radiacja UVB',
						code: 'uvb',
						unit_uuid: unit.uuid
					});
				})
			]);
		})
	]);

/*	Measurements.drop().then(function() {
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
				}),
				Parameters.create({
					name: 'Ołów w PM₁₀',
					code: 'pm10_pb',
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
	});*/
}, 500);
