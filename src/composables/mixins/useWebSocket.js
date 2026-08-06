import { computed, onBeforeUnmount, ref } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { WebSocketService } from '@/services/WebSocketService'

const getRuntimeEnv = () => import.meta.env || {}

const getDefaultSocketEndpoint = () => {
	const env = getRuntimeEnv()

	if (env.VITE_WEB_SOCKET_ENDPOINT || env.VUE_APP_WEB_SOCKET_ENDPOINT) {
		return env.VITE_WEB_SOCKET_ENDPOINT || env.VUE_APP_WEB_SOCKET_ENDPOINT
	}

	return 'wss://ws.industrialmatrix-dev.tools/';

	/*const host = typeof window !== 'undefined' ? window.location.hostname : ''
	return host.includes('stage')
		? 'wss://ws.industrialmatrix-stage.tools/'
		: 'wss://ws.industrialmatrix.tools/'*/
}

const parseSocketData = (data) => {
	if (typeof data !== 'string') return data

	try {
		return JSON.parse(data)
	} catch {
		return data
	}
}

export const useWebSocket = () => {
	const authStore = useAuthStore()
	const sockets = new Map()
	const channels = new Map()
	const readyRefs = new Map()
	const readyKeys = new Map()
	const readyMap = ref({})

	const socketEndpoint = computed(getDefaultSocketEndpoint)

	const buildUrl = (url, parameters = {}) => {
		const query = Object.entries(parameters)
			.filter(([, value]) => value !== undefined && value !== null && value !== '')
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
			.join('&')

		if (!query) return url
		return `${url}${url.includes('?') ? '&' : '?'}${query}`
	}

	const setReady = (socketName, value) => {
		readyMap.value = {
			...readyMap.value,
			[socketName]: value,
		}

		const socketReadyRef = readyRefs.get(socketName)
		if (socketReadyRef && typeof socketReadyRef === 'object' && 'value' in socketReadyRef) {
			socketReadyRef.value = value
		}
	}

	const closeWebSocket = ({ socketName }) => {
		const socket = sockets.get(socketName)
		const readyKey = readyKeys.get(socketName) || socketName
		if (!socket) {
			setReady(readyKey, false)
			return
		}

		socket.disconnect()
		setReady(readyKey, false)
		sockets.delete(socketName)
		channels.delete(socketName)
		readyRefs.delete(readyKey)
		readyKeys.delete(socketName)
	}

	const webSocketSend = ({ socketName, resources }) => {
		const socket = sockets.get(socketName)
		if (!socket) return false

		return socket.send('message', {
			type: 'connect',
			resources,
		})
	}

	const setupWebSocket = ({
		socketName,
		socketReadyRef,
		socketNameReadyProp,
		socketChannel,
		onOpen,
		onError,
		onMessage,
		resources,
		url = socketEndpoint.value,
		socketCallback,
		localHandleOpen,
		localHandleError,
		localHandleConnected,
		subscriptionSuccededCallback,
	}) => {
		if (!socketName || !socketChannel || !url) return null

		if (sockets.has(socketName)) closeWebSocket({ socketName })

		const readyKey = socketNameReadyProp || socketName
		readyKeys.set(socketName, readyKey)
		if (socketReadyRef) readyRefs.set(readyKey, socketReadyRef)
		setReady(readyKey, false)

		const accessToken = authStore.access_token || ''
		const socket = WebSocketService({
			wsUrl: url,
			channelAuthConfig: {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		})

		sockets.set(socketName, socket)

		socket.on('connected', (data) => {
			localHandleConnected?.(data)
		})

		socket.on('disconnected', () => setReady(readyKey, false))
		socket.on('error', (error) => {
			onError?.(error)
			localHandleError?.(error)
		})

		const channel = socket.private(socketChannel)
		channels.set(socketName, channel)

		channel.listenToAll((event, data) => {
			const parsedData = parseSocketData(data)
			const message =
				event === undefined && parsedData?.type !== undefined
					? parsedData
					: { type: event, data: parsedData }

			onMessage?.(message)
			socketCallback?.(message)
		})

		channel.onSubscriptionSucceeded((data) => {
			setReady(readyKey, true)
			onOpen?.(data)
			localHandleOpen?.(data)
			subscriptionSuccededCallback?.(data)
			if (resources !== undefined) webSocketSend({ socketName, resources })
		})

		return socket
	}

	onBeforeUnmount(() => {
		for (const socketName of [...sockets.keys()]) {
			closeWebSocket({ socketName })
		}
	})

	return {
		socketEndpoint,
		readyMap,
		setupWebSocket,
		buildUrl,
		closeWebSocket,
		webSocketSend,
	}
}
