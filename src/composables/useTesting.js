import { api_request } from '@/api/request_provider';
import { useTestingStore } from '@/stores/TestingStore';

/**
 * Testing composable for managing notifications, imports, and logs
 * Handles testing notifications, settings import, masterDB/motorIQ imports, and logs
 *
 * Migrated from: vue2_project/src/store/modules/testing.js
 */
export const useTesting = () => {
	const testingStore = useTestingStore();

	/**
	 * Send test notification
	 * @param {Object} payload - Notification data
	 * @returns {Promise}
	 */
	const sentNotification = (payload) => {
		return api_request.post('/notifications/emulate', {
			...payload,
			data: payload.data,
			loadingProp: 'isSaving',
			loading: true,
			resultMessage: 'notification sended',
		});
	};

	/**
	 * Fetch notification templates
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchNotificationTemplates = (params = {}) => {
		return api_request.get('/notifications/templates', {
			params: params.params || params,
			notNotify: true,
		});
	};

	/**
	 * Save notification templates
	 * @param {Object} payload - Templates data
	 * @returns {Promise}
	 */
	const saveNotificationTemplates = (payload) => {
		return api_request.post('/notifications/templates', {
			...payload,
			data: payload.data,
		});
	};

	/**
	 * Import settings
	 * @param {Object} payload - Settings import data
	 * @returns {Promise}
	 */
	const importSettings = (payload) => {
		return api_request.post('/settings/import', {
			...payload,
			data: payload.data,
		});
	};

	/**
	 * Upload masterDB file
	 * @param {Object} payload - File upload data
	 * @returns {Promise}
	 */
	const uploadMasterDB = (payload) => {
		return api_request.post('/settings/upload-masterDB', {
			...payload,
			data: payload.data,
			notNotify: true,
		});
	};

	/**
	 * Import masterDB
	 * @param {Object} payload - Import data
	 * @returns {Promise}
	 */
	const importMasterDB = (payload) => {
		return api_request.post('/settings/import-masterDB', {
			...payload,
			data: payload.data,
			resultMessage: 'Import operation successfull',
		});
	};

	/**
	 * Upload motorIQ file
	 * @param {Object} payload - File upload data
	 * @returns {Promise}
	 */
	const uploadMotorIQ = (payload) => {
		return api_request.post('/settings/upload-motorIQ', {
			...payload,
			data: payload.data,
			notNotify: true,
		});
	};

	/**
	 * Import motorIQ
	 * @param {Object} payload - Import data
	 * @returns {Promise}
	 */
	const importMotorIQ = (payload) => {
		return api_request.post('/settings/import-motorIQ', {
			...payload,
			data: payload.data,
			notNotify: true,
		});
	};

	/**
	 * Repeat motorIQ import
	 * @param {Object} payload - Import data
	 * @returns {Promise}
	 */
	const importMotorIQRepeat = (payload) => {
		return api_request.post('/settings/import-motorIQ/repeat', {
			...payload,
			data: payload.data,
			resultMessage: 'Repeat import operation successfull',
		});
	};

	/**
	 * Delete motorIQ import row
	 * @param {Object} payload - Payload with rowId
	 * @returns {Promise}
	 */
	const deleteImportMotorIQRow = (payload) => {
		const { rowId, ...rest } = payload;
		return api_request.delete(`/settings/import/log-rows/${rowId}`, {
			...rest,
			resultMessage: 'Row deleted successfully',
		});
	};

	/**
	 * Get import plant progress
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const getImportPlantProgress = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.get(`/settings/import/progress/${itemId}`, {
			...rest,
			notNotify: true,
		});
	};

	/**
	 * Fetch logs list
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchLogs = (params = {}) => {
		return api_request.get('/logs', {
			params: params.params || params,
			storeName: 'testingStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			loading: true,
			setToStore: true,
		});
	};

	/**
	 * Fetch single log by ID
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const fetchLog = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.get(`/logs/${itemId}`, {
			...rest,
			storeName: 'testingStore',
			stateProp: 'itemData',
			setToStore: true,
			notNotify: true,
		});
	};

	/**
	 * Fetch log errors
	 * @param {Object} payload - Payload with itemId and params
	 * @returns {Promise}
	 */
	const fetchLogErrors = (payload) => {
		const { itemId, params, ...rest } = payload;
		return api_request.get(`/logs/${itemId}/rows`, {
			...rest,
			params,
			storeName: 'testingStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			loading: true,
			setToStore: true,
		});
	};

	return {
		testingStore,
		sentNotification,
		fetchNotificationTemplates,
		saveNotificationTemplates,
		importSettings,
		uploadMasterDB,
		importMasterDB,
		uploadMotorIQ,
		importMotorIQ,
		importMotorIQRepeat,
		deleteImportMotorIQRow,
		getImportPlantProgress,
		fetchLogs,
		fetchLog,
		fetchLogErrors,
	};
};
