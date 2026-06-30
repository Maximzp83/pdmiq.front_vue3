<template>
	<div :class="['sensor-alarms-charts-wrapper content-row relative', { 'drag-n-drop-item': additionalProps.enableDragNDrop }]">
		<div v-if="additionalProps.enableDragNDrop" class="dark-overlay">
			<div class="reorder-caption">
				<i class="icomoon icon-move-arrows"></i>
			</div>
		</div>

		<div class="card">
			<div v-if="sensorData" class="card-header flex mrow wrap align-center">
				<div class="mcol-xs-2 mcol-lg-1">
					<EquipmentPictureBlock :equipmentData="equipmentData" @event="(payload) => emit('event', payload)" />
				</div>

				<div class="mcol-xs-8 mcol-sm-6 mcol-lg-8">
					<div class="title article-title" v-html="sensorTitle"></div>
				</div>

				<div v-if="additionalProps.showDatePicker" class="ml-auto mcol-xs-auto">
					<Datepicker v-model="daterange" setupDaterangeFilter enableShortcuts type="daterange" />
				</div>
			</div>
		</div>

		<div class="charts-data-container">
			<div class="charts-list">
				<div
					v-for="(chart, idx) in chartsList"
					:key="`chart-${chart.chart_id}_idx-${idx}`"
					class="chart-container-wrapper content-row"
				>
					<SensorAlarmsChartItemContainer
						ref="chartItemRefs"
						:key="updateChartsList"
						:ChartInstance="chart"
						:rootFilters="newFilters"
						:sensorData="sensorData"
						:additionalProps="additionalProps"
						:currentSensorType="currentSensorType"
						@event="(payload) => emit('event', payload)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { executeChartsListFactory } from '@/modules/charts_factory/index.js';
import { getSensorTitle } from '@/helpers/specialHelpers';
import { useSensorType } from '@/composables/mixins/useSensorType';
import Datepicker from '@/components/common/Datepicker.vue';
import EquipmentPictureBlock from '@/views/Sensors/charts/EquipmentPictureBlock.vue';
import SensorAlarmsChartItemContainer from './SensorAlarmsChartItemContainer.vue';

defineOptions({ name: 'SuccessDashboardSensorAlarmsChartsListWrapper' });

const props = defineProps({
	rootFilters: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	injectToChartOptions: { type: Object, default: () => ({}) },
	chartsContainerIdx: null,
	alarmItem: { type: Object, required: true },
});
const emit = defineEmits(['event']);

const updateChartsList = ref(0);
const chartsListInstancesInitialBuild = ref(true);
const hasStatistics = ref(false);
const chartsListWrapperReady = ref(false);
const chartsListWrapperLoading = ref(false);
const daterange = ref([]);
const chartItemRefs = ref([]);

const sensorData = computed(() => props.alarmItem.sensorData);
const { currentSensorType, currentChartSettingsKey } = useSensorType({ currentSensorTypeData: sensorData });
const equipmentData = computed(() => sensorData.value?.equipment || null);
const sensorTitle = computed(() => sensorData.value ? getSensorTitle(sensorData.value, { boldLabels: true }) : '');
const newFilters = computed(() => ({
	...props.rootFilters,
	daterange: daterange.value,
	daterange_setted_at: Date.now(),
}));
const chartsListInstanceEventsList = computed(() =>
	Object.freeze({
		chartsListWrapperReady: (value) => {
			hasStatistics.value = value;
			chartsListWrapperReady.value = true;
		},
		chartsListWrapperLoading: (value) => {
			chartsListWrapperLoading.value = value;
		},
	}),
);
const ChartsListInstance = computed(() =>
	executeChartsListFactory('sensorAlarmsChartsListFactory', {
		settings: {
			events: chartsListInstanceEventsList.value,
			settings_payload: {
				inject_options: {
					navigator: { enabled: false },
					...(props.injectToChartOptions || {}),
				},
			},
		},
		payload_1: {
			sensorType: currentChartSettingsKey.value,
			sensorItem: sensorData.value,
			alarmItem: props.alarmItem,
			currentSensorType: currentSensorType.value,
			enableDescriptionForm: props.additionalProps.enableDescriptionForm,
			enableAnnotations: props.additionalProps.enableAnnotations,
		},
	}),
);
const buildChartsSettings = computed(() =>
	Object.freeze({
		chartFactoryName: 'SensorAlarmsChart',
		setupChartsConfigsListSettings: {
			configsKey: 'sensorChartsListsConfig',
			chartKey: currentChartSettingsKey.value,
			getParamsByIds: props.alarmItem.parameters,
		},
	}),
);
const canBuildCharts = computed(() => Boolean(
	currentChartSettingsKey.value &&
	props.alarmItem.parameters?.length,
));
const chartsList = computed(() => updateChartsList.value ? ChartsListInstance.value.getCharts() : []);

const buildCharts = ({ settings, payload } = {}) => {
	if (!canBuildCharts.value) return;

	ChartsListInstance.value.buildCharts({
		settings,
		payload_1: { ...(payload || {}) },
		filters: { ...props.rootFilters },
	});

	if (chartsListInstancesInitialBuild.value) {
		chartsListInstancesInitialBuild.value = false;
	}

	updateChartsList.value += 1;
};
const setupDaterange = (graph) => {
	if (daterange.value.length) return;
	if (graph.date_start && graph.date_finish) {
		daterange.value = [graph.date_start, graph.date_finish];
	} else if (props.rootFilters.daterange) {
		daterange.value = props.rootFilters.daterange;
	}
};
const getSensorsAlarmsChartsForms = () => ChartsListInstance.value.getSensorsAlarmsChartsForms();

watch(buildChartsSettings, (settings) => {
	buildCharts({ settings });
});

onMounted(() => {
	props.alarmItem.sensorGraphsGroup?.forEach(setupDaterange);
	buildCharts({ settings: buildChartsSettings.value });
});

defineExpose({ getSensorsAlarmsChartsForms });
</script>
