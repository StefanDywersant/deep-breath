var logger = require('./logger');

module.exports = function(probeFunc, date, epsilon) {


	var step = 0;


	logger.info('[startdatefinder] Starting with date=' + date);


	var probe = function(date, interval) {
		step++;

		logger.debug('[startdatefinder:probe] Probing date=%s interval=%d step=%d', date, interval, step);

		return probeFunc(date).then(function(result) {
			if (result) {
				if (interval > epsilon) {
					return probe(
						new Date(date.getTime() - Math.floor(interval / 2)),
						Math.floor(interval / 2)
					);
				} else {
					logger.info('[startdatefinder:probe] Found start date %s in %d steps', date, step);
					return date;
				}
			} else {
				return probe(
					new Date(date.getTime() + interval),
					interval
				);
			}

		});
	};


	return probe(date, Math.floor((Date.now() - date.getTime()) / 2));
};