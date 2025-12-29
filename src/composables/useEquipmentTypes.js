import { api_request } from '@/api/request_provider';
import { useEquipmentTypesStore } from '@/stores/EquipmentTypesStore';

export function useEquipmentTypes() {
	const equipmentTypesStore = useEquipmentTypesStore();

	const fetchEquipmentTypes = (params = {}) => {
		return api_request.get('/equipments/types', {
			params: { max: equipmentTypesStore.filters.max, page: equipmentTypesStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'equipmentTypesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchEquipmentType = (id) => {
		return api_request.get(`/equipments/types/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'equipmentTypesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createEquipmentType = (data) => {
		return api_request.post('/equipments/types', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'equipmentTypesStore',
			notify: true,
			resultMessage: 'Equipment type created successfully',
		});
	};

	const updateEquipmentType = (id, data) => {
		return api_request.put(`/equipments/types/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'equipmentTypesStore',
			notify: true,
			resultMessage: 'Equipment type updated successfully',
		});
	};

	const deleteEquipmentType = (id) => {
		return api_request.delete(`/equipments/types/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'equipmentTypesStore',
			notify: true,
			resultMessage: 'Equipment type deleted successfully',
		});
	};

	return { equipmentTypesStore, fetchEquipmentTypes, fetchEquipmentType, createEquipmentType, updateEquipmentType, deleteEquipmentType };
}
