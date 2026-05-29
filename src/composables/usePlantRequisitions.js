import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

const baseUrl = '/plants/work-orders';

export function usePlantRequisitions() {
	const fetchRequisitions = (params = {}) =>
		api_request.get(baseUrl, {
			params,
			incudeMeta: true,
			notNotify: true,
			storeName: 'plantrequisitionsStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		});

	const fetchRequisition = ({ itemId, ...payload } = {}) =>
		api_request.get(`${baseUrl}/${itemId}`, {
			notNotify: true,
			storeName: 'plantrequisitionsStore',
			stateProp: 'itemData',
			loadingProp: 'isLoading',
			...payload,
		});

	const saveRequisition = (payload = {}) =>
		api_request(baseUrl, {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			storeName: 'plantrequisitionsStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			...payload,
		});

	const fetchRequisitionAnalytics = (params = {}) =>
		api_request.get(`${baseUrl}/analytics`, { params, notNotify: true });

	const calculateRequisitionsRoi = (params = {}) =>
		api_request.get(`${baseUrl}/roi`, { params, notNotify: true });

	const denyRequisition = ({ itemId, ...payload } = {}) =>
		api_request.put(`${baseUrl}/${itemId}/deny`, payload);

	const approveRequisition = ({ itemId, ...payload } = {}) =>
		api_request.put(`${baseUrl}/${itemId}/approve`, payload);

	const resetRequisition = ({ itemId, ...payload } = {}) =>
		api_request.put(`${baseUrl}/${itemId}/reset`, payload);

	const unapproveRequisition = ({ itemId, ...payload } = {}) =>
		api_request.put(`${baseUrl}/${itemId}/unapprove`, payload);

	const holdOnRequisition = ({ itemId, ...payload } = {}) =>
		api_request.put(`${baseUrl}/${itemId}/on-hold`, payload);

	const concludeRequisition = ({ itemId, ...payload } = {}) =>
		api_request.put(`${baseUrl}/${itemId}/conclude`, payload);

	const takeRequisition = ({ itemId, ...payload } = {}) =>
		api_request.put(`${baseUrl}/${itemId}/take`, payload);

	const completeRequisition = ({ itemId, ...payload } = {}) =>
		api_request.put(`${baseUrl}/${itemId}/complete`, payload);

	const deleteRequisition = (payload = {}) =>
		api_request.delete(baseUrl, {
			itemName: Lang.tt('Requisition'),
			...payload,
		});

	const exportRequisitionsToExcel = (params = {}) =>
		api_request.get('/excel/export', {
			params: {
				...params,
				url: 'plants/work-orders',
			},
			resultMessage: Lang.tt('phrases.File_was_sent_on_your_email'),
		});

	return {
		fetchRequisitions,
		fetchRequisition,
		saveRequisition,
		fetchRequisitionAnalytics,
		calculateRequisitionsRoi,
		denyRequisition,
		approveRequisition,
		resetRequisition,
		unapproveRequisition,
		holdOnRequisition,
		concludeRequisition,
		takeRequisition,
		completeRequisition,
		deleteRequisition,
		exportRequisitionsToExcel,
	};
}
