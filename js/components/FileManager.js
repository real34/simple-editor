var React = require('react');
var StoreListenerMixin = require('./mixins/StoreListenerMixin');

var FileUploader = require('./FileUploader');
var FileDownloader = require('./FileDownloader');
var loadFile = require('../actions/loadFile');

var FileManager = React.createClass({
	mixins: [StoreListenerMixin('ContentStore')],
	_stateFromStore: function(store) {
		return { markdown: store.getCurrentContent() }
	},
	handleContentUpload: function(filename, content) {
		loadFile(this.props.context, filename, content);
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
			<p className="file-manager">
				Mardown source:
				<FileDownloader getFileData={ this.downloadedFileData } label="Download" />
				<FileUploader onUpload={ this.handleContentUpload } />
			</p>
		);
	}
});

module.exports = FileManager;