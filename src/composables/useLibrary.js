import { api_request } from '@/api/request_provider';
import { useLibraryStore } from '@/stores/LibraryStore';

export function useLibrary() {
	const libraryStore = useLibraryStore();

	const fetchLibrary = (params = {}) => {
		return api_request.get('/library', {
			params: { max: libraryStore.filters.max, page: libraryStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'libraryStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchLibrarySingle = (id) => {
		return api_request.get(`/library/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'libraryStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createLibrarySingle = (data) => {
		return api_request.post('/library', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'libraryStore',
			notify: true,
			resultMessage: 'Library item created successfully',
		});
	};

	const updateLibrarySingle = (id, data) => {
		return api_request.put(`/library/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'libraryStore',
			notify: true,
			resultMessage: 'Library item updated successfully',
		});
	};

	const deleteLibrarySingle = (id) => {
		return api_request.delete(`/library/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'libraryStore',
			notify: true,
			resultMessage: 'Library item deleted successfully',
		});
	};

	return { libraryStore, fetchLibrary, fetchLibrarySingle, createLibrarySingle, updateLibrarySingle, deleteLibrarySingle };
}
