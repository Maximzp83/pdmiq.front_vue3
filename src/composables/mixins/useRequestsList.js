import { ref, watch, onBeforeMount, onMounted } from 'vue';
import { executeRequestAction } from '@/composables/executeRequestAction';
import { mergedBindParams, setupRequestBinding, shouldFetchForBinding } from '@/composables/useRequestBinding';

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

	const startFetchAction = (option) => {
		if (option.bindTo) {
			setupBindTo(option);
			return;
		}
		if (requestsListInitialSetup.value && option.initialSetup?.fetchById) {
			const { localProp, localLoadProp } = option;
			fetchByIdHandler({
				...option.initialSetup.fetchById,
				localProp,
				localLoadProp,
			});
			return;
		}
		if (option.blockInitialFetch) return;

		const { action, actionName, localProp, localLoadProp, payload, callback, notFetch } = option;
		const resolvedAction = action || methodsMap[actionName];

		if (!resolvedAction) return;

		let newPayload = { params: { max: -1 } };
		if (payload) {
			newPayload = {
				...payload,
				params: { max: -1, ...payload.params },
			};
		}

		if (!notFetch) {
			doFetchAction(resolvedAction, localProp, localLoadProp, newPayload, callback);
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
			initialSetup,
		} = option;

		const resolvedAction = action || methodsMap[actionName];
		if (!resolvedAction) return;

		setupRequestBinding({
			bindTo,
			isInitialSetupRef: requestsListInitialSetup,
			blockInitialFetch,
			initialSetup,
			decorateOption: (item, mergeWith) => ({
				...item,
				action: resolvedAction,
				localProp,
				localLoadProp,
				payload: option.payload,
				mergeWith,
			}),
			onWatchTrigger: watchHandler,
			onFetchById: (fetchById) =>	fetchByIdHandler({ ...fetchById, localLoadProp, localProp }),
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
			fetchById,
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
		} else if (fetchById?.itemId) {
			fetchByIdHandler({ ...fetchById, localProp, localLoadProp });
		}
	};

	const fetchByIdHandler = ({ action, actionName, itemId, localProp, localLoadProp, payload }) => {
		if (localLoadProp) setTargetValue(localLoadProp, true);
		const actionFn = action || methodsMap[actionName];
		if (typeof actionFn !== 'function') {
			console.warn(`[useRequestsList] action "${actionName}" not found`);
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
		startFetchAction,
		setupBindTo,
		watchHandler,
	};
}
