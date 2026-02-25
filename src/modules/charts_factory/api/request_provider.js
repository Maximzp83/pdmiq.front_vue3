import { api } from '@/services/api';
import { Notification } from 'element-ui';
import {
	getResponseMessage,
	isSuccessStatus,
	handleError,
	isPrevent,
	getResponseValue,
	getResultMessage
} from '@/services/api/api_helpers';

const getOptions = payload => {
	const { notNotify, notNotifyError } = payload;

	return {
		notify: !notNotify,
		notifyError: !notNotifyError
	};
};

const request1 = (url, payload = {}) => {
	if (isPrevent()) return;
	const { notify, notifyError } = getOptions(payload);
	const { method, statusCheckSettings } = payload;

	return new Promise((resolve, reject) => {
		api(method, url, payload)
			.then(response => {
				// console.log(response)
				if (isSuccessStatus(response, statusCheckSettings)) {
					try {
						const {
							resultMessage,
							// concatData,
							returnResponse,
							returnResponseOnly
						} = payload;

						const value = returnResponseOnly
							? response
							: getResponseValue(response, payload);
						// console.log(value)

						let payloadResolve = {
							value: value,
							request_payload: payload
						};

						if (returnResponse) {
							payloadResolve.response = response;
						}
						// console.log(response)
						resolve(payloadResolve);

						const message = getResultMessage(resultMessage, response.data.data);
						if (notify)
							Notification.success({
								title: `Success`,
								message: message,
								duration: 2500
							});
					} catch (e) {
						console.warn(e);
					}
				} else {
					const message = getResponseMessage(response);
					reject(response);
					Notification.error({
						title: `Error`,
						message: message || 'wrong response status',
						duration: 0
					});
				}
			})
			.catch(error => {
				// console.log('catch', loading)
				handleError(error, {
					reject: reject,
					notify: notifyError
				});
			});
	});
};

export const request = (url, payload) => request1(url, payload);
