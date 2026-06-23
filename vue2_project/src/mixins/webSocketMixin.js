// import Pusher from 'pusher-js';
// import axios from '@/services/api/axiosService';
import { WebSocketService } from '@/services/WebSocketService.js';

const webSocketMixin = {
	computed: {
		socketEndpoint: () => {
			if (process.env.VUE_APP_WEB_SOCKET_ENDPOINT) {
				return `${process.env.VUE_APP_WEB_SOCKET_ENDPOINT}`;
			}
			// return 'wss://ws.industrialmatrix-stage.tools/';
			return 'wss://ws.industrialmatrix.tools/';
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
			socketCallback,
			socketNameReadyProp,
			socketChannel,
			localHandleOpen,
			localHandleError,
			localHandleConnected,
			subscriptionSuccededCallback
			// resources
		}) {
			// console.log(0)
			this[socketName] = WebSocketService({
				// debug: true,
				wsUrl: this.socketEndpoint,
				channelAuthConfig: {
					headers: {'Authorization': `Bearer ${this.accessToken}`}
				}
			});

			// console.log(/*url, resources,*/ socketName, this[socketName])

			if (!localHandleOpen) {
				this[socketName].on('open', () => {
					// console.log('websocket on open')
					this[socketNameReadyProp] = true;
				});
			}

			this[socketName].on('connected', () => {
				if (localHandleConnected) {
					localHandleConnected();
				}
				// console.log('connected in mixin', this[socketName], socketChannel)
					// console.log('socketCallbackName', socketCallbackName, this[socketCallbackName], socketCallback)
				if (socketCallbackName) {
					this[socketName].private(socketChannel).listenToAll(this[socketCallbackName]);
				} else if (socketCallback) {
					this[socketName].private(socketChannel).listenToAll(socketCallback);
				}

				if (subscriptionSuccededCallback) {
					this[socketName].private(socketChannel).onSubscriptionSucceeded(subscriptionSuccededCallback);
				}
			});

			/*this[socketName].on('subscribed', () => {
				console.log('subscribed in mixin', this[socketName], socketChannel)
				
				// console.log('subscribed in mixin', this[socketName], socketChannel)
			});*/

			this[socketName].on('disconnected', () => {
				// console.log('on disconnected')
				this[socketNameReadyProp] = false;
			});

			this[socketName].on('error', err => {
				if (localHandleError) {
					this[localHandleError](err);
				} else {
					console.error(
						'Socket encountered error: ',
						err.message || err,
						'Closing socket'
					);
					this[socketName].disconnect();
				}
			});
		},

		closeWebSocket({ socketName }) {
			if (this[socketName]) {
				this[socketName].disconnect();
				// this[socketName] = null;
			}
		},

		webSocketSend({ socketName, resources }) {
			// console.log(this[socketName], resources)
			this[socketName].send('message', {
				type: 'connect',
				resources: resources
			});
			/*this[socketName].send(
				JSON.stringify({
					action: 'message',
					type: 'connect',
					resources: resources
				})
			);*/
		}
	}
};

export default () => webSocketMixin;
