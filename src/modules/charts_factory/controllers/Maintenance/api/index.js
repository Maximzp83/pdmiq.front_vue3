import { request } from '../../../api/request_provider.js';

const fetch_statistics1 = payload => {
	const extendedPayload = {
		method: 'GET',
		notNotify: true,
		...payload
	};

	return request(payload.url, extendedPayload);
};

export const fetch_statistics = payload => fetch_statistics1(payload);
