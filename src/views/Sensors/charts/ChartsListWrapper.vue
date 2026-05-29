<template>
	<div>
		<div class="charts-data-container">
			<ChartsPreloader
				:showMock="!chartsListWrapperLoading && chartsListWrapperReady && !hasStatistics"
				:showPreloader="chartsListWrapperReady && (chartsListWrapperLoading || overlayChartsListWrapperLoading) && !hasStatistics"
			/>

			<div class="charts-list" v-show="!(chartsListWrapperReady && !hasStatistics)">
				<div
					v-for="(chart, idx) in chartsList"
					:key="`chart-${chart.chart_id}_idx-${idx}`"
					class="chart-container-wrapper content-row"
				>
					<ChartItemContainer
						:key="updateChartsList"
						:ref="(el) => setChartRef(chart.chart_id, el)"
						:ChartInstance="chart"
						:rootFilters="rootFilters"
						:sensorData="sensorData"
						:additionalProps="additionalProps"
						:currentSensorType="currentSensorType"
						:forceLoading="overlayChartsListWrapperLoading"
						:chartsListWrapperReadyCounter="chartsListWrapperReadyCounter"
						@event="handleEvent"
					/>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="editThresholdsByStagesEnabled"
			v-model="unsavedThresholdsDialogOpen"
			append-to-body
			center
			class="small dialog-decorate-header thresholds-update-dialog"
			:title="tt('phrases.Unsaved_Thresholds')"
		>
			<UpdateThresholdsDialog
				:redirectTo="redirectTo"
				@event="handleEvent"
				@onClose="unsavedThresholdsDialogOpen = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { getValues } from '@/helpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useSensorsStore } from '@/stores/SensorsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { executeChartsListFactory } from '@/modules/charts_factory/index.js';

import ChartsPreloader from '@/components/charts/ChartsPreloader.vue';
import ChartItemContainer from './ChartItemContainer.vue';
import UpdateThresholdsDialog from './UpdateThresholdsDialog.vue';

const { tt } = Lang;

defineOptions({
	name: 'ChartsListWrapper',
});

