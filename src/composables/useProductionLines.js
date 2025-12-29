import { api_request } from '@/api/request_provider';
import { useProductionLinesStore } from '@/stores/ProductionLinesStore';

export function useProductionLines() {
	const productionLinesStore = useProductionLinesStore();

	const fetchProductionLines = (params = {}) => {
		return api_request.get('/production-lines', {
			params: { max: productionLinesStore.filters.max, page: productionLinesStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'productionLinesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchProductionLine = (id) => {
		return api_request.get(`/production-lines/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'productionLinesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createProductionLine = (data) => {
		return api_request.post('/production-lines', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'productionLinesStore',
			notify: true,
			resultMessage: 'Production line created successfully',
		});
	};

	const updateProductionLine = (id, data) => {
		return api_request.put(`/production-lines/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'productionLinesStore',
			notify: true,
			resultMessage: 'Production line updated successfully',
		});
	};

	const deleteProductionLine = (id) => {
		return api_request.delete(`/production-lines/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'productionLinesStore',
			notify: true,
			resultMessage: 'Production line deleted successfully',
		});
	};

	return { productionLinesStore, fetchProductionLines, fetchProductionLine, createProductionLine, updateProductionLine, deleteProductionLine };
}
