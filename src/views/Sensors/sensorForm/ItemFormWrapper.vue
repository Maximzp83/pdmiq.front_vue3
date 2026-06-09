<template>
	<div class="sensor-form-item content-row">
		<VueElementLoadingWrapper :isSaving="!!sensorSaving" :itemsName="itemsName.one" />

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
				ref="itemFormComponentRef"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				@event="handleEvent"
				@submit="emit('submit', $event)"
			/>
		</div>

		<div v-if="activeTab?.prop === 'ultrasoundTab'" class="tab-container section-row">
			<ItemFormUltraSound
				ref="itemFormComponentRef"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				@event="handleEvent"
				@submit="emit('submit', $event)"
			/>
		</div>

		<div v-if="activeTab?.prop === 'NCDTab'" class="tab-container content-row">
			<ItemFormNCD
				ref="itemFormComponentRef"
				:fromModal="fromModal"
				:equipmentData="equipmentData"
				:itemData="selectedSensorData"
				:itemsName="itemsName"
				:isNew="isNew"
				@event="handleEvent"
				@submit="emit('submit', $event)"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { SENSOR_TYPES } from '@/constants/global';
import { LUBE_VERSIONS } from '@/constants/ultrasound';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useTabs } from '@/composables/mixins/useTabs';
import { useAuthStore } from '@/stores/AuthStore';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
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
});

const emit = defineEmits(['submit', 'event', 'onRemove']);

const authStore = useAuthStore();
const itemFormComponentRef = ref(null);
const sensorSaving = ref(false);
const disableTabs = ref(false);

const isNew = computed(() => !!props.itemData?.new);
const selectedSensorData = computed(() => (props.itemData?.id ? Object.freeze(props.itemData) : undefined));
const sensorTitle = computed(() => (isNew.value ? tt('New') : props.itemData?.asset_numbers || ''));
const itemsName = computed(() => ({ one: tt('Sensor'), mult: tt('Sensors') }));
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

const validateItemForm = () => {
	if (!props.hasAccessToCreate && !authStore.hasAccessTo(['edit_dashboard'])) {
		return false;
	}

	itemFormComponentRef.value?.validateForm?.();
	return true;
};

const submitItemForm = () => {
	itemFormComponentRef.value?.validateForm?.();
};

const { handleEvent } = useEventHandler({
	handleFormSubmitFinish: ({ isLoading }) => {
		sensorSaving.value = isLoading;
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

defineExpose({
	validateItemForm,
	submitItemForm,
});
</script>
