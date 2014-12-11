var React = require('react');
var Dispatchr = require('dispatchr')();

Dispatchr.registerStore(require('./stores/ContentStore'));
Dispatchr.registerStore(require('./stores/EventStore'));

var dispatcher = new Dispatchr();
var SimpleEditorWindow = require('./components/SimpleEditorWindow');

React.render(
	<SimpleEditorWindow context={ dispatcher }/>,
	document.getElementById('editor')
);