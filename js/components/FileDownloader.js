var React = require('react');

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

module.exports = FileDownloader;