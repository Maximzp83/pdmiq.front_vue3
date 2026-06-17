<template>
	<div class="sensor-form-item content-row">
		<VueElementLoadingWrapper :isSaving="!!sensorSaving" :itemsName="itemsName.one" />

		<div v-if="isNew" class="section-row edit-form-container">
			<div class="el-form-item flex align-center inline-form-row">
				<div class="el-form-item__label">{{ tt('phrases.Existing_sensors') }}</div>
				<div class="el-form-item__content">
					<FetchByQuerySelect
						v-model="sensorId"
						clearable
						enableLoadmore
						:optionsLoading="sensorsLoading"
						:optionsList="sensorsList"
						:settings="sensorQueryOptions"
						:placeholder="`${tt('select')} ${tt('sensor')}`"
						:setupLabelMethod="setupSensorLabelMethod"
						@update:optionsLoading="sensorsLoading = $event"
						@update:optionsList="sensorsList = $event"
					/>
				</div>
			</div>
		</div>

		<div class="section-row sensor-tabsbar card-tabs">
			<TabsBar
				card
				:activeTab="activeTab"
				:tabsList="tabsList"
				:disableTabs="disableTabs"
				buttonsType="info"
				buttonsClass="inverted"
				@switchTab="switchTab"
			/>
		</div>

		<div class="section-row content-row flex">
			<div class="article-title bold">{{ `${tt('Sensor')} ${sensorTitle}` }}</div>
			<el-button
				v-if="canRemove"
				class="ml-auto action-button remove-button"
				size="small"
				type="danger"
				@click="removeItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>

		<div v-if="activeTab?.prop === 'bannerTab'" class="tab-container content-row">
			<ItemForm
				:ref="(el) => setSubItemRef('ItemFormComponent', el, 0)"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				:formulasList="formulasList"
				:controllersList="banner_controllersList"
				:bannerSubtypesList="banner_subtypesList"
				:ultrasound_controllersList="ultrasound_controllersList"
				:lubeTypesList="lubeTypesList"
				:bearingsList="bearingsList"
				:commonItemsLoadings="commonItemsLoadings"
				@event="handleEvent"
				@submit="emit('submit', $event)"
			/>
		</div>

		<div v-if="activeTab?.prop === 'ultrasoundTab'" class="tab-container section-row">
			<ItemFormUltraSound
				:ref="(el) => setSubItemRef('ItemFormComponent', el, 0)"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				:formulasList="formulasList"
				:bearingsList="bearingsList"
				:lubeTypesList="lubeTypesList"
				:controllersList="ultrasound_controllersList"
				:commonItemsLoadings="commonItemsLoadings"
				@event="handleEvent"
				@submit="emit('submit', $event)"
			/>
		</div>

		<div v-if="activeTab?.prop === 'NCDTab'" class="tab-container content-row">
			<ItemFormNCD
				:ref="(el) => setSubItemRef('ItemFormComponent', el, 0)"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				:formulasList="formulasList"
				:controllersList="ncd_controllersList"
				:commonItemsLoadings="commonItemsLoadings"
				@event="handleEvent"
				@submit="emit('submit', $event)"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { DATASET, SENSOR_TYPES } from '@/constants/global';
import { LUBE_VERSIONS } from '@/constants/ultrasound';
import { findItemBy, setupLabel } from '@/helpers';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNotify } from '@/composables/useNotify';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useTabs } from '@/composables/mixins/useTabs';
import { useAuthStore } from '@/stores/AuthStore';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import TabsBar from '@/components/common/TabsBar.vue';
import ItemForm from './ItemForm.vue';
import ItemFormUltraSound from './ItemFormUltraSound.vue';
import ItemFormNCD from './ItemFormNCD.vue';

const { tt } = Lang;

defineOptions({
	name: 'SensorFormWrapper',
});

