import api from './index.js';
import { Lang } from '@/localization';
import { useHelpers } from '@/composables/mixins/useHelpers';
const { useLoadStore } = useHelpers();

import { useNotify } from '@/composables/useNotify';
const { Notify } = useNotify();

import { useAuthStore } from '@/stores/AuthStore';

/**
 * Check if request should be prevented
 * @returns {boolean}
 */
const isPrevent = () => {
	const authStore = useAuthStore();
	return authStore.preventRequests;
};

/**
 * Get options from payload
 * @param {Object} payload
 * @returns {Object}
 */
const getOptions = (payload) => {
	const { loading = false, notNotify = false, notNotifyError = false } = payload;

	return {
		loading,
		toStore: payload.setToStore || payload.toStore || false,
		notify: !notNotify && payload.notify !== false,
		notifyError: !notNotifyError,
	};
};

/**
 * Check if response status is success
 * @param {Object} response - Axios response
 * @param {Object} statusCheckSettings - Status check settings
 * @returns {boolean}
 */
const isSuccessStatus = (response, statusCheckSettings) => {
	if (statusCheckSettings) {
		// Custom status check logic
		return statusCheckSettings.successStatus
			? response.status === statusCheckSettings.successStatus
			: response.status >= 200 && response.status < 300;
	}
	return response.status >= 200 && response.status < 300;
};

/**
 * Get value from response
 * @param {Object} response - Axios response
 * @param {Object} payload - Request payload
 * @returns {*} Response value
 */
const getResponseValue = (response, payload) => {
	const { prepareData, prepareDataSettings, dataPath } = payload;
	// console.log('payload', payload);
	if (dataPath) {
		// Extract data from specific path
		const paths = dataPath.split('.');
		let value = response.data;
		for (const path of paths) {
			value = value?.[path];
		}
		return value;
	}

	// Default: return data.items or data
	let value = response.data;
	if (response.data?.data?.items) {
		value = response.data.data.items;
	} else if (response.data?.items) {
		value = response.data.items;
	} else if (response.data?.data) {
		value = response.data.data;
	}

	if (typeof prepareData === 'function') {
		return prepareData(value, prepareDataSettings);
	}

	return value;
};

/**
 * Resolve legacy string-based data preparers without loading their full registry
 * into the initial application bundle.
 */
const getPreparedResponseValue = async (response, payload) => {
	if (typeof payload.prepareData !== 'string') {
		return getResponseValue(response, payload);
	}

	const { prepareDataFunctions } = await import('@/utils/data-preparers');
	const prepareData = prepareDataFunctions[payload.prepareData];

	return getResponseValue(response, {
		...payload,
		prepareData,
	});
};

/**
 * Get result message for notification
 * @param {string|Function} resultMessage - Message or function
 * @param {*} data - Response data
 * @returns {string}
 */
const getResultMessage = (resultMessage, data) => {
	if (!resultMessage) return Lang.tt('Success');

	if (typeof resultMessage === 'function') {
		return resultMessage(data);
	}

	return resultMessage;
};

/**
 * Get error message from response
 * @param {Object} response - Axios response
 * @param {Object} errorMessageSettings - Error message settings
 * @returns {string}
 */
export const getResponseMessage = (response, errorMessageSettings) => {
	if (errorMessageSettings?.customMessage) {
		return errorMessageSettings.customMessage;
	}

	if (response.data?.messages) {
		let message = '';
		response.data.messages.forEach((mi) => {;
			message += mi + '\n';
		})
		return message;
	}

	if (response.data?.message) {
		return response.data.message;
	}

	if (response.data?.error) {
		return typeof response.data.error === 'string'
			? response.data.error
			: JSON.stringify(response.data.error);
	}

	return null;
};

/**
 * Handle error
 * @param {Error} error - Error object
 * @param {Object} options - Error handling options
 */
const handleError = (error, options = {}) => {
	const { store, reject, loading, loadingProp, notify, errorMessageSettings } =
		options;

	if (loading) {
		if (loadingProp && store?.set_value) {
			store.set_value(loadingProp, false);
		}
	}

	if (error.response?.status == 401) {
		if (reject) {
			reject(error);
		}
		return;
	}

	const message = getResponseMessage(error.response, errorMessageSettings);

	/*const message =
		error.response?.data?.message ||
		errorMessageSettings?.customMessage ||
		error.message ||
		Lang.tt('phrases.request_error');*/
	// console.log('handleError', message, error, notify);
	if (notify) {
		// Use Element Plus notification if available
		Notify({
			type: 'error',
			title: Lang.tt('Error'),
			message: message,
			duration: 0,
		});
	}

	if (reject) {
		reject(error);
	}
};

