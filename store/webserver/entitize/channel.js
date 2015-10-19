var q = require('q');

module.exports = function(channel) {
	return channel.getParameter().then(function(parameter) {
		return parameter.getUnit().then(function(unit) {
			return {
				uuid: channel.uuid,
				parameter: {
					uuid: parameter.uuid,
					name: parameter.name,
					code: parameter.code,
					unit: {
						uuid: unit.uuid,
						format: unit.format
					}
				}
			};
		});
	});
};