const props = defineProps({
	rootFilters: { type: Object, default: () => ({}) },
	sensorData: { type: Object, required: true },
	linespeedOverlaySensorData: { type: Object, default: null },
	rpmOverlayData: { type: Object, default: null },
	joinChartsBy: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	injectToChartOptions: { type: Object, default: () => ({}) },
	activeAxis: null,
	enableAxisSelector: Boolean,
	getParamsByIds: { type: Array, default: () => [] },
	oneChartOnly: Boolean,
	chartsContainerIdx: Number,
	additionalChartPayload: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);
const sensorsStore = useSensorsStore();
const globalStore = useGlobalStore();
const { charts_filters: yFilters } = storeToRefs(sensorsStore);
const { redirectTo } = storeToRefs(globalStore);

const hasStatistics = ref(false);
const chartsListWrapperReady = ref(false);
const chartsListWrapperReadyCounter = ref(0);
const chartsListWrapperLoading = ref(false);
const overlayChartsListWrapperLoading = ref(false);
const updateChartsList = ref(0);
const chartsListInstancesInitialBuild = ref(true);
const unsavedThresholdsDialogOpen = ref(false);
const isRedirected = ref(false);
const chartRefs = ref({});

const { currentSensorType, currentChartSettingsKey, getType, getChartSettingsKey } = useSensorType({
	currentSensorTypeData: computed(() => props.sensorData),
});

const chartsListInstanceEventsList = computed(() => {
	const events = {
		chartsListWrapperReady: (hasStats) => {
			hasStatistics.value = hasStats;
			chartsListWrapperReady.value = true;
			chartsListWrapperReadyCounter.value += 1;
		},
		chartsListWrapperLoading: (value) => {
			chartsListWrapperLoading.value = value;
		},
	};

	if (!props.oneChartOnly) {
		events.changeChartsListWrappersReadyCounter = handleChangeChartsListWrappersReadyCounter;
	}

	return Object.freeze(events);
});

const chartsListInstance = computed(() =>
	executeChartsListFactory('sensorChartsListFactory', {
		settings: {
			events: chartsListInstanceEventsList.value,
			settings_payload: {
				chartDataReadySettings: { useFirstStatisticsItemForAll: true },
				inject_options: props.injectToChartOptions,
			},
			setupChartsConfigsListSettings: {},
		},
		payload_1: {
			sensorType: currentChartSettingsKey.value,
			sensorItem: props.sensorData,
			currentSensorType: currentSensorType.value,
			enableAxisSelector: props.enableAxisSelector,
			editThresholdsByStagesEnabled: editThresholdsByStagesEnabled.value,
			oneChartOnly: props.oneChartOnly,
		},
	}),
);

const chartsList = computed(() => updateChartsList.value ? chartsListInstance.value.getCharts() : []);
const chartsConfigsFullList = computed(() =>
	chartsListInstancesInitialBuild.value ? [] : chartsListInstance.value.chartsConfigsFullList,
);
const editThresholdsByStagesEnabled = computed(() => {
	const type = currentSensorType.value;
	return Boolean(
		type.isBanner ||
		type.isBannerCM1L ||
		type.isNCDTempVibe ||
		type.isNCDWiredTempVibe ||
		type.isNCDTempVibeCurr ||
		type.isBannerTempVibe2 ||
		type.isBannerV2_1 ||
		type.isBannerM25
	);
});
const buildChartsSettings = computed(() => {
	const settings = {
		chartFactoryName: 'SensorChart',
		setupChartsConfigsListSettings: {
			configsKey: 'sensorChartsListsConfig',
			chartKey: currentChartSettingsKey.value,
			joinChartsBy: props.joinChartsBy,
			getParamsByIds: props.getParamsByIds,
			filterParamsBy: [],
		},
	};

	if (props.oneChartOnly) {
		if (props.getParamsByIds.length > 1) {
			settings.setupChartsConfigsListSettings.getParamsByIdsFilterMethod = 'every';
		} else {
			settings.setupChartsConfigsListSettings.filterParamsBy.push({
				prop: 'skipTitle',
				method: '==',
				value: null,
			});
		}
	}

	if (
		props.enableAxisSelector &&
		props.joinChartsBy.prop !== 'axis' &&
		props.joinChartsBy.prop !== 'type' &&
		props.activeAxis
	) {
		if (props.sensorData.is_hidden_ncd_active_vertical_axis) {
			settings.setupChartsConfigsListSettings.filterParamsBy.push({
				prop: 'axis_id',
				method: '!=',
				value: props.sensorData.ncd_active_vertical_axis,
			});
		}
		if (props.joinChartsBy.prop) {
			settings.setupChartsConfigsListSettings.filterParamsBy.push({
				prop: 'axis_id',
				value: props.activeAxis,
				exceptCharts: ['displacement'],
				skipWithoutProp: true,
			});
		}
	}

	if (currentSensorType.value.isNCDEnv && props.sensorData.is_iaq_disabled) {
		settings.setupChartsConfigsListSettings.filterParamsBy.push({
			prop: 'type',
			value: 'iaq',
			method: '!=',
		});
	}

	if (currentSensorType.value.isBannerV2_1) {
		settings.parseChartsConfigsListForDuplicates = true;
	}

	return Object.freeze(settings);
});

const setChartRef = (chartId, el) => {
	if (el) chartRefs.value[chartId] = el;
};

const buildCharts = ({ settings, payload } = {}) => {
	chartsListInstance.value.buildCharts({
		settings,
		payload_1: { ...(payload || {}), ...props.additionalChartPayload },
		filters: { ...props.rootFilters },
		y_filters: { ...yFilters.value },
	});

	if (chartsListInstancesInitialBuild.value) {
		chartsListInstancesInitialBuild.value = false;
	}

	updateChartsList.value += 1;

	if (props.rpmOverlayData?.is_rpm_visible && props.rpmOverlayData.rpm_value) {
		setupOverlayPlotlines(props.rpmOverlayData.rpm_value);
	}

	if (window.location.origin === 'http://localhost:8080') {
		window[`ChartsListInstance_${props.chartsContainerIdx}`] = chartsListInstance.value;
	}
};

const setupOverlayPlotlines = (rpmValue) => {
	callMethodInAllCharts({
		ids: getValues('chart_id', chartsListInstance.value.getCharts()),
		methodName: 'setupOverlayPlotlines',
		payload: rpmValue,
		fromInstance: true,
	});
};

const reloadChart = (ids, settings = {}) => {
	chartsListInstance.value.reloadCharts(ids, settings);
};

const handleChangeChartsListWrappersReadyCounter = (value, payload) => {
	emit('event', {
		eventName: 'handleChangeChartsListWrappersReadyCounter',
		data: { val: value, payload },
		onward: true,
	});
};

const callMethodInAllCharts = ({ methodName, fromInstance, payload, ids }) => {
	chartsList.value.forEach((Chart) => {
		const shouldCall = ids ? ids.includes(Chart.chart_id) : true;
		if (!shouldCall) return;
		if (fromInstance) {
			Chart[methodName]?.(payload);
		} else {
			chartRefs.value[Chart.chart_id]?.[methodName]?.(payload);
		}
	});
};

const checkUnsavedThresholds = ({ to } = {}) => {
	globalStore.set_value?.('redirectTo', to?.path);
	const hasUnsavedThresholds = chartsList.value.some((Chart) => Object.keys(Chart.updateThresholdsData || {}).length);
	if (hasUnsavedThresholds) {
		unsavedThresholdsDialogOpen.value = true;
	}
	return !hasUnsavedThresholds;
};

const handleRedirectTo = (to) => {
	if (!isRedirected.value) {
		isRedirected.value = true;
		emit('event', {
			eventName: 'handleRedirectTo',
			data: to,
			onward: true,
		});
	}
};

const { handleEvent } = useEventHandler({
	handleRedirectTo,
}, emit);

watch(buildChartsSettings, (settings) => {
	buildCharts({ settings });
});

watch(() => props.rootFilters, () => {
	chartsListInstance.value.setFiltersToCharts?.({ ...props.rootFilters });
});

onMounted(() => {
	buildCharts({ settings: buildChartsSettings.value });
});

onBeforeUnmount(() => {
	chartsListInstance.value?.destroyCharts?.();
});

defineExpose({
	chartsList,
	chartsConfigsFullList,
	chartsListInstance,
	buildCharts,
	reloadChart,
	callMethodInAllCharts,
	checkUnsavedThresholds,
	getType,
	getChartSettingsKey,
});
</script>
