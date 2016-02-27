var dividers = require('../../const/dividers');


module.exports = function(value) {
	return value / dividers.pm10 * 5;
};