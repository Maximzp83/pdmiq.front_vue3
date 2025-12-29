import { api_request } from '@/api/request_provider';
import { usePlantRequisitionsStore } from '@/stores/PlantRequisitionsStore';

export function usePlantRequisitions() {
	const plantrequisitionsStore = usePlantRequisitionsStore();

	const fetchPlantRequisitions = (params = {}) => {
		return api_request.get('/plant-requisitions', {
			params: { max: plantrequisitionsStore.filters.max, page: plantrequisitionsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantrequisitionsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchPlantRequisitionsSingle = (id) => {
		return api_request.get(`/plant-requisitions/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantrequisitionsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createPlantRequisitionsSingle = (data) => {
		return api_request.post('/plant-requisitions', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'plantrequisitionsStore',
			notify: true,
			resultMessage: 'Plant requisition created successfully',
		});
	};

	const updatePlantRequisitionsSingle = (id, data) => {
		return api_request.put(`/plant-requisitions/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'plantrequisitionsStore',
			notify: true,
			resultMessage: 'Plant requisition updated successfully',
		});
	};

	const deletePlantRequisitionsSingle = (id) => {
		return api_request.delete(`/plant-requisitions/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantrequisitionsStore',
			notify: true,
			resultMessage: 'Plant requisition deleted successfully',
		});
	};

	return { plantrequisitionsStore, fetchPlantRequisitions, fetchPlantRequisitionsSingle, createPlantRequisitionsSingle, updatePlantRequisitionsSingle, deletePlantRequisitionsSingle };
}
