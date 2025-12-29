import { api_request } from '@/api/request_provider';
import { useAssetsStore } from '@/stores/AssetsStore';

export function useAssets() {
	const assetsStore = useAssetsStore();

	const fetchAssets = (params = {}) => {
		return api_request.get('/assets', {
			params: { max: assetsStore.filters.max, page: assetsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'assetsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchAsset = (id) => {
		return api_request.get(`/assets/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'assetsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createAsset = (data) => {
		return api_request.post('/assets', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'assetsStore',
			notify: true,
			resultMessage: 'Asset created successfully',
		});
	};

	const updateAsset = (id, data) => {
		return api_request.put(`/assets/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'assetsStore',
			notify: true,
			resultMessage: 'Asset updated successfully',
		});
	};

	const deleteAsset = (id) => {
		return api_request.delete(`/assets/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'assetsStore',
			notify: true,
			resultMessage: 'Asset deleted successfully',
		});
	};

	return { assetsStore, fetchAssets, fetchAsset, createAsset, updateAsset, deleteAsset };
}
