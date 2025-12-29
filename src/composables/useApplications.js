import { api_request } from '@/api/request_provider';
import { useApplicationsStore } from '@/stores/ApplicationsStore';

export function useApplications() {
	const applicationsStore = useApplicationsStore();

	const fetchApplications = (params = {}) => {
		return api_request.get('/applications', {
			params: { max: applicationsStore.filters.max, page: applicationsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'applicationsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchApplication = (id) => {
		return api_request.get(`/applications/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'applicationsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createApplication = (data) => {
		return api_request.post('/applications', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'applicationsStore',
			notify: true,
			resultMessage: 'Application created successfully',
		});
	};

	const updateApplication = (id, data) => {
		return api_request.put(`/applications/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'applicationsStore',
			notify: true,
			resultMessage: 'Application updated successfully',
		});
	};

	const deleteApplication = (id) => {
		return api_request.delete(`/applications/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'applicationsStore',
			notify: true,
			resultMessage: 'Application deleted successfully',
		});
	};

	return { applicationsStore, fetchApplications, fetchApplication, createApplication, updateApplication, deleteApplication };
}
