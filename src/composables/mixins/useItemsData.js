import { ref, watch, onMounted, onBeforeMount, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { api_request } from '@/api/request_provider.js';
import { prepareRangeParams } from '@/helpers';
import { useGlobalStore } from '@/stores/GlobalStore';

/**
 * Composable for managing items data with API calls
 * Similar to Vue2 mixin but adapted for Vue3 Composition API
 *
 * @param {Object} config - Configuration object
 * @param {string} config.apiRoute - API endpoint route
 * @param {Object} config.filters - Reactive filters ref
 * @param {Object} config.options - Additional options
 * @param {boolean} config.options.manual - Don't fetch on mount
 * @param {boolean} config.options.stopFetch - Don't fetch on beforeMount
 * @param {boolean} config.options.watchPropsFiltersOnly - Only watch propsFilters
 * @param {Array} config.options.excludeGetParams - Params to exclude from query
 * @param {Array} config.options.acceptedFilters - Only these filters will be sent
 * @param {Object} config.options.predefinedFilters - Filters to always include
 * @param {Object} config.options.propsFilters - Filters from props (reactive ref)
 * @param {Function} config.options.localPrepareFilters - Custom filter preparation function
 * @param {Object} config.options.fetchItemsPayload - Additional payload for fetch
 * @param {boolean} config.options.showToggleListButton - Check isShowList before fetch
 * @param {Array} config.options.excludeGlobFilters - Global filters to exclude from watch
 * @returns {Object} Items data and methods
 */
export function useItemsData({ apiRoute, filters: filtersRef, options = {} }) {
	const route = useRoute();
	const router = useRouter();
	const globalStore = useGlobalStore();
	const { globalFilters } = storeToRefs(globalStore);

	// ========== State ==========
	const itemsList = ref([]);
	const itemsLoading = ref(false);
	const meta = ref({});
	const itemData = ref(null);
	const preventFetch = ref(false);

	const {
		manual = false,
		stopFetch = false,
		watchPropsFiltersOnly = false,
		excludeGetParams,
		acceptedFilters,
		predefinedFilters = {},
		propsFilters,
		localPrepareFilters,
		fetchItemsPayload = {},
		showToggleListButton = false,
		excludeGlobFilters = [],
		requestOptions = {},
	} = options;

	// ========== Computed-like ==========
	const getRouteMeta = () => route.meta;
	const getRouteQuery = () => {
		const { query } = route;
		return Object.keys(query).length ? query : null;
	};

	const getPreventedFilters = () => {
		let filters = {};
		const routeMeta = getRouteMeta();
		if (routeMeta?.preventFilterBy) {
			routeMeta.preventFilterBy.forEach(f => (filters[f] = null));
		}
		return filters;
	};

	// ========== Methods ==========

	/**
	 * Prepare filters for API request
	 * @param {Object} filters - Raw filters
	 * @returns {Object} Prepared filters
	 */
	const prepareFilters = (filters) => {
		let newFilters = {};

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
		const propsFiltersValue = propsFilters?.value || propsFilters;
		if (propsFiltersValue && Object.keys(propsFiltersValue).length > 0) {
			newFilters = { ...newFilters, ...propsFiltersValue };
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
	 * @param {Object} additionalOptions - Additional request options
	 * @returns {Promise} API response
	 */
	const fetchItems = async (filters = {}, additionalOptions = {}) => {
		// Check showToggleListButton condition
		if (showToggleListButton && filtersRef?.value && !filtersRef.value.isShowList) {
			return Promise.resolve([]);
		}

		itemsLoading.value = true;
		const preparedFilters = prepareFilters(filters);

		let payload = {
			params: preparedFilters,
			...fetchItemsPayload,
			...requestOptions,
			...additionalOptions,
		};

		try {
			return new Promise((resolve, reject) => {
				api_request.get(apiRoute, payload)
					.then(({ value, fetchedMeta }) => {
						itemsList.value = value;
						if (fetchedMeta) meta.value = fetchedMeta;
						itemsLoading.value = false;
						resolve({ value, meta: fetchedMeta });
					})
					.catch((error) => {
						itemsLoading.value = false;
						reject(error);
					});
			});
		} catch (error) {
			itemsLoading.value = false;
			console.error(`[useItemsData] fetch error:`, error);
			throw error;
		}
	};

	/**
	 * Refetch items list with current filters
	 */
	const refetchItemsList = () => {
		const filters = filtersRef?.value || {};
		fetchItems({
			...globalFilters.value,
			...filters,
			...getPreventedFilters()
		});
	};

	/**
	 * Set filters with optional page reset
	 * @param {Object} newFiltersValues - New filter values
	 * @param {Object} settings - Settings
	 * @param {boolean} settings.preventResetPage - Don't reset page to 1
	 */
	const setFilters = (newFiltersValues, settings = {}) => {
		if (!filtersRef) return;

		let newFilters = { ...filtersRef.value, ...newFiltersValues };

		if (!settings.preventResetPage) {
			newFilters.page = 1;
		}

		filtersRef.value = newFilters;
	};

	/**
	 * Set preventFetch flag and update filters
	 * Useful when you need to update filters without triggering fetch
	 * @param {Object} newFiltersValues - New filter values
	 * @param {Object} settings - Settings
	 */
	const setFiltersWithoutFetch = (newFiltersValues, settings = {}) => {
		preventFetch.value = true;
		setFilters(newFiltersValues, settings);
	};

	// ========== Watchers ==========

	// Watch filters
	if (filtersRef && !watchPropsFiltersOnly) {
		watch(filtersRef, (filters) => {
			if (preventFetch.value) {
				preventFetch.value = false;
			} else {
				fetchItems({
					...globalFilters.value,
					...filters,
					...getPreventedFilters()
				});
			}
		}, { deep: true });
	}

	// Watch globalFilters
	watch(globalFilters, (newGlobalFilters, oldGlobalFilters) => {
		let nextStep = true;

		// Check excluded global filters
		if (excludeGlobFilters.length) {
			excludeGlobFilters.forEach(gf => {
				if (newGlobalFilters[gf] !== oldGlobalFilters[gf]) {
					nextStep = false;
				}
			});
		}

		if (!nextStep) return;

		preventFetch.value = true;
		setFilters({ page: 1 });

		const filters = filtersRef?.value || {};
		fetchItems({
			...filters,
			...newGlobalFilters,
			...getPreventedFilters()
		});
	}, { deep: true });

	// Watch propsFilters if provided
	if (propsFilters) {
		watch(propsFilters, () => {
			if (preventFetch.value) {
				preventFetch.value = false;
			} else {
				refetchItemsList();
			}
		}, { deep: true });
	}

	// ========== Lifecycle ==========
	onBeforeMount(() => {
		const routeMeta = getRouteMeta();
		const routeQuery = getRouteQuery();

		// Handle route meta filters
		if (routeMeta?.filtersSettings) {
			preventFetch.value = true;
			setFilters(routeMeta.filtersSettings);
		}

		// Handle route query
		if (routeQuery) {
			preventFetch.value = true;
			setFilters(routeQuery);
		}

		// Initial fetch
		if (!stopFetch && !manual) {
			if (watchPropsFiltersOnly) {
				const propsFiltersValue = propsFilters?.value || propsFilters || {};
				fetchItems({ ...propsFiltersValue });
			} else {
				const filters = filtersRef?.value || {};
				fetchItems({
					...filters,
					...globalFilters.value,
					...getPreventedFilters()
				});
			}
		}
	});

	return {
		// State
		itemsList,
		itemsLoading,
		meta,
		itemData,
		preventFetch,

		// Methods
		fetchItems,
		fetchItemsList: fetchItems, // alias
		refetchItemsList,
		prepareFilters,
		setFilters,
		setFiltersWithoutFetch,
	};
}
