import { api_request } from '@/api/request_provider';
import { useSolenoidsStore } from '@/stores/SolenoidsStore';

export function useSolenoids() {
	const solenoidsStore = useSolenoidsStore();

	const fetchSolenoids = (params = {}) => {
		return api_request.get('/solenoids', {
			params: { max: solenoidsStore.filters.max, page: solenoidsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'solenoidsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchSolenoid = (id) => {
		return api_request.get(`/solenoids/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'solenoidsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createSolenoid = (data) => {
		return api_request.post('/solenoids', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'solenoidsStore',
			notify: true,
			resultMessage: 'Solenoid created successfully',
		});
	};

	const updateSolenoid = (id, data) => {
		return api_request.put(`/solenoids/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'solenoidsStore',
			notify: true,
			resultMessage: 'Solenoid updated successfully',
		});
	};

	const deleteSolenoid = (id) => {
		return api_request.delete(`/solenoids/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'solenoidsStore',
			notify: true,
			resultMessage: 'Solenoid deleted successfully',
		});
	};

	return { solenoidsStore, fetchSolenoids, fetchSolenoid, createSolenoid, updateSolenoid, deleteSolenoid };
}
