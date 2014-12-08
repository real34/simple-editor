var React = require('react');
var Reflux = require('reflux');
var markdown = require('markdown').markdown;

var EditorActions = Reflux.createActions(['contentChanged', 'fileLoaded']);

var ContentStore = (function() {
	var _currentContent = '';
	return Reflux.createStore({
		listenables: EditorActions,
		onContentChanged: function(newContent) {
			_currentContent = newContent;
			this.trigger(_currentContent);
		},
		onFileLoaded: function(fileInformation) {
			_currentContent = fileInformation.content;
			this.trigger(_currentContent);
		},
		getInitialState: function() {
			return ["#Hello world!", "Welcome to **markdown**"].join("\n\n");
		}
	});
})();

var SimpleEditor = React.createClass({
	getInitialState: function() {
		return { value: ContentStore.getInitialState() };
	},
	handleChange: function(event) {
		EditorActions.contentChanged(event.target.value);
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
	mixins: [Reflux.listenTo(ContentStore, 'onContentChanged', 'onContentChanged')],
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
	mixins: [Reflux.listenTo(ContentStore, 'onContentChanged', 'onContentChanged')],
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