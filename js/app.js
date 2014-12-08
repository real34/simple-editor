var markdown = require('markdown').markdown;
var React = require('react');
var AppDispatcher = require('flux').Dispatcher;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var EditorConstants = {
	CONTENT_CHANGED: 'CONTENT_CHANGED',
	FILE_LOADED: 'FILE_LOADED'
};
var EditorActions = {
	changeContent: function(newContent) {
		AppDispatcher.dispatch({
			actionType: EditorConstants.CONTENT_CHANGED,
			content: newContent
		});
	},
	loadFile: function(filename, newContent) {
		AppDispatcher.dispatch({
			actionType: EditorConstants.FILE_LOADED,
			filename: filename,
			content: newContent
		});
	}
};

function ContentStore() {
	var self = this;
	this._currentContent = ["#Hello world!", "Welcome to **markdown**"].join("\n\n");
	AppDispatcher.register(function(payload) {
		var action = payload.actionType;

		switch (action.actionType) {
			case EditorConstants.CONTENT_CHANGED:
			case EditorConstants.FILE_LOADED:
				self.updateContent(content);
			break;
		}
	});
}
util.inherits(ContentStore, EventEmitter);
ContentStore.prototype.getCurrentContent = function() {
	return this._currentContent;
};
ContentStore.prototype.updateContent = function(newContent) {
	this._currentContent = newContent;
	this.emit('change');
};

var ContentStore = new ContentStore();

// var ContentStore = (function() {
// 	var _currentContent = '';
// 	return Reflux.createStore({
// 		listenables: EditorActions,
// 		onContentChanged: function(newContent) {
// 			_currentContent = newContent;
// 			this.trigger(_currentContent);
// 		},
// 		onFileLoaded: function(fileInformation) {
// 			_currentContent = fileInformation.content;
// 			this.trigger(_currentContent);
// 		},
// 		getInitialState: function() {
// 			return ["#Hello world!", "Welcome to **markdown**"].join("\n\n");
// 		}
// 	});
// })();

var SimpleEditor = React.createClass({
	_stateFromStore: function() {
		return { value: ContentStore.getCurrentContent() }
	},
	getInitialState: function() {
		return this._stateFromStore();
	},
	_onChange: function() {
		this.setState(this._stateFromStore());
	},
	componentDidMount: function() {
		ContentStore.on('change', this._onChange);
	},
	componentWillUnmount: function() {
		ContentStore.removeListener('change', this._onChange);
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
	// mixins: [Reflux.listenTo(ContentStore, 'onContentChanged', 'onContentChanged')],
	getInitialState: function() {
		return { html : '' };
	},
	onContentChanged: function(newContent) {
		this.setState({ html: markdown.toHTML(newContent) });
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
	// mixins: [Reflux.listenTo(ContentStore, 'onContentChanged', 'onContentChanged')],
	handleUpload: function(event) {
		var reader = new FileReader();
		var file = event.target.files[0];

		reader.onload = function() {
			EditorActions.fileLoaded({
				name: file.name,
				content: this.result
			});
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
	onContentChanged: function(newContent) {
		this.setState({ markdown: newContent });
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