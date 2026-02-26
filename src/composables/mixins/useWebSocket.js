import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';

export function useWebSocket() {
	const authStore = useAuthStore();
	const sockets = {};
	const readyMap = ref({});

	const appKey = computed(() => {
		const env = import.meta.env || {};
		if (env.VITE_WEB_SOCKET_APP_KEY) return `${env.VITE_WEB_SOCKET_APP_KEY}`;
		if (env.VUE_APP_WEB_SOCKET_APP_KEY) return `${env.VUE_APP_WEB_SOCKET_APP_KEY}`;
		if (window.location.origin === 'https://app.industrialmatrix.com') {
			return 'pdmmatrix';
		}
		return 'pdmmatrix';
	});

	const socketEndpoint = computed(() => {
		const env = import.meta.env || {};
		if (env.VITE_WEB_SOCKET_ENDPOINT) return `${env.VITE_WEB_SOCKET_ENDPOINT}`;
		if (env.VUE_APP_WEB_SOCKET_ENDPOINT) return `${env.VUE_APP_WEB_SOCKET_ENDPOINT}`;
		return 'wss://0xnszsa5m8.execute-api.ca-central-1.amazonaws.com/socketprod';
	});

	const buildUrl = (url, parameters) => {
		let qs = '';
		for (const key in parameters) {
			const value = parameters[key];
			qs += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
		}
		if (qs.length > 0) {
			qs = qs.substring(0, qs.length - 1);
			return `${url}?${qs}`;
		}
		return url;
	};

	const setupWebSocket = ({
		socketName,
		socketReadyRef,
		socketChannel,
		onOpen,
		onError,
		onMessage,
		resources,
	}) => {
		const url = buildUrl(socketEndpoint.value, {
			topicId: socketChannel,
			appKey: appKey.value,
			accessToken: authStore.access_token,
			resources: resources || null,
		});

		const socket = new WebSocket(url);
		sockets[socketName] = socket;

		if (onOpen) {
			socket.onopen = onOpen;
		} else {
			socket.onopen = () => {
				if (socketReadyRef && 'value' in socketReadyRef) {
					socketReadyRef.value = true;
				} else {
					readyMap.value[socketName] = true;
				}
			};
		}

		if (onError) {
			socket.onerror = onError;
		} else {
			socket.onerror = (err) => {
				console.error('Socket encountered error:', err?.message || err, 'Closing socket');
				socket.close();
			};
		}

		if (onMessage) {
			socket.onmessage = (e) => {
				onMessage(JSON.parse(e.data));
			};
		}

		socket.onclose = () => {
			if (socketReadyRef && 'value' in socketReadyRef) {
				socketReadyRef.value = false;
			} else {
				readyMap.value[socketName] = false;
			}
		};

		return socket;
	};

	const closeWebSocket = ({ socketName }) => {
		const socket = sockets[socketName];
		if (socket) {
			socket.close();
		}
	};

	const webSocketSend = ({ socketName, resources }) => {
		const socket = sockets[socketName];
		if (!socket) return;
		socket.send(
			JSON.stringify({
				action: 'message',
				type: 'connect',
				resources,
			}),
		);
	};

	return {
		appKey,
		socketEndpoint,
		readyMap,
		setupWebSocket,
		buildUrl,
		closeWebSocket,
		webSocketSend,
	};
}
