var dividers = require('../../const/dividers');


module.exports = function(value) {
	return value / dividers['pm2.5'] * 5;
};