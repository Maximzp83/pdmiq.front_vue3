/**
 * WebSocket Service - Client for working with WebSocket channels
 *
 * @author Claude Code
 * @version 2.0.0
 *
 * Usage:
 *
 * const ws = new WebSocketService({
 *     wsUrl: 'wss://xxx.execute-api.region.amazonaws.com/production',
 *     channelAuthEndpoint: 'https://your-app.com/api/broadcasting/auth',
 *     channelAuthConfig: {
 *         headers: {
 *             'Authorization': `Bearer ${token}`
 *         },
 *         data: {
 *             // additional fields
 *         }
 *     }
 * });
 *
 * // Public channel
 * ws.channel('orders')
 *     .listen('OrderShipped', (data) => console.log(data));
 *
 * // Private channel
 * ws.private('order.123')
 *     .listen('OrderStatusChanged', (data) => console.log(data));
 *
 * // Presence channel
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
		// channelAuthEndpoint = 'https://api.industrialmatrix-stage.tools/api/broadcasting/auth';
		channelAuthEndpoint = 'https://api.industrialmatrix.tools/api/broadcasting/auth';
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
			presenceTtl: options.presenceTtl || 300,
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
		this.presenceRenewalTimer = null;

		this._boundBeforeUnload = this._handleBeforeUnload.bind(this);
		window.addEventListener('beforeunload', this._boundBeforeUnload);

		if (this.options.autoConnect) {
			this.connect();
		}
	}

	/**
	 * Connect to WebSocket
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
	 * Set up WebSocket event handlers
	 */
	setupWebSocketHandlers() {
		this.ws.onopen = () => {
			this.log('WebSocket connected');
			this.reconnectAttempts = 0;

			// Send initialization event
			this.send('pusher:connection_init', {});

			/*setTimeout(() => {
				console.log('setupWebSocketHandlers', this.channels.keys().next().value);
				this.handleMessage({event: 'dxm.command', channel: this.channels.keys().next().value});
			}, 5000)*/
		};

		this.ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				this.log('Received:', message);
				this.handleMessage(message);
				// console.log('onmessage', message);

			} catch (error) {
				this.log('Error parsing message:', error);
			}
		};

		this.ws.onerror = (error) => {
			this.log('WebSocket error:', error);
			this.emit('error', error);
		};

		this.ws.onclose = () => {
			this.log('WebSocket closed');
			this.connectionState = 'disconnected';
			this.socketId = null;
			this.stopPing();
			this.stopPresenceRenewal();
			this.emit('disconnected');

			if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
				this.scheduleReconnect();
			}
		};
	}

	/**
	 * Handle an incoming message
	 */
	handleMessage(message) {
		// console.log('handleMessage', message);
		const { event, data, channel } = message;
		// Pusher system events
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
				// Ping/pong for keepalive
				break;

			case 'pusher_internal:member_added':
				this.handleMemberAdded(channel, data);
				break;

			case 'pusher_internal:member_removed':
				this.handleMemberRemoved(channel, data);
				break;

			default:
				// Custom channel events
				// console.log(channel, this.channels)
				if (channel && this.channels.has(channel)) {
					this.channels.get(channel).handleEvent(event, data);
				}
				break;
		}
	}

	/**
	 * Handle connection established
	 */
	handleConnectionEstablished(data) {
		const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
		this.socketId = parsedData.socket_id;
		this.connectionState = 'connected';

		this.log('Connection established, socket_id:', this.socketId);
		this.emit('connected', { socket_id: this.socketId });

		// Start ping
		this.startPing();
		this.startPresenceRenewal();

		// Resubscribe to all channels
		this.resubscribeChannels();
	}

	/**
	 * Handle successful subscription
	 */
	handleSubscriptionSucceeded(channelName, data) {
		// console.log('handleSubscriptionSucceeded', channelName, data, this.channels.has(channelName));
		if (this.channels.has(channelName)) {
			const channel = this.channels.get(channelName);
			const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
			channel.handleSubscriptionSucceeded(parsedData);
		}
	}

	/**
	 * Handle member added (presence)
	 */
	handleMemberAdded(channelName, data) {
		if (this.channels.has(channelName)) {
			const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
			this.channels.get(channelName).handleMemberAdded(parsedData);
		}
	}

	/**
	 * Handle member removed (presence)
	 */
	handleMemberRemoved(channelName, data) {
		if (this.channels.has(channelName)) {
			const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
			this.channels.get(channelName).handleMemberRemoved(parsedData);
		}
	}

	/**
	 * Handle errors
	 */
	handleError(data) {
		const errorData = typeof data === 'string' ? JSON.parse(data) : data;
		this.log('Error:', errorData);
		this.emit('error', errorData);
	}

	/**
	 * Subscribe to a public channel
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
	 * Subscribe to a private channel
	 */
	private(channelName) {
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
	 * Join a presence channel
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
	 * Leave a channel
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
	 * Resubscribe to all channels after reconnection
	 */
	resubscribeChannels() {
		this.channels.forEach(channel => {
			channel.subscribe();
		});
	}

	/**
	 * Authorize channel — obtain auth token for subscription
	 */
	async authorizeChannel(channelName) {
		if (!this.options.channelAuthEndpoint) {
			throw new Error('Channel auth endpoint not configured');
		}

		if (!this.socketId) {
			throw new Error('Socket not connected');
		}

		const response = await this._sendAuthRequest(channelName, 'subscribe');

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Authorization failed (${response.status}): ${errorText}`);
		}

		return await response.json();
	}

	/**
	 * Deauthorize channel — notify server about unsubscription, fire-and-forget
	 */
	deauthorizeChannel(channelName) {
		if (!this.options.channelAuthEndpoint || !this.socketId) return;

		this._sendAuthRequest(channelName, 'unsubscribe', true).catch(() => {});
	}

	/**
	 * Shared method for sending a request to the auth endpoint
	 *
	 * @param {string}  channelName
	 * @param {string}  event      - 'subscribe' | 'unsubscribe'
	 * @param {boolean} keepalive  - true to guarantee delivery on page unload
	 */
	_sendAuthRequest(channelName, event, keepalive = false) {
		const formData = new URLSearchParams();
		formData.append('socket_id', this.socketId);
		formData.append('channel_name', channelName);
		formData.append('event', event);

		if (this.options.channelAuthConfig.data) {
			Object.entries(this.options.channelAuthConfig.data).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}

		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
			...(this.options.channelAuthConfig.headers || {}),
		};

		return fetch(this.options.channelAuthEndpoint, {
			method: 'POST',
			headers,
			body: formData.toString(),
			keepalive,
		});
	}

	/**
	 * Send a message to the server
	 */
	send(event, data = {}) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			const message = JSON.stringify({ event, data });
			this.log('Sending:', message);
			this.ws.send(message);
		}
	}

	/**
	 * Start periodic presence renewal for private channels
	 */
	startPresenceRenewal() {
		this.stopPresenceRenewal();

		const interval = Math.floor(this.options.presenceTtl / 2) * 1000;

		this.presenceRenewalTimer = setInterval(() => {
			this.channels.forEach(channel => {
				if (channel instanceof PrivateChannel) {
					channel.renewPresence();
				}
			});
		}, interval);
	}

	/**
	 * Stop presence renewal
	 */
	stopPresenceRenewal() {
		if (this.presenceRenewalTimer) {
			clearInterval(this.presenceRenewalTimer);
			this.presenceRenewalTimer = null;
		}
	}

	/**
	 * Notify server about unsubscription from all channels on page unload
	 */
	_handleBeforeUnload() {
		this.channels.forEach(channel => {
			if (channel instanceof PrivateChannel && channel.subscribed) {
				channel.notifyUnsubscribe();
			}
		});
	}

	/**
	 * Start ping
	 */
	startPing() {
		this.stopPing();
		this.pingInterval = setInterval(() => {
			this.send('pusher:ping');
		}, 30000); // Every 30 seconds
	}

	/**
	 * Stop ping
	 */
	stopPing() {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
	}

	/**
	 * Schedule reconnection with exponential backoff
	 */
	scheduleReconnect() {
		this.reconnectAttempts++;
		const delay = this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

		this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);

		this.reconnectTimer = setTimeout(() => {
			this.connect();
		}, delay);
	}

	/**
	 * Handle connection error
	 */
	handleConnectionError(error) {
		this.connectionState = 'disconnected';
		this.emit('error', error);

		if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
			this.scheduleReconnect();
		}
	}

	/**
	 * Disconnect from the server
	 */
	disconnect() {
		this.options.reconnect = false; // Disable auto-reconnect
		this.stopPing();
		this.stopPresenceRenewal();
		window.removeEventListener('beforeunload', this._boundBeforeUnload);

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		// Unsubscribe from all channels
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
	 * Subscribe to service-level events
	 */
	on(event, callback) {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, []);
		}
		this.eventListeners.get(event).push(callback);
		return this;
	}

	/**
	 * Emit a service-level event
	 */
	emit(event, data) {
		// console.log('emit', event, data, this.eventListeners.has(event));
		if (this.eventListeners.has(event)) {
			this.eventListeners.get(event).forEach(callback => callback(data));
		}
	}

	/**
	 * Log a message to the console
	 */
	log(...args) {
		if (this.options.debug) {
			console.log('[WebSocketService]', ...args);
		}
	}
}

/**
 * Base channel class
 */
class Channel {
	constructor(echo, name) {
		this.echo = echo;
		this.name = name;
		this.listeners = new Map();
		this.allListeners = []; // Listeners for all events
		this.subscriptionSucceededListeners = [];
		this.subscribed = false;
		this.subscribing = false; // Flag indicating a subscribe request is in progress
	}

	/**
	 * Subscribe to the channel
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
	 * Unsubscribe from the channel
	 */
	unsubscribe() {
		if (!this.subscribed && !this.subscribing) {
			return;
		}

		this.echo.log(`Unsubscribing from channel: ${this.name}`);

		this.echo.send('pusher:unsubscribe', {
			channel: this.name
		});

		this.subscribed = false;
		this.subscribing = false;
		this.listeners.clear();
		this.allListeners = [];
		this.subscriptionSucceededListeners = [];
	}

	/**
	 * Listen for a specific event
	 */
	listen(event, callback) {
		// For private/presence channels the event arrives with a leading dot
		// For public channels it may or may not have a leading dot
		const eventName = event.startsWith('.') ? event : event;

		if (!this.listeners.has(eventName)) {
			this.listeners.set(eventName, []);
		}
		this.listeners.get(eventName).push(callback);

		this.echo.log(`Listening for event "${eventName}" on channel "${this.name}"`);

		return this;
	}

	/**
	 * Listen for all events on the channel
	 */
	listenToAll(callback) {
		this.allListeners.push(callback);
		// console.log('listenToAll', this.allListeners);
		this.echo.log(`Listening for all events on channel "${this.name}"`);

		return this;
	}

	/**
	 * Listen for successful channel subscription
	 */
	onSubscriptionSucceeded(callback) {
		this.subscriptionSucceededListeners.push(callback);
		this.echo.log(`Listening for subscription success on channel "${this.name}"`);

		return this;
	}

	/**
	 * Stop listening for all events
	 */
	stopListeningToAll() {
		this.allListeners = [];

		this.echo.log(`Stopped listening for all events on channel "${this.name}"`);

		return this;
	}

	/**
	 * Stop listening for a specific event
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
	 * Handle an incoming event
	 */
	handleEvent(event, data) {
		const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
		// console.log('handleEvent', event, parsedData, this.allListeners);
		// Fire all allListeners first
		this.allListeners.forEach(callback => {
			callback(event, parsedData);
		});

		// Then fire specific listeners
		// Try with and without leading dot
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
	 * Handle successful subscription
	 */
	handleSubscriptionSucceeded(/*data*/) {
		// console.log('handleSubscriptionSucceeded', this);
		this.subscribed = true;
		this.subscribing = false;
		this.echo.log(`Subscribed to channel: ${this.name}`);
		this.subscriptionSucceededListeners.forEach(callback => {
			callback();
		});
		// console.log('handleSubscriptionSucceeded', this);

		// this.emit('subscribed', { socket_id: this.socketId });
	}
}

/**
 * Private channel
 */
class PrivateChannel extends Channel {
	async subscribe() {
		if (this.subscribed || this.subscribing) {
			return;
		}

		this.subscribing = true;
		this.echo.log(`Subscribing to private channel: ${this.name}`);

		try {
			// Obtain authorization
			const authData = await this.echo.authorizeChannel(this.name);

			// Subscribe with authorization
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

	unsubscribe() {
		if (!this.subscribed && !this.subscribing) {
			return;
		}

		this.notifyUnsubscribe();

		this.echo.send('pusher:unsubscribe', {
			channel: this.name
		});

		this.subscribed = false;
		this.subscribing = false;
		this.listeners.clear();
		this.allListeners = [];
		this.subscriptionSucceededListeners = [];
	}

	/**
	 * Renew presence on the channel (refresh TTL on the server)
	 */
	renewPresence() {
		if (!this.subscribed) return;

		this.echo.authorizeChannel(this.name).catch(() => {});
	}

	/**
	 * Notify server about unsubscription
	 */
	notifyUnsubscribe() {
		if (!this.subscribed) return;

		this.echo.deauthorizeChannel(this.name);
	}

	/**
	 * Whisper (client-to-client message)
	 */
	whisper(event, data) {
		this.echo.send('client-' + event, data);
		return this;
	}

	/**
	 * Listen for whisper messages
	 */
	listenForWhisper(event, callback) {
		return this.listen('client-' + event, callback);
	}
}

/**
 * Presence channel
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
			// Obtain authorization
			const authData = await this.echo.authorizeChannel(this.name);

			// Subscribe with authorization and channel_data
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
	 * Handle successful subscription with member data
	 */
	handleSubscriptionSucceeded(data) {
		this.subscribed = true;
		this.subscribing = false;
		// console.log('PresenceChannel handleSubscriptionSucceeded', this);
		this.subscriptionSucceededListeners.forEach(callback => {
			callback(data);
		});

		// Process current members
		if (data && data.presence) {
			const { count, /*ids,*/ hash } = data.presence;

			// Store members
			if (hash) {
				Object.entries(hash).forEach(([id, info]) => {
					this.members.set(id, info);
				});
			}

			// Fire here callbacks
			this.hereCallbacks.forEach(callback => {
				callback(Array.from(this.members.values()));
			});

			this.echo.log(`Subscribed to presence channel: ${this.name} (${count} members)`);
		}
	}

	/**
	 * Handle member added
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
	 * Handle member removed
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
	 * Register a callback for the current members list
	 */
	here(callback) {
		this.hereCallbacks.push(callback);
		return this;
	}

	/**
	 * Register a callback for members joining
	 */
	joining(callback) {
		this.joiningCallbacks.push(callback);
		return this;
	}

	/**
	 * Register a callback for members leaving
	 */
	leaving(callback) {
		this.leavingCallbacks.push(callback);
		return this;
	}
}

// Export for module usage
/*if (typeof module !== 'undefined' && module.exports) {
	module.exports = WebSocketService;
}*/
export const WebSocketService = (config) => new WebSocketServiceClass(config);
