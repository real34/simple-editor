var createStore = require('dispatchr/utils/createStore');

var EventStore = createStore({
	storeName: 'EventStore',
	initialize: function() {
		this.events = [];
	},
	handlers: {
		'default': 'trackEvent'
	},
	trackEvent: function(payload, eventName) {
		this.events.push({
			name: eventName,
			payload: payload
		});
		this.emitChange();
	},
	getEvents: function() {
		return this.events;
	},
	dehydrate: function() {
		return { events: this.events }
	},
	rehydrate: function(state) {
		this.events = state.events;
		this.emitChange();
	}
});

module.exports = EventStore;