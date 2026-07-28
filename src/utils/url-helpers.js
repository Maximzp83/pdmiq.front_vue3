import { useAuthStore } from '@/stores/AuthStore';
import {getBaseURL} from '@/api/index.js';

/**
 * Parse URL parameters from a URL string
 * @param {string} url - URL to parse
 * @returns {Object} Object containing pathOnly and parsed parameters
 * @example
 *   getParamsFromUrl('https://api.com/users?page=1&limit=10')
 *   // Returns: { pathOnly: 'https://api.com/users', page: '1', limit: '10' }
 */
export const getParamsFromUrl = (url) => {
	const urlSplitted = url.split('?');
	const pathOnly = urlSplitted[0];
	const result = {
		pathOnly: pathOnly,
	};

	if (urlSplitted && urlSplitted.length > 1) {
		const params = urlSplitted[urlSplitted.length - 1].split('&');
		for (let i = 0; i < params.length; i++) {
			let param = params[i];
			const paramSplitted = param.split('=');
			result[paramSplitted[0]] = paramSplitted[1];
		}
	}
	return result;
};

/**
 * Parse route query values from comma-separated string
 * Converts numeric strings to numbers
 * @param {string} valuesStr - Comma-separated values
 * @returns {Array} Array of parsed values (strings or numbers)
 * @example
 *   getValuesFromRouteQuery('1,2,foo,3')
 *   // Returns: [1, 2, 'foo', 3]
 */
export const getValuesFromRouteQuery = (valuesStr) => {
	const result = [];
	const values = valuesStr.split(',');

	for (const value of values) {
		if (isNaN(+value)) {
			result.push(value);
		} else {
			result.push(+value);
		}
	}
	return result;
};

/**
 * Build query string from parameters object
 * Handles array parameters (e.g., id[]=1&id[]=2)
 * @param {string} url - Base URL
 * @param {Object} params - Parameters object
 * @returns {string} URL with query string or empty string
 * @example
 *   setupGetParamsStr('/users', { page: 1, id: [4, 5] })
 *   // Returns: '/users?page=1&id[]=4&id[]=5'
 */
export const setupGetParamsStr = (url, params) => {
	const params_array = [];

	for (const prop in params) {
		if (params[prop] instanceof Array) {
			params[prop].forEach((vi) => {
				params_array.push(`${prop}[]=${vi}`);
			});
		} else {
			params_array.push(`${prop}=${params[prop]}`);
		}
	}

	const params_str = params_array.join('&');
	if (params_str.length) {
		return `${url}?${params_str}`;
	}

	return '';
};

/**
 * Generate full URL with auth token and filters
 * Uses current API base URL and auth token from AuthStore
 * @param {Object} settings - Settings object
 * @param {string} settings.path - API path
 * @param {Object} settings.filters - Query parameters/filters
 * @returns {string} Full URL with base URL, path, and query params
 * @example
 *   generateUrl({ path: 'users', filters: { page: 1 } })
 *   // Returns: 'https://api.example.com/users?token=xxx&page=1'
 */
export const generateUrl = ({ path, filters }) => {
	const authStore = useAuthStore();
	const params = { ...filters };
	params.token = authStore.access_token;

	// Get base URL from environment or axios defaults
	// console.log(api)
	const baseURL = getBaseURL();
	const finalUrl = `${baseURL}/${path}`;

	return setupGetParamsStr(finalUrl, params);
};

/**
 * Encode URL query parameters
 * Splits URL and encodes only the query parameter values
 * @param {string} url - URL to encode
 * @returns {string} URL with encoded query parameters
 * @example
 *   encodeUrl('https://api.com/users?name=John Doe')
 *   // Returns: 'https://api.com/users?name=John%20Doe'
 */
export const encodeUrl = (url) => {
	// Split into base and query parameters
	const [base, query] = url.split('?');
	if (!query) return url; // no parameters

	const params = new URLSearchParams(query);
	for (const [key, value] of params.entries()) {
		params.set(key, encodeURIComponent(value));
	}

	return `${base}?${params.toString()}`;
};
