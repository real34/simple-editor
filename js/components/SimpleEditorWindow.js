var React = require('react');

var DebugBar = require('./DebugBar');
var FileManager = require('./FileManager');
var SimpleEditor = require('./SimpleEditor');
var SimplePreview = require('./SimplePreview');

var SimpleEditorWindow = React.createClass({
	render: function() {
		return (
			<div>
				<DebugBar context={ this.props.context } />
				<FileManager context={ this.props.context } />
				<SimpleEditor context={ this.props.context } />
				<SimplePreview context={ this.props.context } />
			</div>
		);
	}
});

module.exports = SimpleEditorWindow;