var config = require('config').datasource.dacsystem;

if (!process.argv[2])
	throw new Error('You should provide datasource name as first CLI argument');

var origin = config.origins.reduce(function(found, origin) {
	if (found)
		return found;
	return origin.code == process.argv[2] ? origin : null;
}, null);

if (!origin)
	throw new Error('Unknown origin: ' + process.argv[2]);

module.exports = origin;