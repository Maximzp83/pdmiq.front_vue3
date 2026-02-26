import { watch, nextTick } from 'vue';
import { toggleHeightBlock } from '@/helpers/specialHelpers';
import { useNotify } from '@/composables/useNotify';
import { Lang } from '@/localization';

export function useFormOperationsInItemsList({
	openCreateForm,
	collectedData,
	tableSettings,
	saveItem,
	fetchItems,
	filters,
	globalFilters,
	itemsTableContainerRef,
} = {}) {
	const { Notify } = useNotify();

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const closeCreateForm = () => {
		if (openCreateForm && 'value' in openCreateForm) {
			openCreateForm.value = false;
		}
	};

	const handleCreateItem = () => {
		if (openCreateForm && 'value' in openCreateForm) {
			openCreateForm.value = true;
		}
	};

	const closeFormFields = () => {
		if (itemsTableContainerRef?.value) {
			itemsTableContainerRef.value.activeRowIdx = null;
		}
		if (openCreateForm && 'value' in openCreateForm) {
			openCreateForm.value = false;
		}
	};

	const handleSubmitForm = (data) => {
		if (typeof saveItem !== 'function') {
			console.warn('[useFormOperationsInItemsList] saveItem is not a function');
			return;
		}
		const payload = { data };
		saveItem(payload).then(() => {
			if (typeof fetchItems === 'function') {
				fetchItems({ ...resolve(filters), ...resolve(globalFilters) });
			}
			closeFormFields();
		});
	};

	const blockReady = (payload) => {
		if (collectedData?.value) {
			collectedData.value.push(payload);
		}
	};

	const clearCollectedData = () => {
		if (collectedData && 'value' in collectedData) {
			collectedData.value = [];
		}
	};

	const setupPayload = (dataArr) => {
		let data = {};
		if (dataArr.length) {
			data.id = dataArr[0].itemId;
			for (const item of dataArr) {
				data = { ...data, ...item.data };
			}
		}
		return data;
	};

	if (openCreateForm) {
		watch(
			openCreateForm,
			(open) => {
				nextTick().then(() => {
					const target = document.getElementById('createItemForm');
					toggleHeightBlock(open, target);
				});
			},
		);
	}

	if (collectedData) {
		watch(
			collectedData,
			(dataArr) => {
				const columns = resolve(tableSettings)?.columns || [];
				if (dataArr.length === columns.length) {
					const isValid = dataArr.every((o) => o.isValid);
					if (isValid) {
						const payload = setupPayload(dataArr);
						handleSubmitForm(payload);
					} else {
						setTimeout(() => {
							Notify({
								type: 'warning',
								title: Lang.tt('phrases.Validation_error'),
								message: Lang.tt('phrases.check_form_fields'),
								duration: 0,
							});
						}, 10);
					}
				}
			},
			{ deep: true },
		);
	}

	return {
		closeCreateForm,
		handleCreateItem,
		closeFormFields,
		handleSubmitForm,
		blockReady,
		clearCollectedData,
		setupPayload,
	};
}
