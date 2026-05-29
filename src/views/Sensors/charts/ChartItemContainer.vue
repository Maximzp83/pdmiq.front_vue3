<template>
	<div class="card">
		<VueElementLoadingWrapper
			v-if="!disableAnimationAndSpinner"
			:isLoading="chartLoading || forceLoading"
			:itemsName="tt('chart')"
		/>

		<div
			v-if="!hideChartHeader"
			v-show="hasStatistics"
			class="card-header chart-card-header capitalize flex mrow wrap"
		>
			<div class="mcol-xs-10 mcol-sm-9 left-part fluid">
				<div class="flex mrow wrap align-center">
					<div class="title-block ellipsis" v-text="chartTitle"></div>

					<div v-if="enableZoomBlock && ChartAPI" class="zoom-block-container mcol-xs-9 mcol-sm-auto">
						<div class="chart-actions-block">
							<div class="flex wrap mrow">
								<ChartZoom
									class="mcol-xs-12 mcol-sm-auto"
									:ChartInstance="ChartInstance"
									:chartOptionsUpdate="chartOptionsUpdate"
									:chartIsInit="chartRendering"
									:showHistory="additionalProps.showHistory"
									@event="handleEvent"
								/>

								<ChartThresholdsOperations
									v-if="enableThresholdsOperations && additionalProps.accessToThresholds"
									class="mcol-xs-12 mcol-sm-auto"
									:ChartInstance="ChartInstance"
									:editPlotlines="editPlotlines"
									:disabledThresholdsEdit="disabledThresholdsEdit"
									:showCalculateThresholdsButton="showCalculateThresholdsButton"
									:isRebaseline="isRebaseline"
									:calculateThresholdsIsActive="calculateThresholdsIsActive"
									@event="handleEvent"
								/>
							</div>
						</div>
					</div>

					<div
						v-if="(enableLubeUnlockBlock || enableFFTUnlockBlock) && ChartAPI"
						class="zoom-block-container lube-blocked-container mcol-xs-9 mcol-sm-auto"
					>
						<div class="chart-actions-block">
							<div class="flex wrap mrow">
								<UnlockBlock
									v-if="enableLubeUnlockBlock"
									class="mcol-xs-12 mcol-sm-auto unlock-block"
									:popoverTitle="tt('phrases.Reset_lube')"
									:instanceLabel="tt('Luber')"
									:sensorData="sensorData"
									:chartOptionsUpdate="chartOptionsUpdate"
									:passedTimeValue="sensorData.lube_cycle_updated_at || sensorData.lube_shot_updated_at"
									@onUnlock="handleUnlockLube"
								/>

								<UnlockBlock
									v-if="enableFFTUnlockBlock"
									class="mcol-xs-12 mcol-sm-auto unlock-block"
									:popoverTitle="tt('phrases.unlock_fft')"
									instanceLabel="FFT"
									:sensorData="sensorData"
									:chartOptionsUpdate="chartOptionsUpdate"
									:passedTimeValue="sensorData.last_fft_lock && sensorData.last_fft_lock.created_at"
									@onUnlock="handleUnlockFFT"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-if="showDisableChartButton" class="flex align-center mcol-xs-2 mcol-sm-auto ml-auto">
				<el-button
					:class="{ active: chartIsHidden }"
					native-type="button"
					type="tertiary"
					class="action-button disable-chart-button is-plain"
					size="small"
					@click="toggleChart"
				>
					<i :class="['icomoon', chartIsHidden ? 'icon-eye' : 'icon-eye-slash']"></i>
				</el-button>
			</div>

			<ChartColorShemeBlock
				v-if="enableColorPickerBlock && ChartAPI"
				class="mcol-xs-2 mcol-sm-auto ml-auto align-center buttons-container"
				:ChartInstance="ChartInstance"
				:sensorId="sensorData.id"
				:hasStatistics="hasStatistics"
			/>

			<HeaderRightPart
				v-if="!additionalProps.hideChartHeaderRightPart"
				class="mcol-xs-2 mcol-sm-auto ml-auto align-center"
				:isRebaseline="isRebaseline"
				:is_high_speed="is_high_speed"
				:problems="problems"
				:hideProblems="hideProblems"
				:parameterTypeItems="parameterTypeItems"
				:hideExportButton="hideExportButton"
				:showToggleNavigator="additionalProps.showToggleNavigator"
				:toggleNavigatorButtonActive="showNavigator"
				:rootFilters="rootFilters"
				:sensorId="sensorData.id"
				@event="handleEvent"
			/>
		</div>

		<div
			v-show="!chartIsHidden && (initialFetch || hasStatistics)"
			:class="['chart-container card-content', { 'edit-plotlines': editPlotlines }, { 'show-navigator': showNavigator }]"
		>
			<div class="flex mrow wrap">
				<div class="mcol-xs-12 mcol-sm-8 fluid">
					<ChartWrapper
						ref="chartWrapperRef"
						:chartOptions="chartOptions"
						constructorType="stockChart"
						:hcInstance="hcInstance"
					/>
				</div>

				<div v-show="statsThresholdsActive" class="mcol-xs-12 mcol-sm-4 stats-table-wrapper">
					<StatsTable
						title="Stats"
						:isShow="statsThresholdsActive"
						:ChartInstance="ChartInstance"
						:statsData="statsData"
						:chartsListWrapperReadyCounter="chartsListWrapperReadyCounter"
					/>
				</div>
			</div>
		</div>

		<div v-show="!initialFetch && !hasStatistics" class="chart-mock card">
			<div class="content-container inlineImg" style="background-image: url(/static/img/background/graph.svg)">
				<div class="caption">
					<div class="text-item">{{ tt('phrases.There_are') }}</div>
					<div class="text-item central">{{ tt('phrases.no_statistics') }}</div>
					<div class="text-item">{{ `${tt('for')} ${chartTitle}` }}</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="ChartInstance.editThresholdsByStagesEnabled"
			v-model="updateThresholdsDialogOpen"
			append-to-body
			center
			class="small dialog-decorate-header"
			:title="tt('Warning')"
		>
			<UpdateThresholdsDialog
				:ChartInstance="ChartInstance"
				:isWarningThresholdChanged="isWarningThresholdChanged"
				:isWarningThresholdLessThanAlarm="isWarningThresholdLessThanAlarm"
				:enableContinueButton="isWarningThresholdLessThanAlarm"
				@event="handleEvent"
				@onClose="updateThresholdsDialogOpen = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useGlobalStore } from '@/stores/GlobalStore';
