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
	},
	dehydrate: function() {
		return { events: this.events }
	},
	rehydrate: function(state) {
		this.events = state.events;
		this.emitChange();
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
				<textarea onChange={this.handleChange} value={this.state.value}></textarea>
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

var FileUploader = React.createClass({
	handleUpload: function(event) {
		var onUploadCallback = this.props.onUpload;
		var reader = new FileReader();
		var file = event.target.files[0];

		reader.onload = function() {
			onUploadCallback(file.name, this.result);
		};
		reader.readAsText(file);
	},
	render: function() {
		return (
			<input type="file" onChange={ this.handleUpload } />
		);
	}
});

var FileDownloader = React.createClass({
	// For a wider range of compatibility, see https://github.com/eligrey/FileSaver.js
	handleDownload: function(event) {
		var fileData = this.props.getFileData();
		var blob = new Blob(
			[fileData.content],
			{ type: fileData.type }
		);
		var fileURL = window.URL.createObjectURL(blob); // consider also using `window.URL.revokeObjectURL(fileURL);` to prevent memory leaks
		event.target.setAttribute('download', fileData.name);
		event.target.setAttribute('href', fileURL);
	},
	render: function() {
		return (
			<a href="" download="" onClick={ this.handleDownload }>{ this.props.label }</a>
		);
	}
});

var FileManager = React.createClass({
	mixins: [ContentStoreListenerMixin],
	_stateFromStore: function(store) {
		return { markdown: store.getCurrentContent() }
	},
	handleContentUpload: function(filename, content) {
		EditorActions.loadFile(filename, content);
	},
	downloadedFileData: function() {
		return {
			content: this.state.markdown,
			type: "text/markdown;charset=utf-8;",
			name: window.prompt('Please enter the filename', 'simple-text.md')
		};
	},
	render: function() {
		return (
			<p>
				<FileUploader onUpload={ this.handleContentUpload } />
				- <FileDownloader getFileData={ this.downloadedFileData } label="Download Mardown file" />
			</p>
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

	downloadedStateData: function() {
		return {
			content: JSON.stringify(dispatcher.dehydrate()),
			type: "text/json;charset=utf-8;",
			name: 'simple-editor-state-' + new Date(Date.now()).toLocaleString()
		}
	},
	handleUploadState: function(filename, content) {
		dispatcher.rehydrate(JSON.parse(content));
	},

	downloadedHistoryData: function() {
		var currentAppHistory = {
			initialState: this.initialState,
			events: dispatcher.getStore('EventStore').getEvents()
		};
		return {
			content: JSON.stringify(currentAppHistory),
			type: "text/json;charset=utf-8;",
			name: 'simple-editor-history-' + new Date(Date.now()).toLocaleString()
		}
	},
	handleUploadHistory: function(filename, content) {
		var HISTORY_SPEED_IN_MS = 100;
		var history = JSON.parse(content);
		console.debug('rebuilding interface from history contained in "' + filename + '"...');
		console.debug('... back to initial state');
		dispatcher.rehydrate(history.initialState);

		(function applyNextEvent() {
			var eventToApply = history.events.shift();
			console.debug('... applying next event - remaining: ' + history.events.length);
			dispatcher.dispatch(eventToApply.name, eventToApply.payload);

			if (history.events.length) {
				window.setTimeout(applyNextEvent, HISTORY_SPEED_IN_MS);
			} else {
				console.debug('that\'s all folks!');
			}
		})();
	},

	render: function() {
		return (
			<div>
				<p>
					<strong>DEBUG BAR</strong>
					- {this.state.eventCount} events tracked
				</p>
				<p>
					<FileUploader onUpload={ this.handleUploadState } />
					- <FileDownloader getFileData={ this.downloadedStateData } label="Download current application state" />
				</p>
				<p>
					<FileUploader onUpload={ this.handleUploadHistory } />
					- <FileDownloader getFileData={ this.downloadedHistoryData } label="Download application history" />
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