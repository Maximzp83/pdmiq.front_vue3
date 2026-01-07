import { prepareParams } from './api_helpers';
import { storeGetter } from '@/store';

import axios from './axiosService';

export const api = (method, url, payload) => {
	const {
		headers,
		data,
		params,
		newMethod,
		responseType,
		access_token
	} = parsePayload(payload, method);

	// checkAuthorizationHeaders(access_token);
	if (
		!axios.defaults.headers.common ||
		!axios.defaults.headers.common.Authorization
	) {
		const token = storeGetter('auth').access_token || access_token;
		axios.defaults.headers.common.Authorization = token ? `Bearer ${token}` : null;
	}

	/*if (payload && payload.baseURL) {
		console.log(payload.baseURL)
	}*/
	// console.log(axios.defaults.baseURL)
	return axios({
		method: newMethod || method,
		url: url,
		baseURL: payload && payload.baseURL ? payload.baseURL : undefined,
		headers: headers,
		params: params,
		data: data,
		responseType: responseType
	});
};

const parsePayload1 = (payloadData, method) => {
	const result = {};
	if (payloadData) {
		const payload = { ...payloadData };

		let newData = null;
		let newMethod = null;

		if (payload.withFile) {
			newData = setupMultipartFormData(payload.data);

			if (method == 'PUT') {
				newData.set('_method', 'PUT');
			}

			newMethod = newData && newData.has('_method') ? 'POST' : method;

			payload.headers = { 'Content-Type': 'multipart/form-data' };
			// console.log(newData.get('name'))
			// console.log(newData.get('title_ru'))
		}

		// if (!isEmpty(payload)) {
		if (payload.params) result.params = prepareParams(payload.params);
		if (payload.data) result.data = newData || payload.data;
		if (payload.url) result.mod_url = payload.url;
		if (payload.headers) result.headers = payload.headers;
		if (payload.responseType) result.responseType = payload.responseType;
		result.newMethod = newMethod || method;
		// }
	}
	return result;
};

const setupMultipartFormData = (obj, form, namespace) => {
	try {
		let fd = form || new FormData();
		let formKey;
		// debugger;

		for (let property in obj) {
			if (obj[property] || obj[property] === 0) {
				if (namespace) {
					formKey = namespace + '[' + property + ']';
				} else {
					formKey = property;
				}
				// console.log(formKey)
				// if the property is an object, but not a File, use recursivity.
				if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
					setupMultipartFormData(obj[property], fd, formKey);
				} else {
					// if it's a string or a File object
					fd.append(formKey, obj[property]);
				}
			}
		}

		return fd;
	} catch (e) {
		console.warn(e);
	}
};

const parsePayload = (payloadData, method) => parsePayload1(payloadData, method);

// export { api };
