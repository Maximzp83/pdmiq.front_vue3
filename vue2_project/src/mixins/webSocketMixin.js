// import Pusher from 'pusher-js';
// import axios from '@/services/api/axiosService';

const webSocketMixin = {
	computed: {
		appKey() {
			if (process.env.VUE_APP_WEB_SOCKET_APP_KEY) {
				return `${process.env.VUE_APP_WEB_SOCKET_APP_KEY}`;
			}

			if (window.location.origin === 'https://app.industrialmatrix.com') {
				return 'pdmmatrix';
			} 

			// return 'testmatrix';
			return 'pdmmatrix';
		},

		socketEndpoint: () => {
			if (process.env.VUE_APP_WEB_SOCKET_ENDPOINT) {
				return `${process.env.VUE_APP_WEB_SOCKET_ENDPOINT}`;
			}
			return 'wss://0xnszsa5m8.execute-api.ca-central-1.amazonaws.com/socketprod';
		},
		// topic: () => 'live.statistic.9ae4ad0b-ab79-4924-9f2d-89bcde2f66f4',
		accessToken() {
			return this.$store.state.auth.access_token;
		}
	},

	methods: {
		setupWebSocket({
			socketName,
			socketCallbackName,
			socketNameReadyProp,
			socketChannel,
			localHandleOpen,
			localHandleError,
			resources
		}) {
			// let appKey = 'testmatrix';
			// let appKey = 'pdmmatrix';


			const url = this.buildUrl(this.socketEndpoint, {
				topicId: socketChannel,
				appKey: this.appKey,
				accessToken: this.accessToken,
				resources: resources || null
			});

			// console.log('websocket url', url);

			this[socketName] = new WebSocket(url);
			// console.log(/*url, resources,*/ socketName, this[socketName])

			if (!localHandleOpen) {
				this[socketName].onopen = () => {
					// console.log('websocket on open')
					this[socketNameReadyProp] = true;
				};
			}

			if (!localHandleError) {
				this[socketName].onerror = err => {
					console.error(
						'Socket encountered error: ',
						err.message || err,
						'Closing socket'
					);
					this[socketName].close();
				};
			}

			if (socketCallbackName) {
				this[socketName].onmessage = e => {
					// console.log('onmessage', e)
					this[socketCallbackName](JSON.parse(e.data));
				};
			}

			this[socketName].onclose = () => {
				this[socketNameReadyProp] = false;
			};
		},

		buildUrl(url, parameters) {
			var qs = '';
			for (var key in parameters) {
				var value = parameters[key];
				qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
			}
			if (qs.length > 0) {
				qs = qs.substring(0, qs.length - 1);
				url = url + '?' + qs;
			}
			// console.log(url)
			return url;
		},

		closeWebSocket({ socketName }) {
			if (this[socketName]) {
				this[socketName].close();
				// this[socketName] = null;
			}
		},

		webSocketSend({ socketName, resources }) {
			// console.log(this[socketName], resources)
			this[socketName].send(
				JSON.stringify({
					action: 'message',
					type: 'connect',
					resources: resources
				})
			);
		}
	}
};

export default () => webSocketMixin;
