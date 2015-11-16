var q = require('q');

module.exports = function(channel) {
	if (!channel)
		return null;

	return channel.getParameter().then(function(parameter) {
		return parameter.getUnit().then(function(unit) {
			return {
				uuid: channel.uuid,
				parameter: {
					uuid: parameter.uuid,
					name: parameter.name,
					code: parameter.code,
					flags: channel.flags,
					unit: {
						uuid: unit.uuid,
						format: unit.format
					}
				}
			};
		});
	});
};