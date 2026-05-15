import { getCurrentInstance, onBeforeUnmount, ref } from 'vue';

import { cleanValuesByList, findItemBy, mergeArrays } from '@/helpers';

export function useAsyncSelect({
	settings,
	fetchParams,
	optionsList,
	optionsLoading,
	currentValue,
	idKey = 'id',
	loadmoreIsActive = true,
	proxyTarget,
	onOptionsListChange,
	onOptionsLoadingChange,
} = {}) {
	const vm = getCurrentInstance();
	const timer = ref(null);
	const query = ref('');
	const currentPage = ref(0);
	const lastPage = ref(1);
	const fetchNextTime = ref(false);
	const isDropdownOpen = ref(false);
	const hasLoadedInitialOptions = ref(Array.isArray(optionsList) && optionsList.length > 0);
	const innerOptionsList = ref([...(optionsList || [])]);
	const innerOptionsLoading = ref(!!optionsLoading);
	const fetchedByIds = ref([]);

	const getStore = () => vm?.appContext?.config?.globalProperties?.$store;
	const resolveSettings = () => settings?.value || settings || {};
	const resolveFetchParams = () => fetchParams?.value || fetchParams || {};
	const resolveCurrentValue = () =>
		currentValue && typeof currentValue === 'object' && 'value' in currentValue
			? currentValue.value
			: currentValue;

	const updateOptionsList = (value) => {
		innerOptionsList.value = Array.isArray(value) ? value : [];
		onOptionsListChange?.(innerOptionsList.value);
	};

	const updateOptionsLoading = (value) => {
		innerOptionsLoading.value = !!value;
		onOptionsLoadingChange?.(innerOptionsLoading.value);
	};

	const syncExternalOptionsList = (value) => {
		innerOptionsList.value = Array.isArray(value) ? [...value] : [];
		if (innerOptionsList.value.length) {
			hasLoadedInitialOptions.value = true;
		}
	};

	const syncExternalOptionsLoading = (value) => {
		innerOptionsLoading.value = !!value;
	};

	const runFetchAction = (fetchAction, payload) => {
		let result;

		if (typeof fetchAction === 'function') {
			result = fetchAction(payload);
		} else {
			const store = getStore();
			if (store && typeof store.dispatch === 'function' && typeof fetchAction === 'string') {
				result = store.dispatch(fetchAction, payload);
			}
		}

		if (!result || typeof result.then !== 'function') {
			return Promise.reject(
				new Error('[useAsyncSelect] fetchAction did not return a Promise'),
			);
		}

		return result;
	};

	const buildListPayload = ({ page = 1, queryValue = '', extraParams = {} } = {}) => {
		const localSettings = resolveSettings();
		const {
			params = {},
			max = 30,
			queryParam = 'q',
			pageParam = 'page',
			maxParam = 'max',
			loading,
		} = localSettings;

		return {
			incudeMeta: true,
			params: {
				...params,
				...resolveFetchParams(),
				...extraParams,
				[maxParam]: extraParams[maxParam] ?? max,
				[pageParam]: extraParams[pageParam] ?? page,
				[queryParam]: queryValue,
			},
			loading,
		};
	};

	const fetchSuccessHandler = ({ response, append = false, setToStore }) => {
		const value = response?.value || [];
		const fetchedMeta = response?.fetchedMeta || {};
		const responseCurrentPage = fetchedMeta.current_page ?? 1;
		const responseLastPage = fetchedMeta.last_page ?? responseCurrentPage;
		const newList = append
			? mergeArrays(innerOptionsList.value, value, { duplicateCheckProp: idKey })
			: value;

		const store = getStore();
		if (setToStore && store && typeof store.dispatch === 'function') {
			store.dispatch(setToStore, newList);
		}

		updateOptionsList(newList);
		if (newList.length || !append) {
			hasLoadedInitialOptions.value = true;
		}
		currentPage.value = responseCurrentPage;
		lastPage.value = responseLastPage;
	};

	const fetchItems = async ({ append = false, page = 1, queryValue = query.value, extraParams = {} } = {}) => {
		try {
			const { fetchAction, setToStore } = resolveSettings();
			updateOptionsLoading(true);

			const payload = buildListPayload({
				page,
				queryValue,
				extraParams,
			});

			const response = await runFetchAction(fetchAction, payload);
			if (!response || typeof response !== 'object') {
				return Promise.reject(
					new Error('[useAsyncSelect] fetchAction resolved without response payload'),
				);
			}

			fetchSuccessHandler({ response, append, setToStore });
			return response;
		} catch (error) {
			console.warn(error);
			return Promise.reject(error);
		} finally {
			updateOptionsLoading(false);
		}
	};

	const getMissingIds = () => {
		const value = resolveCurrentValue();
		if (!value && value !== 0) return [];

		const ids = Array.isArray(value) ? value : [value];
		return ids.filter((id) => {
			if (id === null || id === undefined || id === '') return false;
			if (fetchedByIds.value.includes(id)) return false;
			return !findItemBy(idKey, id, innerOptionsList.value);
		});
	};

	const fetchSelectedItemsById = async () => {
		const missingIds = getMissingIds();
		if (!missingIds.length) return;

		const { fetchByIdAction, fetchById, itemIdParam = 'itemId' } = resolveSettings();
		const fetchConfig = fetchByIdAction || fetchById;
		if (!fetchConfig) return;

		updateOptionsLoading(true);

		try {
			const requests = missingIds.map((id) => {
				if (typeof fetchConfig === 'function') {
					return fetchConfig({ [itemIdParam]: id });
				}

				return runFetchAction(fetchConfig, { [itemIdParam]: id });
			});

			const responses = await Promise.all(requests);
			const fetchedItems = responses.map((response) => response?.value).filter(Boolean);

			if (fetchedItems.length) {
				updateOptionsList(
					mergeArrays(innerOptionsList.value, fetchedItems, {
						duplicateCheckProp: idKey,
					}),
				);
			}

			fetchedByIds.value = mergeArrays(
				fetchedByIds.value.map((id) => ({ id })),
				missingIds.map((id) => ({ id })),
				{ duplicateCheckProp: 'id' },
			).map((item) => item.id);
		} catch (error) {
			console.warn(error);
		} finally {
			updateOptionsLoading(false);
		}
	};

	const selectQuery = (value) => {
		const { minQueryLength = 1, cleanValues, setToStore, maxParam = 'max', max = 30 } =
			resolveSettings();
		query.value = value;
		currentPage.value = 0;
		lastPage.value = 1;

		if (value && value.length >= minQueryLength) {
			if (timer.value) {
				clearTimeout(timer.value);
			}

			timer.value = setTimeout(() => {
				timer.value = null;

				if (cleanValues) cleanValuesByList(cleanValues, proxyTarget || vm?.proxy);
				fetchItems({
					page: 1,
					append: false,
					queryValue: value,
					extraParams: {
						[maxParam]: value.length ? -1 : max,
					},
				});
			}, 700);
		} else if (!setToStore && resolveSettings().resetOptionsOnEmptyQuery) {
			updateOptionsList([]);
		}
	};

	const handleToggleDropdown = async (open, minOptionsToFetch = 2) => {
		isDropdownOpen.value = open;

		if (open) {
			const shouldLoadInitial =
				!hasLoadedInitialOptions.value && innerOptionsList.value.length < minOptionsToFetch;

			if (shouldLoadInitial || fetchNextTime.value) {
				await loadmore({ isEmptyList: true });
			}
			fetchNextTime.value = false;
		} else {
			query.value = '';
		}
	};

	const loadmore = async (settings = {}) => {
		if (innerOptionsLoading.value) return;
		if (!isDropdownOpen.value) return;

		const shouldLoadInitial = !!settings.isEmptyList;
		const hasMore = currentPage.value < lastPage.value;
		if (!shouldLoadInitial && (!loadmoreIsActive || !hasMore)) return;

		await fetchItems({
			append: !shouldLoadInitial,
			page: shouldLoadInitial ? 1 : currentPage.value + 1,
		});
	};

	const handleValueCleared = () => {
		if (query.value) {
			query.value = '';
			fetchNextTime.value = true;
			currentPage.value = 0;
			lastPage.value = 1;
			updateOptionsList([]);
		}
	};

	onBeforeUnmount(() => {
		if (timer.value) {
			clearTimeout(timer.value);
		}
	});

	return {
		innerOptionsList,
		innerOptionsLoading,
		fetchSelectedItemsById,
		selectQuery,
		handleToggleDropdown,
		loadmore,
		handleValueCleared,
		syncExternalOptionsList,
		syncExternalOptionsLoading,
		updateOptionsList,
	};
}
