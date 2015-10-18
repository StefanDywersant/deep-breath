var logger = require('../../service/logger'),
	mqOutbound = require('../mq/outbound'),
	types = require('../../types/types');

module.exports = function(payload, datasourceCode) {


	logger.verbose('[fin_measurements] Finished req_measurements for channel=%s', payload.channel_code);

	return mqOutbound.send({
		type: types.MQ.START_UPDATES,
		payload: {
			channel_code: payload.channel_code
		}
	}, 'datasource:' + datasourceCode);

};