export function useEmitter(emit) {
	const emitEvent = (eventName, payload) => {
		try {
			emit('event', {eventName, payload});
		} catch (err) {
			console.error(`[useEmitter] emit error:`, err);
		}
	};

	return { emitEvent };
}

export function useEventHandler(methodsMap) {
	const handleEvent = ({ eventName, payload }) => {
		if (typeof methodsMap[eventName] === 'function') {
			methodsMap[eventName](payload);
		} else {
			console.warn(`[handleEvent] Method "${eventName}" not found`);
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