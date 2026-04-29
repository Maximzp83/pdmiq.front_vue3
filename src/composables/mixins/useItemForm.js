import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useAuthStore } from '@/stores/AuthStore';
import { updateFormData, prepareSubmitData, cleanObjValues } from '@/helpers';
import { checkUploadSettings } from '@/helpers/specialHelpers';
import { useNotify } from '@/composables/useNotify';
import { Lang } from '@/localization';

export function useItemForm({
	itemData,
	formData,
	initialFormData,
	copyItem,
	copyOptions,
	formSettings,
	new_item_type,
	cleanFormDataAfterClose,
	localSetupPage,
	idPropName,
	formRef,
	blockSetupPageInWatcher,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localValidationHook,
	handleValidateRefsItems,
	handleValidationResultCallback,
	localPrepareSubmitData,
	prepareSubmitDataSettings,
	localSubmit,
	ignoreLocalSubmit,
	editInModal,
	fromModal,
	showSubmitButtons,
	itemsName,
	editModal,
	submitAction,
	uploadSettings,
	preparePayload,
	localPreSubmitHook,
	successSubmitCallback,
	propsSuccessSubmitCallback,
	instanceName,
	emit,
} = {}) {
	const globalStore = useGlobalStore();
	const authStore = useAuthStore();
	const { Notify } = useNotify();

	const isMobile = ref(false);
	const itemId = ref(null);
	const isInitialSetup = ref(true);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const activeItemsTable = computed(() => globalStore.activeItemsTable);
	const globalFilters = computed(() => globalStore.globalFilters);
	const navbarSettings = computed(() => globalStore.navbarSettings);
	const authUser = computed(() => authStore.authUser);
	const showPlant = computed(() => {
		const settings = navbarSettings.value;
		if (settings && settings.showPlantName) {
			const { id, name } = settings.showPlantName;
			return Object.freeze({ id, name });
		}
		return null;
	});

	const clearValidate = (props = []) => {
		const form = resolve(formRef);
		if (form?.clearValidate) {
			form.clearValidate(props);
		}
	};

	const initFormData = () => {
		if (formData && 'value' in formData) {
			formData.value = { ...(initialFormData || {}) };
		}
	};

	const setupForm = (item, currentFormData) => {
		let additionalRules = {};
		if (copyItem && copyOptions) {
			additionalRules = copyOptions.additionalRules;
		}
		return updateFormData(item, currentFormData, additionalRules);
	};

	const setupPage = (item, options = {}) => {
		const propName = options.formDataName || 'formData';
		const idProp = options.idPropName || idPropName || 'id';

		const targetFormRef = propName === 'formData' ? formData : options[propName];
		const targetForm = resolve(targetFormRef);

		if (item && Object.keys(item).length) {
			if (!copyItem) {
				itemId.value = item[idProp];
			}
			if (targetFormRef && 'value' in targetFormRef) {
				targetFormRef.value = setupForm(item, targetForm);
			}
		} else {
			itemId.value = null;
			if (initialFormData) {
				initFormData();
			} else if (cleanFormDataAfterClose && targetFormRef && 'value' in targetFormRef) {
				targetFormRef.value = cleanObjValues(targetFormRef.value);
			}
			if (new_item_type && targetFormRef && 'value' in targetFormRef) {
				targetFormRef.value.type = new_item_type;
			}
		}

		if (formSettings && targetFormRef && 'value' in targetFormRef) {
			targetFormRef.value = { ...targetFormRef.value, ...formSettings };
		}

		if (localSetupPage) localSetupPage(item);

		setTimeout(() => {
			isInitialSetup.value = false;
		}, 0);
	};

	const handleValidationResult = (validationResults, options = {}) => {
		if (validationResults.every((item) => item)) {
			if (handleValidationResultCallback) {
				handleValidationResultCallback();
			}

			if (subItemsSettings && collectDataFromSubItems && formData) {
				if (resetFormDataBySubItems) {
					resetFormDataBySubItems(subItemsSettings);
				}
				formData.value = {
					...formData.value,
					...collectDataFromSubItems(subItemsSettings, options),
				};
			}

			if (localValidationHook) {
				localValidationHook(options);
			} else if (handleValidateRefsItems) {
				handleValidateRefsItems(options);
			} else {
				submitForm(options);
			}
		} else {
			Notify({
				type: 'warning',
				title: Lang.tt('phrases.form_isnt_ready'),
				message: Lang.tt('phrases.Please_check_fields_errors_first'),
			});
			return false;
		}
	};

	const validateForm = (options = {}) => {
		clearValidate();
		const activeForm = options.activeFormRef || formRef;
		const form = resolve(activeForm);
		if (!form?.validate) return;

		form.validate((mainFormIsValid) => {
			const validationResults = [mainFormIsValid];

			if (subItemsSettings && validateSubItemsForm) {
				validationResults.push(validateSubItemsForm(subItemsSettings));
			}

			handleValidationResult(validationResults, options);
		});
	};

	const submitForm = (options = {}) => {
		try {
			let { formDataName, additionalInject } = options;
			additionalInject = additionalInject || {};

			const form = resolve(formData);
			let data = {
				id: itemId.value,
				...(formDataName && options[formDataName] ? options[formDataName] : form),
				...additionalInject,
			};

			if (localPrepareSubmitData) {
				data = localPrepareSubmitData(data, options);
			}

			if (data) {
				if (localSubmit && !ignoreLocalSubmit) {
					return localSubmit(
						{ ...prepareSubmitData(data, prepareSubmitDataSettings) },
						options,
					);
				}

				if (editInModal || fromModal || showSubmitButtons) {
					const itemName =
						resolve(editModal)?.itemName || resolve(itemsName)?.one || 'Item';
					let payload = {
						data: { ...prepareSubmitData(data, prepareSubmitDataSettings) },
						itemName,
					};

					if (uploadSettings) {
						payload = checkUploadSettings(payload, uploadSettings);
					}
					if (preparePayload) {
						payload = preparePayload(payload);
					}
					if (localPreSubmitHook) {
						const { next } = localPreSubmitHook(payload);
						if (!next) return;
					}

					if (emit) {
						emit('event', { eventName: 'toggleSaving', data: true, onward: true });
					}

					if (typeof submitAction !== 'function') {
						console.warn('[useItemForm] submitAction is not a function');
						return;
					}

					submitAction(payload)
						.then((answer) => {
							if (emit) {
								emit('event', {
									eventName: 'toggleSaving',
									data: false,
									onward: true,
								});
							}
							try {
								if (emit) {
									emit('event', {
										eventName: 'successModalSubmit',
										data: answer,
										onward: true,
									});
								}

								if (successSubmitCallback) {
									successSubmitCallback(answer);
								}

								if (propsSuccessSubmitCallback) {
									propsSuccessSubmitCallback(answer);
								}

								if (
									activeItemsTable.value === instanceName ||
									instanceName === 'Sensors'
								) {
									globalStore.set_global_state({
										stateProp: 'updateItemsList',
										value: true,
									});
								}

								if (activeItemsTable.value || fromModal) {
									globalStore.set_global_state({
										stateProp: 'updateCounters',
										value: true,
									});
								}
							} catch (e) {
								console.warn(e);
							}
						})
						.catch(() => {
							if (emit) {
								emit('event', {
									eventName: 'toggleSaving',
									data: false,
									onward: true,
								});
							}
						});
				} else {
					const formDataPrepared = {
						...prepareSubmitData(data, prepareSubmitDataSettings),
					};
					if (localPreSubmitHook) {
						const { next } = localPreSubmitHook(formDataPrepared);
						if (!next) return;
					}
					if (emit) {
						emit('submit', formDataPrepared);
					}
				}
			}
		} catch (e) {
			console.warn(e);
		}
	};

	const handleCancel = () => {
		if (emit) emit('onCancel');
	};

	watch(
		() => resolve(itemData),
		(data) => {
			if (!blockSetupPageInWatcher) {
				setupPage(data);
			}
		},
	);

	onMounted(() => {
		if (initialFormData) {
			initFormData();
		}
		setupPage(resolve(itemData));
	});

	onBeforeMount(() => {
		isMobile.value = document.documentElement.clientWidth < 992;
	});

	return {
		// state
		isMobile,
		itemId,
		isInitialSetup,
		activeItemsTable,
		globalFilters,
		navbarSettings,
		showPlant,
		authUser,

		// methods
		clearValidate,
		initFormData,
		setupForm,
		setupPage,
		validateForm,
		handleValidationResult,
		submitForm,
		handleCancel,
	};
}
