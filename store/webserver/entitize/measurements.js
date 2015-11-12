module.exports = function(measurements, channel) {
	return {
		channel_uuid: channel.uuid,
		measurements: measurements.map(function(measurement) {
			return {
				begin: measurement.begin,
				end: measurement.end,
				value: measurement.value
			}
		})
	}
};