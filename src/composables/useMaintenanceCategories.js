import { api_request } from '@/api/request_provider';
import { useMaintenanceCategoriesStore } from '@/stores/MaintenanceCategoriesStore';

export function useMaintenanceCategories() {
	const maintenancecategoriesStore = useMaintenanceCategoriesStore();

	const fetchMaintenanceCategories = (params = {}) => {
		return api_request.get('/maintenance-categories', {
			params: { max: maintenancecategoriesStore.filters.max, page: maintenancecategoriesStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'maintenancecategoriesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchMaintenanceCategoriesSingle = (id) => {
		return api_request.get(`/maintenance-categories/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'maintenancecategoriesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createMaintenanceCategoriesSingle = (data) => {
		return api_request.post('/maintenance-categories', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'maintenancecategoriesStore',
			notify: true,
			resultMessage: 'Maintenance category created successfully',
		});
	};

	const updateMaintenanceCategoriesSingle = (id, data) => {
		return api_request.put(`/maintenance-categories/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'maintenancecategoriesStore',
			notify: true,
			resultMessage: 'Maintenance category updated successfully',
		});
	};

	const deleteMaintenanceCategoriesSingle = (id) => {
		return api_request.delete(`/maintenance-categories/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'maintenancecategoriesStore',
			notify: true,
			resultMessage: 'Maintenance category deleted successfully',
		});
	};

	return { maintenancecategoriesStore, fetchMaintenanceCategories, fetchMaintenanceCategoriesSingle, createMaintenanceCategoriesSingle, updateMaintenanceCategoriesSingle, deleteMaintenanceCategoriesSingle };
}
