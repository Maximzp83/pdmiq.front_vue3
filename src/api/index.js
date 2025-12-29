import axios from 'axios';
import { useAuthStore } from '@/stores/AuthStore';

/**
 * Get base API URL from environment or use default
 */
const getBaseURL = () => {
	if (import.meta.env.VITE_API_BASE_URL) {
		return import.meta.env.VITE_API_BASE_URL;
	}
	return 'https://api.testmatrix.assetmatrix.com/api';
};

/**
 * Prepare query parameters by filtering out null/undefined values
 * @param {Object} params - Query parameters
 * @returns {Object} Cleaned parameters
 */
const prepareParams = (params) => {
	const result = {};
	for (const prop in params) {
		const value = params[prop];
		if (value || typeof value === 'boolean' || value === 0) {
			result[prop] = value;
		}
	}
	return result;
};

/**
 * Setup multipart form data from object
 * Recursively converts nested objects to FormData format
 * @param {Object} obj - Data object to convert
 * @param {FormData} form - Existing FormData instance (optional)
 * @param {string} namespace - Namespace for nested objects (optional)
 * @returns {FormData}
 */
const setupMultipartFormData = (obj, form, namespace) => {
	try {
		const fd = form || new FormData();
		let formKey;

		for (const property in obj) {
			if (obj[property] || obj[property] === 0) {
				if (namespace) {
					formKey = `${namespace}[${property}]`;
				} else {
					formKey = property;
				}

				// If the property is an object, but not a File, use recursion
				if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
					setupMultipartFormData(obj[property], fd, formKey);
				} else {
					// If it's a string, number, or File object
					fd.append(formKey, obj[property]);
				}
			}
		}

		return fd;
	} catch (e) {
		console.warn('[api] Error setting up multipart form data:', e);
		return form || new FormData();
	}
};

/**
 * Create axios instance
 */
const apiInstance = axios.create({
	baseURL: getBaseURL(),
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	},
});

/**
 * Request interceptor - add auth token
 */
apiInstance.interceptors.request.use(
	(config) => {
		const authStore = useAuthStore();
		const token = authStore.access_token;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

/**
 * Response interceptor - handle errors
 */
apiInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		if (error.response?.status === 401) {
			const authStore = useAuthStore();
			authStore.isAuthenticated = false;
			authStore.access_token = null;
			localStorage.removeItem('access_token');
			localStorage.removeItem('authUser');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	},
);

/**
 * Main API function - similar to Vue2 api(method, url, payload)
 * Enhanced with multipart form data support for file uploads
 *
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - API endpoint URL
 * @param {Object} payload - Request payload
 * @param {Object} payload.params - Query parameters (for GET requests)
 * @param {Object} payload.data - Request body (for POST/PUT requests)
 * @param {boolean} payload.withFile - Enable multipart/form-data mode for file uploads
 * @param {Object} payload.headers - Custom headers
 * @param {string} payload.responseType - Response type (blob, arraybuffer, etc.)
 * @param {string} payload.baseURL - Override base URL for this request
 * @returns {Promise} Axios response
 */
const api = (method, url, payload = {}) => {
	let { params, data, withFile, headers, ...config } = payload;
	let finalMethod = method.toUpperCase();
	let finalData = data;

	// Handle file uploads with multipart form data
	if (withFile && data) {
		finalData = setupMultipartFormData(data);

		// Laravel-style PUT method override for multipart requests
		if (finalMethod === 'PUT') {
			finalData.set('_method', 'PUT');
			finalMethod = 'POST';
		}

		// Set multipart form data headers
		headers = {
			...headers,
			'Content-Type': 'multipart/form-data',
		};
	}

	// Prepare request configuration
	const requestConfig = {
		method: finalMethod,
		url,
		...config,
	};

	// Add custom headers if provided
	if (headers) {
		requestConfig.headers = headers;
	}

	// Add query parameters (filtered)
	if (params && Object.keys(params).length > 0) {
		requestConfig.params = prepareParams(params);
	}

	// Add request body
	if (finalData) {
		// For FormData, don't check keys
		if (finalData instanceof FormData) {
			requestConfig.data = finalData;
		} else if (Object.keys(finalData).length > 0) {
			requestConfig.data = finalData;
		}
	}

	return apiInstance.request(requestConfig);
};

/**
 * Convenience methods
 */
api.get = (url, payload = {}) => api('GET', url, payload);
api.post = (url, payload = {}) => api('POST', url, payload);
api.put = (url, payload = {}) => api('PUT', url, payload);
api.delete = (url, payload = {}) => api('DELETE', url, payload);
api.patch = (url, payload = {}) => api('PATCH', url, payload);

export default api;
