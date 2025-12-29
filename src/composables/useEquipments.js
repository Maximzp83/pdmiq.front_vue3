import { api_request } from '@/api/request_provider';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';

/**
 * Equipments composable for managing equipment items, faults, and configurations
 * Handles CRUD operations, vibration analysis, metrics, and equipment management
 *
 * Migrated from: vue2_project/src/store/modules/equipments.js
 */
export const useEquipments = () => {
	const equipmentsStore = useEquipmentsStore();

	// ==================== Equipment Faults ====================

	/**
	 * Fetch equipment faults list
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchEquipmentsFaults = (params = {}) => {
		return api_request.get('/equipments/faults', {
			params: params.params || params,
			storeName: 'equipmentsStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			loading: true,
			setToStore: true,
		});
	};

	/**
	 * Fetch single equipment fault by ID
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const fetchEquipmentsFault = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.get(`/equipments/faults/${itemId}`, {
			...rest,
			storeName: 'equipmentsStore',
			stateProp: 'itemData',
			setToStore: true,
			notNotify: true,
		});
	};

	/**
	 * Save equipment fault (create or update)
	 * @param {Object} payload - Payload with data and optional itemId
	 * @returns {Promise}
	 */
	const saveEquipmentsFault = (payload) => {
		const { itemId, data, ...rest } = payload;
		const method = itemId ? 'PUT' : 'POST';
		const url = itemId ? `/equipments/faults/${itemId}` : '/equipments/faults';

		return api_request(url, {
			...rest,
			method,
			data,
			loadingProp: 'isSaving',
			loading: true,
		});
	};

	/**
	 * Delete equipment fault
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const deleteEquipmentsFaults = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.delete(`/equipments/faults/${itemId}`, {
			...rest,
			loadingProp: 'isSaving',
			loading: true,
		});
	};

	// ==================== Equipments ====================

	/**
	 * Fetch equipments list
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchEquipments = (params = {}) => {
		return api_request.get('/equipments', {
			params: params.params || params,
			storeName: 'equipmentsStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			prepareData: 'prepareEquipmentsList',
			loading: true,
			setToStore: true,
		});
	};

	/**
	 * Fetch equipments dashboard data
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchEquipmentsDashboard = (params = {}) => {
		return api_request.get('/equipments/dashboard', {
			params: params.params || params,
			storeName: 'equipmentsStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			prepareData: 'prepareEquipmentsList',
			loading: true,
			setToStore: true,
		});
	};

	/**
	 * Fetch single equipment by ID
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const fetchEquipment = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.get(`/equipments/${itemId}`, {
			...rest,
			storeName: 'equipmentsStore',
			stateProp: 'itemData',
			prepareData: 'prepareEquipmentsList',
			prepareDataSettings: {
				addSettingItems: [{ key: 'equipmentSubType', val_key: 'equipmentSubType' }],
			},
			setToStore: true,
			notNotify: true,
		});
	};

	/**
	 * Save equipment (create or update)
	 * @param {Object} payload - Payload with data and optional itemId
	 * @returns {Promise}
	 */
	const saveEquipment = (payload) => {
		const { itemId, data, ...rest } = payload;
		const method = itemId ? 'PUT' : 'POST';
		const url = itemId ? `/equipments/${itemId}` : '/equipments';

		return api_request(url, {
			...rest,
			method,
			data,
			loadingProp: 'isSaving',
			loading: true,
		});
	};

	/**
	 * Delete equipment
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const deleteEquipment = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.delete(`/equipments/${itemId}`, {
			...rest,
			loadingProp: 'isSaving',
			loading: true,
		});
	};

	// ==================== Equipment Operations ====================

	/**
	 * Fetch equipment analogues
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const fetchAnalogues = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request.get(`/equipments/${itemId}/analogues`, {
			...rest,
			dataPath: 'data',
			notNotify: true,
		});
	};

	/**
	 * Fetch RPM options
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchRpmOptions = (params = {}) => {
		return api_request.get('/equipments/rpm-options', {
			params: params.params || params,
			notNotify: true,
		});
	};

	/**
	 * Set equipment RPM parameters
	 * @param {Object} payload - Payload with itemId and data
	 * @returns {Promise}
	 */
	const setEquipmentRpmParams = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request.put(`/equipments/${itemId}/rpm-params`, {
			...rest,
			data,
		});
	};

	/**
	 * Process equipment repairs
	 * @param {Object} payload - Payload with itemId and repair data
	 * @returns {Promise}
	 */
	const equipmentRepairsProcess = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request(`/equipments/${itemId}/repairs`, {
			...rest,
			method: payload.method || 'POST',
			data,
		});
	};

	/**
	 * Reorder equipment
	 * @param {Object} payload - Reorder data
	 * @returns {Promise}
	 */
	const reorderEquipment = (payload) => {
		return api_request.post('/equipments/reorder', {
			...payload,
			data: payload.data,
			notNotify: true,
		});
	};

	/**
	 * Reorder sensors for equipment
	 * @param {Object} payload - Payload with itemId and sensor positions
	 * @returns {Promise}
	 */
	const reorderSensors = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request.put(`/equipments/${itemId}/sensors/positions`, {
			...rest,
			data,
			notNotify: true,
		});
	};

	/**
	 * Move equipment to different location
	 * @param {Object} payload - Payload with itemId and move data
	 * @returns {Promise}
	 */
	const moveEquipment = (payload) => {
		const { itemId, data, ...rest } = payload;
		return api_request.post(`/equipments/move/${itemId}`, {
			...rest,
			data,
		});
	};

	/**
	 * Add/remove equipment from favorites
	 * @param {Object} payload - Payload with itemId
	 * @returns {Promise}
	 */
	const addToFavoritesEquipment = (payload) => {
		const { itemId, ...rest } = payload;
		return api_request(`/equipments/${itemId}/favorite`, {
			...rest,
			method: payload.method || 'POST',
			dataPath: 'data',
		});
	};

	/**
	 * Fetch health statistics
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchHealthStatistics = (params = {}) => {
		return api_request.get('/equipments/health', {
			params: params.params || params,
			notNotify: true,
		});
	};

	/**
	 * Ping socket endpoint (for real-time updates)
	 * @param {Object} payload - Payload with url
	 * @returns {Promise}
	 */
	const pingSocketEndpoint = (payload) => {
		return api_request.post(payload.url, {
			...payload,
			data: payload.data,
			notNotify: true,
		});
	};

	// ==================== Vibration Analysis Rules ====================

	/**
	 * Fetch vibration analysis rules
	 * @param {Object} payload - Payload with equipmentTypeId
	 * @returns {Promise}
	 */
	const fetchVibrationAnalysisRules = (payload) => {
		const { equipmentTypeId, params, ...rest } = payload;
		return api_request.get(
			`/equipments/types/${equipmentTypeId}/vibration-analysis-rules`,
			{
				...rest,
				params,
				notNotify: true,
			},
		);
	};

	/**
	 * Update vibration analysis rules
	 * @param {Object} payload - Payload with equipmentTypeId and rules data
	 * @returns {Promise}
	 */
	const updateVibrationAnalysisRules = (payload) => {
		const { equipmentTypeId, data, ...rest } = payload;
		return api_request.post(
			`/equipments/types/${equipmentTypeId}/vibration-analysis-rules`,
			{
				...rest,
				data,
				resultMessage: 'Vibration Analysis Rules Saved',
			},
		);
	};

	/**
	 * Fetch vibration analysis rule crossover options
	 * @param {Object} payload - Payload with equipmentTypeId and ruleId
	 * @returns {Promise}
	 */
	const fetchVibrationAnalysisRuleCrossoverOptions = (payload) => {
		const { equipmentTypeId, ruleId, params, ...rest } = payload;
		return api_request.get(
			`/equipments/types/${equipmentTypeId}/vibration-analysis-rules/${ruleId}/crossover-options-values`,
			{
				...rest,
				params,
				notNotify: true,
			},
		);
	};

	// ==================== Metric Multi-Views ====================

	/**
	 * Fetch metric multi-views for equipment
	 * @param {Object} payload - Payload with equipmentId
	 * @returns {Promise}
	 */
	const fetchMetricMultiViews = (payload) => {
		const { equipmentId, params, ...rest } = payload;
		return api_request.get(`/equipments/${equipmentId}/metric-multi-views`, {
			...rest,
			params,
			notNotify: true,
		});
	};

	/**
	 * Save metric multi-view
	 * @param {Object} payload - Payload with equipmentId and view data
	 * @returns {Promise}
	 */
	const saveMetricMultiViews = (payload) => {
		const { equipmentId, data, ...rest } = payload;
		return api_request.post(`/equipments/${equipmentId}/metric-multi-views`, {
			...rest,
			data,
			resultMessage: 'multi-view saved',
		});
	};

	/**
	 * Save metric multi-view thresholds
	 * @param {Object} payload - Payload with multiViewId, graphId, and threshold data
	 * @returns {Promise}
	 */
	const saveMetricMultiViewsThresholds = (payload) => {
		const { multiViewId, graphId, data, ...rest } = payload;
		return api_request.post(
			`/metric-multi-views/${multiViewId}/graphs/${graphId}/thresholds`,
			{
				...rest,
				data,
				resultMessage: 'thresholds updated',
			},
		);
	};

	return {
		equipmentsStore,
		// Faults
		fetchEquipmentsFaults,
		fetchEquipmentsFault,
		saveEquipmentsFault,
		deleteEquipmentsFaults,
		// Equipments CRUD
		fetchEquipments,
		fetchEquipmentsDashboard,
		fetchEquipment,
		saveEquipment,
		deleteEquipment,
		// Operations
		fetchAnalogues,
		fetchRpmOptions,
		setEquipmentRpmParams,
		equipmentRepairsProcess,
		reorderEquipment,
		reorderSensors,
		moveEquipment,
		addToFavoritesEquipment,
		fetchHealthStatistics,
		pingSocketEndpoint,
		// Vibration Analysis
		fetchVibrationAnalysisRules,
		updateVibrationAnalysisRules,
		fetchVibrationAnalysisRuleCrossoverOptions,
		// Metric Multi-Views
		fetchMetricMultiViews,
		saveMetricMultiViews,
		saveMetricMultiViewsThresholds,
	};
};
