module.exports = function(measurements, channel) {
	return {
		channel_uuid: channel.uuid,
		measurements: measurements.map(function(measurement) {
			return {
				begin: measurement.begin.getTime(),
				end: measurement.end.getTime(),
				value: measurement.value
			}
		})
	}
};