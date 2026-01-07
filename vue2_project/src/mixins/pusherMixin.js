import Pusher from 'pusher-js';
import axios from '@/services/api/axiosService';

const pusherMixin = {
	methods: {
		setupPusher({ endpoint, pusherName, channelSetupName, params }) {
			// console.log(endpoint, pusherName, channelSetupName, params)
			this[pusherName] = new Pusher('5c83d946c41bc9aa5fce', {
				cluster: 'mt1',
				authEndpoint: endpoint,
				auth: {
					headers: { Authorization: axios.defaults.headers.common.Authorization },
					params: params || {}
				}
			});

			this[channelSetupName]();
		},

		destroyPusher({ pusherName, channelName, intervalName }) {
			if (this[pusherName]) {
				this[pusherName].unsubscribe(this[channelName]);
				this[pusherName].disconnect();
				this[pusherName] = null;
			}
			if (this[channelName]) this[channelName].unbind();
			clearInterval(this[intervalName]);
			this[intervalName] = null;
			this[channelName] = null;
		},

		pingSocketpusherEndpoint(pusherEndpoint) {
			const payload = {
				url: pusherEndpoint,
				statusCheckSettings: { withoutDataCheck: true }
			};
			this.ping_socket_endpoint(payload);
		}
	}
};

export default pusherMixin;
