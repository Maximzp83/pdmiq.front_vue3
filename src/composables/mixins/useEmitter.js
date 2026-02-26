export function useEventEmitter(emit) {
	const emitEvent = (eventName, payload, onward = true) => {
		try {
			emit('event', { eventName, payload, onward });
		} catch (err) {
			console.error('[useEventEmitter] emit error:', err);
		}
	};

	const emitLegacy = (eventName, payload) => {
		try {
			emit('event', eventName, payload);
		} catch (err) {
			console.error('[useEventEmitter] emit legacy error:', err);
		}
	};

	return { emitEvent, emitLegacy };
}

// Backwards-compatible alias
export function useEmitter(emit) {
	const { emitEvent } = useEventEmitter(emit);
	return { emitEvent };
}

export function useEventHandler(methodsMap, emit) {
	const handleEvent = (eventOrName, payload) => {
		if (!eventOrName) return;

		const isObjectPayload = typeof eventOrName === 'object';
		const eventName = isObjectPayload ? eventOrName.eventName : eventOrName;
		const data =
			eventOrName.payload !== undefined
				? eventOrName.payload
				: eventOrName.data !== undefined
					? eventOrName.data
					: payload;

		if (typeof methodsMap?.[eventName] === 'function') {
			methodsMap[eventName](data);
		} else {
			if (isObjectPayload && eventOrName.onward && emit) {
				emit('event', eventOrName);
			} else {
				console.warn(`[handleEvent] Method "${eventName}" not found`);
			}
		}
	};

	return { handleEvent };
}

export function useCallMethod(methodsMap) {
	const callMethod = (eventName, payload) => {
		if (typeof methodsMap[eventName] === 'function') {
			methodsMap[eventName](payload);
		} else {
			console.warn(`[callMethod] Method "${eventName}" not found`);
		}
	};

	return { callMethod };
}
