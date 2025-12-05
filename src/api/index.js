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
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - API endpoint URL
 * @param {Object} payload - Request payload
 * @param {Object} payload.params - Query parameters (for GET requests)
 * @param {Object} payload.data - Request body (for POST/PUT requests)
 * @returns {Promise} Axios response
 */
const api = (method, url, payload = {}) => {
	const { params, data, ...config } = payload;

	const requestConfig = {
		method: method.toUpperCase(),
		url,
		...config,
	};

	if (params && Object.keys(params).length > 0) {
		requestConfig.params = params;
	}

	if (data && Object.keys(data).length > 0) {
		requestConfig.data = data;
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
