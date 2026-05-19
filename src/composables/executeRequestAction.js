export function executeRequestAction(action, payload = {}, errorPrefix = '[executeRequestAction]') {
	if (typeof action !== 'function') {
		return Promise.reject(new Error(`${errorPrefix} action is not a function`));
	}

	const result = action(payload);
	if (!result || typeof result.then !== 'function') {
		return Promise.reject(new Error(`${errorPrefix} action did not return a Promise`));
	}

	return result;
}
