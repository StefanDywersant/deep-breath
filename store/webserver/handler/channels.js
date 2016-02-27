var Stations = require('../../models/stations'),
	Channels = require('../../models/channels'),
	entitize = require('../entitize/channel'),
	q = require('q');


var channelsByStationHandler = function(req, res) {
	Stations.findByUUID(req.params.uuid).then(function(station) {
		if (!station) {
			res.status(404).send('Station not found: ' + req.params.uuid);
			return false;
		}

		return Channels.findByStation(station).then(function(channels) {
			return q.all(channels.map(entitize));
		}).then(function(channels) {
			res.send(channels);
		});
	}).catch(function(error) {
		res.status(500).send(error.message);
	});
};


var channelByUUID = function(req, res) {
	return Channels.findByUUID(req.params.uuid).then(entitize).then(function(channel) {
		if (!channel) {
			res.status(404).send('Channel not found: ' + req.params.uuid);
			return;
		}

		res.send(channel);
	}).catch(function(error) {
		res.status(500).send(error.message);
	});
};


module.exports = function(app) {
	app.get('/stations/uuid/:uuid/channels', channelsByStationHandler);
	app.get('/channels/uuid/:uuid', channelByUUID);
	app.get('/channels/station/:uuid', channelsByStationHandler);
};
