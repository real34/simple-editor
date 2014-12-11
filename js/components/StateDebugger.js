var React = require('react');

var FileUploader = require('./FileUploader');
var FileDownloader = require('./FileDownloader');

var StateDebugger = React.createClass({
	downloadedStateData: function() {
		return {
			content: JSON.stringify(this.props.context.dehydrate()),
			type: "text/json;charset=utf-8;",
			name: 'simple-editor-state-' + new Date(Date.now()).toLocaleString()
		}
	},
	handleUploadState: function(filename, content) {
		this.props.context.rehydrate(JSON.parse(content));
	},
	render: function() {
		return (
			<p>
				Current application state:
				<FileDownloader getFileData={ this.downloadedStateData } label="Download" />
				<FileUploader onUpload={ this.handleUploadState } />
			</p>
		);
	}
});

module.exports = StateDebugger;