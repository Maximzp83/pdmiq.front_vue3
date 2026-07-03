<template>
	<div>
		<div class="section-row equipments-tabsbar">
			<div class="underline-tabs full-width">
				<TabsBar
					customDisable
					:activeTab="activeTab"
					:tabsList="tabsList"
					:disableTabs="disableTabs"
					buttonsType="primary"
					@switchTab="switchTab"
				/>
			</div>
		</div>

		<div v-show="activeTab.prop === tabsList[0].prop" class="tab-container section-row">
			<ItemForm
				:ref="(el) => setSubItemRef('ItemFormComponent', el, 0)"
				:fromModal="fromModal"
				:fromMultiformModal="fromMultiformModal"
				:itemData="itemData"
				:itemsName="itemsName"
				:instancesItemsData="instancesItemsData"
				:multiFormFilters="multiFormFilters"
				:editModal="editModal"
				@submit="(data) => emit('submit', data)"
				@onCancel="() => emit('onCancel')"
				@event="handleEvent"
			/>
		</div>

		<div
			v-show="tabsList[1] && activeTab.prop === tabsList[1].prop"
			class="tab-container section-row"
		>
			<SensorItemFormWrapper
				v-for="(item, idx) in sensorFormsList"
				:ref="(el) => setSubItemRef('SensorFormComponent', el, idx)"
				:key="`sensorForm-${item.id}`"
				:fromModal="fromModal"
				:equipmentData="itemData"
				:itemData="item"
				:hasAccessToCreate="authStore.hasAccessTo(['create_dashboard'])"
				:formulasList="formulasList"
				:bearingsList="bearingsList"
				:lubeTypesList="lubeTypesList"
				:banner_controllersList="bannerControllersList"
				:ultrasound_controllersList="ultrasoundControllersList"
				:ncd_controllersList="ncdControllersList"
				:banner_subtypesList="bannerSubtypesList"
				:commonItemsLoadings="commonItemsLoadings"
				@event="handleEvent"
				@onRemove="removeSensorItem"
			/>

			<el-button
				v-if="authStore.hasAccessTo(['create_dashboard'])"
				class="create-button content-row with-text"
				size="small"
				type="success"
				@click="addFormItem(sensorFormsList, 's_i-')"
			>
				<span class="capitalize">{{ `${tt('Add')} ${tt('sensor')}` }}</span>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>

		<div
			v-show="tabsList[2] && activeTab.prop === tabsList[2].prop"
			class="tab-container section-row"
		>
			<MultiViewItemForm
				v-for="(item, idx) in multiViewFormsList"
				:ref="(el) => setSubItemRef('MultiViewItemForm', el, idx)"
				:key="`multiViewForm-${item.id}`"
				class="section-row"
				:fromModal="fromModal"
				:equipmentData="itemData"
				:itemData="item"
				@event="handleEvent"
				@onRemove="(id) => removeFormItem(id, multiViewFormsList)"
			/>

			<el-button
				v-if="authStore.hasAccessTo(['create_dashboard'])"
				class="section-row create-button content-row with-text"
				size="small"
				type="success"
				@click="addFormItem(multiViewFormsList, 'mv_i-')"
			>
				<span class="capitalize">{{ `${tt('Add')} ${tt('View')}` }}</span>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch, defineAsyncComponent } from 'vue';
import { ElMessageBox } from 'element-plus';

import { api_request } from '@/api/request_provider';
import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { SENSOR_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useNotify } from '@/composables/useNotify';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useTabs } from '@/composables/mixins/useTabs';
import { useSensors } from '@/composables/useSensors';

import TabsBar from '@/components/common/TabsBar.vue';
import ItemForm from './ItemForm.vue';
const MultiViewItemForm = defineAsyncComponent(()=>import('./MultiView/MultiViewItemForm.vue'));
const SensorItemFormWrapper = defineAsyncComponent(() => import('@/views/Sensors/sensorForm/ItemFormWrapper.vue'));

const { tt } = Lang;

defineOptions({ name: 'EquipmentItemFormWrapper' });

const props = defineProps({
	fromModal: Boolean,
	fromMultiformModal: Boolean,
	itemData: { type: Object, default: () => ({}) },
	itemsName: { type: Object, default: () => ({}) },
	instancesItemsData: Object,
	multiFormFilters: Object,
	editModal: Object,
});
const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { Notify } = useNotify();
const { fetchDatasetFormulas, detachSensor } = useSensors();
const refsMap = ref({});
const disableTabs = ref(false);
const formSubmitFinishCount = ref(0);
const formSubmitSuccessCount = ref(0);
const formsCount = ref(0);
const sensorFormsList = ref([]);
const multiViewsList = ref([]);
const multiViewsLoading = ref(false);
const multiViewFormsList = ref([]);
const formulasList = ref([]);
const formulasLoading = ref(false);
const bannerControllersList = ref([]);
const bannerControllersLoading = ref(false);
const ultrasoundControllersList = ref([]);
const ultrasoundControllersLoading = ref(false);
const ncdControllersList = ref([]);
const ncdControllersLoading = ref(false);
const bearingsList = ref([]);
const bearingsLoading = ref(false);
const lubeTypesList = ref([]);
const lubeTypesLoading = ref(false);
const bannerSubtypesList = ref([]);
const bannerSubtypesLoading = ref(false);

