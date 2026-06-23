import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import { ENTITIES } from '@/config/entities';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useAuthStore } from '@/stores/AuthStore';
import { updateFormData, prepareSubmitData, cleanObjValues } from '@/helpers';
// import { checkUploadSettings } from '@/helpers/specialHelpers';
import { useNotify } from '@/composables/useNotify';
import { executeFormSubmit } from '@/composables/mixins/executeFormSubmit';
import { Lang } from '@/localization';

export const buildProps = (extra = {}) => ({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromMultiformModal: Boolean,
	editModal: { type: Object, default: null },
	fromAnotherInstance: Boolean,
	instancesItemsData: { type: Object, default: null },
	multiFormFilters: { type: Object, default: null },
	settings: { type: Object, default: () => ({}) },
	additionalSettings: { type: Object, default: () => ({}) },
	...extra,
});

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
	editModal,
	showSubmitButtons,
	entityKey,
	apiRoute,
	itemsName,
	uploadSettings,
	preparePayload,
	localPreSubmitHook,
	successSubmitCallback,
	propsSuccessSubmitCallback,
	emit,
	debug
} = {}) {
	// const emit = defineEmits(['submit', 'onCancel', 'event']);

	const globalStore = useGlobalStore();
	const authStore = useAuthStore();
	const { Notify } = useNotify();

	const isMobile = ref(false);
	const itemId = ref(null);
	const isInitialSetup = ref(true);

	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;
	const resolveSubItemsSettings = () => resolve(subItemsSettings);
	const entityConfig = entityKey ? ENTITIES[entityKey] : null;
	const resolvedApiRoute = apiRoute || entityConfig?.apiBase || null;
	const resolvedItemsName = computed(() => {
		const localItemsName = resolve(itemsName);
		if (localItemsName) {
			return localItemsName;
		}

		if (entityConfig?.itemsName) {
			return Object.freeze({
				one: Lang.tt(entityConfig.itemsName.one),
				mult: Lang.tt(entityConfig.itemsName.mult),
				instanceName: entityConfig.itemsName.instanceName,
			});
		}

		return Object.freeze({
			one: 'Item',
			mult: 'Items',
		});
	});

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
			}
			if (cleanFormDataAfterClose && targetFormRef && 'value' in targetFormRef) {
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

			const currentSubItemsSettings = resolveSubItemsSettings();
			if (currentSubItemsSettings && collectDataFromSubItems && formData) {
				if (resetFormDataBySubItems) {
					resetFormDataBySubItems(currentSubItemsSettings);
				}
				formData.value = {
					...formData.value,
					...collectDataFromSubItems(currentSubItemsSettings, options),
				};
			}

			if (localValidationHook) {
				const localValidationResult = localValidationHook(options);
				if (localValidationResult === false) {
					return false;
				}
				if (options.skipSubmit) {
					return true;
				}
				if (localValidationResult === true) {
					submitForm(options);
				}
			} else if (handleValidateRefsItems) {
				handleValidateRefsItems(options);
			} else if (options.skipSubmit) {
				return true;
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

			const currentSubItemsSettings = resolveSubItemsSettings();
			if (currentSubItemsSettings && validateSubItemsForm) {
				validationResults.push(validateSubItemsForm(currentSubItemsSettings));
			}

			handleValidationResult(validationResults, options);
		});
	};

	const submitForm = (options = {}) => {
		try {
			// debugger
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
				const preparedData = { ...prepareSubmitData(data, prepareSubmitDataSettings) };

				if (localSubmit && !ignoreLocalSubmit) {
					return localSubmit(preparedData, options);
				}

				const itemName = resolve(editModal)?.itemName || resolvedItemsName.value.one || 'Item';

				if (editInModal || fromModal || showSubmitButtons) {
					return executeFormSubmit({
						formData: preparedData,
						itemName,
						uploadSettings,
						preparePayload,
						localPreSubmitHook,
						debug,
						emit,
						itemId: preparedData.id || 'new',
						apiRoute: resolvedApiRoute,
						successSubmitCallback,
						propsSuccessSubmitCallback,
						options
					}).then((answer) => {
						const activeTable = `${activeItemsTable.value || ''}`.toLowerCase();
						const instanceName = `${resolvedItemsName.value.instanceName || ''}`.toLowerCase();

						if (activeTable === instanceName || instanceName === 'sensors') {
							globalStore.set_global_state({
								stateProp: 'updateItemsList',
								value: { key: 'equipmentsList', val: true },
							});
						}

						if (activeItemsTable.value || fromModal) {
							globalStore.set_global_state({
								stateProp: 'updateCounters',
								value: true,
							});
						}

						return answer;
					});
				} else {
					if (localPreSubmitHook) {
						const { next } = localPreSubmitHook({data: preparedData, itemName});
						if (!next) return;
					}
					if (emit) {
						emit('submit', preparedData);
					}
				}
			}
		} catch (e) {
			console.warn(e);
		}
	};

	const handleCancel = () => {
		emit('onCancel');
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
		buildProps
	};
}
