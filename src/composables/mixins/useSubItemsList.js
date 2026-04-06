import uniqid from 'uniqid';
import { validateBySettings } from '@/helpers';
import isEmpty from 'lodash/isEmpty';

export function useSubItemsList({ formData, refsMap, state } = {}) {
	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const resolveListTarget = (list) => {
		if (list && typeof list === 'object' && 'value' in list && Array.isArray(list.value)) {
			return { list: list.value, ref: list, key: null };
		}

		if (Array.isArray(list)) {
			return { list, ref: null, key: null };
		}

		if (typeof list === 'string') {
			const localState = resolve(state);
			if (localState && Array.isArray(localState[list])) {
				return { list: localState[list], ref: null, key: list };
			}
		}

		return { list: null, ref: null, key: null };
	};

	const setupFormSubItemsList = (dataList, uniqidPrefix) => {
		const itemsList = [];
		for (const item of dataList || []) {
			if (typeof item !== 'object') {
				itemsList.push({ value: item, id: uniqid(`${uniqidPrefix}-`) });
			} else if (item) {
				itemsList.push({ ...item, id: item.id || uniqid(`${uniqidPrefix}-`) });
			}
		}
		return itemsList;
	};

	const addFormItem = (list, uniqPrefix, settings = {}) => {
		let { unshift, formData: localFormData, focus } = settings;
		localFormData = localFormData || {};
		const method = unshift ? 'unshift' : 'push';
		const newItem = {
			id: uniqid(uniqPrefix),
			new: true,
			focus,
			...localFormData,
		};

		const { list: targetList, ref } = resolveListTarget(list);
		if (!targetList) {
			console.warn('[useSubItemsList] List not found');
			return;
		}

		if (ref) {
			ref.value[method](newItem);
		} else {
			targetList[method](newItem);
		}
	};

	const removeFormItem = (id, list) => {
		const { list: targetList, ref, key } = resolveListTarget(list);
		if (!targetList) {
			console.warn('[useSubItemsList] List not found');
			return;
		}

		const filtered = targetList.filter((o) => o.id !== id);
		if (ref) {
			ref.value = filtered;
		} else if (key) {
			const localState = resolve(state);
			if (localState) {
				localState[key] = filtered;
			}
		} else {
			targetList.length = 0;
			Array.prototype.push.apply(targetList, filtered);
		}
	};

	const runPipeline = (steps, context) => {
		for (const step of steps) {
			const result = step(context);
			if (result?.stop) break;
		}
		return context.collectedData;
	};

	const applyCondition = (context) => {
		const { conditionSettings } = context.settings;
		const passed = validateBySettings({
			...conditionSettings,
			dataObj: context.collectedValue,
		});
		if (!passed) return { stop: true };
	};

	const applyCallback = (context) => {
		const { callback, payload } = context.settings;
		context.collectedData = callback(payload);
		return { stop: true };
	};

	const applyDestructure = (context) => {
		context.collectedValue = destructure(context.collectedValue);
	};

	const applyDataUpdate = (context) => {
		if (context.settings.onCollectDataCallback) {
			context = context.settings.onCollectDataCallback(context);

			if (context?.itemIsReady) return;
		}

		const { targetProp, returnArray, concatData, skipReturnData } = context.settings;
		const { collectedValue, collectedData } = context;
		const currentFormData = resolve(formData) || {};

		if (skipReturnData) return;

		if (returnArray) {
			const key = targetProp || 'result';
			collectedData[key] = collectedData[key] || [];
			if (concatData) {
				collectedData[key] = collectedData[key].concat(collectedValue);
			} else {
				collectedData[key].push(collectedValue);
			}
			return;
		}

		if (!targetProp) {
			const list = Array.isArray(collectedValue) ? collectedValue : [collectedValue];
			list.forEach((item) => Object.assign(collectedData, item));
			return;
		}

		if (Array.isArray(currentFormData?.[targetProp])) {
			collectedData[targetProp] = collectedData[targetProp] || [];
			if (Array.isArray(collectedValue)) {
				collectedData[targetProp] = (collectedData[targetProp] || []).concat(
					collectedValue,
				);
			} else {
				collectedData[targetProp].push(collectedValue);
			}
		} else {
			collectedData[targetProp] = collectedValue;
		}
	};

	const applyFlags = (context) => {
		const { setIfEmpty, cleanIfEmpty, targetProp } = context.settings;
		const target = targetProp
			? context.collectedData[targetProp]
			: context.collectedValue;
		const hasNoValue =
			!target || (Array.isArray(target) && target.length === 0) || isEmpty(target);

		if (setIfEmpty) {
			context.collectedData[setIfEmpty.prop] = hasNoValue
				? setIfEmpty.val
				: !setIfEmpty.val;
		}

		if (hasNoValue && cleanIfEmpty) {
			context.collectedData[cleanIfEmpty.prop] = cleanIfEmpty.val;
		}
	};

	const destructure = (val) => {
		let finalValue = Array.isArray(val) ? val[0] : val;
		if (Array.isArray(finalValue)) {
			finalValue = destructure(finalValue);
		}
		return finalValue;
	};

	const updateDataByRef = ({ Instance, settingsItem, collectedData }) => {
		const { conditionSettings, callback, destructure, setIfEmpty, cleanIfEmpty } =
			settingsItem;
		const context = {
			collectedValue: Instance.getFormData(),
			settings: settingsItem,
			formData: resolve(formData),
			collectedData,
		};

		const steps = [];
		if (conditionSettings) steps.push(applyCondition);
		if (callback) steps.push(applyCallback);
		if (destructure) steps.push(applyDestructure);
		steps.push(applyDataUpdate);
		if (setIfEmpty || cleanIfEmpty) steps.push(applyFlags);

		return runPipeline(steps, context);
	};

	const operateRefs = ({ settingsItem, operation }) => {
		const refs = resolve(refsMap) || {};
		let refsList = refs[settingsItem.ref];
		if (refsList) {
			refsList = Array.isArray(refsList) ? refsList : [refsList];
			refsList.filter(Boolean).forEach((Instance) => operation(Instance));
		}
	};

	const validateSubItemsForm = (subItemsSettings) => {
		const validationResults = [];
		subItemsSettings.forEach((settingsItem) => {
			operateRefs({
				settingsItem,
				operation: (Instance) => {
					if (Instance.validateItemForm) {
						validationResults.push(Instance.validateItemForm(settingsItem));
					}
				},
			});
		});
		return validationResults.every((item) => item);
	};

	const resetFormDataBySubItems = (subItemsSettings) => {
		subItemsSettings.forEach((settingsItem) => {
			if (settingsItem.targetProp && !settingsItem.keepOriginalData) {
				const fd = resolve(formData);
				if (!fd) return;
				if (Array.isArray(fd[settingsItem.targetProp])) {
					fd[settingsItem.targetProp] = [];
				} else {
					fd[settingsItem.targetProp] = null;
				}
			}
		});
	};

	const collectDataFromSubItems = (subItemsSettings, options = {}) => {
		let collectedData = {};

		subItemsSettings.forEach((settingsItem) => {
			operateRefs({
				settingsItem,
				operation: (Instance) => {
					if (settingsItem.submitInSubItem) {
						Instance.submitItemForm({ settingsItem, options });
					} else if (settingsItem.localSubmitMethod) {
						Instance[settingsItem.localSubmitMethod]({
							options,
							collectedData,
							settingsItem,
						});
					} else {
						collectedData = updateDataByRef({
							Instance,
							options,
							collectedData,
							settingsItem,
						});
					}
				},
			});

			if (settingsItem.onCollect) {
				settingsItem.onCollect({ settingsItem, collectedData });
			}
		});

		return collectedData;
	};

	return {
		setupFormSubItemsList,
		addFormItem,
		removeFormItem,
		updateDataByRef,
		validateSubItemsForm,
		resetFormDataBySubItems,
		collectDataFromSubItems,
		operateRefs,
	};
}
