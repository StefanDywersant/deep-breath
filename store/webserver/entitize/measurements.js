module.exports = function(measurements, channel) {
	return {
		channel_uuid: channel.uuid,
		measurements: measurements.reduce(function(map, measurement) {
			map[measurement.timestamp.getTime()] = measurement.value;
			return map;
		}, {})
	}
};