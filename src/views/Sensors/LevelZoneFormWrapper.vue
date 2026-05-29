<template>
	<div class="edit-form-container">
		<div
			v-for="item in settings.parameters"
			:key="`parameter_type-${item.parameterItem.id}`"
			class="section-row"
		>
			<LevelZoneForm
				:ref="(el) => setLevelZoneFormRef(el)"
				:sensor="sensorData"
				:currentSensorType="currentSensorType"
				:isOffAlarm="settings.isOffAlarm"
				:parameterData="item"
				:metric_system_type="filters.measurement"
				:isNCDTempVibeSensor="isNCDTempVibeSensor"
				@submit="(formData) => submitLevelZone({ chartId: item.chart_id, formData })"
			/>
		</div>

		<div class="dialog-footer section-row text-center">
			<el-button
				class="uppercase"
				type="primary"
				:loading="levelZonesSaving"
				@click="validateForm"
			>
				{{ tt('SAVE') }}
			</el-button>
			<el-button class="uppercase" @click="closeDialog">{{ tt('Cancel') }}</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { useSensors } from '@/composables/useSensors';
import { useSensorsStore } from '@/stores/SensorsStore';

import LevelZoneForm from './LevelZoneForm.vue';

const { tt } = Lang;

defineOptions({
	name: 'LevelZoneFormWrapper',
});

const props = defineProps({
	sensorData: { type: Object, default: () => ({}) },
	currentSensorType: { type: Object, default: () => ({}) },
	settings: { type: Object, default: () => ({ parameters: [] }) },
});

const emit = defineEmits(['closeDialog', 'zoneUpdated']);

const sensorsStore = useSensorsStore();
const { statistics_filters: filters } = storeToRefs(sensorsStore);
const { saveSensorLevelZones } = useSensors();

const successCount = ref(0);
const levelZonesSaving = ref(false);
const levelZoneFormRefs = ref([]);

const isNCDTempVibeSensor = computed(() => {
	const currentSensorType = props.currentSensorType || {};
	return (
		currentSensorType.isNCDTempVibe ||
		currentSensorType.isNCDWiredTempVibe ||
		currentSensorType.isNCDTempVibeCurr
	);
});

const setLevelZoneFormRef = (el) => {
	if (el && !levelZoneFormRefs.value.includes(el)) {
		levelZoneFormRefs.value.push(el);
	}
};

const closeDialog = () => {
	emit('closeDialog');
};

const validateForm = () => {
	successCount.value = 0;
	levelZoneFormRefs.value.filter(Boolean).forEach((form) => {
		form.validateForm?.();
	});
};

const submitLevelZone = ({ chartId, formData }) => {
	levelZonesSaving.value = true;
	saveSensorLevelZones({
		sensorId: props.sensorData?.id,
		data: formData,
	})
		.then(() => {
			handleSuccess(chartId);
		})
		.catch((error) => {
			console.warn(error);
			levelZonesSaving.value = false;
		});
};

const handleSuccess = (chartId) => {
	successCount.value += 1;
	emit('zoneUpdated', chartId);

	if (successCount.value === props.settings.parameters.length) {
		closeDialog();
		levelZonesSaving.value = false;
	}
};
</script>
