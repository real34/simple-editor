var createStore = require('dispatchr/utils/createStore');

var ContentStore = createStore({
	storeName: 'ContentStore',
	initialize: function() {
		this.currentContent = ["#Hello world!", "Welcome to **markdown**"].join("\n\n");
	},
	handlers: {
		'CONTENT_CHANGED': 'onContentChanged',
		'FILE_LOADED': 'onContentChanged'
	},
	onContentChanged: function(payload) {
		this.currentContent = payload.content;
		this.emitChange();
	},
	getCurrentContent: function() {
		return this.currentContent;
	},
	dehydrate: function() {
		return { currentContent: this.currentContent }
	},
	rehydrate: function(state) {
		this.currentContent = state.currentContent;
		this.emitChange();
	}
});

module.exports = ContentStore;