var React = require('react');
var StoreListenerMixin = require('./mixins/StoreListenerMixin');
var markdown = require('markdown').markdown;

var SimplePreview = React.createClass({
	mixins: [StoreListenerMixin('ContentStore')],
	_stateFromStore: function(store) {
		return { html: markdown.toHTML(store.getCurrentContent()) }
	},
	render: function() {
		return (
			<div className="preview-area">
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

module.exports = SimplePreview;