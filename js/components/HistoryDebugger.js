var React = require('react');

var FileUploader = require('./FileUploader');
var FileDownloader = require('./FileDownloader');

var HistoryDebugger = React.createClass({
	componentDidMount: function() {
		this.initialState = this.props.context.dehydrate();
	},
	downloadedHistoryData: function() {
		var currentAppHistory = {
			initialState: this.initialState,
			events: this.props.EventStore.getEvents()
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
		var context = this.props.context;

		console.debug('rebuilding interface from history contained in "' + filename + '"...');
		console.debug('... back to initial state');
		context.rehydrate(history.initialState);

		(function applyNextEvent() {
			var eventToApply = history.events.shift();
			console.debug('... applying next event - remaining: ' + history.events.length);
			context.dispatch(eventToApply.name, eventToApply.payload);

			if (history.events.length) {
				window.setTimeout(applyNextEvent, HISTORY_SPEED_IN_MS);
			} else {
				console.debug('that\'s all folks!');
			}
		})();
	},
	render: function() {
		return (
			<p>
				Application history:
				<FileDownloader getFileData={ this.downloadedHistoryData } label="Download" />
				<FileUploader onUpload={ this.handleUploadHistory } />
			</p>
		);
	}
});

module.exports = HistoryDebugger;