import { ref, watch, onBeforeMount, onMounted } from 'vue';

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

	const doFetchAction = (actionName, localProp, localLoadProp, payload, callback) => {
		if (localLoadProp) setTargetValue(localLoadProp, true);
		const isInitial = requestsListInitialSetup.value;

		const action = methodsMap[actionName];
		if (typeof action !== 'function') {
			console.warn(`[useRequestsList] action "${actionName}" not found`);
			if (localLoadProp) setTargetValue(localLoadProp, false);
			return;
		}

		action(payload)
			.then(({ value, request_payload, fetchedMeta }) => {
				if (callback) {
					callback({
						actionName,
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
		if (option.blockInitialFetch) return;

		const { action, localProp, localLoadProp, payload, callback, notFetch } = option;
		if (!methodsMap[action]) return;

		let newPayload = { params: { max: -1 } };
		if (payload) {
			newPayload = {
				...payload,
				params: { max: -1, ...payload.params },
			};
		}

		if (!notFetch) {
			doFetchAction(action, localProp, localLoadProp, newPayload, callback);
		}
	};

	const setupBindTo = (option) => {
		const {
			action,
			localProp,
			localLoadProp,
			bindTo,
			blockInitialFetch,
			initialSetup,
		} = option;

		bindTo.forEach((item, idx) => {
			const newOption = {
				...item,
				action,
				localProp,
				localLoadProp,
				payload: option.payload,
				mergeWith: bindTo.filter((bti) => bti !== item),
			};

			const getPrimary = item.getValue;
			const getAlternate = item.alternateGetValue;

			if (requestsListInitialSetup.value && idx === bindTo.length - 1) {
				if (!blockInitialFetch && !initialSetup) {
					const bindingValue = getPrimary ? getPrimary() : undefined;
					const alternateValue = getAlternate ? getAlternate() : undefined;
					watchHandler(bindingValue ?? alternateValue, newOption);
				}
			}

			if (getPrimary) {
				watch(
					() => getPrimary(),
					(newVal) => {
						if (!requestsListInitialSetup.value || idx === bindTo.length - 1) {
							const alternateValue = getAlternate ? getAlternate() : undefined;
							watchHandler(newVal ?? alternateValue, newOption);
						}
					},
				);
			}
		});

		if (requestsListInitialSetup.value && initialSetup) {
			const { fetchById } = initialSetup;
			if (fetchById) {
				fetchByIdHandler({ ...fetchById, localLoadProp, localProp });
			}
		}
	};

	const mergedParams = (mergeWithItems = []) => {
		const result = {};
		mergeWithItems.forEach((obj) => {
			if (obj.getValue) {
				result[obj.param] = obj.getValue();
			}
		});
		return result;
	};

	const watchHandler = (value, option) => {
		const {
			action,
			localProp,
			localLoadProp,
			withoutClean,
			param,
			cleanKey,
			mergeWith,
			fetchAnyWay,
			noFetch,
			fetchById,
			mainParam,
			disableFetch,
		} = option;
		const payload = option.payload || {};

		if (cleanKey && !requestsListInitialSetup.value) {
			if (state?.skipBindingCleanProp?.[cleanKey]) {
				state.skipBindingCleanProp[cleanKey] = null;
			} else {
				const current = getTargetValue(cleanKey);
				setTargetValue(cleanKey, Array.isArray(current) ? [] : null);
			}
		}

		if (!withoutClean) {
			if (state?.skipListCleanProp?.[localProp]) {
				state.skipListCleanProp[localProp] = null;
			} else if (localProp) {
				setTargetValue(localProp, []);
			}
		}
		if (disableFetch) return;

		const newPayload = {
			...payload,
			params: {
				...payload.params,
				...mergedParams(mergeWith),
			},
		};

		if (param) newPayload.params[param] = value;
		if (mainParam) newPayload[mainParam] = value;

		let isFetch = false;
		if (Array.isArray(value)) {
			isFetch = value.length > 0 && value[0] !== null;
		} else if (value || fetchAnyWay) {
			isFetch = true;
		} else {
			isFetch = mergeWith?.some((mi) => {
				if (!mi.noFetch && !mi.disableFetch) {
					const val = newPayload.params[mi.param];
					return Array.isArray(val) ? val.length > 0 && val[0] !== null : !!val;
				}
				return false;
			});
		}

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

	const fetchByIdHandler = ({ action, itemId, localProp, localLoadProp, payload }) => {
		if (localLoadProp) setTargetValue(localLoadProp, true);
		const actionFn = methodsMap[action];
		if (typeof actionFn !== 'function') {
			console.warn(`[useRequestsList] action "${action}" not found`);
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
