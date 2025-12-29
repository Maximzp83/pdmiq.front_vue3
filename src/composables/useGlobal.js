import { api_request } from '@/api/request_provider';
import { useGlobalStore } from '@/stores/GlobalStore';

/**
 * Global composable for managing global state and API calls
 * Handles global plants, companies, and analytics
 */
export const useGlobal = () => {
	const globalStore = useGlobalStore();

	/**
	 * Fetch global plants list
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchGlobalPlants = (params = {}) => {
		return api_request.get('/plants', {
			params: params.params || params,
			storeName: 'globalStore',
			stateProp: 'globalPlantsList',
			loadingProp: 'globalPlantsLoading',
			prepareData: 'prepareGlobalPlantsData',
			loading: true,
			setToStore: true,
			notNotify: true,
		});
	};

	/**
	 * Fetch global companies list
	 * @param {Object} params - Query parameters
	 * @returns {Promise}
	 */
	const fetchGlobalCompanies = (params = {}) => {
		return api_request.get('/companies', {
			params: params.params || params,
			storeName: 'globalStore',
			stateProp: 'globalCompaniesList',
			loadingProp: 'globalCompaniesLoading',
			loading: true,
			setToStore: true,
			notNotify: true,
		});
	};

	/**
	 * Save page visit analytics
	 * @param {Object} data - Analytics data
	 * @returns {Promise}
	 */
	const saveVisitAnalytics = (data = {}) => {
		return api_request.post('/analytics/page-visits', {
			data: data.data || data,
			notNotify: true,
		});
	};

	return {
		globalStore,
		fetchGlobalPlants,
		fetchGlobalCompanies,
		saveVisitAnalytics,
	};
};