const subItemsSettings = Object.freeze([
	{ ref: 'ItemFormComponent', targetProp: 'equipmentSubmitPayload' },
	{ ref: 'SensorFormComponent', submitInSubItem: true },
	{ ref: 'MultiViewItemForm', targetProp: 'multiViewsItems', returnArray: true },
]);
const tabsList = computed(() => {
	const list = [{ title: tt('main'), prop: 'mainTab' }];
	if (authStore.hasAccessTo(['create_dashboard', 'edit_dashboard'])) {
		list.push(
			{
				title: 'pdm',
				prop: 'pdmTab',
				disabled: !props.itemData?.id,
				placement: 'top',
				popover: {
					disabled: !!props.itemData?.id,
					text: tt('phrases.create_item_first'),
				},
			},
			{
				title: 'Multi View',
				prop: 'multiViewTab',
				disabled: !props.itemData?.id,
				placement: 'top',
				popover: {
					disabled: !!props.itemData?.id,
					text: tt('phrases.create_item_first'),
				},
			},
		);
	}
	return Object.freeze(list);
});

const { activeTab, switchTab } = useTabs({ tabsList, hideTabsBar: true });
const { handleEvent } = useEventHandler({
	handleFormSubmitFinish: ({ success } = {}) => {
		handleFormSubmitFinish(!!success);
	},
}, emit);
const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	refsMap,
});

const commonItemsLoadings = computed(() => Object.freeze({
	formulasLoading: formulasLoading.value,
	banner_controllersLoading: bannerControllersLoading.value,
	ultrasound_controllersLoading: ultrasoundControllersLoading.value,
	ncd_controllersLoading: ncdControllersLoading.value,
	bearingsLoading: bearingsLoading.value,
	lubeTypesLoading: lubeTypesLoading.value,
	banner_subtypesLoading: bannerSubtypesLoading.value,
}));

const extractItemsList = (response) => response?.value || response?.data?.data || response?.data || response || [];
const activePlantId = computed(
	() => globalStore.navbarSettings?.showPlantName?.id || globalStore.globalFilters?.plantId,
);
const controllersParams = (type) => ({
	type,
	max: -1,
	plantId: activePlantId.value,
});

const fetchCommonList = (target, loading, request) => {
	if (target.value.length || loading.value) return Promise.resolve();

	loading.value = true;
	return request()
		.then((response) => {
			target.value = extractItemsList(response);
		})
		.finally(() => {
			loading.value = false;
		});
};

const fetchPdmCommonLists = () => Promise.all([
	fetchCommonList(formulasList, formulasLoading, () => fetchDatasetFormulas()),
	fetchCommonList(bannerControllersList, bannerControllersLoading, () =>
		createGetRequest(ENTITIES.Controllers.apiBase)({ params: controllersParams(SENSOR_TYPES.BANNER) }),
	),
	fetchCommonList(ultrasoundControllersList, ultrasoundControllersLoading, () =>
		createGetRequest(ENTITIES.Controllers.apiBase)({ params: controllersParams(SENSOR_TYPES.ULTRA_SOUND) }),
	),
	fetchCommonList(ncdControllersList, ncdControllersLoading, () =>
		createGetRequest(ENTITIES.Controllers.apiBase)({ params: controllersParams(SENSOR_TYPES.NCD) }),
	),
	fetchCommonList(bearingsList, bearingsLoading, () =>
		createGetRequest(ENTITIES.Bearings.apiBase)({ params: { max: -1 } }),
	),
	fetchCommonList(lubeTypesList, lubeTypesLoading, () =>
		createGetRequest(ENTITIES.LubeTypes.apiBase)({ params: { max: -1 } }),
	),
	fetchCommonList(bannerSubtypesList, bannerSubtypesLoading, () =>
		createGetRequest(ENTITIES.BannerV2Subtypes.apiBase)({ params: { max: -1 } }),
	),
]);

const fetchMultiViews = (equipmentId) => {
	if (!equipmentId) return Promise.resolve();

	multiViewsLoading.value = true;
	return createGetRequest(`/equipments/${equipmentId}/metric-multi-views`)({
		params: { max: -1, orderByColumn: 'name', orderByMethod: 'asc' },
	})
		.then(({ value }) => {
			multiViewsList.value = value || [];
		})
		.finally(() => {
			multiViewsLoading.value = false;
		});
};

