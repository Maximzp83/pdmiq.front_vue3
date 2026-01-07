import {
	getResponseMessage,
	isSuccessStatus,
	handleError,
	isPrevent,
	getResponseValue,
	getResultMessage
} from '@/services/api/api_helpers';
import { Notification } from 'element-ui';
import { api } from '@/services/api';
import { Lang } from '@/localization';

// console.log(api)
const getOptions = payload => {
	const { notNotify, setToStore, loading, notNotifyError } = payload;

	return {
		loading: loading,
		notify: !notNotify,
		notifyError: !notNotifyError,
		toStore: setToStore
	};
};

const fetch_items1 = ({ commit }, url, payload = {}) => {
	if (isPrevent()) return;
	const { loading, /*notify,*/ toStore, notifyError } = getOptions(payload);

	if (loading) commit('SET_STATUS_LOADING', true);

	return new Promise((resolve, reject) => {
		api('GET', url, payload)
			.then(response => {
				if (isSuccessStatus(response)) {
					try {
						const value = getResponseValue(response, payload);
						// console.log(toStore, value)
						if (toStore) {
							commit('SET_STATE', {
								stateProp: 'itemsList',
								value: getResponseValue(response, payload)
							});

							if (response.data.meta) {
								commit('SET_STATE', {
									stateProp: 'fetchedMeta',
									value: response.data.meta
								});
							}
						}

						resolve({
							value: value,
							request_payload: payload,
							fetchedMeta: response.data.meta
						});
					} catch (e) {
						console.warn(e);
					}
				} else {
					const message = getResponseMessage(response);
					reject(response);
					Notification.error({
						title: Lang.tt(`Error`),
						message: message || Lang.tt('phrases.wrong_response_status'),
						duration: 0
					});
				}
				// setTimeout(() => {
				if (loading) commit('SET_STATUS_LOADING', false);
				// }, 2000);
			})
			.catch(error => {
				handleError(error, {
					commit: commit,
					reject: reject,
					loading: loading,
					notify: notifyError
				});
			});
	});
};

const save_data1 = ({ commit }, payloadUrl, payload = {}) => {
	if (isPrevent()) return;
	const { loading, notify, toStore, notifyError } = getOptions(payload);

	if (loading) commit('SET_STATUS_SAVING', true);

	let options;
	if (payload.data.id) {
		options = {
			method: 'PUT',
			url: `${payloadUrl}/${payload.data.id}`,
			thisResultMessage: 'saved',
			updateRoute: false
			// returnParentRoute: true
		};
	} else {
		options = {
			method: 'POST',
			url: payloadUrl,
			thisResultMessage: 'created',
			updateRoute: true
			// returnParentRoute: true
		};
	}
	const { method, url, thisResultMessage, updateRoute } = options;

	return new Promise((resolve, reject) => {
		api(method, url, payload)
			.then(response => {
				if (isSuccessStatus(response)) {
					try {
						const { stateProp, resultMessage, itemName } = payload;
						if (toStore) {
							commit('SET_STATE', {
								stateProp: stateProp,
								value: response.data.data
							});
						}
						resolve({ data: response.data, updateRoute: updateRoute });
						if (notify)
							Notification.success({
								title: Lang.tt(`Success`),
								message: resultMessage
									? resultMessage.text
									: `${itemName || 'Item'} ${thisResultMessage}`
							});
					} catch (e) {
						console.warn(e);
					}
				} else {
					const message = getResponseMessage(response);
					reject(response);
					Notification.error({
						title: Lang.tt(`Error`),
						message: message || Lang.tt('phrases.wrong_response_status'),
						duration: 0
					});
				}

				if (loading) commit('SET_STATUS_SAVING', false);
			})
			.catch(error => {
				// console.log('catch', reject)
				handleError(error, {
					commit: commit,
					reject: reject,
					loading: loading,
					notify: notifyError
				});
			});
	});
};

