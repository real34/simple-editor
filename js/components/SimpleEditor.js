var React = require('react');
var StoreListenerMixin = require('./mixins/StoreListenerMixin');
var changeContent = require('../actions/changeContent');

var SimpleEditor = React.createClass({
	mixins: [StoreListenerMixin('ContentStore')],
	_stateFromStore: function(store) {
		return { value: store.getCurrentContent() }
	},
	handleChange: function(event) {
		changeContent(this.props.context, event.target.value);
	},
	render: function() {
		return (
			<div className="editor">
				<h3>Input</h3>
				<textarea onChange={this.handleChange} value={this.state.value}></textarea>
			</div>
		);
	}
});

module.exports = SimpleEditor;