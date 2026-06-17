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
		const form = itemFormRef?.value;
		const formValidation = form?.validate
			? new Promise((resolve) => {
				form.validate((mainFormIsValid) => {
					resolve(mainFormIsValid);
				});
			})
			: Promise.resolve(true);

		return formValidation.then((mainFormIsValid) => {
			const validationResults = [];
			if (!mainFormIsValid) {
				validationResults.push(false);
			}
			console.log('validationResults1', validationResults);

			const validations = [];
			if (subItemsSettings && validateSubItemsForm) {
				validations.push(validateSubItemsForm(subItemsSettings));
			}
			if (localValidationHook) {
				validations.push(localValidationHook(options));
			}

			return Promise.all(validations).then((results) => {
				validationResults.push(...results);
				console.log('validationResults2', validationResults, localValidationHook);
				return validationResults.every((item) => item);
			});
		}).catch(() => {
			const validationResults = [false];
			console.log('validationResults1', validationResults);
			if (localValidationHook) {
				return Promise.resolve(localValidationHook(options)).then((localResult) => {
					validationResults.push(localResult);
					console.log('validationResults2', validationResults, localValidationHook);
					return false;
				});
			}
			console.log('validationResults2', validationResults, localValidationHook);
			return false;
		});
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
