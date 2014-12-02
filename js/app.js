var React = require('react');
var Reflux = require('reflux');
var markdown = require('markdown').markdown;

var EditorActions = Reflux.createActions(['contentChanged']);

var ContentStore = (function() {
	var _currentContent = '';
	return Reflux.createStore({
		listenables: EditorActions,
		onContentChanged: function(newContent) {
			_currentContent = newContent;
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

var SimpleEditorWindow = React.createClass({
	render: function() {
		return (
			<div>
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