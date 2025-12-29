import { api_request } from '@/api/request_provider';
import { useDashboardStore } from '@/stores/DashboardStore';

/**
 * Dashboard composable for managing dashboard data and API calls
 * Handles dashboard counters and PDM statistics
 *
 * Migrated from: vue2_project/src/store/modules/dashboard.js
 */
export const useDashboard = () => {
	const dashboardStore = useDashboardStore();

	/**
	 * Fetch dashboard counters
	 * Uses prepareCountersData to format counter totals into structured items
	 *
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchCounters = (params = {}) => {
		return api_request.get('/dashboard/counters', {
			params: params.params || params,
			storeName: 'dashboardStore',
			stateProp: 'dashboardCounters',
			loadingProp: 'countersLoading',
			dataPath: 'data',
			prepareData: 'prepareCountersData',
			loading: true,
			setToStore: true,
			notNotify: true,
		});
	};

	/**
	 * Fetch dashboard PDM statistics
	 *
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchDashboardPdmStatistics = (params = {}) => {
		return api_request.get('/dashboard/pdm', {
			params: params.params || params,
			dataPath: 'data',
			notNotify: true,
		});
	};

	return {
		dashboardStore,
		fetchCounters,
		fetchDashboardPdmStatistics,
	};
};
