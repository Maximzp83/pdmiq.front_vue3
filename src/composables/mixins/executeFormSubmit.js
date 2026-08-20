import { checkUploadSettings } from '@/helpers/specialHelpers';
import { api_request } from '@/api/request_provider';

export function executeFormSubmit({
	formData, uploadSettings,
	preparePayload, debug, emit,
	localPreSubmitHook,
	itemId,
	successSubmitCallback,
	propsSuccessSubmitCallback,
	apiRoute,
	itemSaving,
	itemName,
	options
}) {
	let payload = {
		data: formData,
		itemName: itemName,
	};

	if (uploadSettings) {
		payload = checkUploadSettings(payload, uploadSettings);
	}

	if (preparePayload) {
		payload = preparePayload(payload);
	}

	if (localPreSubmitHook) {
		const { next } = localPreSubmitHook(payload);
		if (!next) {
			return Promise.reject(new Error('[executeFormSubmit] localPreSubmitHook cancelled submit'));
		}
	}

	let method = itemId === 'new' ? 'post' : 'put';
	const url = itemId === 'new' ? apiRoute : `${apiRoute}/${itemId}`;
	if (debug && import.meta.env.DEV) {
		if (payload) {
			console.log(itemId, method, url);
			console.log('options', options);
			console.log('payload', method, url, payload);
			return Promise.reject();
		}
	}

	if (emit) {
		emit('event', { eventName: 'toggleSaving', data: true, onward: true });
	}

	if (itemSaving != null) {
		itemSaving.value = true;
	}

	return new Promise((resolve, reject) => {
		return api_request[method](url, payload)
			.then((answer) => {
				try {
					if (successSubmitCallback) {
						successSubmitCallback(answer);
					}

					if (propsSuccessSubmitCallback) {
						propsSuccessSubmitCallback(answer);
					}
					// console.log('answer', answer);

					if (emit) {
						emit('event', { eventName: 'toggleSaving', data: false, onward: true });
					}

					if (itemSaving != null) {
						itemSaving.value = false;
					}
					resolve(answer);

				} catch (e) {
					if (itemSaving != null) {
						itemSaving.value = false;
					}
					if (emit) {
						emit('event', { eventName: 'toggleSaving', data: false, onward: true });
					}
					console.error('[executeFormSubmit] success callback failed', e);
					reject(e);
				}
				// return answer;
			})
			.catch((error) => {
				if (itemSaving != null) {
					itemSaving.value = false;
				}
				if (emit) {
					emit('event', { eventName: 'toggleSaving', data: false, onward: true });
				}
				reject(error);
			});

	});

	// return {  };
}
