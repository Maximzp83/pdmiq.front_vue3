import { api_request } from '@/api/request_provider';
import { useWorkOrdersStore } from '@/stores/WorkOrdersStore';

export function useWorkOrders() {
	const workOrdersStore = useWorkOrdersStore();

	const fetchWorkOrders = (params = {}) => {
		return api_request.get('/work-orders', {
			params: { max: workOrdersStore.filters.max, page: workOrdersStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'workOrdersStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchWorkOrder = (id) => {
		return api_request.get(`/work-orders/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'workOrdersStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createWorkOrder = (data) => {
		return api_request.post('/work-orders', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'workOrdersStore',
			notify: true,
			resultMessage: 'Work order created successfully',
		});
	};

	const updateWorkOrder = (id, data) => {
		return api_request.put(`/work-orders/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'workOrdersStore',
			notify: true,
			resultMessage: 'Work order updated successfully',
		});
	};

	const deleteWorkOrder = (id) => {
		return api_request.delete(`/work-orders/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'workOrdersStore',
			notify: true,
			resultMessage: 'Work order deleted successfully',
		});
	};

	return { workOrdersStore, fetchWorkOrders, fetchWorkOrder, createWorkOrder, updateWorkOrder, deleteWorkOrder };
}
