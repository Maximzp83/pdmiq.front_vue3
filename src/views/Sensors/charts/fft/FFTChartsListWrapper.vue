<template>
	<div class="block-item statistics-block">
		<div class="relative">
			<div class="charts-data-container">
				<div
					v-if="!chartsListWrapperLoading && chartsListWrapperReady && !hasStatistics && !someChartsIsHidden"
					class="text-center"
				>
					{{ tt('phrases.FFT_data_is_not_valid') }}
				</div>

				<div
					class="charts-list"
					v-show="!(!chartsListWrapperLoading && chartsListWrapperReady && !hasStatistics && !someChartsIsHidden)"
				>
					<div
						v-for="(chart, idx) in chartsList"
						:key="`chart-${chart.chart_id}_idx-${idx}`"
						class="chart-container-wrapper content-row"
					>
						<FFTChartItemContainer
							:ref="(el) => setChartRef(chart.chart_id, el)"
							:ChartInstance="chart"
							:rootFilters="rootFilters"
							:sensorData="sensorData"
							:additionalProps="additionalProps"
							:prevFFTItems="prevFFTItems"
							:currentFFTItem="currentFFTItem"
							:activeAxis="activeAxis"
							@event="handleEvent"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { executeChartsListFactory } from '@/modules/charts_factory/index.js';
import { BANNER_REQUEST_TYPES } from '@/constants/global';

import FFTChartItemContainer from './FFTChartItemContainer.vue';

const { tt } = Lang;

defineOptions({
	name: 'FFTChartsListWrapper',
});

const props = defineProps({
	rootFilters: { type: Object, default: () => ({}) },
	sensorData: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	activeAxis: Number,
	enableAxisSelector: Boolean,
	sensorId: Number,
	fftId: Number,
	measurement: Number,
	splitCharts: Boolean,
	prevFFTItems: { type: Array, default: () => [] },
	currentFFTItem: { type: Object, default: () => ({}) },
	getParamsByIds: { type: Array, default: () => [] },
});

const emit = defineEmits(['event']);
const updateChartsList = ref(0);
const chartsListInstancesInitialBuild = ref(true);
const hasStatistics = ref(false);
const chartsListWrapperReady = ref(false);
const chartsListWrapperLoading = ref(false);
const hiddenChartsMap = ref({});
const chartRefs = ref({});

const { currentSensorType, currentChartSettingsKey } = useSensorType({
	currentSensorTypeData: computed(() => props.sensorData),
});

const isRequestTypeEnvelope = computed(() =>
	props.currentFFTItem?.banner_request_type === BANNER_REQUEST_TYPES.ENVELOPE,
);
const joinChartsBy = computed(() => ({ prop: props.splitCharts ? '' : 'split' }));
const chartsListInstanceEventsList = computed(() => Object.freeze({
	chartsListWrapperReady: (hasStats) => {
		hasStatistics.value = hasStats;
		chartsListWrapperReady.value = true;
	},
	chartsListWrapperLoading: (value) => {
		chartsListWrapperLoading.value = value;
	},
}));
const isNCDSensor = computed(() =>
	currentSensorType.value.isNCDTempVibe ||
	currentSensorType.value.isNCDWiredTempVibe ||
	currentSensorType.value.isNCDTempVibeCurr,
);
const chartsListInstance = computed(() =>
	executeChartsListFactory('FFTChartsListFactory', {
		settings: {
			events: chartsListInstanceEventsList.value,
		},
		payload_1: {
			sensorType: currentChartSettingsKey.value,
			sensorItem: props.sensorData,
			currentSensorType: currentSensorType.value,
		},
	}),
);
const buildChartsSettings = computed(() => {
	const settings = {
		chartFactoryName: 'FFTChart',
		setupChartsConfigsListSettings: {
			configsKey: 'FFTChartsListsConfig',
			chartKey: 'fft',
			joinChartsBy: joinChartsBy.value,
			getParamsByIds: props.getParamsByIds,
			filterParamsBy: [],
		},
	};

	if (isRequestTypeEnvelope.value) {
		settings.setupChartsConfigsListSettings.filterParamsBy.push({
			prop: 'type',
			method: '!=',
			value: 'velocity',
		});
	}

	if (!isNCDSensor.value) {
		settings.setupChartsConfigsListSettings.filterParamsBy.push({
			prop: 'type',
			method: '!=',
			value: 'transformed_acceleration',
		});
	}

	if (!props.splitCharts && props.activeAxis) {
		if (props.sensorData.is_hidden_ncd_active_vertical_axis) {
			settings.setupChartsConfigsListSettings.filterParamsBy.push({
				prop: 'axis_id',
				method: '!=',
				value: props.sensorData.ncd_active_vertical_axis,
			});
		}
		if (joinChartsBy.value.prop) {
			settings.setupChartsConfigsListSettings.filterParamsBy.push({
				prop: 'axis_id',
				value: props.activeAxis,
			});
		}
	}

	return Object.freeze(settings);
});
const chartsList = computed(() => updateChartsList.value ? chartsListInstance.value.getCharts() : []);
const someChartsIsHidden = computed(() => chartsList.value.some((chart) => hiddenChartsMap.value[chart.chart_id]));

const setChartRef = (chartId, el) => {
	if (el) chartRefs.value[chartId] = el;
};

const handleChartVisibilityChange = ({ chartId, isHidden }) => {
	if (chartId === undefined) return;
	hiddenChartsMap.value = {
		...hiddenChartsMap.value,
		[chartId]: isHidden,
	};
};

const callChartsMethod = (payload) => {
	chartsListInstance.value?.callChartsMethod(payload);
};

const buildCharts = ({ settings, payload } = {}) => {
	chartsListInstance.value.buildCharts({
		settings,
		payload_1: {
			...(payload || {}),
			fftId: props.fftId,
			isRequestTypeEnvelope: isRequestTypeEnvelope.value,
		},
		filters: { ...props.rootFilters },
	});

	if (chartsListInstancesInitialBuild.value) {
		chartsListInstancesInitialBuild.value = false;
	}

	updateChartsList.value += 1;
	const nextHiddenChartsMap = {};
	chartsList.value.forEach((chart) => {
		nextHiddenChartsMap[chart.chart_id] = hiddenChartsMap.value[chart.chart_id] || false;
	});
	hiddenChartsMap.value = nextHiddenChartsMap;

	if (import.meta.env.DEV) {
		window[`ChartsListInstance_0`] = chartsListInstance.value;
	}
};

const { handleEvent } = useEventHandler({
	handleChartVisibilityChange,
}, emit);

watch(buildChartsSettings, (settings) => {
	buildCharts({ settings });
});

onMounted(() => {
	buildCharts({ settings: buildChartsSettings.value });
});

defineExpose({
	chartsList,
	chartsListInstance,
	callChartsMethod,
	buildCharts,
});
</script>
