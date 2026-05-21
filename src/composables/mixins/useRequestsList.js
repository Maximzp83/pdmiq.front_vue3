import { ref, watch, onBeforeMount, onMounted } from 'vue';
import { executeRequestAction } from '@/composables/executeRequestAction';
import { mergedBindParams, setupRequestBinding, shouldFetchForBinding } from '@/composables/useRequestBinding';
import { mergeObjects } from '@/helpers';

export function useRequestsList({
	state,
	methodsMap = {},
	requestsToDoList,
	initialRequestsListResponsesReadyCallback,
	localBeforeMountRequestsList,
} = {}) {
	const requestsListInitialSetup = ref(true);
	const initialSuccessResponsesQuantity = ref(0);
	const initiateRequestsToDoList = ref(true);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const resolveTarget = (target) => {
		if (target && typeof target === 'object' && 'value' in target) {
			return { type: 'ref', ref: target };
		}
		if (typeof target === 'string' && state) {
			return { type: 'state', key: target };
		}
		return { type: 'none' };
	};

	const setTargetValue = (target, value) => {
		const resolved = resolveTarget(target);
		if (resolved.type === 'ref') {
			resolved.ref.value = value;
		} else if (resolved.type === 'state') {
			state[resolved.key] = value;
		}
	};

	const getTargetValue = (target) => {
		const resolved = resolveTarget(target);
		if (resolved.type === 'ref') return resolved.ref.value;
		if (resolved.type === 'state') return state[resolved.key];
		return undefined;
	};

	const operateRequestsList = (list) => {
		for (const option of list || []) {
			startFetchAction(option);
		}
	};

	const resolveRequestOptionList = () => resolve(requestsToDoList) || [];

	const findRequestOption = (keyOrPredicate) => {
		const list = resolveRequestOptionList();
		if (typeof keyOrPredicate === 'function') {
			return list.find(keyOrPredicate);
		}
		return list.find(
			(option) =>
				option.key === keyOrPredicate ||
				option.actionName === keyOrPredicate ||
				option.localProp === keyOrPredicate,
		);
	};

	const doFetchAction = (action, localProp, localLoadProp, payload, callback) => {
		if (localLoadProp) setTargetValue(localLoadProp, true);
		const isInitial = requestsListInitialSetup.value;

		// const action = methodsMap[actionName];
		if (typeof action !== 'function') {
			console.warn(`[useRequestsList] action "${action}" not found`);
			if (localLoadProp) setTargetValue(localLoadProp, false);
			return;
		}

		executeRequestAction(action, payload, '[useRequestsList]')
			.then(({ value, request_payload, fetchedMeta }) => {
				if (callback) {
					callback({
						actionName: action.name || 'anonymousAction',
						localProp,
						data: value,
						fetchedMeta,
					});
				} else {
					if (!payload.setToStore && !request_payload.setToStore) {
						if (localProp) setTargetValue(localProp, value);
					}
				}

				if (localLoadProp) setTargetValue(localLoadProp, false);
				if (isInitial) initialSuccessResponsesQuantity.value += 1;
			})
			.catch(() => {
				if (localLoadProp) setTargetValue(localLoadProp, false);
			});
	};

	const startFetchAction = (option, settings = {}) => {
		const { forceFullList = false, skipBindToSetup = false } = settings;

		if (option.hasValueCase && !forceFullList) {
			const itemId = option.hasValueCase.getValue && option.hasValueCase.getValue();

			if (itemId) {
				option.blockInitialFetch = true;
				fetchByIdHandler(itemId, option);
			}
		}

		if (option.bindTo && !skipBindToSetup) {
			// console.log('setupBindTo')
			setupBindTo(option);
			return;
		}

		if (option.blockInitialFetch) return;

		const { action, actionName, localProp, localLoadProp, payload, callback, notFetch } = option;
		const resolvedAction = action || methodsMap[actionName];

		if (!resolvedAction) return;

		let newPayload = { params: { max: -1 } };
		
		if (payload) {
			newPayload = mergeObjects(newPayload, payload);

			if (payload.params) {
				Object.keys(payload.params).forEach(key => {
					newPayload.params[key] = typeof payload.params[key] === 'function' ?
						payload.params[key]() :
						payload.params[key];
				});
			}
		}
		
		// console.log('startFetchAction', option, newPayload);
		if (!notFetch) {
			doFetchAction(resolvedAction, localProp, localLoadProp, newPayload, callback);
		}
	};

	const reloadRequestOption = (option, settings = {}) => {
		/*const option =
			typeof keyOrOption === 'object' && keyOrOption !== null
				? keyOrOption
				: findRequestOption(keyOrOption);

		if (!option) {
			console.warn(`[useRequestsList] request option "${keyOrOption}" not found`);
			return;
		}*/

		const nextOption = { ...option };
		delete nextOption.blockInitialFetch;

		return startFetchAction(nextOption, {
			forceFullList: true,
			skipBindToSetup: true,
			...settings,
		});
	};

	const handleToggleDropdown = (isOpen, keyOrOption, settings = {}) => {
		// console.log('handleToggleDropdown', isOpen, keyOrOption, settings)
		if (isOpen) {
			const { shouldReload } = settings;

			const option =
				typeof keyOrOption === 'object' && keyOrOption !== null
					? keyOrOption
					: findRequestOption(keyOrOption);

			if (!option) {
				console.warn(`[useRequestsList] request option "${keyOrOption}" not found`);
				return;
			}

			const currentList = getTargetValue(option.localProp);
			const defaultShouldReload =
				!!option.hasValueCase && Array.isArray(currentList) && currentList.length === 1;

			if (typeof shouldReload === 'function' ? shouldReload(option, currentList) : defaultShouldReload) {
				reloadRequestOption(option);
			}
		}
	};

	const setupBindTo = (option) => {
		const {
			action,
			actionName,
			localProp,
			localLoadProp,
			bindTo,
			blockInitialFetch,
		} = option;

		const resolvedAction = action || methodsMap[actionName];
		if (!resolvedAction) return;
		// const initialFetchById = resolveInitialFetchByIdOption(option);

		setupRequestBinding({
			bindTo,
			blockInitialFetch,
			isInitialSetupRef: requestsListInitialSetup,
			buildWatchOption: (item, mergeWith) => ({
				...item,
				action: resolvedAction,
				localProp,
				localLoadProp,
				payload: option.payload,
				mergeWith,
			}),
			onWatchTrigger: watchHandler,
		});
	};

	const watchHandler = (value, option) => {
		const {
			action,
			localProp,
			localLoadProp,
			withoutClean,
			param,
			// params: mainParams,
			cleanKey,
			mergeWith,
			fetchAnyWay,
			noFetch,
			// fetchById,
			mainParam,
			disableFetch,
			reset_values,
			onTrigger
		} = option;
		const payload = option.payload || {};

		/*if (cleanKey && !requestsListInitialSetup.value) {
			if (state?.skipBindingCleanProp?.[cleanKey]) {
				state.skipBindingCleanProp[cleanKey] = null;
			} else {
				const current = getTargetValue(cleanKey);
				setTargetValue(cleanKey, Array.isArray(current) ? [] : null);
			}
		}*/

		if (!withoutClean) {
			if (state?.skipListCleanProp?.[localProp]) {
				state.skipListCleanProp[localProp] = null;
			} else if (localProp) {
				setTargetValue(localProp, []);
			}
		}

		if (reset_values && !requestsListInitialSetup.value) {
			// console.log('reset_values', reset_values)
			reset_values.forEach((value) => {
				setTargetValue(value, null);
			})			
		}

		if (onTrigger && !requestsListInitialSetup.value) onTrigger(value, option);

		if (disableFetch) return;

		const newPayload = {
			...payload,
			params: {
				...payload.params,
				...mergedBindParams(mergeWith),
			},
		};
		if (param) newPayload.params[param] = value;
		if (mainParam) newPayload[mainParam] = value;

		const isFetch = shouldFetchForBinding({
			value,
			mergeWith,
			newPayload,
			fetchAnyWay,
		});
		// console.log(value, option, !noFetch && isFetch)
		if (!noFetch && isFetch) {
			startFetchAction({
				action,
				localProp,
				localLoadProp,
				payload: newPayload,
			});
		}
	};

	const fetchByIdHandler = (itemId, { hasValueCase = {}, localProp, localLoadProp }) => {
		const { action, fetchItemActionName, payload } = hasValueCase;
		if (localLoadProp) setTargetValue(localLoadProp, true);
		const actionFn = action || methodsMap[fetchItemActionName];
		if (typeof actionFn !== 'function') {
			console.warn(`[useRequestsList] action "${fetchItemActionName}" not found`);
			if (localLoadProp) setTargetValue(localLoadProp, false);
			return;
		}

		actionFn({ itemId, ...(payload || {}) })
			.then((response) => {
				if (localProp) setTargetValue(localProp, response.value ? [response.value] : []);
				if (localLoadProp) setTargetValue(localLoadProp, false);
			})
			.catch(() => {
				if (localLoadProp) setTargetValue(localLoadProp, false);
			});
	};

	watch(initialSuccessResponsesQuantity, (q) => {
		const list = resolve(requestsToDoList);
		if (initialRequestsListResponsesReadyCallback && list) {
			if (list.length === q) {
				initialRequestsListResponsesReadyCallback();
			}
		}
	});

	watch(initiateRequestsToDoList, (init) => {
		const list = resolve(requestsToDoList);
		if (init && list) {
			operateRequestsList(list);
			setTimeout(() => {
				requestsListInitialSetup.value = false;
			}, 50);
		}
	});

	onBeforeMount(() => {
		if (localBeforeMountRequestsList) localBeforeMountRequestsList();
		const list = resolve(requestsToDoList);
		if (initiateRequestsToDoList.value && list) {
			operateRequestsList(list);
		}
	});

	onMounted(() => {
		setTimeout(() => {
			if (initiateRequestsToDoList.value) {
				requestsListInitialSetup.value = false;
			}
		}, 0);
	});

	return {
		requestsListInitialSetup,
		initialSuccessResponsesQuantity,
		initiateRequestsToDoList,
		operateRequestsList,
		findRequestOption,
		reloadRequestOption,
		handleToggleDropdown,
		startFetchAction,
		setupBindTo,
		watchHandler,
	};
}
