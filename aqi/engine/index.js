var channels = require('../store/channels'),
	measurements = require('../store/measurements'),
	scale = require('../const/scale'),
	q = require('q');


var algorithms = {
	'bzn': require('./pollutants/bzn.js'),
	'co': require('./pollutants/co.js'),
	'no2': require('./pollutants/no2.js'),
	'o3': require('./pollutants/o3.js'),
	'pm2.5': require('./pollutants/pm2_5.js'),
	'pm10': require('./pollutants/pm10.js'),
	'so2': require('./pollutants/so2.js')
};


var score = function(value) {
	if (value <= 1) {
		return scale.VERY_GOOD;
	} else if (value > 1 && value <= 3) {
		return scale.GOOD;
	} else if (value > 3 && value <= 5) {
		return scale.MODERATE;
	} else if (value > 5 && value <= 7) {
		return scale.SUFFICIENT;
	} else if (value > 7 && value <= 10) {
		return scale.BAD;
	} else if (value > 10) {
		return scale.VERY_BAD;
	}
};


var channelByUUID = function(uuid, channels) {
	return channels.reduce(function(found, channel) {
		if (found)
			return found;

		return channel.uuid == uuid
			? channel
			: null;
	}, null);
};


var forChannels = function(reqChannels) {
	return q.all(reqChannels.map(function(reqChannel) {
		return channels.byUUID(reqChannel.channel_uuid);
	})).then(function(channels) {
		return channels.filter(function(channel) {
			return Object.keys(algorithms).indexOf(channel.parameter.code) > -1;
		});
	}).then(function(channels) {
		var channelIndexes = reqChannels.reduce(function(channelIndexes, reqChannel) {
			var channel = channelByUUID(reqChannel.channel_uuid, channels);

			if (!channel)
				return channelIndexes;

			var value = algorithms[channel.parameter.code](reqChannel.value);

			channelIndexes.push({
				channel_uuid: channel.uuid,
				index: {
					value: value,
					score: score(value)
				}
			});

			return channelIndexes;
		}, []);

		var overallValue = channelIndexes.reduce(function(value, channelIndex) {
			return value > channelIndex.index.value
				? value
				: channelIndex.index.value
		}, 0);

		return {
			channels: channelIndexes,
			index: {
				value: overallValue,
				score: score(overallValue)
			}
		}
	});
};


module.exports = {
	forChannels: forChannels
};