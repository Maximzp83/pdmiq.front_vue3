import { api_request } from '@/api/request_provider';
import { useRfqsStore } from '@/stores/RfqsStore';

export function useRfqs() {
	const rfqsStore = useRfqsStore();

	const fetchRfqs = (params = {}) => {
		return api_request.get('/rfqs', {
			params: { max: rfqsStore.filters.max, page: rfqsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'rfqsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchRfqsSingle = (id) => {
		return api_request.get(`/rfqs/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'rfqsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createRfqsSingle = (data) => {
		return api_request.post('/rfqs', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'rfqsStore',
			notify: true,
			resultMessage: 'RFQ created successfully',
		});
	};

	const updateRfqsSingle = (id, data) => {
		return api_request.put(`/rfqs/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'rfqsStore',
			notify: true,
			resultMessage: 'RFQ updated successfully',
		});
	};

	const deleteRfqsSingle = (id) => {
		return api_request.delete(`/rfqs/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'rfqsStore',
			notify: true,
			resultMessage: 'RFQ deleted successfully',
		});
	};

	return { rfqsStore, fetchRfqs, fetchRfqsSingle, createRfqsSingle, updateRfqsSingle, deleteRfqsSingle };
}
