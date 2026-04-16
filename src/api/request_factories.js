import { api_request } from '@/api/request_provider';

export const createGetRequest = (url, defaultPayload = {}) => (payload = {}) =>
	api_request.get(url, {
		notNotify: true,
		...defaultPayload,
		...payload,
	});
