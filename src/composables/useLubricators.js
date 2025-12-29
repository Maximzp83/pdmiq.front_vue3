import { api_request } from '@/api/request_provider';
import { useLubricatorsStore } from '@/stores/LubricatorsStore';

export function useLubricators() {
	const lubricatorsStore = useLubricatorsStore();

	const fetchLubricators = (params = {}) => {
		return api_request.get('/lubricators', {
			params: { max: lubricatorsStore.filters.max, page: lubricatorsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'lubricatorsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchLubricator = (id) => {
		return api_request.get(`/lubricators/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'lubricatorsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createLubricator = (data) => {
		return api_request.post('/lubricators', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'lubricatorsStore',
			notify: true,
			resultMessage: 'Lubricator created successfully',
		});
	};

	const updateLubricator = (id, data) => {
		return api_request.put(`/lubricators/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'lubricatorsStore',
			notify: true,
			resultMessage: 'Lubricator updated successfully',
		});
	};

	const deleteLubricator = (id) => {
		return api_request.delete(`/lubricators/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'lubricatorsStore',
			notify: true,
			resultMessage: 'Lubricator deleted successfully',
		});
	};

	return { lubricatorsStore, fetchLubricators, fetchLubricator, createLubricator, updateLubricator, deleteLubricator };
}
