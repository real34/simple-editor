var StoreListenerMixin = function(storeName) {
	var dispatcher;
	return {
		componentDidMount: function() {
			dispatcher = this.props.context;
			dispatcher.getStore(storeName).addChangeListener(this._onChange);
		},
		componentWillUnmount: function() {
			var dispatcher = this.props.context;
			dispatcher.getStore(storeName).removeChangeListener(this._onChange);
		},
		_onChange: function() {
			this.setState(this.getInitialState());
		},
		getInitialState: function() {
			var dispatcher = this.props.context;
			return this._stateFromStore(dispatcher.getStore(storeName));
		},
	}
};

module.exports = StoreListenerMixin;