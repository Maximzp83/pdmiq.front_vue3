import { ref, onMounted } from 'vue';
import { api_request } from '@/api/request_provider.js';
import { prepareRangeParams } from '@/helpers';

/**
 * Composable for managing items data with API calls
 * Similar to Vue2 mixin but adapted for Vue3 Composition API
 *
 * @param {Object} config - Configuration object
 * @param {string} config.apiRoute - API endpoint route
 * @param {Object} config.filters - Initial filters
 * @param {Object} config.options - Additional options
 * @param {boolean} config.options.manual - Don't fetch on mount
 * @param {Array} config.options.excludeGetParams - Params to exclude from query
 * @param {Array} config.options.acceptedFilters - Only these filters will be sent
 * @param {Object} config.options.predefinedFilters - Filters to always include
 * @param {Object} config.options.propsFilters - Filters from props
 * @param {Function} config.options.localPrepareFilters - Custom filter preparation function
 * @param {Object} config.options.store - Pinia store instance (for api_request)
 * @param {boolean} config.options. - Use api_request instead of direct API call
 * @returns {Object} Items data and methods
 */
export function useItemsData({ apiRoute, filters = {}, options = {} }) {
	const itemsList = ref([]);
	const itemsLoading = ref(false);
	const meta = ref({});
	const itemData = ref(null);

	const {
		manual = false,
		excludeGetParams,
		acceptedFilters,
		predefinedFilters = {},
		propsFilters = {},
		localPrepareFilters,
		requestOptions = {},
	} = options;

	/**
	 * Prepare filters for API request
	 * @param {Object} filters - Raw filters
	 * @returns {Object} Prepared filters
	 */
	const prepareFilters = (filters) => {
		let newFilters = {};
		// console.log('filters', filters);
		// Filter by excludeGetParams
		if (excludeGetParams && Array.isArray(excludeGetParams)) {
			for (let key in filters) {
				if (!excludeGetParams.some((p) => p == key)) {
					newFilters[key] = filters[key];
				}
			}
		}
		// Filter by acceptedFilters
		else if (acceptedFilters && Array.isArray(acceptedFilters)) {
			for (let key in filters) {
				if (acceptedFilters.indexOf(key) !== -1) {
					newFilters[key] = filters[key];
				}
			}
		}
		// Include all filters
		else {
			newFilters = { ...filters };
		}

		// Add predefined filters
		if (predefinedFilters && Object.keys(predefinedFilters).length > 0) {
			newFilters = { ...newFilters, ...predefinedFilters };
		}

		// Add props filters
		if (propsFilters && Object.keys(propsFilters).length > 0) {
			newFilters = { ...newFilters, ...propsFilters };
		}

		// Apply custom filter preparation
		if (localPrepareFilters && typeof localPrepareFilters === 'function') {
			newFilters = localPrepareFilters(newFilters);
		}

		// Handle date range
		if (newFilters.daterange && newFilters.daterange.length) {
			newFilters = {
				...newFilters,
				...prepareRangeParams(newFilters.daterange),
			};
			delete newFilters.daterange;
		}

		// Remove internal filter properties
		delete newFilters.items_active_grid_type;
		delete newFilters.isShowList;
		delete newFilters.isShowListRefreshed;
		delete newFilters.isShowListRefreshed2;
		delete newFilters.daterange_setted_at;

		return newFilters;
	};

	/**
	 * Fetch items list from API
	 * @param {Object} filters - Filters to apply
	 * @param {Object} requestOptions - Additional request options
	 * @returns {Promise} API response
	 */
	const fetchItemsList = async (filters = {}, requestOptions = {}) => {
		const preparedFilters = prepareFilters(filters);

		// Use api_request if store is provided
		try {
			const payload = {
				method: 'GET',
				params: preparedFilters,
				...requestOptions,
			};
			// console.log('payload', payload);
			return new Promise((resolve, reject) => {
				api_request(apiRoute, payload)
					.then(({ value }) => {
						// console.log('response', response);
						itemsList.value = value;
						resolve(itemsList.value);
					})
					.catch((error) => {
						reject(error);
					});
			});
		} catch (error) {
			console.error(`[useItemsData] fetch error:`, error);
			throw error;
		}
	};

	// Fetch on mount if not manual
	onMounted(() => {
		if (!manual) {
			fetchItemsList(filters, requestOptions);
		}
	});

	return {
		itemsList,
		itemsLoading,
		meta,
		itemData,
		fetchItemsList,
		prepareFilters,
	};
}
