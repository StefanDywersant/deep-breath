module.exports = {
	MQ: {
		ANNOUNCE: 'announce',
		REQ_MEASUREMENTS: 'req_measurements',
		FIN_MEASUREMENTS: 'fin_measurements',
		CHANNEL_HEALTH: 'channel_health',
		MEASUREMENT: 'measurements',
		START_UPDATES: 'start_updates'
	},
	STATION: {
		CLASSIFICATION: {
			BACKGROUND: 0x00001,
			COMMUNICATION: 0x00002,
			_MASK: 0x0000f
		},
		METHOD: {
			AUTOMATIC: 0x00010,
			MANUAL: 0x00020,
			_MASK: 0x000f0
		},
		PURPOSE: {
			PLANT_PROTECTION: 0x00100,
			HUMAN_HEALTH_PROTECTION: 0x00200,
			_MASK: 0x00f00
		},
		LOCAL_DISPERSION_CONDITIONS: {
			CITY: 0x01000,
			WOODS: 0x02000,
			AGRICULTURAL: 0x04000,
			_MASK: 0x0f000
		},
		AREA_TYPE: {
			URBAN: 0x10000,
			SUBURBAN: 0x20000,
			EXTRA_URBAN: 0x30000,
			FAR_EXTRA_URBAN: 0x40000,
			_MASK: 0xf0000
		}
	},
	CHANNEL: {
		HEALTH: {
			HEALTHY: 0x00001,
			FAULTY: 0x00000,
			_MASK: 0x0000f
		},
		METHOD: {
			AUTOMATIC: 0x00010,
			MANUAL: 0x00020,
			_MASK: 0x000f0
		}
	}
};