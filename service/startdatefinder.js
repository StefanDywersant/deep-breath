var logger = require('./logger');


var heuristic = function(probeFunc, date, epsilon) {
	var step = 0;


	logger.info('[startdatefinder:heuristic] Starting with date=%s', date.toString());


	var probe = function(date, interval) {
		step++;

		logger.debug('[startdatefinder:heuristic] Probing date=%s interval=%d step=%d', date.toString(), interval, step);

		return probeFunc(date).then(function(result) {
			if (result) {
				if (interval > epsilon) {
					return probe(
						new Date(date.getTime() - Math.floor(interval / 2)),
						Math.floor(interval / 2)
					);
				} else {
					logger.info('[startdatefinder:heuristic] Found start date %s in %d steps', date.toString(), step);
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


var accurate = function(probeFunc, date, interval) {
	var step = 0;


	logger.info('[startdatefinder:accurate] Starting with date=%s', date.toString());


	var probe = function(date) {
		step++;

		logger.debug('[startdatefinder:accurate] Probing date=%s step=%d', date.toString(), step);

		return probeFunc(date).then(function(result) {
			if (result) {
				logger.info('[startdatefinder:accurate] Found start date %s in %d steps', date.toString(), step);
				return date;
			} else {
				var next = new Date(date.getTime() + interval);

				if (next.getTime() > Date.now()) {
					logger.info('[startdatefinder:accurate] Start date not found, steps=%d', step);
					return null;
				}

				return probe(new Date(date.getTime() + interval));
			}
		});
	};


	return probe(date);
};


module.exports = {
	accurate: accurate,
	heuristic: heuristic
};