import {
	SENSOR_PARAMETERS_TYPES,
	NCD_SENSOR_PARAMETERS_TYPES,
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { LUBE_PROCESSING_STATUSES, LUBE_CYCLE_STATUSES, LUBE_VERSIONS } from '@/constants/ultrasound';
import { FFT_LOCK_STATUSES } from '@/constants/global';

import ChartWrapper from '@/components/charts/ChartWrapper.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ChartZoom from './ChartZoom.vue';
import UnlockBlock from './UnlockBlock.vue';
import ChartThresholdsOperations from './ChartThresholdsOperations.vue';
import HeaderRightPart from './HeaderRightPart.vue';
import ChartColorShemeBlock from './ChartColorShemeBlock.vue';
import UpdateThresholdsDialog from './UpdateThresholdsDialog.vue';
import StatsTable from './StatsTable.vue';

const { tt } = Lang;

defineOptions({
	name: 'ChartItemContainer',
});

const props = defineProps({
	ChartInstance: { type: Object, required: true },
	rootFilters: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	sensorData: { type: Object, required: true },
	currentSensorType: { type: Object, default: () => ({}) },
	forceLoading: Boolean,
	chartsListWrapperReadyCounter: Number,
});

const emit = defineEmits(['event']);
const globalStore = useGlobalStore();
const { isSidebarCollapse } = storeToRefs(globalStore);

const chartWrapperRef = ref(null);
const chartToggled = ref(1);
const refetchChartData = ref(false);
const chartIsInit = ref(false);
const chartOptionsUpdate = ref(0);
const showNavigator = ref(false);
const chartLoading = ref(false);
const chartRendering = ref(false);
const initialFetch = ref(true);
const hasStatistics = ref(false);
const statisticsResponsesReady = ref(false);
const chartDataReady = ref(false);
const editPlotlines = ref(false);
const calculateThresholdsIsActive = ref(false);
const chartThresholdsUpdate = ref(0);
const updateThresholdsDialogOpen = ref(false);
const chartIsRendered = ref(false);

const chartIsHidden = computed(() => chartToggled.value && props.ChartInstance.chartIsHidden && !oneChartOnly.value);
const hcInstance = computed(() => {
	const instances = props.additionalProps.higchartInstances;
	if (!instances) return undefined;
	const { hcInstanceNew, hcInstance: legacyInstance, stockInit, boost, stockInitNew, boostNew } = instances;
	if (props.ChartInstance.generateSeriesByStatistics) {
		stockInitNew?.(hcInstanceNew);
		boostNew?.(hcInstanceNew);
		return hcInstanceNew;
	}
	stockInit?.(legacyInstance);
	boost?.(legacyInstance);
	return legacyInstance;
});
const chartOptions = computed(() => chartOptionsUpdate.value ? Object.freeze(props.ChartInstance.getChartOptions()) : null);
const statsData = computed(() => chartOptionsUpdate.value ? Object.freeze(props.ChartInstance.getChartStatsData()) : null);
const ChartAPI = computed(() => chartIsInit.value ? props.ChartInstance.ChartAPI : null);
const parameterTypeItems = computed(() => props.ChartInstance.requestsList || []);
const isUltrasound = computed(() => props.currentSensorType.isUltrasound);
const isSDTsensor = computed(() => props.currentSensorType.isSDTsensor);
const isHumiditySensor = computed(() => props.currentSensorType.isHumiditySensor);
const hideChartHeader = computed(() => props.additionalProps.hideChartHeader);
const enableZoomBlock = computed(() => !props.additionalProps.hideZoomBlock);
const isLubeMatrixV3 = computed(() => props.sensorData?.lube_version === LUBE_VERSIONS.V3);
const enableLubeUnlockBlock = computed(() =>
	props.sensorData && (isUltrasound.value || isLubeMatrixV3.value) &&
	[
		LUBE_CYCLE_STATUSES.BLOCKED,
		LUBE_PROCESSING_STATUSES.UNSUCCESSFUL,
		LUBE_PROCESSING_STATUSES.LUBRICANT_FULL_SPENT,
		LUBE_PROCESSING_STATUSES.BLOCKED,
		LUBE_PROCESSING_STATUSES.LOSS_CONNECTION,
		LUBE_PROCESSING_STATUSES.NO_COMMAND_RESPONSE,
		LUBE_PROCESSING_STATUSES.UNKNOWN,
		LUBE_PROCESSING_STATUSES.NO_LUBRICATION_STATUS_RESPONSE,
		LUBE_PROCESSING_STATUSES.NO_START_LUBRICATION_COMMAND_RESPONSE,
	].includes(props.sensorData.lube_cycle_status || props.sensorData.lube_shot_status),
);
const enableFFTUnlockBlock = computed(() =>
	props.sensorData?.last_fft_lock && props.sensorData.last_fft_lock.status !== FFT_LOCK_STATUSES.UNLOCKED,
);
const disableAnimationAndSpinner = computed(() => props.additionalProps.disableAnimationAndSpinner);
const statsThresholdsActive = computed(() => props.additionalProps.statsThresholdsActive);
const oneChartOnly = computed(() => props.additionalProps.oneChartOnly);
const enableThresholdsOperations = computed(() => {
	const sensorType = props.ChartInstance.resources?.payload_1?.sensorType;
	if (props.ChartInstance.disableThresholds || props.additionalProps.isCompare) return false;
	if (
		sensorType === 'ncd_environmental' &&
		parameterTypeItems.value.some((item) => item.id === NCD_SENSOR_PARAMETERS_TYPES.IAQ)
	) return false;
	return true;
});
const disabledThresholdsEdit = computed(() =>
	props.sensorData.is_re_baseline_process &&
	parameterTypeItems.value[0]?.id !== SENSOR_PARAMETERS_TYPES.TEMPERATURE,
);
const showCalculateThresholdsButton = computed(() => props.ChartInstance.showCalculateThresholdsButton);
const isRebaseline = computed(() =>
	!props.ChartInstance.disableThresholds &&
	!props.additionalProps.isCompare &&
	!isSDTsensor.value &&
	props.sensorData.is_re_baseline_process,
);
const is_high_speed = computed(() => !props.additionalProps.isCompare && props.additionalProps.lube_cycle_high_speed);
const hideExportButton = computed(() => props.additionalProps.isCompare || props.additionalProps.hideExportButton);
const hideProblems = computed(() =>
	props.additionalProps.hideProblems || isUltrasound.value || isSDTsensor.value || isHumiditySensor.value,
);
const chartTitle = computed(() => chartOptionsUpdate.value != null ? props.ChartInstance.chartTitle : null);
const problems = computed(() => {
	if (!chartOptions.value || statisticsResponsesReady.value === undefined) return [];
	return props.ChartInstance.getTransformedStatistics?.({
		data_key: 'problems',
		parameterId: parameterTypeItems.value[0]?.id,
	}) || [];
});
const enableColorPickerBlock = computed(() => props.currentSensorType.isBannerV2Generic);
const updateThresholdsData = computed(() =>
	chartThresholdsUpdate.value ? Object.freeze(props.ChartInstance.updateThresholdsData) : {},
);
const isWarningThresholdChanged = computed(() => !!updateThresholdsData.value.warning_zone);
const isWarningThresholdLessThanAlarm = computed(() =>
	chartThresholdsUpdate.value ? props.ChartInstance.isWarningThresholdLessThanAlarm : true,
);
const showDisableChartButton = ref(false);

const handleHasStatisticsChange = (value) => {
	hasStatistics.value = value;
	if (props.additionalProps.setIsGraphMountedToWindow && !value && !chartIsRendered.value) {
		chartIsRendered.value = true;
		window.isGraphMounted = true;
	}
};

const handleChartRendered = (event, Chart) => {
	props.ChartInstance.syncHistorySeriesVisibility?.(props.additionalProps.showHistory);
	if (!chartIsRendered.value && Chart?.lastInitialRedrawComplete) {
		chartIsRendered.value = true;
		window.isGraphMounted = true;
	}
};

const handleStatisticsResponsesReady = (ready) => {
	statisticsResponsesReady.value = ready;
	if (ready) initialFetch.value = false;
};

const handleChartThresholdsUpdate = ({ open_dialog: openDialog, settings } = {}) => {
	chartThresholdsUpdate.value += 1;
	updateThresholdsDialogOpen.value = openDialog;
	if (settings?.redirectTo) {
		emit('event', {
			eventName: 'handleRedirectTo',
			data: settings.redirectTo,
			onward: true,
		});
	}
};

const handleChartPointClick = ({ point } = {}) => {
	if (point) {
		emit('event', {
			eventName: 'addNoteToChart',
			data: point,
			onward: true,
		});
	}
};

const handleOpenFFTCharts = ({ point } = {}) => {
	emit('event', {
		eventName: 'openFFTCharts',
		data: { ...point, sensorType: props.currentSensorType },
		onward: true,
	});
};

const handleSetupThresholds = () => {
	const { chart_id: chartId, requestsList, resources } = props.ChartInstance;
	const { levelZoneDataParameterId } = resources.chart_config || {};
	const thresholdData = props.ChartInstance.getTransformedStatistics?.({
		parameterId: levelZoneDataParameterId,
		statistics_result: true,
	}) || {};

	emit('event', {
		eventName: 'handleSetupThresholds',
		data: {
			parameters: [{
				chartTitle: chartTitle.value,
				chart_id: chartId,
				levelZoneData: thresholdData.levelZoneData,
				levelZones: thresholdData.levelZones,
				parameterItem: requestsList[0],
			}],
		},
		onward: true,
	});
};

const handleCalculateThresholds = () => {
	calculateThresholdsIsActive.value = !calculateThresholdsIsActive.value;
	props.ChartInstance.injectProps('options', {
		chart: { zoomType: calculateThresholdsIsActive.value ? 'x' : 'xy' },
	}, { emitChartOptionsUpdate: true });
};

const toggleEditPlotlinesManual = () => {
	editPlotlines.value = !editPlotlines.value;
	props.ChartInstance.injectProps('options', {
		chart: { zoomType: editPlotlines.value ? '' : 'xy' },
	}, { emitChartOptionsUpdate: true });
};

const zoomYAxis = (data) => {
	props.ChartInstance.ChartAPI?.yAxis?.[0]?.setExtremes(...data);
};

const fetchChartData = (filters = {}, settings = {}) => props.ChartInstance.fetchChartData(filters, settings);
const toggleChart = () => {
	props.ChartInstance.toggleChart();
	if (!chartIsHidden.value && (!chartIsInit.value || !hasStatistics.value || refetchChartData.value)) {
		fetchChartData();
		refetchChartData.value = false;
	}
};
const toggleNavigator = () => {
	showNavigator.value = !showNavigator.value;
	props.ChartInstance.injectProps('options', {
		navigator: { enabled: showNavigator.value },
	}, { emitChartOptionsUpdate: true });
};
const handleUnlockLube = () => {
	emit('event', {
		eventName: 'handleUnlockLube',
		data: { chartId: props.ChartInstance.chart_id, sensorId: props.sensorData.id },
		onward: true,
	});
};
const handleUnlockFFT = () => {
	emit('event', {
		eventName: 'handleUnlockFFT',
		data: { chartId: props.ChartInstance.chart_id, sensorId: props.sensorData.id },
		onward: true,
	});
};

const chartInstanceEventsList = computed(() => {
	const list = {
		chartIsHidden: () => { chartToggled.value += 1; },
		isLoading: (value) => { chartLoading.value = value; },
		isRendering: (value) => { chartRendering.value = value; },
		isInitiated: () => { chartIsInit.value = true; },
		statisticsResponsesReady: handleStatisticsResponsesReady,
		hasStatistics: handleHasStatisticsChange,
		chartDataReady: (value) => { chartDataReady.value = value; },
		chartOptionsReady: () => { chartOptionsUpdate.value += 1; },
		chartOptionsUpdate: () => { chartOptionsUpdate.value += 1; },
		chartThresholdsUpdate: handleChartThresholdsUpdate,
	};
	if (props.additionalProps.setIsGraphMountedToWindow) {
		list.chartRenderEvent = handleChartRendered;
	}
	return Object.freeze(list);
});

const chartPointsEventsList = computed(() => Object.freeze({
	pointClickEvent: { name: 'click', event: handleChartPointClick },
	openFFTCharts: { name: 'click', event: handleOpenFFTCharts },
}));

const { handleEvent } = useEventHandler({
	toggleEditPlotlinesManual,
	zoomYAxis,
	handleSetupThresholds,
	handleCalculateThresholds,
	toggleNavigator,
}, emit);

watch(() => props.rootFilters, () => {
	refetchChartData.value = true;
});

watch(isSidebarCollapse, () => {
	setTimeout(() => {
		const chartElement = chartWrapperRef.value?.$el;
		if (chartElement && ChartAPI.value) {
			ChartAPI.value.setSize(chartElement.clientWidth - 1, chartElement.clientHeight);
		}
	}, 350);
});

onMounted(() => {
	props.ChartInstance.injectProps('events', chartInstanceEventsList.value);
	props.ChartInstance.setValue?.('seriesEvents', chartPointsEventsList.value);
	props.ChartInstance.fetchChartData({ rootStatisticsData: props.additionalProps.rootStatisticsData });
});

onBeforeUnmount(() => {
	props.ChartInstance.destroyChart?.();
});

defineExpose({
	fetchChartData,
	toggleChart,
	zoomYAxis,
	toggleNavigator,
});
</script>
