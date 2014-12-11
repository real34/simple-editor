var React = require('react');
var StoreListenerMixin = require('./mixins/StoreListenerMixin');

var StateDebugger = require('./StateDebugger');
var HistoryDebugger = require('./HistoryDebugger');

var DebugBar = React.createClass({
	mixins: [StoreListenerMixin('EventStore')],
	_stateFromStore: function(store) {
		return { eventCount: store.getEvents().length }
	},
	render: function() {
		return (
			<div className="debug-bar">
				<p>
					<strong>DEBUG BAR</strong>
					- {this.state.eventCount} events tracked
				</p>
				<StateDebugger context={ this.props.context } />
				<HistoryDebugger context={ this.props.context } EventStore={ this.props.context.getStore('EventStore') } />
			</div>
		);
	}
});

module.exports = DebugBar;