const props = defineProps({
	fromModal: Boolean,
	itemData: { type: Object, default: () => ({}) },
	equipmentData: { type: Object, default: () => ({}) },
	hasAccessToCreate: Boolean,
	formulasList: { type: Array, default: () => [] },
	bearingsList: { type: Array, default: () => [] },
	lubeTypesList: { type: Array, default: () => [] },
	banner_controllersList: { type: Array, default: () => [] },
	ultrasound_controllersList: { type: Array, default: () => [] },
	ncd_controllersList: { type: Array, default: () => [] },
	banner_subtypesList: { type: Array, default: () => [] },
	commonItemsLoadings: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['submit', 'event', 'onRemove']);

const authStore = useAuthStore();
const { Notify } = useNotify();
const refsMap = ref({});
const sensorSaving = ref(false);
const sensorId = ref(null);
const sensorsList = ref([]);
const sensorsLoading = ref(false);
const disableTabs = ref(false);
const subItemsSettings = Object.freeze([
	{ ref: 'ItemFormComponent', submitInSubItem: true },
]);
const { setSubItemRef, validateSubItemsForm, collectDataFromSubItems } = useSubItemsList({
	refsMap,
});

const isNew = computed(() => !!props.itemData?.new);
const selectedSensorData = computed(() => {
	if (isNew.value) {
		if (sensorId.value && sensorsList.value.length) {
			return findItemBy('id', sensorId.value, sensorsList.value);
		}
		return undefined;
	}

	return props.itemData?.id ? Object.freeze(props.itemData) : undefined;
});
const sensorTitle = computed(() => (isNew.value ? tt('New') : props.itemData?.asset_numbers || ''));
const itemsName = computed(() => ({ one: tt('Sensor'), mult: tt('Sensors') }));
const sensorQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: createGetRequest(ENTITIES.Sensors.apiBase),
		fetchByIdAction: createGetByIdRequest(ENTITIES.Sensors.apiBase),
		params: { max: 100, withoutEquipments: true },
	}),
);
const sensorLabelOptions = Object.freeze({
	accessors: ['asset_numbers', 'data_set', 'controller.name', 'port_number'],
	useGetItemValue: [{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }],
	delimeter: ',',
});
const tabsList = computed(() =>
	Object.freeze([
		{ title: 'banner', prop: 'bannerTab', item_type: SENSOR_TYPES.BANNER },
		{ title: 'ultraSound', prop: 'ultrasoundTab', item_type: SENSOR_TYPES.ULTRA_SOUND },
		{ title: `NCD ${tt('Sensor')}`, prop: 'NCDTab', item_type: SENSOR_TYPES.NCD },
	]),
);

const initialTab = computed(() => {
	const type =
		props.itemData?.lube_version === LUBE_VERSIONS.V3
			? SENSOR_TYPES.BANNER
			: props.itemData?.type || SENSOR_TYPES.BANNER;
	return findItemBy('item_type', type, tabsList.value) || tabsList.value[0];
});

const { activeTab, switchTab } = useTabs({
	tabsList,
	initialTab: initialTab.value,
});

const canRemove = computed(
	() =>
		authStore.hasAccessTo(['delete_dashboard']) &&
		(activeTab.value?.prop !== 'NCDTab' || isNew.value || props.itemData?.is_archived),
);

const removeItem = () => {
	emit('onRemove', { sensorId: props.itemData?.id, isNew: isNew.value });
};

const setupSensorLabelMethod = (sensor) => {
	const { data_set, device_address_id, controller, fft_sensor_id } = sensor || {};

	if (data_set === DATASET.BANNER_TEMP_VIBE_V2 || data_set === DATASET.BANNER_V2_GENERIC) {
		return `${controller?.name || ''}, D${device_address_id}, S${fft_sensor_id}`;
	}
	return setupLabel(sensor, sensorLabelOptions);
};


const validateItemForm = async () => {
	if (!props.hasAccessToCreate) {
		Notify({
			type: 'warning',
			title: tt('phrases.restricted_actions'),
			message: `${tt('phrases.you_do_not_have_permissions_to_save')} ${tt('sensors')}`,
		});
		return false;
	}

	return validateSubItemsForm(subItemsSettings);
};

const submitItemForm = () => {
	collectDataFromSubItems(subItemsSettings);
};

const { handleEvent } = useEventHandler({
	handleFormSubmitFinish: ({ isLoading, success } = {}) => {
		sensorSaving.value = isLoading;
		emit('event', {
			eventName: 'handleFormSubmitFinish',
			data: { isLoading, success },
			onward: true,
		});
	},
});

watch(
	() => props.itemData,
	(sensor) => {
		if (!sensor?.id) {
			disableTabs.value = false;
			return;
		}

		const type =
			sensor.lube_version === LUBE_VERSIONS.V3 ? SENSOR_TYPES.BANNER : sensor.type;
		const tab = findItemBy('item_type', type, tabsList.value);
		if (tab) {
			activeTab.value = tab;
			disableTabs.value = true;
		}
	},
	{ immediate: true },
);

watch(selectedSensorData, (sensor) => {
	if (!sensor?.id) return;

	const type = sensor.lube_version === LUBE_VERSIONS.V3 ? SENSOR_TYPES.BANNER : sensor.type;
	const tab = findItemBy('item_type', type, tabsList.value);
	if (tab) {
		activeTab.value = tab;
	}
});

defineExpose({
	validateItemForm,
	submitItemForm,
});
</script>
