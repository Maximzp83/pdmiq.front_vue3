import { checkUploadSettings } from '@/helpers/specialHelpers';
import { api_request } from '@/api/request_provider';

export function useFormSubmit({
	formData, itemsName, uploadSettings,
	preparePayload, debug, emit,
	localPreSubmitHook,
	itemId,
	successSubmitCallback,
	propsSuccessSubmitCallback,
	changeRoute,
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
		if (!next) return Promise.reject();
	}

	let method = itemId === 'new' ? 'post' : 'put';
	const url = itemId === 'new' ? apiRoute : `${apiRoute}/${itemId}`;

	if (debug && process.env.NODE_ENV === 'development') {
		if (payload) {
			console.log('options', options);
			console.log('payload', method, url, payload);
			return Promise.reject('debug');
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
					console.log('catch', e);	
				}
				// return answer;
			})
			.catch(() => {
				if (itemSaving != null) {
					itemSaving.value = false;
				}
				if (emit) {
					emit('event', { eventName: 'toggleSaving', data: false, onward: true });
				}
				reject();
			});

	});

	// return {  };
}
