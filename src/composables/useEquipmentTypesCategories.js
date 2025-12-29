import { api_request } from '@/api/request_provider';
import { useEquipmentTypesCategoriesStore } from '@/stores/EquipmentTypesCategoriesStore';

export function useEquipmentTypesCategories() {
	const equipmenttypescategoriesStore = useEquipmentTypesCategoriesStore();

	const fetchEquipmentTypesCategories = (params = {}) => {
		return api_request.get('/equipment-types-categories', {
			params: { max: equipmenttypescategoriesStore.filters.max, page: equipmenttypescategoriesStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'equipmenttypescategoriesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchEquipmentTypesCategoriesSingle = (id) => {
		return api_request.get(`/equipment-types-categories/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'equipmenttypescategoriesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createEquipmentTypesCategoriesSingle = (data) => {
		return api_request.post('/equipment-types-categories', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'equipmenttypescategoriesStore',
			notify: true,
			resultMessage: 'Equipment type category created successfully',
		});
	};

	const updateEquipmentTypesCategoriesSingle = (id, data) => {
		return api_request.put(`/equipment-types-categories/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'equipmenttypescategoriesStore',
			notify: true,
			resultMessage: 'Equipment type category updated successfully',
		});
	};

	const deleteEquipmentTypesCategoriesSingle = (id) => {
		return api_request.delete(`/equipment-types-categories/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'equipmenttypescategoriesStore',
			notify: true,
			resultMessage: 'Equipment type category deleted successfully',
		});
	};

	return { equipmenttypescategoriesStore, fetchEquipmentTypesCategories, fetchEquipmentTypesCategoriesSingle, createEquipmentTypesCategoriesSingle, updateEquipmentTypesCategoriesSingle, deleteEquipmentTypesCategoriesSingle };
}
