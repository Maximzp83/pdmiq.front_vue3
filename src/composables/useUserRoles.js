import { api_request } from '@/api/request_provider';
import { useUserRolesStore } from '@/stores/UserRolesStore';

export function useUserRoles() {
	const userrolesStore = useUserRolesStore();

	const fetchUserRoles = (params = {}) => {
		return api_request.get('/user-roles', {
			params: { max: userrolesStore.filters.max, page: userrolesStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'userrolesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchUserRolesSingle = (id) => {
		return api_request.get(`/user-roles/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'userrolesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createUserRolesSingle = (data) => {
		return api_request.post('/user-roles', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'userrolesStore',
			notify: true,
			resultMessage: 'User role created successfully',
		});
	};

	const updateUserRolesSingle = (id, data) => {
		return api_request.put(`/user-roles/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'userrolesStore',
			notify: true,
			resultMessage: 'User role updated successfully',
		});
	};

	const deleteUserRolesSingle = (id) => {
		return api_request.delete(`/user-roles/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'userrolesStore',
			notify: true,
			resultMessage: 'User role deleted successfully',
		});
	};

	return { userrolesStore, fetchUserRoles, fetchUserRolesSingle, createUserRolesSingle, updateUserRolesSingle, deleteUserRolesSingle };
}
