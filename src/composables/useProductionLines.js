import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

const baseUrl = '/production-lines';

export function useProductionLines() {
	const fetchProductionLines = (params = {}) =>
		api_request.get(baseUrl, {
			params,
			incudeMeta: true,
			notNotify: true,
			storeName: 'productionLinesStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		});

	const fetchProductionLine = ({ itemId, ...payload } = {}) =>
		api_request.get(`${baseUrl}/${itemId}`, {
			notNotify: true,
			storeName: 'productionLinesStore',
			stateProp: 'itemData',
			loadingProp: 'isLoading',
			...payload,
		});

	const saveProductionLine = (payload = {}) =>
		api_request(baseUrl, {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			storeName: 'productionLinesStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			...payload,
		});

	const deleteProductionLine = (payload = {}) =>
		api_request.delete(baseUrl, {
			itemName: Lang.tt('Production_Line'),
			...payload,
		});

	const reorderProductionLine = (payload = {}) =>
		api_request.post(`${baseUrl}/reorder`, {
			notNotify: true,
			...payload,
		});

	const fetchProductionLineRoi = (params = {}) =>
		api_request.get(`${baseUrl}/roi`, { params, notNotify: true });

	const fetchProductionLineRpmNodes = (params = {}) =>
		api_request.get(`${baseUrl}/rpm-nodes`, { params, notNotify: true });

	return {
		fetchProductionLines,
		fetchProductionLine,
		saveProductionLine,
		deleteProductionLine,
		reorderProductionLine,
		fetchProductionLineRoi,
		fetchProductionLineRpmNodes,
	};
}
