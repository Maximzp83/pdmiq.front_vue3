import { api_request } from '@/api/request_provider';
import { usePlantWorkStationsStore } from '@/stores/PlantWorkStationsStore';

export function usePlantWorkStations() {
	const plantworkstationsStore = usePlantWorkStationsStore();

	const fetchPlantWorkStations = (params = {}) => {
		return api_request.get('/plant-work-stations', {
			params: { max: plantworkstationsStore.filters.max, page: plantworkstationsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantworkstationsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchPlantWorkStationsSingle = (id) => {
		return api_request.get(`/plant-work-stations/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantworkstationsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createPlantWorkStationsSingle = (data) => {
		return api_request.post('/plant-work-stations', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'plantworkstationsStore',
			notify: true,
			resultMessage: 'Plant work station created successfully',
		});
	};

	const updatePlantWorkStationsSingle = (id, data) => {
		return api_request.put(`/plant-work-stations/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'plantworkstationsStore',
			notify: true,
			resultMessage: 'Plant work station updated successfully',
		});
	};

	const deletePlantWorkStationsSingle = (id) => {
		return api_request.delete(`/plant-work-stations/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'plantworkstationsStore',
			notify: true,
			resultMessage: 'Plant work station deleted successfully',
		});
	};

	return { plantworkstationsStore, fetchPlantWorkStations, fetchPlantWorkStationsSingle, createPlantWorkStationsSingle, updatePlantWorkStationsSingle, deletePlantWorkStationsSingle };
}
