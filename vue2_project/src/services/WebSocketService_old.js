/**
 * WebSocket Service - Клиент для работы с WebSocket каналами
 *
 * @author Claude Code
 * @version 2.0.0
 *
 * Использование:
 *
 * const ws = new WebSocketService({
 *     wsUrl: 'wss://xxx.execute-api.region.amazonaws.com/production',
 *     channelAuthEndpoint: 'https://your-app.com/api/broadcasting/auth',
 *     channelAuthConfig: {
 *         headers: {
 *             'Authorization': `Bearer ${token}`
 *         },
 *         data: {
 *             // дополнительные поля
 *         }
 *     }
 * });
 *
 * // Публичный канал
 * ws.channel('orders')
 *     .listen('OrderShipped', (data) => console.log(data));
 *
 * // Приватный канал
 * ws.private('order.123')
 *     .listen('OrderStatusChanged', (data) => console.log(data));
 *
 * // Presence канал
 * ws.join('chat.room.1')
 *     .here((users) => console.log('Online:', users))
 *     .joining((user) => console.log('Joined:', user))
 *     .leaving((user) => console.log('Left:', user))
 *     .listen('MessageSent', (data) => console.log(data));
 */

let channelAuthEndpoint = '';

if (process.env.VUE_APP_API_URL) {
	channelAuthEndpoint = `${process.env.VUE_APP_API_URL}/broadcasting/auth`;
} else {
	if (
		window.location.origin === 'https://testmatrix.assetmatrix.com'
		// || window.location.origin === 'https://newcharts.industrialmatrix.com'
	) {
		channelAuthEndpoint = 'https://api.industrialmatrix-dev.tools/api/broadcasting/auth';
	} else if (
		window.location.origin === 'https://app.industrialmatrix.com'
		|| window.location.origin === 'https://newcharts.industrialmatrix.com'
	) {
		channelAuthEndpoint = 'https://api.industrialmatrix-dev.tools/api/broadcasting/auth';
	} else {
		// channelAuthEndpoint = 'https://api.industrialmatrix-dev.tools/api/broadcasting/auth';
		channelAuthEndpoint = 'https://api.industrialmatrix-stage.tools/api/broadcasting/auth';
	}
}
// console.log('1 channelAuthEndpoint', '.env = ', `${process.env.VUE_APP_API_URL}/broadcasting/`, 'result = ', channelAuthEndpoint);

class WebSocketServiceClass {
	constructor(options) {
		this.options = {
			wsUrl: options.wsUrl,
			channelAuthEndpoint: options.channelAuthEndpoint || channelAuthEndpoint, // backward compatibility
			channelAuthConfig: options.channelAuthConfig || {},
			autoConnect: options.autoConnect !== false,
			reconnect: options.reconnect !== false,
			reconnectInterval: options.reconnectInterval || 3000,
			maxReconnectAttempts: options.maxReconnectAttempts || 10,
			debug: options.debug || false,
		};

		this.ws = null;
		this.socketId = null;
		this.channels = new Map();
		this.eventListeners = new Map();
		this.connectionState = 'disconnected'; // disconnected, connecting, connected
		this.reconnectAttempts = 0;
		this.reconnectTimer = null;
		this.pingInterval = null;

		if (this.options.autoConnect) {
			this.connect();
		}
	}

	/**
	 * Подключение к WebSocket
	 */
	connect() {
		if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
			this.log('Already connected or connecting');
			return;
		}

		this.connectionState = 'connecting';
		this.log('Connecting to:', this.options.wsUrl);
		this.emit('connecting');

