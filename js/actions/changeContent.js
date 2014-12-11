module.exports = function(dispatcher, newContent) {
	dispatcher.dispatch('CONTENT_CHANGED', {
		content: newContent
	});
};