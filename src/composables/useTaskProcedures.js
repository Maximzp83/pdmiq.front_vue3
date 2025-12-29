import { api_request } from '@/api/request_provider';
import { useTaskProceduresStore } from '@/stores/TaskProceduresStore';

export function useTaskProcedures() {
	const taskproceduresStore = useTaskProceduresStore();

	const fetchTaskProcedures = (params = {}) => {
		return api_request.get('/task-procedures', {
			params: { max: taskproceduresStore.filters.max, page: taskproceduresStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'taskproceduresStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchTaskProceduresSingle = (id) => {
		return api_request.get(`/task-procedures/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'taskproceduresStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createTaskProceduresSingle = (data) => {
		return api_request.post('/task-procedures', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'taskproceduresStore',
			notify: true,
			resultMessage: 'Task procedure created successfully',
		});
	};

	const updateTaskProceduresSingle = (id, data) => {
		return api_request.put(`/task-procedures/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'taskproceduresStore',
			notify: true,
			resultMessage: 'Task procedure updated successfully',
		});
	};

	const deleteTaskProceduresSingle = (id) => {
		return api_request.delete(`/task-procedures/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'taskproceduresStore',
			notify: true,
			resultMessage: 'Task procedure deleted successfully',
		});
	};

	return { taskproceduresStore, fetchTaskProcedures, fetchTaskProceduresSingle, createTaskProceduresSingle, updateTaskProceduresSingle, deleteTaskProceduresSingle };
}
