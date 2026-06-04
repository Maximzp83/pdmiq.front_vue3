import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

const baseUrl = '/assets';

export function useAssets() {
	const fetchAssets = (params = {}) =>
		api_request.get(baseUrl, {
			params,
			incudeMeta: true,
			notNotify: true,
			storeName: 'assetsStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		});

	const fetchAsset = ({ itemId, ...payload } = {}) =>
		api_request.get(`${baseUrl}/${itemId}`, {
			notNotify: true,
			storeName: 'assetsStore',
			stateProp: 'itemData',
			loadingProp: 'isLoading',
			...payload,
		});

	const saveAsset = (payload = {}) =>
		api_request(baseUrl, {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			storeName: 'assetsStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			...payload,
		});

	const deleteAsset = (payload = {}) =>
		api_request.delete(baseUrl, {
			itemName: Lang.tt('Asset'),
			...payload,
		});

	const reorderAsset = (payload = {}) =>
		api_request.post(`${baseUrl}/reorder`, {
			notNotify: true,
			...payload,
		});

	const fetchAssetRoi = (params = {}) =>
		api_request.get(`${baseUrl}/roi`, { params, notNotify: true });

	return {
		fetchAssets,
		fetchAsset,
		saveAsset,
		deleteAsset,
		reorderAsset,
		fetchAssetRoi,
	};
}
