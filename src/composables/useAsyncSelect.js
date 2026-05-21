import { getCurrentInstance, onBeforeUnmount, ref } from 'vue';

import { executeRequestAction } from '@/composables/executeRequestAction';
import { mergedBindParams, setupRequestBinding } from '@/composables/useRequestBinding';
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
	onValueChange,
	onOptionsListChange,
	onOptionsLoadingChange,
} = {}) {
	const vm = getCurrentInstance();
	const timer = ref(null);
	const query = ref('');
	const currentPage = ref(0);
	const lastPage = ref(1);
	const bindingInitialSetup = ref(true);
	const fetchNextTime = ref(false);
	const isDropdownOpen = ref(false);
	const dropdownOpenIntent = ref(false);
	const hasLoadedInitialOptions = ref(Array.isArray(optionsList) && optionsList.length > 0);
	const innerOptionsList = ref([...(optionsList || [])]);
	const innerOptionsLoading = ref(!!optionsLoading);
	const fetchedByIds = ref([]);
	const boundParams = ref({});
	const boundPayload = ref({});

	const resolveSettings = () => settings?.value || settings || {};
	const resolveFetchParams = () => fetchParams?.value || fetchParams || {};
	const resolveCurrentValue = () =>
		currentValue && typeof currentValue === 'object' && 'value' in currentValue
			? currentValue.value
			: currentValue;

	const updateCurrentValue = (value) => {
		onValueChange?.(value);
	};

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

	const runFetchAction = (fetchAction, payload) =>
		executeRequestAction(fetchAction, payload, '[useAsyncSelect]');

	const buildListPayload = ({ page = 1, queryValue = '', extraParams = {}, extraPayload = {} } = {}) => {
		const localSettings = resolveSettings();
		const {
			params = {},
			max = 30,
			queryParam = 'q',
			pageParam = 'page',
			maxParam = 'max',
			loading,
			setToStore,
			bindTo
		} = localSettings;

		const paramsFromBindTo = {};
		if (bindTo) {
			bindTo.forEach((item) => {
				paramsFromBindTo[item.param] = item.getValue();
			});
		}

		return {
			incudeMeta: true,
			...(setToStore ? { setToStore } : {}),
			...extraPayload,
			params: {
				...params,
				...paramsFromBindTo,
				...resolveFetchParams(),
				...boundParams.value,
				...(extraPayload.params || {}),
				...extraParams,
				[maxParam]: extraParams[maxParam] ?? max,
				[pageParam]: extraParams[pageParam] ?? page,
				[queryParam]: queryValue,
			},
			loading,
		};
	};

	const fetchSuccessHandler = ({ response, append = false }) => {
		const value = response?.value || [];
		const fetchedMeta = response?.fetchedMeta || {};
		const responseCurrentPage = fetchedMeta.current_page ?? 1;
		const responseLastPage = fetchedMeta.last_page ?? responseCurrentPage;
		const newList = append
			? mergeArrays(innerOptionsList.value, value, { duplicateCheckProp: idKey })
			: value;

		updateOptionsList(newList);
		if (newList.length || !append) {
			hasLoadedInitialOptions.value = true;
		}
		// console.log('fetchSuccessHandler', responseCurrentPage, responseLastPage);
		currentPage.value = responseCurrentPage;
		lastPage.value = responseLastPage;
	};

	const fetchItems = ({
		append = false,
		page = 1,
		queryValue = query.value,
		extraParams = {},
		extraPayload = {},
	} = {}) => {
		const { fetchAction } = resolveSettings();
		updateOptionsLoading(true);

		const payload = buildListPayload({
			page,
			queryValue,
			extraParams,
			extraPayload,
		});
		// console.log('fetchItems', )
		return runFetchAction(fetchAction, payload)
			.then((response) => {
				if (!response || typeof response !== 'object') {
					return Promise.reject(
						new Error('[useAsyncSelect] fetchAction resolved without response payload'),
					);
				}

				fetchSuccessHandler({ response, append });
				return response;
			})
			.catch((error) => {
				console.warn(error);
				return Promise.reject(error);
			})
			.finally(() => {
				updateOptionsLoading(false);
			});
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

	const fetchSelectedItemsById = () => {
		const missingIds = getMissingIds();
		if (!missingIds.length) return Promise.resolve([]);

		const { fetchByIdAction, fetchById, itemIdParam = 'itemId' } = resolveSettings();
		const fetchConfig = fetchByIdAction || fetchById;
		if (!fetchConfig) return Promise.resolve([]);

		updateOptionsLoading(true);

		const requests = missingIds.map((id) =>
			runFetchAction(fetchConfig, { [itemIdParam]: id }),
		);

		return Promise.all(requests)
			.then((responses) => {
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

				return responses;
			})
			.catch((error) => {
				console.warn(error);
				return Promise.reject(error);
			})
			.finally(() => {
				updateOptionsLoading(false);
			});
	};

	const selectQuery = (value) => {
		const { minQueryLength = 1, cleanValues, setToStore, maxParam = 'max', max = 30 } =
			resolveSettings();

		if (!value && (isDropdownOpen.value || dropdownOpenIntent.value) && !query.value) {
			return;
		}

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
					extraPayload: boundPayload.value,
				});
			}, 700);
		} else if (!setToStore && resolveSettings().resetOptionsOnEmptyQuery) {
			updateOptionsList([]);
		}
	};

	const handleBoundFetch = (value, option) => {
		const {
			withoutClean,
			param,
			mergeWith,
			mainParam,
			disableFetch,
			payload = {},
		} = option;
		// console.log('handleBoundFetch', value, option);
		if (!withoutClean) {
			updateOptionsList([]);
			updateCurrentValue(null);
			// currentPage.value = null;
		}
		currentPage.value = 0;
		lastPage.value = 1;
		hasLoadedInitialOptions.value = false;

		if (disableFetch) return;

		const newPayload = {
			...payload,
			params: {
				...payload.params,
				...mergedBindParams(mergeWith),
			},
		};

		if (param) newPayload.params[param] = value;
		boundParams.value = { ...(newPayload.params || {}) };

		if (mainParam) {
			boundPayload.value = { [mainParam]: value };
		} else {
			boundPayload.value = {};
		}
	};

	const handleToggleDropdown = (open, minOptionsToFetch = 2) => {
		isDropdownOpen.value = open;
		dropdownOpenIntent.value = open;

		if (open) {
			const shouldLoadInitial =
				!hasLoadedInitialOptions.value || (innerOptionsList.value.length < minOptionsToFetch);
			if (shouldLoadInitial || fetchNextTime.value) {
				return loadmore({ isEmptyList: true }).finally(() => {
					fetchNextTime.value = false;
				});
			}
			fetchNextTime.value = false;
		} else {
			query.value = '';
		}

		return Promise.resolve();
	};

	const loadmore = (settings = {}) => {
		if (innerOptionsLoading.value) return Promise.resolve();
		if (!isDropdownOpen.value) return Promise.resolve();

		const shouldLoadInitial = !!settings.isEmptyList;
		const hasMore = currentPage.value < lastPage.value;
		// console.log(currentPage.value +'<'+ lastPage.value)
		if (!shouldLoadInitial && (!loadmoreIsActive || !hasMore)) return Promise.resolve();

		return fetchItems({
			append: !shouldLoadInitial,
			page: shouldLoadInitial ? 1 : currentPage.value + 1,
			extraPayload: boundPayload.value,
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

	const notifyDropdownOpenIntent = () => {
		dropdownOpenIntent.value = true;
	};

	onBeforeUnmount(() => {
		if (timer.value) {
			clearTimeout(timer.value);
		}
	});

	const bindTo = resolveSettings().bindTo;
	if (Array.isArray(bindTo) && bindTo.length) {
		// setup bindTo for FetchByQuerySelect case
		setupRequestBinding({
			bindTo,
			isInitialSetupRef: bindingInitialSetup,
			blockInitialFetch: true,
			buildWatchOption: (item, mergeWith) => ({
				...item,
				payload: resolveSettings().payload,
				mergeWith,
			}),
			onWatchTrigger: handleBoundFetch,
		});
		setTimeout(() => {
			bindingInitialSetup.value = false;
		}, 0);
	}

	return {
		innerOptionsList,
		innerOptionsLoading,
		fetchSelectedItemsById,
		selectQuery,
		handleToggleDropdown,
		loadmore,
		handleValueCleared,
		notifyDropdownOpenIntent,
		syncExternalOptionsList,
		syncExternalOptionsLoading,
		updateOptionsList,
	};
}