/**
 * Multipurpose response handler - Vue3/Pinia version
 * Similar to Vue2 multipurpose_response but adapted for Pinia stores
 *
 * @param {Object} store - Pinia store instance
 * @param {string} url - API endpoint URL
 * @param {Object} payload - Request payload configuration
 * @param {string} payload.method - HTTP method (default: 'GET')
 * @param {boolean} payload.setToStore - Save response to store
 * @param {boolean} payload.load - Show loading state
 * @param {string} payload.stateProp - Store state property name
 * @param {string} payload.nestedStateProp - Nested store state property
 * @param {string} payload.loadingProp - Store loading property name
 * @param {Function} payload.prepareData - Function to prepare response data
 * @param {string} payload.dataPath - Path to extract data from response
 * @param {boolean} payload.notify - Show success notification
 * @param {boolean} payload.notNotify - Don't show notifications
 * @param {boolean} payload.notifyError - Show error notification
 * @param {string} payload.resultMessage - Success message
 * @param {Object} payload.errorMessageSettings - Error message settings
 * @param {Object} payload.statusCheckSettings - Status check settings
 * @param {boolean} payload.concatData - Concatenate data instead of replacing
 * @param {boolean} payload.returnResponse - Include full response in result
 * @param {boolean} payload.returnResponseOnly - Return only response
 * @param {string} payload.action - Store action to dispatch after success
 * @param {Object} payload.params - Query parameters
 * @param {Object} payload.data - Request body
 * @returns {Promise} Promise with response data
 */
const api_request = (url, payload = {}) => {
	// console.log('api_request', url, payload, isPrevent());
	if (isPrevent()) return;

	const { loading, toStore, notify, notifyError } = getOptions(payload);
	const {
		method = 'GET',
		loadingProp,
		statusCheckSettings,
		errorMessageSettings,
	} = payload;

	// Get useLoadStore function
	// console.log('api_request', url, payload, notify, notifyError);
	// Create store loading promise
	const storePromise = (toStore || loading) && payload.storeName
		? useLoadStore(payload.storeName)
		: Promise.resolve(null);

	return new Promise((resolve, reject) => {
		// Load store first if needed, then execute API request
		storePromise
			.then((store) => {
				// Set loading state
				if (loading && store && loadingProp) {
					store.set_value(loadingProp, true);
				}

				// Execute API request
				return api(method, url, payload)
					.then(async (response) => {
						if (isSuccessStatus(response, statusCheckSettings)) {
							try {
								const {
									stateProp,
									nestedStateProp,
									action,
									actionName,
									resultMessage,
									concatData,
									returnResponse,
									returnResponseOnly,
									incudeMeta,
									itemName
								} = payload;
								// console.log('response', response);
								const value = returnResponseOnly
									? response
									: await getPreparedResponseValue(response, payload);

								// Save to store
								if (toStore && store && store.set_value) {
									if (nestedStateProp) {
										// Handle nested state (if store supports it)
										const currentValue = store[nestedStateProp] || {};
										store.set_value(nestedStateProp, {
											...currentValue,
											...(concatData ? { ...currentValue, ...value } : value),
										});
									} else if (stateProp) {
										const currentValue = store[stateProp];
										store.set_value(
											stateProp,
											concatData && Array.isArray(currentValue) && Array.isArray(value)
												? [...currentValue, ...value]
												: value,
										);
									}
								}

								// Dispatch action if provided
								const resolvedAction = action || (store && store[actionName]);
								if (resolvedAction && typeof store[actionName] === 'function') {
									resolvedAction();
								}

								const payloadResolve = {
									value: value,
									request_payload: payload,
								};

								if (incudeMeta) {
									payloadResolve.fetchedMeta = response.data?.meta;
								}

								if (returnResponse) {
									payloadResolve.response = response;
								}

								resolve(payloadResolve);

								// Show success notification
								const message = getResultMessage(resultMessage, response.data?.data);
								if (notify) {
									// console.log(message);
									Notify({
										type: 'success',
										title: Lang.tt('Success'),
										message: message,
										duration: 3500,
										// duration: 0,
									});
								}
							} catch (e) {
								console.warn('[api_request] Error processing response:', e);
								reject(e);
							}
						} else {
							const message = getResponseMessage(response, errorMessageSettings);
							reject(response);

							if (Notify) {
								Notify({
									type: 'error',
									title: Lang.tt('Error'),
									message: message || Lang.tt('phrases.wrong_response_status'),
									duration: 0,
								});
							}
						}

						// Clear loading state
						if (loading && store && loadingProp && store.set_value) {
							store.set_value(loadingProp, false);
						}
					})
					.catch((error) => {
						handleError(error, {
							store,
							reject,
							loading,
							loadingProp,
							notify: notifyError,
							errorMessageSettings,
						});
					});
			})
			.catch((error) => {
				// Handle store loading error
				console.warn('[api_request] Error loading store:', error);
				reject(error);
			});
	});
};

/**
 * Convenience methods for cleaner syntax
 * @example
 *   api_request.get('/users', { params: { page: 1 } })
 *   api_request.post('/users', { data: { name: 'John' } })
 *   api_request.post('/upload', { data: { file }, withFile: true })
 */
api_request.get = (url, payload = {}) => api_request(url, {...payload, method: 'GET' });
api_request.post = (url, payload = {}) => api_request(url, {...payload, method: 'POST' });
api_request.put = (url, payload = {}) => api_request(url, {...payload, method: 'PUT' });
api_request.patch = (url, payload = {}) => api_request(url, {...payload, method: 'PATCH' });
api_request.delete = (url, payload = {}) => api_request(url, {...payload, method: 'DELETE' });

export { api_request, getResponseValue, isSuccessStatus };
