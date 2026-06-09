import { ref, shallowRef, shallowReactive, computed, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';
import { ENTITIES } from '@/config/entities';
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
export function useItemsData({
	entityKey,
	apiRoute,
	itemRoute,
	filters,
	options = {},
	itemsName,
	itemStore,
	itemFiltersName,
	formSettings,
}) {

	const route = useRoute();
	const globalStore = useGlobalStore();
	const { set_value: set_global_store } = globalStore;
	const { globalFilters } = storeToRefs(globalStore);
	const { changeRoute } = useNavigation();
	const { tt } = Lang;
	const entityConfig = entityKey ? ENTITIES[entityKey] : null;
	const resolvedApiRoute = apiRoute || entityConfig?.apiBase || null;
	const resolvedItemRoute = itemRoute || entityConfig?.routeBase || null;
	const resolvedItemFiltersName = itemFiltersName || entityConfig?.filtersStorageKey || null;
	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;
	const resolvedItemsName = computed(() => {
		const localItemsName = resolve(itemsName);
		if (localItemsName) {
			return localItemsName;
		}

		if (entityConfig?.itemsName) {
			return Object.freeze({
				one: tt(entityConfig.itemsName.one),
				mult: tt(entityConfig.itemsName.mult),
				instanceName: entityConfig.itemsName.instanceName,
			});
		}

		return Object.freeze({
			one: 'Item',
			mult: 'Items',
		});
	});

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
		fromDashboard,
		editInModal,
		additionalModalSettings,
		localModalSettingsHook,
		formComponentFileLoader,
		debug,
		enableDeepUpdateForList,
		filtersStateProp = 'filters',
		relatedFiltersStoresMap = {},
	} = options;

	// ========== State ==========
	const itemsList = enableDeepUpdateForList ? ref() : shallowRef([]);
	const itemsLoading = ref(false);
	const meta = ref({});
	const itemData = shallowRef(null);
	const preventFetch = ref(false);
	const doNotFetchItems = ref(false);
	const filtersRef = itemStore ? storeToRefs(itemStore)[filtersStateProp] : filters;

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
		pageTitle: resolvedItemsName.value.mult || ''
	});

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
			.get(resolvedApiRoute, payload)
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
		
		// console.log('setFilters', newFiltersValues);
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
			toLocalStorage: { prop: resolvedItemFiltersName },
			...settings
		}

		if (itemStore?.set_value) {
			itemStore.set_value(filtersStateProp, newFilters, settings);
		} else if (filtersRef) {
			filtersRef.value = newFilters;
		}
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

	const setRelatedFilters = (row, settings = []) => {
		settings.forEach((setting) => {
			const [storeKey] = (setting.action || '').split('/');
			const target = relatedFiltersStoresMap[storeKey];
			if (!target?.store) return;

			const stateProp = target.stateProp || 'filters';
			const currentFilters = target.store[stateProp] || {};
			const newFilters = {};
			const params = setting.params || setting.param || [];

			params.forEach((param) => {
				if (typeof param === 'object') {
					newFilters[param.key] = param.val;
				} else {
					newFilters[param] = row?.id;
				}
			});
			if (currentFilters.plantId) newFilters.plantId = null;

			const nextFilters = { ...currentFilters, ...newFilters, page: 1 };
			const actionName = target.actionName || setting.action?.split('/')[1];

			if (actionName && typeof target.store[actionName] === 'function') {
				target.store[actionName](nextFilters);
			} else {
				target.store.set_value?.(stateProp, nextFilters, {
					toLocalStorage: { prop: target.storageKey },
				});
			}
		});
	};

	const handleShowNextInstanceItem = (data = {}) => {
		const { row } = data;
		const action = data.action || data;

		setRelatedFilters(row, action?.setFilters);
		if (action?.path) {
			set_global_store('navbarSettings', {});
			changeRoute({ path: action.path });
		}
	};

	const resolveOpenStrategy = () => ((fromDashboard || editInModal) ? 'modal' : 'route');

	const buildBaseModalSettings = () => ({
		show: true,
		formComponentFileLoader,
		itemName: resolvedItemsName.value.one || '',
		formSettings: formSettings || null,
		settings: {
			apiRoute: resolvedApiRoute,
		},
		debug,
	});

	const buildModalSettings = ({ payload = {}, itemData = null } = {}) => {
		let { modal_settings } = payload || {};
		modal_settings = modal_settings || {};

		let modalSettings = {
			...buildBaseModalSettings(),
			instanceData: itemData,
		};

		if (additionalModalSettings) {
			modalSettings = { ...modalSettings, ...additionalModalSettings };
		}

		modalSettings = { ...modalSettings, ...modal_settings };

		if (localModalSettingsHook) {
			modalSettings = localModalSettingsHook({
				itemData,
				modalSettings,
			});
		}

		return modalSettings;
	};

	const openModal = (modalSettings, payload = {}) => {
		// console.log('modalSettings', modalSettings);
		globalStore.show_edit_modal(modalSettings);
		return Promise.resolve(payload);
	};

	const openCreateRoute = (payload = {}) => {
		if (!resolvedItemRoute) {
			return Promise.resolve(payload);
		}

		changeRoute({ path: `${resolvedItemRoute}/new` });
		return Promise.resolve(payload);
	};

	const openEditRoute = (itemId, payload = {}) => {
		if (!resolvedItemRoute || !itemId) {
			return Promise.resolve(payload);
		}

		changeRoute({ path: `${resolvedItemRoute}/${itemId}` });
		return Promise.resolve(payload);
	};

	// -------------------------------------
	const createItem = (payload = {}) => {
		if (typeof localCreateItem === 'function') {
			return Promise.resolve(localCreateItem(payload));
		}

		if (resolveOpenStrategy() === 'modal') {
			return openModal(buildModalSettings({ payload }), payload);
		}

		return openCreateRoute(payload);
	};

	// -------------------------------------
	const editItem = (payload = {}) => {
		if (typeof localEditItem === 'function') {
			return Promise.resolve(localEditItem(payload));
		}

		const itemData = payload.row || payload.rowData || null;
		const itemId = payload?.row?.id || payload?.rowData?.id || null;
		// console.log('editItem', payload, itemData, itemId, resolveOpenStrategy());
		if (resolveOpenStrategy() === 'modal') {
			return openModal(buildModalSettings({ payload, itemData }), payload);
		}

		return openEditRoute(itemId, payload);
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

		if (!resolvedApiRoute) {
			return Promise.resolve(payload);
		}

		const confirmButtonText = settings.confirmButtonText || tt('Delete');
		// const methodName = settings.methodName || 'deleteItem';
		const prop = ids.length > 1 ? 'mult' : 'one';

		const confirmMessage =
			settings.confirmMessage ||
			`${tt('phrases.this_will_permanently_delete_selected')} ${
				resolvedItemsName.value[prop]
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
			api_request.delete(resolvedApiRoute, {
					data: { ids },
					itemName: resolvedItemsName.value.one,
				}).then(() => fetchItems({ ...(filtersRef?.value || {}) }))
		)
	};

	// ========== Watchers ==========

	let filtersTimer = null;

	const scheduleFetchItems = () => {
		if (filtersTimer) clearTimeout(filtersTimer);

		filtersTimer = setTimeout(() => {
			filtersTimer = null;

			if (doNotFetchItems.value) return;

			fetchItems({
				...globalFilters.value,
				...(filtersRef?.value || {}),
				...getPreventedFilters()
			});
		}, 10);
	};

	// Watch filters
	if (filtersRef && !watchPropsFiltersOnly) {
		watch(filtersRef, () => {
			scheduleFetchItems();
		}, {
			deep: true,
			flush: 'post'
		});
	}

	// Watch globalFilters
	watch(globalFilters, (newGlobalFilters, oldGlobalFilters) => {
		let nextStep = true;
		// console.log('globalFilters', newGlobalFilters, oldGlobalFilters);
		// Check excluded global filters
		if (excludeGlobFilters.length) {
			excludeGlobFilters.forEach(gf => {
				if (newGlobalFilters[gf] !== oldGlobalFilters[gf]) {
					nextStep = false;
				}
			});
		}

		if (!nextStep) return;

		setFilters({ page: 1 });

		scheduleFetchItems();
	}, {
		deep: true,
		flush: 'post'
	});

	// Watch propsFilters if provided
	if (propsFilters) {
		watch(propsFilters, () => {
			scheduleFetchItems();
		}, {
			deep: true,
			flush: 'post'
		});
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
		itemsName: resolvedItemsName,
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
		setRelatedFilters,
		createItem,
		editItem,
		deleteItem,
		handleDeleteItems,
		handleShowNextInstanceItem,
	};
}