const delete_item1 = ({ commit }, payloadUrl, payload = {}) => {
	if (isPrevent()) return;
	const { loading, notify, notifyError } = getOptions(payload);

	if (!loading) commit('SET_STATUS_SAVING', true);
	const { itemName } = payload;

	let options;
	if (payload.data.id) {
		options = {
			url: `${payloadUrl}/${payload.data.id}`,
			resultMessage: itemName || 'item'
		};
	} else if (payload.data.ids) {
		options = {
			url: payloadUrl,
			resultMessage: itemName ? `${itemName}s` : 'items',
			payloadData: payload
		};
	}
	const { url, payloadData, resultMessage } = options;
	/*if (options) {
		console.log(url, payloadData)
		return
	}*/
	return new Promise((resolve, reject) => {
		api('DELETE', url, payloadData)
			.then(response => {
				if (isSuccessStatus(response)) {
					try {
						resolve({ response: response, request_payload: payload });
						if (notify)
							Notification.success({
								title: Lang.tt(`Success`),
								message: `${resultMessage} deleted`
							});
					} catch (e) {
						console.log(e);
					}
				}

				if (loading) commit('SET_STATUS_SAVING', false);
			})
			.catch(error => {
				handleError(error, {
					commit: commit,
					reject: reject,
					loading: loading,
					notify: notifyError
				});
			});
	});
};

const multipurpose_response1 = ({ commit, dispatch }, url, payload = {}) => {
	if (isPrevent()) return;
	const { loading, toStore, notify, notifyError } = getOptions(payload);
	const { method, loadingProp, statusCheckSettings, errorMessageSettings } = payload;

	if (loading) {
		if (loadingProp) {
			commit('SET_STATE', { stateProp: loadingProp, value: true });
		} else {
			commit('SET_STATUS_LOADING', true);
		}
	}

	return new Promise((resolve, reject) => {
		api(method, url, payload)
			.then(response => {
				// console.log(response)

				/*if (statusCheckSettings) {
					console.log(response)					
				}*/
				// console.time('result from back')
				if (isSuccessStatus(response, statusCheckSettings)) {
					try {
						const {
							stateProp,
							nestedStateProp,
							action,
							resultMessage,
							concatData,
							returnResponse,
							returnResponseOnly
						} = payload;

						const value = returnResponseOnly
							? response
							: getResponseValue(response, payload);
						// console.log(value)

						if (toStore) {
							if (nestedStateProp) {
								commit('SET_NESTED_STATE', {
									stateProp: nestedStateProp,
									value: value,
									concatData: concatData
								});
							} else {
								commit('SET_STATE', {
									stateProp: stateProp,
									value: value,
									concatData: concatData
								});
							}
						}

						if (action) {
							dispatch(action);
						}

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
								title: Lang.tt(`Success`),
								message: message,
								duration: 3500
							});
					} catch (e) {
						console.warn(e);
					}
				} else {
					const message = getResponseMessage(response, errorMessageSettings);
					reject(response);
					Notification.error({
						title: Lang.tt(`Error`),
						message: message || Lang.tt('phrases.wrong_response_status'),
						duration: 0
					});
				}

				if (loading) {
					if (loadingProp) {
						commit('SET_STATE', { stateProp: loadingProp, value: false });
					} else {
						commit('SET_STATUS_LOADING', false);
					}
				}
			})
			.catch(error => {
				handleError(error, {
					commit: commit,
					reject: reject,
					loading: loading,
					loadingProp: loadingProp,
					notify: notifyError,
					errorMessageSettings
				});
			});
	});
};

export const fetch_items = (storeArg, url, payload) =>
	fetch_items1(storeArg, url, payload);
export const save_data = (storeArg, url, payload) =>
	save_data1(storeArg, url, payload);
export const delete_item = (storeArg, url, payload) =>
	delete_item1(storeArg, url, payload);
export const multipurpose_response = (storeArg, url, payload) =>
	multipurpose_response1(storeArg, url, payload);
/*export {
	fetch_items,
	save_data,
	delete_item,
	multipurpose_response
};*/
