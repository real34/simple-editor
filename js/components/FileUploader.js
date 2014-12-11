var React = require('react');

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

module.exports = FileUploader;