		try {
			this.ws = new WebSocket(this.options.wsUrl);
			this.setupWebSocketHandlers();
		} catch (error) {
			this.log('Connection error:', error);
			this.handleConnectionError(error);
		}
	}

	/**
	 * Настройка обработчиков WebSocket
	 */
	setupWebSocketHandlers() {
		this.ws.onopen = () => {
			this.log('WebSocket connected');
			this.reconnectAttempts = 0;

			// Отправить событие инициализации
			this.send('pusher:connection_init', {});
			this.emit('open');
		};

		this.ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				this.log('Received:', message);
				this.handleMessage(message);
			} catch (error) {
				this.log('Error parsing message:', error);
			}
		};

		this.ws.onerror = (error) => {
			this.log('WebSocket error:', error);
			// this.emit('error', error);
			this.emit('error', error);
		};

		this.ws.onclose = () => {
			this.log('WebSocket closed');
			this.connectionState = 'disconnected';
			this.socketId = null;
			this.stopPing();
			this.emit('disconnected');

			if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
				this.scheduleReconnect();
			}
		};
	}

	/**
	 * Обработка входящих сообщений
	 */
	handleMessage(message) {
		const { event, data, channel } = message;

		// Системные события Pusher
		switch (event) {
			case 'pusher:connection_established':
				this.handleConnectionEstablished(data);
				break;

			case 'pusher_internal:subscription_succeeded':
				this.handleSubscriptionSucceeded(channel, data);
				break;

			case 'pusher:error':
				this.handleError(data);
				break;

			case 'pusher:pong':
				// Ping/pong для keepalive
				break;

			case 'pusher_internal:member_added':
				this.handleMemberAdded(channel, data);
				break;

			case 'pusher_internal:member_removed':
				this.handleMemberRemoved(channel, data);
				break;

			default:
				// Кастомные события на каналах
				if (channel && this.channels.has(channel)) {
					this.channels.get(channel).handleEvent({...data, channel, event});
				}
				break;
		}
	}

	/**
	 * Обработка установки соединения
	 */
	handleConnectionEstablished(data) {
		const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
		this.socketId = parsedData.socket_id;
		this.connectionState = 'connected';

		this.log('Connection established, socket_id:', this.socketId);
		this.emit('connected', { socket_id: this.socketId });

		// Начать ping
		this.startPing();

		// Переподписаться на все каналы
		this.resubscribeChannels();
	}

	/**
	 * Обработка успешной подписки
	 */
	handleSubscriptionSucceeded(channelName, data) {
		if (this.channels.has(channelName)) {
			const channel = this.channels.get(channelName);
			const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
			channel.handleSubscriptionSucceeded(parsedData);
		}
	}

	/**
	 * Обработка добавления участника (presence)
	 */
	handleMemberAdded(channelName, data) {
		if (this.channels.has(channelName)) {
			const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
			this.channels.get(channelName).handleMemberAdded(parsedData);
		}
	}

	/**
	 * Обработка удаления участника (presence)
	 */
	handleMemberRemoved(channelName, data) {
		if (this.channels.has(channelName)) {
			const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
			this.channels.get(channelName).handleMemberRemoved(parsedData);
		}
	}

	/**
	 * Обработка ошибок
	 */
	handleError(data) {
		const errorData = typeof data === 'string' ? JSON.parse(data) : data;
		this.log('Error:', errorData);
		this.emit('error', errorData);
	}

	/**
	 * Публичный канал
	 */
	channel(channelName) {
		const fullName = channelName;

		if (!this.channels.has(fullName)) {
			const channel = new Channel(this, fullName);
			this.channels.set(fullName, channel);

			if (this.connectionState === 'connected') {
				channel.subscribe();
			}
		}

		return this.channels.get(fullName);
	}

	/**
	 * Приватный канал
	 */
	private(channelName) {
		// console.log('private(channelName)', channelName);
		const fullName = channelName.startsWith('private-') ? channelName : `private-${channelName}`;

		if (!this.channels.has(fullName)) {
			const channel = new PrivateChannel(this, fullName);
			this.channels.set(fullName, channel);

			if (this.connectionState === 'connected') {
				channel.subscribe();
			}
		}

		return this.channels.get(fullName);
	}

	/**
	 * Presence канал
	 */
	join(channelName) {
		const fullName = channelName.startsWith('presence-') ? channelName : `presence-${channelName}`;

		if (!this.channels.has(fullName)) {
			const channel = new PresenceChannel(this, fullName);
			this.channels.set(fullName, channel);

			if (this.connectionState === 'connected') {
				channel.subscribe();
			}
		}

		return this.channels.get(fullName);
	}

	/**
	 * Покинуть канал
	 */
	leave(channelName) {
		if (this.channels.has(channelName)) {
			const channel = this.channels.get(channelName);
			channel.unsubscribe();
			this.channels.delete(channelName);
		}

		return this;
	}

	/**
	 * Переподписаться на все каналы после переподключения
	 */
	resubscribeChannels() {
		// console.log('resubscribeChannels', this.channels)
		this.channels.forEach(channel => {
			channel.subscribe();
		});
	}

	/**
	 * Авторизация канала через Laravel
	 */
	async authorizeChannel(channelName) {
		// console.log('authorizeChannel', this.options.channelAuthEndpoint, this.socketId)
		if (!this.options.channelAuthEndpoint) {
			console.warn('Channel auth endpoint not configured');
		}

		if (!this.socketId) {
			console.warn('Socket not connected');
		}

		// Базовые данные для авторизации
		const formData = new URLSearchParams();
		formData.append('socket_id', this.socketId);
		formData.append('channel_name', channelName);

		// Добавить дополнительные данные из конфигурации
		if (this.options.channelAuthConfig.data) {
			Object.entries(this.options.channelAuthConfig.data).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}

		// Базовые заголовки
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
		};

		// Добавить дополнительные заголовки из конфигурации
		if (this.options.channelAuthConfig.headers) {
			Object.assign(headers, this.options.channelAuthConfig.headers);
		}

		console.log('authorizeChannel', this.options.channelAuthEndpoint, formData, headers)
		const response = await fetch(this.options.channelAuthEndpoint, {
			method: 'POST',
			headers: headers,
			body: formData.toString(),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Authorization failed (${response.status}): ${errorText}`);
		}

		return await response.json();
	}

	/**
	 * Отправить сообщение на сервер
	 */
	send(event, data = {}) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			const message = JSON.stringify({ event, data });
			this.log('Sending:', message);
			this.ws.send(message);
		}
	}

	/**
	 * Запустить ping
	 */
	startPing() {
		this.stopPing();
		this.pingInterval = setInterval(() => {
			this.send('pusher:ping');
		}, 30000); // Каждые 30 секунд
	}

	/**
	 * Остановить ping
	 */
	stopPing() {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
	}

	/**
	 * Запланировать переподключение
	 */
	scheduleReconnect() {
		this.reconnectAttempts++;
		const delay = this.options.reconnectInterval * this.reconnectAttempts;

		this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);

		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, delay);
	}

	/**
	 * Обработка ошибки подключения
	 */
	handleConnectionError(error) {
		this.connectionState = 'disconnected';
		this.emit('error', error);

		if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
			this.scheduleReconnect();
		}
	}

	/**
	 * Отключиться
	 */
	disconnect() {
		this.options.reconnect = false; // Отключить автореконнект
		this.stopPing();
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		console.log('service: disconnect', this.channels)
		// Отписаться от всех каналов
		this.channels.forEach(channel => {
			channel.unsubscribe();
		});
		this.channels.clear();

		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}

		this.connectionState = 'disconnected';
		this.socketId = null;
	}

	/**
	 * Подписаться на события Echo
	 */
	on(event, callback) {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, []);
		}
		this.eventListeners.get(event).push(callback);
		return this;
	}

	/**
	 * Вызвать событие Echo
	 */
	emit(event, data) {
		if (this.eventListeners.has(event)) {
			this.eventListeners.get(event).forEach(callback => callback(data));
		}
	}

	/**
	 * Логирование
	 */
	log(...args) {
		if (this.options.debug) {
			console.log('[WebSocketService]', ...args);
		}
	}
}

/**
 * Базовый класс канала
 */
class Channel {
	constructor(echo, name) {
		this.echo = echo;
		this.name = name;
		this.listeners = new Map();
		this.allListeners = []; // Слушатели для всех событий
		this.subscribed = false;
		this.subscribing = false; // Флаг процесса подписки
	}

	/**
	 * Подписаться на канал
	 */
	async subscribe() {
		if (this.subscribed || this.subscribing) {
			return;
		}

		this.subscribing = true;
		this.echo.log(`Subscribing to channel: ${this.name}`);

		this.echo.send('pusher:subscribe', {
			channel: this.name
		});
	}

	/**
	 * Отписаться от канала
	 */
	unsubscribe() {
		console.log('service: unsubscribe', this.subscribed, this.subscribing)
		if (!this.subscribed && !this.subscribing) {
			return;
		}
		console.log('unsubscribe from channel', this.name)
		this.echo.log(`Unsubscribing from channel: ${this.name}`);

		this.echo.send('pusher:unsubscribe', {
			channel: this.name
		});

		this.subscribed = false;
		this.subscribing = false;
		this.listeners.clear();
		this.allListeners = [];
	}

	/**
	 * Слушать событие
	 */
	listen(event, callback) {
		// Для приватных/presence каналов событие приходит с точкой
		// Для публичных может быть с точкой или без
		const eventName = event.startsWith('.') ? event : event;

		if (!this.listeners.has(eventName)) {
			this.listeners.set(eventName, []);
		}
		this.listeners.get(eventName).push(callback);

		this.echo.log(`Listening for event "${eventName}" on channel "${this.name}"`);

		return this;
	}

	/**
	 * Слушать все события на канале
	 */
	listenToAll(callback) {
		this.allListeners.push(callback);

		this.echo.log(`Listening for all events on channel "${this.name}"`);

		return this;
	}

	/**
	 * Перестать слушать все события
	 */
	stopListeningToAll() {
		this.allListeners = [];

		this.echo.log(`Stopped listening for all events on channel "${this.name}"`);

		return this;
	}

	/**
	 * Перестать слушать конкретное событие
	 */
	stopListening(event) {
		const eventName = event.startsWith('.') ? event : event;

		if (this.listeners.has(eventName)) {
			this.listeners.delete(eventName);
			this.echo.log(`Stopped listening for event "${eventName}" on channel "${this.name}"`);
		}

		return this;
	}

	/**
	 * Обработать входящее событие
	 */
	handleEvent(event, data) {
		const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

		// Сначала вызвать все allListeners
		// console.log('handleEvent', event, data, parsedData)
		this.allListeners.forEach(callback => {
			callback(event, parsedData);
		});

		// Затем вызвать конкретные listeners
		// Попробовать с точкой и без
		const eventVariants = [event, `.${event}`, event.replace(/^\./, '')];

		eventVariants.forEach(variant => {
			if (this.listeners.has(variant)) {
				this.listeners.get(variant).forEach(callback => {
					callback(parsedData);
				});
			}
		});
	}

	/**
	 * Обработать успешную подписку
	 */
	handleSubscriptionSucceeded(/*data*/) {
		this.subscribed = true;
		this.subscribing = false;
		this.echo.log(`Subscribed to channel: ${this.name}`);
	}
}

/**
 * Приватный канал
 */
class PrivateChannel extends Channel {
	async subscribe() {
		if (this.subscribed || this.subscribing) {
			return;
		}

		this.subscribing = true;
		this.echo.log(`Subscribing to private channel: ${this.name}`);

		try {
			// Получить авторизацию
			const authData = await this.echo.authorizeChannel(this.name);
			// console.log('private subscribing', authData)

			// Подписаться с авторизацией
			this.echo.send('pusher:subscribe', {
				channel: this.name,
				auth: authData.auth
			});
		} catch (error) {
			this.subscribing = false;
			this.echo.log(`Failed to subscribe to ${this.name}:`, error);
			this.echo.emit('error', {
				channel: this.name,
				error: error.message
			});
		}
	}

	/**
	 * Whisper (клиент-клиент сообщения)
	 */
	whisper(event, data) {
		this.echo.send('client-' + event, data);
		return this;
	}

	/**
	 * Слушать whisper
	 */
	listenForWhisper(event, callback) {
		return this.listen('client-' + event, callback);
	}
}

/**
 * Presence канал
 */
class PresenceChannel extends PrivateChannel {
	constructor(echo, name) {
		super(echo, name);
		this.members = new Map();
		this.hereCallbacks = [];
		this.joiningCallbacks = [];
		this.leavingCallbacks = [];
	}

	async subscribe() {
		if (this.subscribed || this.subscribing) {
			return;
		}

		this.subscribing = true;
		this.echo.log(`Subscribing to presence channel: ${this.name}`);

		try {
			// Получить авторизацию
			const authData = await this.echo.authorizeChannel(this.name);

			// Подписаться с авторизацией и channel_data
			const subscribeData = {
				channel: this.name,
				auth: authData.auth
			};

			if (authData.channel_data) {
				subscribeData.channel_data = authData.channel_data;
			}

			this.echo.send('pusher:subscribe', subscribeData);
		} catch (error) {
			this.subscribing = false;
			this.echo.log(`Failed to subscribe to ${this.name}:`, error);
			this.echo.emit('error', {
				channel: this.name,
				error: error.message
			});
		}
	}

	/**
	 * Обработать успешную подписку с данными о участниках
	 */
	handleSubscriptionSucceeded(data) {
		this.subscribed = true;
		this.subscribing = false;

		// Обработать присутствующих участников
		if (data && data.presence) {
			const { count, /*ids,*/ hash } = data.presence;

			// Сохранить участников
			if (hash) {
				Object.entries(hash).forEach(([id, info]) => {
					this.members.set(id, info);
				});
			}

			// Вызвать here callbacks
			this.hereCallbacks.forEach(callback => {
				callback(Array.from(this.members.values()));
			});

			this.echo.log(`Subscribed to presence channel: ${this.name} (${count} members)`);
		}
	}

	/**
	 * Обработать добавление участника
	 */
	handleMemberAdded(memberData) {
		const { user_id, user_info } = memberData;
		this.members.set(user_id, user_info);

		this.joiningCallbacks.forEach(callback => {
			callback(user_info);
		});

		this.echo.log(`Member joined ${this.name}:`, user_info);
	}

	/**
	 * Обработать удаление участника
	 */
	handleMemberRemoved(memberData) {
		const { user_id } = memberData;
		const member = this.members.get(user_id);

		if (member) {
			this.members.delete(user_id);

			this.leavingCallbacks.forEach(callback => {
				callback(member);
			});

			this.echo.log(`Member left ${this.name}:`, member);
		}
	}

	/**
	 * Кто сейчас в канале
	 */
	here(callback) {
		this.hereCallbacks.push(callback);
		return this;
	}

	/**
	 * Кто присоединяется
	 */
	joining(callback) {
		this.joiningCallbacks.push(callback);
		return this;
	}

	/**
	 * Кто покидает
	 */
	leaving(callback) {
		this.leavingCallbacks.push(callback);
		return this;
	}
}

// Экспорт для использования
/*if (typeof module !== 'undefined' && module.exports) {
	module.exports = WebSocketService;
}*/
export const WebSocketService = (config) => new WebSocketServiceClass(config);