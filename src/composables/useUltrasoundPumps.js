import { api_request } from '@/api/request_provider';
import { useUltrasoundPumpsStore } from '@/stores/UltrasoundPumpsStore';

export function useUltrasoundPumps() {
	const ultrasoundPumpsStore = useUltrasoundPumpsStore();

	const fetchUltrasoundPumps = (params = {}) => {
		return api_request.get('/ultrasound-pumps', {
			params: { max: ultrasoundPumpsStore.filters.max, page: ultrasoundPumpsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'ultrasoundPumpsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchUltrasoundPump = (id) => {
		return api_request.get(`/ultrasound-pumps/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'ultrasoundPumpsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createUltrasoundPump = (data) => {
		return api_request.post('/ultrasound-pumps', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'ultrasoundPumpsStore',
			notify: true,
			resultMessage: 'Ultrasound pump created successfully',
		});
	};

	const updateUltrasoundPump = (id, data) => {
		return api_request.put(`/ultrasound-pumps/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'ultrasoundPumpsStore',
			notify: true,
			resultMessage: 'Ultrasound pump updated successfully',
		});
	};

	const deleteUltrasoundPump = (id) => {
		return api_request.delete(`/ultrasound-pumps/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'ultrasoundPumpsStore',
			notify: true,
			resultMessage: 'Ultrasound pump deleted successfully',
		});
	};

	return { ultrasoundPumpsStore, fetchUltrasoundPumps, fetchUltrasoundPump, createUltrasoundPump, updateUltrasoundPump, deleteUltrasoundPump };
}
