import { request } from '../../../api/request_provider.js';
// import { mergeArrays } from '@/helpers';
// import { getResponseValue } from '@/services/api/api_helpers';

const fetch_statistics1 = payload => {
	const extendedPayload = {
		...payload,
		method: 'GET',
		notNotify: true,
		alternateResponseProp: 'data'
		// returnResponseOnly: 1
	};

	return request(
		`/plants/conveyor/${extendedPayload.processId}/counters`,
		extendedPayload
	);
};

export const fetch_process_statistics = payload => fetch_statistics1(payload);
