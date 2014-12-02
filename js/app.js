var React = require('react');
var markdown = require('markdown').markdown;

var SimpleEditor = React.createClass({
	handleChange: function() {
		this.props.onContentChanged(this.refs.textarea.getDOMNode().value);
	},
	render: function() {
		return (
			<div className="editor">
				<h3>Input</h3>
				<textarea ref="textarea" onChange={this.handleChange} value={this.props.value}></textarea>
			</div>
		);
	}
});

var SimplePreview = React.createClass({
	render: function() {
		return (
			<div>
				<h3>Preview</h3>
				<div
					className="preview"
					dangerouslySetInnerHTML={{
						__html: markdown.toHTML(this.props.src)
					}}
				/>
			</div>
		);
	}
});

var SimpleEditorWindow = React.createClass({
	getInitialState: function() {
		return {
			source: ['#Hello world!', 'This is **markdown** ...'].join("\n")
		};
	},
	handleContentChanged: function(newContent) {
		this.setState({source: newContent});
	},
	render: function() {
		return (
			<div>
				<SimpleEditor value={this.state.source} onContentChanged={this.handleContentChanged} />
				<SimplePreview src={this.state.source} />
			</div>
		);
	}
});

React.render(
	<SimpleEditorWindow />,
	document.getElementById('editor')
);