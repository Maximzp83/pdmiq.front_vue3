/**
 * Users Composable
 * Handles all user-related API operations
 * Uses api_request for HTTP calls and UsersStore for state management
 */

import { api_request } from '@/api/request_provider';
import { useUsersStore } from '@/stores/UsersStore';

export function useUsers() {
	const usersStore = useUsersStore();

	/**
	 * Fetch users list
	 * @param {Object} params - Query parameters (page, max, search, etc.)
	 * @returns {Promise}
	 */
	const fetchUsers = (params = {}) => {
		return api_request.get('/users', {
			params: {
				max: usersStore.filters.max,
				page: usersStore.filters.page,
				...params,
			},
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'usersStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	/**
	 * Fetch single user by ID
	 * @param {number} userId - User ID
	 * @returns {Promise}
	 */
	const fetchUser = (userId) => {
		return api_request.get(`/users/${userId}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'usersStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	/**
	 * Create new user
	 * @param {Object} userData - User data
	 * @returns {Promise}
	 */
	const createUser = (userData) => {
		return api_request.post('/users', {
			data: userData,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'usersStore',
			notify: true,
			resultMessage: 'User created successfully',
		});
	};

	/**
	 * Update existing user
	 * @param {number} userId - User ID
	 * @param {Object} userData - Updated user data
	 * @returns {Promise}
	 */
	const updateUser = (userId, userData) => {
		return api_request.put(`/users/${userId}`, {
			data: userData,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'usersStore',
			notify: true,
			resultMessage: 'User updated successfully',
		});
	};

	/**
	 * Delete user
	 * @param {number} userId - User ID
	 * @returns {Promise}
	 */
	const deleteUser = (userId) => {
		return api_request.delete(`/users/${userId}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'usersStore',
			notify: true,
			resultMessage: 'User deleted successfully',
		});
	};

	/**
	 * Fetch user reports
	 * @param {number} userId - User ID
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchReports = (userId, params = {}) => {
		return api_request.get(`/users/${userId}/scheduled-reports`, {
			params: {
				max: usersStore.reports_filters.max,
				page: usersStore.reports_filters.page,
				...params,
			},
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'usersStore',
			notNotify: true,
		});
	};

	/**
	 * Save user report (create or update)
	 * @param {number} userId - User ID
	 * @param {Object} reportData - Report data
	 * @returns {Promise}
	 */
	const saveReport = (userId, reportData) => {
		const url = `/users/${userId}/scheduled-reports`;
		const method = reportData.id ? 'put' : 'post';
		const finalUrl = reportData.id ? `${url}/${reportData.id}` : url;

		return api_request[method](finalUrl, {
			data: reportData,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'usersStore',
			notNotify: true,
		});
	};

	return {
		// Store reference
		usersStore,

		// API methods
		fetchUsers,
		fetchUser,
		createUser,
		updateUser,
		deleteUser,
		fetchReports,
		saveReport,
	};
}
