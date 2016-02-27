var q = require('q'),
	index = require('../../engine/index');


var compute = function(req, res) {
	index.forChannels(req.body).done(function(result) {
		res.send(result);
	}, function(error) {
		res.status(500).send(error.message);
	});
};


module.exports = function(app) {
	app.post('/index/compute', compute);
};
