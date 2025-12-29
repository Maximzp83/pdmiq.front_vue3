import { api_request } from '@/api/request_provider';
import { useRoiOnePagersStore } from '@/stores/RoiOnePagersStore';

export function useRoiOnePagers() {
	const roionepagersStore = useRoiOnePagersStore();

	const fetchRoiOnePagers = (params = {}) => {
		return api_request.get('/roi-one-pagers', {
			params: { max: roionepagersStore.filters.max, page: roionepagersStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'roionepagersStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchRoiOnePagersSingle = (id) => {
		return api_request.get(`/roi-one-pagers/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'roionepagersStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createRoiOnePagersSingle = (data) => {
		return api_request.post('/roi-one-pagers', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'roionepagersStore',
			notify: true,
			resultMessage: 'ROI one pager created successfully',
		});
	};

	const updateRoiOnePagersSingle = (id, data) => {
		return api_request.put(`/roi-one-pagers/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'roionepagersStore',
			notify: true,
			resultMessage: 'ROI one pager updated successfully',
		});
	};

	const deleteRoiOnePagersSingle = (id) => {
		return api_request.delete(`/roi-one-pagers/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'roionepagersStore',
			notify: true,
			resultMessage: 'ROI one pager deleted successfully',
		});
	};

	return { roionepagersStore, fetchRoiOnePagers, fetchRoiOnePagersSingle, createRoiOnePagersSingle, updateRoiOnePagersSingle, deleteRoiOnePagersSingle };
}
