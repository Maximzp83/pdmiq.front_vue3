import { api_request } from '@/api/request_provider';
import { useMaintenanceStore } from '@/stores/MaintenanceStore';
import { Lang } from '@/localization';

/**
 * Maintenance composable for managing work orders and maintenance logs
 * Handles CRUD operations, work order workflows, and imports
 *
 * Migrated from: vue2_project/src/store/modules/maintenance.js
 */
export const useMaintenance = () => {
	const maintenanceStore = useMaintenanceStore();

	/**
	 * Fetch maintenance logs list
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchMaintenanceLogs = (params = {}) => {
		return api_request.get('/maintenance', {
			params: params.params || params,
			storeName: 'maintenanceStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			loading: true,
			setToStore: true,
		});
	};

	/**
	 * Fetch single maintenance log by ID
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const fetchMaintenanceLog = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.get(`/maintenance/${itemId}`, {
			...rest,
			storeName: 'maintenanceStore',
			stateProp: 'itemData',
			setToStore: true,
			notNotify: true,
		});
	};

	/**
	 * Fetch maintenance statistics
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchMaintenanceStatistics = (params = {}) => {
		return api_request.get('/maintenance/statistics', {
			params: params.params || params,
			notNotify: true,
		});
	};

	/**
	 * Save maintenance log (create or update)
	 * @param {Object} payload - Payload with data and optional itemId
	 * @returns {Promise}
	 */
	const saveMaintenanceLog = (payload) => {
		const { itemId, data, ...rest } = payload;
		const method = itemId ? 'PUT' : 'POST';
		const url = itemId ? `/maintenance/${itemId}` : '/maintenance';

		return api_request(url, {
			...rest,
			method,
			data,
			storeName: 'maintenanceStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			loading: true,
			setToStore: true,
		});
	};

	/**
	 * Save maintenance request
	 * @param {Object} payload - Payload with data and optional itemId
	 * @returns {Promise}
	 */
	const saveMaintenanceRequest = (payload) => {
		const { itemId, data, ...rest } = payload;
		const method = itemId ? 'PUT' : 'POST';
		const url = itemId
			? `/maintenance/requests/${itemId}`
			: '/maintenance/requests';

		return api_request(url, {
			...rest,
			method,
			data,
			loadingProp: 'isSaving',
			loading: true,
		});
	};

	/**
	 * Convert maintenance request to work order
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const convertMaintenanceRequest = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request.post(`/maintenance/requests/${itemId}`, {
			...rest,
			data,
		});
	};

	/**
	 * Reject maintenance request
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const rejectMaintenanceRequest = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.delete(`/maintenance/${itemId}`, {
			...rest,
		});
	};

	/**
	 * Close work order
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const closeWorkOrder = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request.put(`/maintenance/${itemId}/close`, {
			...rest,
			data,
		});
	};

	/**
	 * Set work orders to in-work status (multiple)
	 * @param {Object} payload - Payload with work order IDs
	 * @returns {Promise}
	 */
	const setInWorkWorkOrders = (payload) => {
		return api_request.put('/maintenance/in-work-multiple', {
			...payload,
			data: payload.data,
		});
	};

	/**
	 * Complete work orders (multiple)
	 * @param {Object} payload - Payload with work order IDs
	 * @returns {Promise}
	 */
	const completeWorkOrders = (payload) => {
		return api_request.put('/maintenance/complete-multiple', {
			...payload,
			data: payload.data,
		});
	};

	/**
	 * Close work orders (multiple)
	 * @param {Object} payload - Payload with work order IDs
	 * @returns {Promise}
	 */
	const closeWorkOrders = (payload) => {
		return api_request.put('/maintenance/close', {
			...payload,
			data: payload.data,
		});
	};

	/**
	 * Unlock/reopen work order
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const unlockWorkOrder = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request.put(`/maintenance/${itemId}/open`, {
			...rest,
			data,
		});
	};

	/**
	 * Delete maintenance log
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const deleteMaintenanceLog = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.delete(`/maintenance/${itemId}`, {
			...rest,
			loadingProp: 'isSaving',
			loading: true,
		});
	};

	/**
	 * Export maintenance log to Excel
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const exportMaintenanceLogToExcel = (params = {}) => {
		return api_request.get('/maintenance/export/excel', {
			params: params.params || params,
			resultMessage: Lang.tt('phrases.File_was_sent_on_your_email'),
		});
	};

	/**
	 * Upload work order file
	 * @param {Object} payload - File upload data
	 * @returns {Promise}
	 */
	const uploadWorkOrder = (payload) => {
		return api_request.post('/maintenance/upload-work-order', {
			...payload,
			data: payload.data,
			notNotify: true,
		});
	};

	/**
	 * Import work order
	 * @param {Object} payload - Import data
	 * @returns {Promise}
	 */
	const importWorkOrder = (payload) => {
		return api_request.post('/maintenance/import-work-order', {
			...payload,
			data: payload.data,
			resultMessage: 'Import process successfully started',
		});
	};

	/**
	 * Revert work order import
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const revertImportWorkOrder = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request.post(`/maintenance/revert-import/${itemId}`, {
			...rest,
			data,
			resultMessage: 'Import process successfully reverted',
		});
	};

	/**
	 * Get work order import progress
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const getImportWorkOrderProgress = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.get(`/maintenance/import-progress/${itemId}`, {
			...rest,
			notNotify: true,
		});
	};

	return {
		maintenanceStore,
		fetchMaintenanceLogs,
		fetchMaintenanceLog,
		fetchMaintenanceStatistics,
		saveMaintenanceLog,
		saveMaintenanceRequest,
		convertMaintenanceRequest,
		rejectMaintenanceRequest,
		closeWorkOrder,
		setInWorkWorkOrders,
		completeWorkOrders,
		closeWorkOrders,
		unlockWorkOrder,
		deleteMaintenanceLog,
		exportMaintenanceLogToExcel,
		uploadWorkOrder,
		importWorkOrder,
		revertImportWorkOrder,
		getImportWorkOrderProgress,
	};
};
