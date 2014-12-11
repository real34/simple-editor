module.exports = function(dispatcher, filename, newContent) {
	dispatcher.dispatch('FILE_LOADED', {
		filename: filename,
		content: newContent
	});
};