import { api_request } from '@/api/request_provider';
import { useBrandsStore } from '@/stores/BrandsStore';

export function useBrands() {
	const brandsStore = useBrandsStore();

	const fetchBrands = (params = {}) => {
		return api_request.get('/equipments/brands', {
			params: { max: brandsStore.filters.max, page: brandsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'brandsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchBrand = (id) => {
		return api_request.get(`/equipments/brands/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'brandsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createBrand = (data) => {
		return api_request.post('/equipments/brands', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'brandsStore',
			notify: true,
			resultMessage: 'Brand created successfully',
		});
	};

	const updateBrand = (id, data) => {
		return api_request.put(`/equipments/brands/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'brandsStore',
			notify: true,
			resultMessage: 'Brand updated successfully',
		});
	};

	const deleteBrand = (id) => {
		return api_request.delete(`/equipments/brands/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'brandsStore',
			notify: true,
			resultMessage: 'Brand deleted successfully',
		});
	};

	return { brandsStore, fetchBrands, fetchBrand, createBrand, updateBrand, deleteBrand };
}
