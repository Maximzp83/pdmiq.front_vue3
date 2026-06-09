import { ref, onMounted } from 'vue';
import { updateFormData } from '@/helpers';

export function useSubItem({
	itemData,
	formData,
	itemFormRef,
	localSetupPageHook,
	localSetupPageActions,
	updateFormDataSettings,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	localValidationHook,
	localGetFormDataCallback,
	localGetFormData,
	localSubmit,
	deleteNewId,
	deleteFileId,
	deleteId,
	isNew,
	emit,
} = {}) {
	const isMobile = ref(false);
	const isInitialSetup = ref(true);
	const isNewItem = ref(false);
	const itemId = ref(null);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const setupForm = (data, currentFormData) => {
		return updateFormData(data, currentFormData, {}, updateFormDataSettings);
	};

	const setupPage = (item) => {
		const currentItem = resolve(item);
		if (currentItem && Object.keys(currentItem).length) {
			isNewItem.value = currentItem.new || isNew || false;
			itemId.value = currentItem.id;

			if (localSetupPageHook) {
				const { next, itemForSetup } = localSetupPageHook(currentItem);
				if (next && formData) {
					formData.value = setupForm(itemForSetup, formData.value);
				}
			} else if (formData) {
				formData.value = setupForm(currentItem, formData.value);
			}
		} else {
			isNewItem.value = true;
		}

		if (localSetupPageActions) {
			localSetupPageActions(currentItem);
		}

		setTimeout(() => {
			isInitialSetup.value = false;
		}, 0);
	};

	const validateItemForm = (options = {}) => {
		const validationResults = [];
		const form = itemFormRef?.value;

		if (form?.validateField && form?.fields) {
			form.fields.forEach((field) => {
				const prop = field?._props?.prop;
				form.validateField(prop, (error) => {
					if (error) validationResults.push(false);
				});
			});
		}

		if (subItemsSettings && validateSubItemsForm) {
			validationResults.push(validateSubItemsForm(subItemsSettings));
		}

		if (localValidationHook) {
			validationResults.push(localValidationHook(options));
		}
		return validationResults.every((item) => item);
	};

	const getFormData = (options) => {
		let data = { ...(formData?.value || {}) };

		if (subItemsSettings && collectDataFromSubItems) {
			data = {
				...data,
				...collectDataFromSubItems(subItemsSettings, options),
			};
		}

		if ((deleteNewId && isNewItem.value) || deleteFileId || deleteId) {
			delete data.id;
		}
		if (localGetFormDataCallback) {
			data = localGetFormDataCallback(data, options);
		}
		if (localGetFormData) {
			return localGetFormData(data, options);
		}
		return data;
	};

	const submitItemForm = (options) => {
		const data = getFormData(options);
		if (localSubmit) localSubmit(data, options);
	};

	const removeItem = () => {
		if (emit) emit('onRemove', itemId.value);
	};

	const addItem = () => {
		if (emit) emit('onCreate');
	};

	const handleResetValidate = () => {
		const form = itemFormRef?.value;
		if (form?.clearValidate) {
			form.clearValidate();
		}
	};

	onMounted(() => {
		setupPage(itemData);
		if (itemData && itemData.focus) {
			const focusRef = itemData.focus;
			const target = typeof focusRef === 'string' ? null : focusRef?.value;
			if (target?.focus) target.focus();
		}
	});

	return {
		isMobile,
		isInitialSetup,
		isNewItem,
		itemId,
		setupPage,
		validateItemForm,
		getFormData,
		submitItemForm,
		removeItem,
		addItem,
		handleResetValidate,
	};
}
