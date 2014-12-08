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
	}
});

Dispatchr.registerStore(ContentStore);

var dispatcher = new Dispatchr();
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

var ContentStoreListenerMixin = {
	componentDidMount: function() {
		dispatcher.getStore('ContentStore').addChangeListener(this._onChange);
	},
	componentWillUnmount: function() {
		dispatcher.getStore('ContentStore').removeChangeListener(this._onChange);
	},
	_onChange: function() {
		this.setState(this.getInitialState());
	},
	getInitialState: function() {
		return this._stateFromStore(dispatcher.getStore('ContentStore'));
	},
};

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

var SimpleEditorWindow = React.createClass({
	render: function() {
		return (
			<div>
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