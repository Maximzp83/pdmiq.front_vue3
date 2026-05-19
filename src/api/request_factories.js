import { api_request } from '@/api/request_provider';

export const createGetRequest = (url, defaultPayload = {}) => (payload = {}) => {
	// console.log('createGetRequest', url, defaultPayload, payload);
	return api_request.get(url, {
		notNotify: true,
		...defaultPayload,
		...payload,
	});
}

export const createGetByIdRequest = (baseUrl, itemIdParam = 'itemId', defaultPayload = {}) => (payload = {}) => {
	const itemId = payload?.[itemIdParam];
	const nextPayload = { ...payload };
	delete nextPayload[itemIdParam];

	return api_request.get(`${baseUrl}/${itemId}`, {
		notNotify: true,
		...defaultPayload,
		...nextPayload,
	});
}
