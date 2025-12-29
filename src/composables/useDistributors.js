import { api_request } from '@/api/request_provider';
import { useDistributorsStore } from '@/stores/DistributorsStore';

export function useDistributors() {
	const distributorsStore = useDistributorsStore();

	const fetchDistributors = (params = {}) => {
		return api_request.get('/distributors', {
			params: { max: distributorsStore.filters.max, page: distributorsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'distributorsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchDistributor = (id) => {
		return api_request.get(`/distributors/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'distributorsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createDistributor = (data) => {
		return api_request.post('/distributors', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'distributorsStore',
			notify: true,
			resultMessage: 'Distributor created successfully',
		});
	};

	const updateDistributor = (id, data) => {
		return api_request.put(`/distributors/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'distributorsStore',
			notify: true,
			resultMessage: 'Distributor updated successfully',
		});
	};

	const deleteDistributor = (id) => {
		return api_request.delete(`/distributors/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'distributorsStore',
			notify: true,
			resultMessage: 'Distributor deleted successfully',
		});
	};

	return { distributorsStore, fetchDistributors, fetchDistributor, createDistributor, updateDistributor, deleteDistributor };
}
