import { api_request } from '@/api/request_provider';
import { useProcessesStore } from '@/stores/ProcessesStore';

export function useProcesses() {
	const processesStore = useProcessesStore();

	const fetchProcesses = (params = {}) => {
		return api_request.get('/processes', {
			params: { max: processesStore.filters.max, page: processesStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'processesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchProcessesSingle = (id) => {
		return api_request.get(`/processes/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'processesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createProcessesSingle = (data) => {
		return api_request.post('/processes', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'processesStore',
			notify: true,
			resultMessage: 'Process created successfully',
		});
	};

	const updateProcessesSingle = (id, data) => {
		return api_request.put(`/processes/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'processesStore',
			notify: true,
			resultMessage: 'Process updated successfully',
		});
	};

	const deleteProcessesSingle = (id) => {
		return api_request.delete(`/processes/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'processesStore',
			notify: true,
			resultMessage: 'Process deleted successfully',
		});
	};

	return { processesStore, fetchProcesses, fetchProcessesSingle, createProcessesSingle, updateProcessesSingle, deleteProcessesSingle };
}
