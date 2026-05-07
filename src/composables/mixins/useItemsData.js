import { ref, shallowRef, shallowReactive, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';
import { api_request } from '@/api/request_provider.js';
import { prepareRangeParams } from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useNavigation } from '@/composables/mixins/useNavigation';

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
export function useItemsData({ apiRoute, itemRoute, filters, options = {}, itemsName, itemStore, itemFiltersName, formSettings }) { 

	const route = useRoute();
	const globalStore = useGlobalStore();
	const { set_value: set_global_store } = globalStore;
	const { globalFilters } = storeToRefs(globalStore);
	const { changeRoute } = useNavigation();
	const { tt } = Lang;

	// ========== Options ==========

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
		tableRef,
		localCreateItem,
		localEditItem,
		localDeleteItem,
		localDeleteItems,
		preventSetNavbar,
		preventSetupNavbar,
		preventDestroyNavbar,
		fromDashboard,
		editInModal,
		additionalModalSettings,
		localModalSettingsHook,
		formComponentFileLoader,
		debug,
		enableDeepUpdateForList,
	} = options;

	// ========== State ==========
	const itemsList = enableDeepUpdateForList ? ref() : shallowRef([]);
	const itemsLoading = ref(false);
	const meta = ref({});
	const itemData = shallowRef(null);
	const preventFetch = ref(false);
	const filtersRef = itemStore ? storeToRefs(itemStore).filters : filters;

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

	const navbarSettings = shallowReactive({
		showFilter: true,
		pageTitle: itemsName && itemsName.value ? itemsName.value.mult : ''
	});

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

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
	const fetchItems = (filters = {}, additionalOptions = {}) => {
		// Check showToggleListButton condition
		if (showToggleListButton && filtersRef?.value && !filtersRef.value.isShowList) {
			return Promise.resolve([]);
		}

		itemsLoading.value = true;
		const preparedFilters = prepareFilters(filters);

		let payload = {
			params: preparedFilters,
			incudeMeta: true,
			notNotify: true,
			...fetchItemsPayload,
			...requestOptions,
			...additionalOptions,
		};

		return api_request
			.get(apiRoute, payload)
			.then(({ value, fetchedMeta }) => {
				itemsList.value = value;
				if (fetchedMeta) meta.value = fetchedMeta;
				return { value, meta: fetchedMeta };
			})
			.catch((error) => {
				console.error(`[useItemsData] fetch error:`, error);
				return Promise.reject(error);
			})
			.finally(() => {
				itemsLoading.value = false;
			});
	};

	/**
	 * Refetch items list with current filters
	 */
	const refetchItemsList = () => {
		const filters = filtersRef?.value || {};
		return fetchItems({
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

		for (let item in newFiltersValues) {
			// console.log( item, filters[item], typeof item, filters[item] instanceof Array )
			if (newFiltersValues[item] instanceof Array) {
				//
			} else {
				if (typeof newFiltersValues[item] != 'boolean') {
					const new_value = newFiltersValues[item] ? +newFiltersValues[item] : newFiltersValues[item];
					// console.log(new_value, newFiltersValues[item])
					newFiltersValues[item] =
						!!new_value && !Number.isNaN(new_value) ? new_value : newFiltersValues[item];
				}
			}
		}

		let newFilters = { ...filtersRef.value, ...newFiltersValues };

		if (!settings.preventResetPage) {
			newFilters.page = 1;
		}

		settings = {
			toLocalStorage: { prop: itemFiltersName },
			...settings
		}

		itemStore.set_value('filters', newFilters, settings);


		// filtersRef.value = newFilters;
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
	// -------------------------------------
	const createItem = (payload = {}) => {
		if (typeof localCreateItem === 'function') {
			return Promise.resolve(localCreateItem(payload));
		}

		if (fromDashboard || editInModal) {
			let { modal_settings } = payload || {};
			modal_settings = modal_settings || {};
			
			let modalSettings = {
				show: true,
				formComponentFileLoader,
				itemName: resolve(itemsName)?.one || '',
				// settings: this.settings || null,
				formSettings: formSettings || null,
				settings: {
					apiRoute,					
				},
				debug
			};
			// console.log(itemsName.value.one, modalSettings)

			if (additionalModalSettings) {
				modalSettings = { ...modalSettings, ...additionalModalSettings };
			}

			/*if (this.localModalSettings) {
				modalSettings = { ...modalSettings, ...this.localModalSettings };
			}*/
			modalSettings = { ...modalSettings, ...modal_settings };

			if (localModalSettingsHook) {
				modalSettings = localModalSettingsHook({
					itemData: null,
					modalSettings: modalSettings
				});
			}

			console.log('modalSettings', modalSettings);
			globalStore.show_edit_modal(modalSettings);
			return Promise.resolve(payload);
		}

		if (!itemRoute) {
			return Promise.resolve(payload);
		}

		changeRoute({ path: `${itemRoute}/new` });
		return Promise.resolve(payload);
	};

	// -------------------------------------
	const editItem = (payload = {}) => {
		if (typeof localEditItem === 'function') {
			return Promise.resolve(localEditItem(payload));
		}

		if (!itemRoute || !payload?.row?.id) {
			return Promise.resolve(payload);
		}

		changeRoute({ path: `${itemRoute}/${payload.row.id}` });
		return Promise.resolve(payload);
	};

	// -------------------------------------
	const handleDeleteItems = (payload = {}, settings = {}) => {
		if (typeof localDeleteItems === 'function') {
			return Promise.resolve(localDeleteItems(payload));
		}

		let ids = [];
		if (payload?.row?.id) {
			ids = [payload.row.id];
		} else {
			ids = [...(resolve(tableRef)?.selectedIds || [])];
		}

		return deleteItem({ ...payload, ids }, settings);
	};

	const deleteItem = (payload = {}, settings = {}) => {
		payload = settings.payload || payload;
		if (typeof localDeleteItem === 'function') {
			return Promise.resolve(localDeleteItem(payload));
		}

		const ids = payload?.ids || [];
		if (!ids.length) {
			return Promise.resolve(payload);
		}

		if (!apiRoute) {
			return Promise.resolve(payload);
		}

		const confirmButtonText = settings.confirmButtonText || tt('Delete');
		// const methodName = settings.methodName || 'deleteItem';
		const prop = ids.length > 1 ? 'mult' : 'one';

		const confirmMessage =
			settings.confirmMessage ||
			`${tt('phrases.this_will_permanently_delete_selected')} ${
				resolve(itemsName)[prop]
			}. ${tt('Continue')}?`;

		return ElMessageBox.confirm(
			confirmMessage,
			// tt('Delete') || 'Delete',
			{
				confirmButtonText,
				cancelButtonText: tt('CANCEL') || 'Cancel',
				type: 'warning',
			},
		).then(() =>
			api_request.delete(apiRoute, {
					data: { ids },
					itemName: resolve(itemsName)?.one,
				}).then(() => fetchItems({ ...(filtersRef?.value || {}) }))
		)
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

		if (navbarSettings) {
			set_global_store('navbarSettings', navbarSettings);
		}
		// console.log('useItemsData beforeMount', itemsName.value)
	});

	/*onMounted(() => {
		console.log('useItemsData mounted', tableRef.value.selectedIds)
	});*/

	onBeforeUnmount(() => {
		const { preventDestroyNavbar, preventSetNavbar } = options;
		if (!preventDestroyNavbar && !preventSetNavbar) {
			set_global_store('navbarSettings', {});
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
		createItem,
		editItem,
		deleteItem,
		handleDeleteItems,
	};
}
