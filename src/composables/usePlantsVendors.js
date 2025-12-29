import { api_request } from '@/api/request_provider';
import { usePlantsVendorsStore } from '@/stores/PlantsVendorsStore';

export function usePlantsVendors() {
	const plantsvendorsStore = usePlantsVendorsStore();

	const fetchPlantsVendors = (params = {}) => {
		return api_request.get('/plants-vendors', {
			params: { max: plantsvendorsStore.filters.max, page: plantsvendorsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantsvendorsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchPlantsVendorsSingle = (id) => {
		return api_request.get(`/plants-vendors/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantsvendorsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createPlantsVendorsSingle = (data) => {
		return api_request.post('/plants-vendors', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'plantsvendorsStore',
			notify: true,
			resultMessage: 'Plant vendor created successfully',
		});
	};

	const updatePlantsVendorsSingle = (id, data) => {
		return api_request.put(`/plants-vendors/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'plantsvendorsStore',
			notify: true,
			resultMessage: 'Plant vendor updated successfully',
		});
	};

	const deletePlantsVendorsSingle = (id) => {
		return api_request.delete(`/plants-vendors/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantsvendorsStore',
			notify: true,
			resultMessage: 'Plant vendor deleted successfully',
		});
	};

	return { plantsvendorsStore, fetchPlantsVendors, fetchPlantsVendorsSingle, createPlantsVendorsSingle, updatePlantsVendorsSingle, deletePlantsVendorsSingle };
}
