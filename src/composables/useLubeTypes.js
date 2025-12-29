import { api_request } from '@/api/request_provider';
import { useLubeTypesStore } from '@/stores/LubeTypesStore';

export function useLubeTypes() {
	const lubeTypesStore = useLubeTypesStore();
	const fetchLubeTypes = (params = {}) => api_request.get('/lube-types', { params: { max: lubeTypesStore.filters.max, page: lubeTypesStore.filters.page, ...params }, loading: true, loadingProp: 'isLoading', storeName: 'lubeTypesStore', toStore: true, stateProp: 'itemsList', notNotify: true });
	const fetchLubeType = (id) => api_request.get(`/lube-types/${id}`, { loading: true, loadingProp: 'isLoading', storeName: 'lubeTypesStore', toStore: true, stateProp: 'itemData', notNotify: true });
	const createLubeType = (data) => api_request.post('/lube-types', { data, loading: true, loadingProp: 'isSaving', storeName: 'lubeTypesStore', notify: true, resultMessage: 'Lube type created successfully' });
	const updateLubeType = (id, data) => api_request.put(`/lube-types/${id}`, { data, loading: true, loadingProp: 'isSaving', storeName: 'lubeTypesStore', notify: true, resultMessage: 'Lube type updated successfully' });
	const deleteLubeType = (id) => api_request.delete(`/lube-types/${id}`, { loading: true, loadingProp: 'isLoading', storeName: 'lubeTypesStore', notify: true, resultMessage: 'Lube type deleted successfully' });
	return { lubeTypesStore, fetchLubeTypes, fetchLubeType, createLubeType, updateLubeType, deleteLubeType };
}
