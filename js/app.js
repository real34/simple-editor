var markdown = require('markdown').markdown;
var React = require('react');
var Dispatchr = require('dispatchr')();
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
	}
});

Dispatchr.registerStore(ContentStore);
Dispatchr.registerStore(EventStore);

var context = {};
var dispatcher = new Dispatchr(context);

var EditorActions = {
	changeContent: function(newContent) {
		dispatcher.dispatch('CONTENT_CHANGED', {
			content: newContent
		});
	},
	loadFile: function(filename, newContent) {
		dispatcher.dispatch('FILE_LOADED', {
			filename: filename,
			content: newContent
		});
	}
};

var StoreListenerMixin = function(storeName) {
	return {
		componentDidMount: function() {
			dispatcher.getStore(storeName).addChangeListener(this._onChange);
		},
		componentWillUnmount: function() {
			dispatcher.getStore(storeName).removeChangeListener(this._onChange);
		},
		_onChange: function() {
			this.setState(this.getInitialState());
		},
		getInitialState: function() {
			return this._stateFromStore(dispatcher.getStore(storeName));
		},
	}
};
var ContentStoreListenerMixin = StoreListenerMixin('ContentStore');
var EventStoreListenerMixin = StoreListenerMixin('EventStore');

var SimpleEditor = React.createClass({
	mixins: [ContentStoreListenerMixin],
	_stateFromStore: function(store) {
		return { value: store.getCurrentContent() }
	},
	handleChange: function(event) {
		EditorActions.changeContent(event.target.value);
	},
	render: function() {
		return (
			<div className="editor">
				<h3>Input</h3>
				<textarea onChange={this.handleChange} defaultValue={this.state.value}></textarea>
			</div>
		);
	}
});

var SimplePreview = React.createClass({
	mixins: [ContentStoreListenerMixin],
	_stateFromStore: function(store) {
		return { html: markdown.toHTML(store.getCurrentContent()) }
	},
	render: function() {
		return (
			<div>
				<h3>Preview</h3>
				<div
					className="preview"
					dangerouslySetInnerHTML={{
						__html: this.state.html
					}}
				/>
			</div>
		);
	}
});

var FileManager = React.createClass({
	mixins: [ContentStoreListenerMixin],
	_stateFromStore: function(store) {
		return { markdown: store.getCurrentContent() }
	},
	handleUpload: function(event) {
		var reader = new FileReader();
		var file = event.target.files[0];

		reader.onload = function() {
			EditorActions.loadFile(file.name, this.result);
		};
		reader.readAsText(file);
	},
	handleDownload: function(event) {
		// For a wider range of compatibility, see https://github.com/eligrey/FileSaver.js
		var blob = new Blob([this.state.markdown], {
			type: "text/markdown;charset=utf-8;"
		});
		var fileURL = window.URL.createObjectURL(blob); // window.URL.revokeObjectURL(fileURL);
		event.target.setAttribute('download', window.prompt('Please enter the filename', 'simple-text.md'));
		event.target.setAttribute('href', fileURL);
	},
	render: function() {
		return (
			<ul>
				<li><input type="file" name="file-uploader" onChange={ this.handleUpload } /></li>
				<li><a href="" download="" onClick={ this.handleDownload }>Download Mardown file</a></li>
			</ul>
		);
	}
});

var DebugBar = React.createClass({
	mixins: [EventStoreListenerMixin],
	_stateFromStore: function(store) {
		return { eventCount: store.getEvents().length }
	},
	componentDidMount: function() {
		this.initialState = dispatcher.dehydrate();
	},

	handleDownloadState: function() {
		var currentAppState = JSON.stringify(dispatcher.dehydrate());
		var fileURL = window.URL.createObjectURL(new Blob(
			[currentAppState],
			{ type: "text/json;charset=utf-8;"}
		));
		var nowSuffix = new Date(Date.now()).toLocaleString();
		event.target.setAttribute('download', 'simple-editor-state-' + nowSuffix);
		event.target.setAttribute('href', fileURL);
	},
	handleUploadState: function(event) {
		var reader = new FileReader();
		reader.onload = function() {
			dispatcher.rehydrate(JSON.parse(this.result));
		};
		reader.readAsText(event.target.files[0]);
	},

	handleDownloadHistory: function() {
		var currentAppHistory = {
			initialState: this.initialState,
			events: dispatcher.getStore('EventStore').getEvents()
		};
		var fileURL = window.URL.createObjectURL(new Blob(
			[JSON.stringify(currentAppHistory)],
			{ type: "text/json;charset=utf-8;"}
		));
		var nowSuffix = new Date(Date.now()).toLocaleString();
		event.target.setAttribute('download', 'simple-editor-history-' + nowSuffix);
		event.target.setAttribute('href', fileURL);
	},
	handleUploadHistory: function(event) {
		var reader = new FileReader();
		reader.onload = function() {
			var HISTORY_SPEED_IN_MS = 100;
			var history = JSON.parse(this.result);
			console.debug('rebuilding interface from history...');
			console.debug('... back to initial state');
			dispatcher.rehydrate(history.initialState);

			window.setTimeout(function applyNextEvent() {
				var eventToApply = history.events.shift();
				console.debug('... applying next event - left: ' + history.events.length);
				dispatcher.dispatch(eventToApply.name, eventToApply.payload);

				if (history.events.length) {
					window.setTimeout(applyNextEvent, HISTORY_SPEED_IN_MS);
				}
			}, HISTORY_SPEED_IN_MS);
		};
		reader.readAsText(event.target.files[0]);
	},

	render: function() {
		return (
			<div>
				<p>
					<strong>DEBUG BAR</strong>
					- {this.state.eventCount} events tracked
				</p>
				<p>
					<input type="file" onChange={ this.handleUploadState } />
					- <a href="" download="" onClick={ this.handleDownloadState }>Download current state</a>
				</p>
				<p>
					<input type="file" onChange={ this.handleUploadHistory } />
					- <a href="" download="" onClick={ this.handleDownloadHistory }>Download actions history</a>
				</p>
			</div>
		);
	}
});

var SimpleEditorWindow = React.createClass({
	render: function() {
		return (
			<div>
				<DebugBar />
				<FileManager />
				<SimpleEditor />
				<SimplePreview />
			</div>
		);
	}
});

React.render(
	<SimpleEditorWindow />,
	document.getElementById('editor')
);