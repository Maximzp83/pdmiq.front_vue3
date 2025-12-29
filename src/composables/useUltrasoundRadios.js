import { api_request } from '@/api/request_provider';
import { useUltrasoundRadiosStore } from '@/stores/UltrasoundRadiosStore';

export function useUltrasoundRadios() {
	const ultrasoundRadiosStore = useUltrasoundRadiosStore();

	const fetchUltrasoundRadios = (params = {}) => {
		return api_request.get('/ultrasound-radios', {
			params: { max: ultrasoundRadiosStore.filters.max, page: ultrasoundRadiosStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'ultrasoundRadiosStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchUltrasoundRadio = (id) => {
		return api_request.get(`/ultrasound-radios/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'ultrasoundRadiosStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createUltrasoundRadio = (data) => {
		return api_request.post('/ultrasound-radios', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'ultrasoundRadiosStore',
			notify: true,
			resultMessage: 'Ultrasound radio created successfully',
		});
	};

	const updateUltrasoundRadio = (id, data) => {
		return api_request.put(`/ultrasound-radios/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'ultrasoundRadiosStore',
			notify: true,
			resultMessage: 'Ultrasound radio updated successfully',
		});
	};

	const deleteUltrasoundRadio = (id) => {
		return api_request.delete(`/ultrasound-radios/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'ultrasoundRadiosStore',
			notify: true,
			resultMessage: 'Ultrasound radio deleted successfully',
		});
	};

	return { ultrasoundRadiosStore, fetchUltrasoundRadios, fetchUltrasoundRadio, createUltrasoundRadio, updateUltrasoundRadio, deleteUltrasoundRadio };
}
