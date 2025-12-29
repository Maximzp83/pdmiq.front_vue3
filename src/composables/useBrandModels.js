import { api_request } from '@/api/request_provider';
import { useBrandModelsStore } from '@/stores/BrandModelsStore';

export function useBrandModels() {
	const brandModelsStore = useBrandModelsStore();

	const fetchBrandModels = (params = {}) => {
		return api_request.get('/equipments/brand-models', {
			params: { max: brandModelsStore.filters.max, page: brandModelsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'brandModelsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchBrandModel = (id) => {
		return api_request.get(`/equipments/brand-models/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'brandModelsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createBrandModel = (data) => {
		return api_request.post('/equipments/brand-models', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'brandModelsStore',
			notify: true,
			resultMessage: 'Brand model created successfully',
		});
	};

	const updateBrandModel = (id, data) => {
		return api_request.put(`/equipments/brand-models/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'brandModelsStore',
			notify: true,
			resultMessage: 'Brand model updated successfully',
		});
	};

	const deleteBrandModel = (id) => {
		return api_request.delete(`/equipments/brand-models/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'brandModelsStore',
			notify: true,
			resultMessage: 'Brand model deleted successfully',
		});
	};

	return { brandModelsStore, fetchBrandModels, fetchBrandModel, createBrandModel, updateBrandModel, deleteBrandModel };
}
