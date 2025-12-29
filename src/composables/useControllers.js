import { api_request } from '@/api/request_provider';
import { useControllersStore } from '@/stores/ControllersStore';

/**
 * Controllers composable for managing controller devices and DXM commands
 * Handles CRUD operations, commands, FFT, and exports
 *
 * Migrated from: vue2_project/src/store/modules/controllers.js
 */
export const useControllers = () => {
	const controllersStore = useControllersStore();

	/**
	 * Fetch controllers list
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchControllers = (params = {}) => {
		return api_request.get('/controllers', {
			params: params.params || params,
			storeName: 'controllersStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			loading: true,
			setToStore: true,
		});
	};

	/**
	 * Fetch single controller by ID
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const fetchController = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.get(`/controllers/${itemId}`, {
			...rest,
			storeName: 'controllersStore',
			stateProp: 'itemData',
			setToStore: true,
			notNotify: true,
		});
	};

	/**
	 * Save controller (create or update)
	 * @param {Object} payload - Payload with data and optional itemId
	 * @returns {Promise}
	 */
	const saveController = (payload) => {
		const { itemId, data, ...rest } = payload;
		const method = itemId ? 'PUT' : 'POST';
		const url = itemId ? `/controllers/${itemId}` : '/controllers';

		return api_request(url, {
			...rest,
			method,
			data,
			storeName: 'controllersStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			loading: true,
			setToStore: true,
		});
	};

	/**
	 * Delete controller
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const deleteController = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.delete(`/controllers/${itemId}`, {
			...rest,
			loadingProp: 'isSaving',
			loading: true,
		});
	};

	/**
	 * Send command to controller
	 * @param {Object} payload - Payload with itemId and command data
	 * @returns {Promise}
	 */
	const controllerCmd = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request.put(`/controllers/${itemId}/cmd`, {
			...rest,
			data,
		});
	};

	/**
	 * Fetch DXM commands history for a controller
	 * @param {Object} payload - Payload with controllerId
	 * @returns {Promise}
	 */
	const fetchDxmCommandsHistory = (payload) => {
		const { controllerId, params, ...rest } = payload;
		return api_request.get(`/controllers/${controllerId}/commands`, {
			...rest,
			params,
			notNotify: true,
		});
	};

	/**
	 * Request a DXM command
	 * @param {Object} payload - Payload with controllerId and command data
	 * @returns {Promise}
	 */
	const requestDxmCommand = (payload) => {
		const { controllerId, data, ...rest } = payload;
		return api_request.post(`/controllers/${controllerId}/commands`, {
			...rest,
			data,
			notNotify: true,
		});
	};

	/**
	 * Execute multiple FFT for controller group
	 * @param {Object} payload - Payload with controllerId and group data
	 * @returns {Promise}
	 */
	const controllerMultipleFft = (payload) => {
		const { controllerId, data, ...rest } = payload;
		return api_request.post(`/controllers/fft/${controllerId}/group`, {
			...rest,
			data,
		});
	};

	/**
	 * Export controllers data
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const exportControllers = (params = {}) => {
		return api_request.get('/controllers/export', {
			params: params.params || params,
			dataPath: 'data',
		});
	};

	/**
	 * Register command
	 * @param {Object} payload - Payload with command data
	 * @returns {Promise}
	 */
	const registerCmd = (payload) => {
		const { data, ...rest } = payload;
		return api_request.post('/registers/command', {
			...rest,
			data,
		});
	};

	return {
		controllersStore,
		fetchControllers,
		fetchController,
		saveController,
		deleteController,
		controllerCmd,
		fetchDxmCommandsHistory,
		requestDxmCommand,
		controllerMultipleFft,
		exportControllers,
		registerCmd,
	};
};
