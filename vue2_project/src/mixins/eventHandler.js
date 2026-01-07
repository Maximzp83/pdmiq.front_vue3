// import { getParentPageRoute } from '@/helpers';

const eventHandler = {
	methods: {
		/*event(name, data) {
			this.$emit('event', name, data);
		},*/

		handleEvent(eventName, data) {
			// console.log(eventName, data, this)
			try {
				if (typeof eventName == 'object' && eventName.eventName) {
					// console.log(typeof eventName == 'object' && eventName.eventName)
					this.handleEventNew(eventName);
				} else if (this[eventName]) {
					this[eventName](data);
				} else {
					console.warn(
						`(old handler) incorrect eventName or component not contains called method (${eventName})`
					);
				}
			} catch (e) {
				console.warn(e);
			}
		},

		handleEventNew(payload, data_old) {
			if (typeof payload !== 'object') {
				this[payload](data_old);
			} else {
				const { eventName, data, onward } = payload;
				// console.log(eventName, data, onward, this._data)
				if (this[eventName]) {
					this[eventName](data);
				} else if (onward) {
					this.$emit('event', payload);
				} else {
					console.warn(
						`incorrect eventName or component not contains called method (${eventName})`
					);
				}
			}
		}
	}
};

export default () => eventHandler;
