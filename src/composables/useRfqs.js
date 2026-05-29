import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

const baseUrl = '/rfqs';

export function useRfqs() {
	const fetchRfqs = (params = {}) =>
		api_request.get(baseUrl, {
			params,
			incudeMeta: true,
			notNotify: true,
			storeName: 'rfqsStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		});

	const fetchRfq = ({ itemId, ...payload } = {}) =>
		api_request.get(`${baseUrl}/${itemId}`, {
			notNotify: true,
			storeName: 'rfqsStore',
			stateProp: 'itemData',
			loadingProp: 'isLoading',
			...payload,
		});

	const saveRfq = (payload = {}) =>
		api_request(baseUrl, {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			storeName: 'rfqsStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			...payload,
		});

	const deleteRfq = (payload = {}) =>
		api_request.delete(baseUrl, {
			itemName: Lang.tt('phrases.Request_for_quotation'),
			...payload,
		});

	return {
		fetchRfqs,
		fetchRfq,
		saveRfq,
		deleteRfq,
	};
}