const removeSensorItem = ({ sensorId, isNew }) => {
	if (isNew) {
		removeFormItem(sensorId, sensorFormsList);
		return;
	}

	ElMessageBox.confirm(
		`${tt('aliases.del_sensor')}. ${tt('Continue')}?`,
		{
			confirmButtonText: tt('Remove'),
			cancelButtonText: tt('Cancel'),
			type: 'warning',
		},
	)
		.then(() => {
			emit('event', { eventName: 'toggleSaving', data: true, onward: true });
			return detachSensor({ sensorId })
				.finally(() => {
					emit('event', { eventName: 'toggleSaving', data: false, onward: true });
				});
		})
		.then(() => {
			removeFormItem(sensorId, sensorFormsList);
			globalStore.set_global_state({
				stateProp: 'updateItemsList',
				value: { key: 'equipmentsList', val: true },
			});
		})
		.catch(() => {});
};

const handleValidationResult = (validationResults, options = {}) => {
	if (!validationResults.every((item) => item)) {
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('phrases.Please_check_fields_errors_first'),
		});
		return false;
	}

	resetFormDataBySubItems(subItemsSettings);
	const {
		equipmentSubmitPayload,
		multiViewsItems = [],
	} = collectDataFromSubItems(subItemsSettings, options);

	formsCount.value = 1 + sensorFormsList.value.length;

	submitEquipment(equipmentSubmitPayload);
	
	if (props.itemData?.id) {
		formsCount.value += 1; // multiViews
		submitMultiViews(multiViewsItems);
	}

	return true;
};

const handleFormSubmitFinish = (success) => {
	if (!formsCount.value) return;

	formSubmitFinishCount.value += 1;
	if (success) {
		formSubmitSuccessCount.value += 1;
	}

	if (formSubmitFinishCount.value < formsCount.value) return;

	emit('event', { eventName: 'toggleSaving', data: false, onward: true });

	if (formSubmitSuccessCount.value >= formsCount.value) {
		globalStore.set_global_state({
			stateProp: 'updateItemsList',
			value: { key: 'equipmentsList', val: true },
		});
		emit('event', {
			eventName: 'successModalSubmit',
			data: true,
			onward: true,
		});
	}

	formsCount.value = 0;
};

// -----------------------
const submitEquipment = (equipmentSubmitPayload = {}) => {
	const {
		equipmentForm,
		withFile,
		desiredId,
		className,
	} = equipmentSubmitPayload;
	const itemId = equipmentForm?.id;
	const method = itemId ? 'put' : 'post';
	const url = itemId ? `${ENTITIES.Equipments.apiBase}/${itemId}` : ENTITIES.Equipments.apiBase;

	const payload = {
		data: equipmentForm,
		withFile,
		itemName: 'Item',
	};

	if (payload) {
		console.log('payload equipment', payload.data)
		return
	}

	emit('event', { eventName: 'toggleSaving', data: true, onward: true });

	api_request[method](url, payload)
		.then((answer) => {
			if (desiredId) {
				return api_request.post(`${ENTITIES.Equipments.apiBase}/reorder`, {
					notNotify: true,
					data: {
						currentId: equipmentForm.id,
						desiredId,
						className,
					},
				}).then(() => answer);
			}
			handleFormSubmitFinish(true);
			return answer;
		})
		.catch(() => {
			handleFormSubmitFinish(false);
		});
};

const submitMultiViews = (multiViewsItems) => {
	if (!props.itemData?.id) return;

	const payload = {
		data: { data: multiViewsItems || [] },
		equipmentId: props.itemData.id,
		itemName: 'Multi Views',
	};

	if (process.env.NODE_ENV === 'development') {
		console.log('multiviews', multiViewsItems);
		return;
	}

	emit('event', { eventName: 'toggleSaving', data: true, onward: true });

	api_request.post(`/equipments/${props.itemData.id}/metric-multi-views`, payload)
		.then(() => {
			handleFormSubmitFinish(true);
		})
		.catch(() => {
			handleFormSubmitFinish(false);
		});
};

const validateForm = async (options = {}) => {
	formSubmitFinishCount.value = 0;
	formSubmitSuccessCount.value = 0;
	formsCount.value = 0;

	return handleValidationResult([
		await validateSubItemsForm(subItemsSettings),
	], options);
};

watch(
	() => [props.itemData?.id, activeTab.value?.prop],
	([equipmentId, activeProp]) => {
		if (equipmentId && activeProp === 'pdmTab') {
			fetchPdmCommonLists();
		}
	},
	{ immediate: true },
);

watch(
	() => props.itemData?.id,
	(id) => {
		if (id) {
			fetchMultiViews(id);
			return;
		}
		multiViewsList.value = [];
		multiViewFormsList.value = [];
		sensorFormsList.value = [];
	},
	{ immediate: true },
);

watch(
	() => props.itemData?.dashboardSensors,
	(sensors) => {
		sensorFormsList.value = setupFormSubItemsList(sensors || [], 's_i');
	},
	{ immediate: true },
);

watch(multiViewsList, (list) => {
	multiViewFormsList.value = setupFormSubItemsList(list, 'mv_i');
});

defineExpose({ validateForm });
</script>
