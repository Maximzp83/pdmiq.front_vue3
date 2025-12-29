import { api_request } from '@/api/request_provider';
import { useIndustrialServicesStore } from '@/stores/IndustrialServicesStore';

export function useIndustrialServices() {
	const industrialServicesStore = useIndustrialServicesStore();

	const fetchIndustrialServices = (params = {}) => {
		return api_request.get('/industrial-services', {
			params: { max: industrialServicesStore.filters.max, page: industrialServicesStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'industrialServicesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchIndustrialService = (id) => {
		return api_request.get(`/industrial-services/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'industrialServicesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createIndustrialService = (data) => {
		return api_request.post('/industrial-services', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'industrialServicesStore',
			notify: true,
			resultMessage: 'Industrial service created successfully',
		});
	};

	const updateIndustrialService = (id, data) => {
		return api_request.put(`/industrial-services/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'industrialServicesStore',
			notify: true,
			resultMessage: 'Industrial service updated successfully',
		});
	};

	const deleteIndustrialService = (id) => {
		return api_request.delete(`/industrial-services/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'industrialServicesStore',
			notify: true,
			resultMessage: 'Industrial service deleted successfully',
		});
	};

	return { industrialServicesStore, fetchIndustrialServices, fetchIndustrialService, createIndustrialService, updateIndustrialService, deleteIndustrialService };
}
