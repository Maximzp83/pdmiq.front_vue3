import { api_request } from '@/api/request_provider';
import { usePartsStore } from '@/stores/PartsStore';

export function useParts() {
	const partsStore = usePartsStore();

	const fetchParts = (params = {}) => {
		return api_request.get('/parts', {
			params: { max: partsStore.filters.max, page: partsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'partsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchPart = (id) => {
		return api_request.get(`/parts/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'partsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createPart = (data) => {
		return api_request.post('/parts', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'partsStore',
			notify: true,
			resultMessage: 'Part created successfully',
		});
	};

	const updatePart = (id, data) => {
		return api_request.put(`/parts/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'partsStore',
			notify: true,
			resultMessage: 'Part updated successfully',
		});
	};

	const deletePart = (id) => {
		return api_request.delete(`/parts/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'partsStore',
			notify: true,
			resultMessage: 'Part deleted successfully',
		});
	};

	return { partsStore, fetchParts, fetchPart, createPart, updatePart, deletePart };
}
