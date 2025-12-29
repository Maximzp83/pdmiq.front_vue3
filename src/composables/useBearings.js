import { api_request } from '@/api/request_provider';
import { useBearingsStore } from '@/stores/BearingsStore';

export function useBearings() {
	const bearingsStore = useBearingsStore();

	const fetchBearings = (params = {}) => {
		return api_request.get('/bearings', {
			params: { max: bearingsStore.filters.max, page: bearingsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'bearingsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchBearing = (id) => {
		return api_request.get(`/bearings/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'bearingsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createBearing = (data) => {
		return api_request.post('/bearings', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'bearingsStore',
			notify: true,
			resultMessage: 'Bearing created successfully',
		});
	};

	const updateBearing = (id, data) => {
		return api_request.put(`/bearings/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'bearingsStore',
			notify: true,
			resultMessage: 'Bearing updated successfully',
		});
	};

	const deleteBearing = (id) => {
		return api_request.delete(`/bearings/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'bearingsStore',
			notify: true,
			resultMessage: 'Bearing deleted successfully',
		});
	};

	return { bearingsStore, fetchBearings, fetchBearing, createBearing, updateBearing, deleteBearing };
}
