const logger = require('./logger');


const retry = function(func, left) {
	return func().fail(function(error) {
		logger.warn('[retry] Download failed: %s. Retries left: %d', error.message, left);

		if (!--left)
			throw new Error('No more retries left: ' + error.message);

		return retry(func, left);
	});
};


module.exports = retry;