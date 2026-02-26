import uniqid from 'uniqid';

export function useCreateFormItem() {
	const validateSubItems = () => true;

	const resolveList = (list) => {
		if (list && Array.isArray(list.value)) {
			return { list: list.value, ref: list };
		}
		if (Array.isArray(list)) {
			return { list, ref: null };
		}
		return { list: null, ref: null };
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
		let { unshift, formData, focus } = settings;
		formData = formData || {};
		const { list: targetList, ref } = resolveList(list);
		if (!targetList) {
			console.warn('[useCreateFormItem] List not found');
			return;
		}
		const method = unshift ? 'unshift' : 'push';
		const newItem = {
			id: uniqid(uniqPrefix),
			new: true,
			focus,
			...formData,
		};
		if (ref) {
			ref.value[method](newItem);
		} else {
			targetList[method](newItem);
		}
	};

	const removeFormItem = (id, list) => {
		const { list: targetList, ref } = resolveList(list);
		if (!targetList) {
			console.warn('[useCreateFormItem] List not found');
			return;
		}
		const filtered = targetList.filter((o) => o.id !== id);
		if (ref) {
			ref.value = filtered;
		} else {
			targetList.length = 0;
			Array.prototype.push.apply(targetList, filtered);
		}
	};

	return { validateSubItems, setupFormSubItemsList, addFormItem, removeFormItem };
}
