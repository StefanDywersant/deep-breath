var q = require('q');

module.exports = function(station) {
	return q({
		uuid: station.uuid,
		address: station.address,
		name: station.name,
		location: {
			longitude: station.location.coordinates[0],
			latitude: station.location.coordinates[1]
		},
		flags: station.flags
	});
};