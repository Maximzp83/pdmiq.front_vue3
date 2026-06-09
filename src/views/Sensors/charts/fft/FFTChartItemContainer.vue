<template>
	<div>
		<VueElementLoadingWrapper :isLoading="chartLoading" :itemsName="tt('chart')" />

		<div class="card-header chart-card-header">
			<div class="flex mrow wrap align-center left-part">
				<div class="title-block ellipsis capitalize" v-text="chartTitle"></div>

				<div v-if="showDisableChartButton" class="fft-chart-actions mcol-xs-6 mcol-sm-auto capitalize">
					<div class="chart-actions-block">
						<el-button
							type=""
							native-type="button"
							class="item-action-button capitalize flex align-center secondary"
							@click="toggleChart"
						>
							<i :class="['icomoon', chartIsHidden ? 'icon-eye' : 'icon-eye-slash']"></i>
						</el-button>
					</div>
				</div>

				<div
					v-if="ChartAPI"
					v-show="!chartIsHidden && hasStatistics"
					class="zoom-block-container mcol-xs-9 mcol-sm-auto capitalize fft-chart-actions"
				>
					<ChartZoom
						buttonType=""
						buttonClass="secondary inverted"
						class="mcol-xs-6 mcol-sm-auto"
						:ChartInstance="ChartInstance"
						:chartOptionsUpdate="chartOptionsUpdate"
						@event="handleEvent"
					/>
				</div>

				<div
					v-show="!chartIsHidden && hasStatistics"
					class="zoom-block-container mcol-xs-6 mcol-lg-8 mcol-xlg-auto fft-chart-actions capitalize"
				>
					<ChartOperationsBar
						:actionButtons="chartOperationsButtons"
						:activeButtonValues="activeButtonValues"
						:xAxisTitle="xAxisTitle"
						:chartPeaks="chartPeaks"
						@event="handleEvent"
					/>
				</div>

				<div
					v-for="component in selectedChildComponents"
					v-show="!chartIsHidden && hasStatistics"
					:key="`fft-analysis-rules-bar-${component.id}`"
					class="mcol-xs-12 mcol-lg-auto fft-chart-actions fft-analysis-bar-container capitalize"
				>
					<ChartFFTAnalysisRulesBar
						:componentItem="component"
						:equipmentData="additionalProps.equipmentData"
						:currentFFTItem="currentFFTItem"
						:sensorId="chartMainData.sensorItem.id"
						:selectedAnalysisRules="selectedAnalysisRules"
						@event="handleEvent"
					/>
				</div>

				<div
					v-show="!chartIsHidden && hasStatistics"
					class="zoom-block-container hover-data-block-wrapper mcol-xs-6 mcol-lg-4 mcol-xlg-auto"
				>
					<div class="chart-actions-block hover-data-block" v-show="hoverData.x">
						<span class="div-block semi-bold capitalize" v-text="hoverData.x || ''"></span>
						<span class="div-block" v-text="hoverData.y == 0 ? '0.0' : hoverData.y"></span>
					</div>
				</div>
			</div>
		</div>

		<div v-show="!chartIsHidden && (initialFetch || hasStatistics)" class="chart-container fft-chart-container">
			<div class="flex mrow wrap">
				<div class="mcol-xs-12 mcol-sm-8 mcol-xlg-9 fluid">
					<ChartWrapper ref="chartWrapperRef" :chartOptions="chartOptions" />
				</div>

				<div v-if="activeButtonValues.showPeaksActive" class="mcol-xs-12 mcol-sm-4 mcol-xlg-3 fft-peaks-wrapper">
					<PeaksList
						title="Highest Peaks"
						:data="chartPeaks"
						:xAxisTitle="xAxisTitle"
						:yAxisTitle="yAxisTitle"
					/>
				</div>
			</div>
		</div>

		<div v-show="!initialFetch && !hasStatistics">
			<div class="caption text-center semi-bold">
				<div class="text-item">{{ tt('phrases.There_are') }}</div>
				<div class="text-item central">{{ tt('phrases.no_statistics') }}</div>
			</div>
		</div>

		<el-dialog
			v-model="activeButtonValues.showWaterfallActive"
			:title="`${tt('Waterfall')} ${tt('Graphs')}`"
			center
			append-to-body
			class="waterfall-chart-dialog big dialog-decorate-header filled-header rounded top"
		>
			<WaterfallStatisticsContainer
				v-if="activeButtonValues.showWaterfallActive"
				:currentFFTChartStatistics="chartFetchedStatistics"
				:prevFFTItems="prevFFTItems"
				:chartMainData="chartMainData"
				:rootFilters="rootFilters"
			/>
		</el-dialog>

		<audio id="waveformSoundPlayer" src=""></audio>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import { Lang } from '@/localization';
import { getRoundedValue, findItemBy } from '@/helpers';
import { getCurrentRpmSource } from '@/helpers/specialHelpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensors } from '@/composables/useSensors';
import { BANNER_REQUEST_TYPES } from '@/constants/global';

import ChartZoom from '../ChartZoom.vue';
import ChartOperationsBar from '../ChartOperationsBar.vue';
import PeaksList from './PeaksList.vue';
import ChartWrapper from '@/components/charts/ChartWrapper.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import WaterfallStatisticsContainer from './WaterfallStatisticsContainer.vue';
import ChartFFTAnalysisRulesBar from './ChartFFTAnalysisRulesBar.vue';

const { tt } = Lang;
const { createFftWaveform, fetchFftWaveform, setFftRpmParams } = useSensors();

defineOptions({
	name: 'FFTChartItemContainer',
});

const props = defineProps({
	ChartInstance: { type: Object, required: true },
	propsLoadingChart: Boolean,
	rootFilters: { type: Object, default: () => ({}) },
	prevFFTItems: { type: Array, default: () => [] },
	currentFFTItem: { type: Object, required: true },
	activeAxis: Number,
	additionalProps: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);
const chartOptionsUpdate = ref(0);
const chartLoading = ref(false);
const chartRendering = ref(false);
const chartIsInit = ref(false);
const initialFetch = ref(true);
const hasStatistics = ref(false);
const hoverData = ref({});
const chartIsHidden = ref(false);
const refetchChartData = ref(false);
const activeButtonValues = reactive({
	addCursorActive: false,
	showPeaksActive: false,
	showPeriodicActive: false,
	showWaterfallActive: false,
	generatingWaveform: false,
	analysisRuleButton30: false,
});
const createdWaveforms = reactive({
	axis_1: '',
	axis_2: '',
	axis_3: '',
});
const selectedAnalysisRules = ref([]);

const isRequestTypeStandard = computed(() =>
	props.currentFFTItem?.banner_request_type === BANNER_REQUEST_TYPES.STANDARD,
);
const currentFFTItemAxisId = computed(() => {
	const axisItem = findItemBy('axis_number', props.activeAxis, props.currentFFTItem.axes);
	return axisItem ? axisItem.id : null;
});
const showDisableChartButton = computed(() =>
	chartMainData.value.parameterItem.type === 'acceleration' && isRequestTypeStandard.value,
);
const chartOperationsButtons = computed(() => {
	const buttons = [];
	const { type } = chartMainData.value.parameterItem;

	if (type === 'waveform') {
		buttons.push({
			id: 6,
			prefix_icon: 'el-icon-video-play',
			type: '',
			className: 'secondary inverted',
			event: 'handlePlaySound',
			loadingKey: 'generatingWaveform',
		});
	}

	buttons.push(
		{
			id: 1,
			text: `${tt('Add')} ${tt('Cursor')}`,
			prefix_icon: 'icon-cursor',
			type: '',
			className: 'secondary inverted',
			activeKey: 'addCursorActive',
			event: 'addCursor',
		},
		{
			id: 3,
			text: `${tt('Show')} ${tt('Peaks')}`,
			event: 'showPeaks',
			type: '',
			className: 'secondary inverted',
			prefix_icon: 'icon-peaks',
			activeKey: 'showPeaksActive',
		},
		{
			id: 4,
			text: `${tt('Periodic')} ${tt('Cursors')}`,
			event: 'showPeriodicCursors',
			type: '',
			className: 'secondary inverted',
			prefix_icon: 'icon-periodic',
			activeKey: 'showPeriodicActive',
			isPeriodicCursors: true,
		},
		{
			id: 5,
			text: tt('Waterfall'),
			event: 'showWaterfallCharts',
			type: '',
			className: 'secondary inverted',
			prefix_icon: 'icon-waterfall',
			activeKey: 'showWaterfallActive',
		},
		{
			id: 2,
			text: tt('Remove'),
			type: '',
			className: 'secondary inverted',
			prefix_icon: 'icon-plus rotate',
			isDelete: true,
			event: 'removeAllCursors',
		},
	);

	return Object.freeze(buttons);
});
const chartOptions = computed(() => chartOptionsUpdate.value ? Object.freeze(props.ChartInstance.getChartOptions()) : null);
const chartFetchedStatistics = computed(() => chartOptionsUpdate.value ? Object.freeze(props.ChartInstance.getFetchedStatistics()) : null);
const chartMainData = computed(() => Object.freeze({
	sensorItem: props.ChartInstance.sensorItem,
	currentSensorType: props.ChartInstance.currentSensorType,
	parameterItem: props.ChartInstance.parameterItem,
}));
const chartPeaks = computed(() => chartOptionsUpdate.value ? Object.freeze(props.ChartInstance.peaksList) : null);
const xAxisTitle = computed(() => chartOptionsUpdate.value ? props.ChartInstance.getXAxisTitle() : '');
const yAxisTitle = computed(() => chartOptionsUpdate.value ? props.ChartInstance.getYAxisTitle() : '');
const ChartAPI = computed(() => chartIsInit.value ? props.ChartInstance.ChartAPI : null);
const chartTitle = computed(() => props.ChartInstance.chartTitle);
const selectedChildComponents = computed(() => {
	let colorIndex = 0;
	const fftOverrides = props.currentFFTItem?.vibration_analysis_rules || [];

	return (props.additionalProps.selectedChildComponents || []).map((component) => ({
		...component,
		vibration_analysis_rules: (component.vibration_analysis_rules || []).map((rule) => {
			const overrideRule = findItemBy('original_rule_id', rule.original_rule_id, fftOverrides);
			const item = {
				...rule,
				active_harmonics: overrideRule?.harmonics != null
					? overrideRule.harmonics
					: rule.original_rule?.harmonics,
				color: colorsList[colorIndex] || '#000',
				y_position: -(250 - colorIndex * 20),
			};
			colorIndex += 1;
			return item;
		}),
	}));
});
const colorsList = Object.freeze([
	'#ff0000', '#00E676', '#795548', '#18FFFF', '#00B8D4', '#FFEA00',
	'#ff00ff', '#c800ea', '#008a09', '#FFAB40', '#9c0303', '#2979FF',
]);
const currentRpmSource = computed(() =>
	getCurrentRpmSource({
		fftItem: props.currentFFTItem,
		sensorData: props.ChartInstance.sensorItem,
		rpm_source_item: props.additionalProps.equipmentData?.rpm_source_item,
		rootFilters: props.rootFilters,
	}),
);

const emitChartVisibilityChange = () => {
	emit('event', {
		eventName: 'handleChartVisibilityChange',
		data: {
			chartId: props.ChartInstance.chart_id,
			isHidden: chartIsHidden.value,
		},
	});
};

const updateLocalStorageValue = (value) => {
	const localStorageHiddenChartsData = JSON.parse(localStorage.getItem('banner_fft_hidden_charts')) || {};
	localStorageHiddenChartsData[props.currentFFTItem.id] = localStorageHiddenChartsData[props.currentFFTItem.id] || {};
	localStorage.setItem('banner_fft_hidden_charts', JSON.stringify({
		...localStorageHiddenChartsData,
		[props.currentFFTItem.id]: {
			...localStorageHiddenChartsData[props.currentFFTItem.id],
			[props.ChartInstance.chart_id]: value,
		},
	}));
};

const toggleChart = () => {
	chartIsHidden.value = !chartIsHidden.value;
	updateLocalStorageValue(chartIsHidden.value);
	emitChartVisibilityChange();

	if (!chartIsHidden.value && (!chartIsInit.value || !hasStatistics.value || refetchChartData.value)) {
		fetchChartData();
		refetchChartData.value = false;
	}
};

const zoomYAxis = (data) => {
	props.ChartInstance.ChartAPI?.yAxis?.[0]?.setExtremes(...data);
};

const handleMouseOver = ({ target } = {}) => {
	const { x, y, options } = target || {};
	if (!options?.isCursor) {
		hoverData.value = {
			x: `${getRoundedValue(x, 1, 4)} ${xAxisTitle.value}`,
			y: `${getRoundedValue(y, 1, 6)} ${yAxisTitle.value}`,
		};
	}
};

const fetchChartData = (filters = {}, settings = {}) => props.ChartInstance.fetchChartData(filters, settings);
const handleStatisticsResponsesReady = (ready) => {
	if (ready) initialFetch.value = false;
};
const handleHasStatistics = (value) => {
	hasStatistics.value = value;
};
const handleChartOptionsReady = () => {
	chartOptionsUpdate.value += 1;
};
const handlePlaySound = () => {
	const { axis_id: axisNumber } = chartMainData.value.parameterItem;
	const waveformItem = findItemBy('axis_number', axisNumber, props.currentFFTItem.axes);
	if (!waveformItem) return;

	if (waveformItem.sound_waveform_sample) {
		playSound();
		return;
	}

	if (createdWaveforms[`axis_${axisNumber}`]) {
		playSound();
		return;
	}

	activeButtonValues.generatingWaveform = true;
	createFftWaveform({
		sensorId: chartMainData.value.sensorItem.id,
		fftId: props.currentFFTItem.id,
		axisId: waveformItem.id,
	})
		.then((response) => {
			if (response?.value?.sample_filename) {
				createdWaveforms[`axis_${axisNumber}`] = response.value.sample_filename;
				playSound();
			}
		})
		.finally(() => {
			activeButtonValues.generatingWaveform = false;
		});
};

const playSound = () => {
	const audioContext = new AudioContext();
	fetchFftWaveform({
		sensorId: props.ChartInstance.sensorItem.id,
		fftId: props.currentFFTItem.id,
		axis: currentFFTItemAxisId.value,
	})
		.then(({ value }) => value?.data || value)
		.then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
		.then((audioBuffer) => {
			const source = audioContext.createBufferSource();
			source.buffer = audioBuffer;
			source.connect(audioContext.destination);
			source.start(0);
		});
};

const handleChartPointClick = ({ point } = {}) => {
	emit('event', {
		eventName: 'addNoteToChart',
		data: point,
		onward: true,
	});
};

const addCursor = () => {
	activeButtonValues.addCursorActive = !activeButtonValues.addCursorActive;
	props.ChartInstance.callChartMethod?.('toggleCursorMode', activeButtonValues.addCursorActive);
};
const showPeaks = () => {
	activeButtonValues.showPeaksActive = !activeButtonValues.showPeaksActive;
	props.ChartInstance.callChartMethod?.('togglePeaks', activeButtonValues.showPeaksActive);
};
const showPeriodicCursors = () => {
	activeButtonValues.showPeriodicActive = !activeButtonValues.showPeriodicActive;
};
const generatePeriodicCursors = (payload) => {
	props.ChartInstance.callChartMethod?.('generatePeriodicCursors', payload);
};
const showWaterfallCharts = () => {
	activeButtonValues.showWaterfallActive = !activeButtonValues.showWaterfallActive;
};
const removeAllCursors = () => {
	props.ChartInstance.callChartMethod?.('removeAllCursors');
};
const handleRpmCursorDrop = (data) => {
	if (!currentRpmSource.value) return;
	setFftRpmParams({
		sensorId: chartMainData.value.sensorItem.id,
		fftId: props.currentFFTItem.id,
		data,
	});
};

const chartPlotOptionsEventsList = computed(() => Object.freeze([
	{
		plotOptionKey: 'series',
		name: 'mouseOver',
		event: handleMouseOver,
	},
	{
		plotOptionKey: 'series',
		name: 'mouseOut',
		event: () => {
			hoverData.value = {};
		},
	},
]));
const chartInstanceEventsList = computed(() => Object.freeze({
	isLoading: (value) => { chartLoading.value = value; },
	isRendering: (value) => { chartRendering.value = value; },
	isInitiated: () => { chartIsInit.value = true; },
	statisticsResponsesReady: handleStatisticsResponsesReady,
	hasStatistics: handleHasStatistics,
	chartOptionsReady: handleChartOptionsReady,
	chartOptionsUpdate: handleChartOptionsReady,
	rpmCursorDrop: handleRpmCursorDrop,
}));
const chartPointsEventsList = computed(() => Object.freeze({
	pointClickEvent: { name: 'click', event: handleChartPointClick },
}));

const { handleEvent } = useEventHandler({
	zoomYAxis,
	handlePlaySound,
	addCursor,
	showPeaks,
	showPeriodicCursors,
	generatePeriodicCursors,
	showWaterfallCharts,
	removeAllCursors,
}, emit);

watch(() => props.rootFilters, () => {
	refetchChartData.value = true;
});

onMounted(() => {
	const hiddenData = JSON.parse(localStorage.getItem('banner_fft_hidden_charts')) || {};
	chartIsHidden.value = !!hiddenData[props.currentFFTItem.id]?.[props.ChartInstance.chart_id];
	emitChartVisibilityChange();

	props.ChartInstance.injectProps('events', chartInstanceEventsList.value);
	props.ChartInstance.assignPlotOptionsEvents?.(chartPlotOptionsEventsList.value);
	props.ChartInstance.setValue?.('seriesEvents', chartPointsEventsList.value);
	props.ChartInstance.fetchChartData();
});

onBeforeUnmount(() => {
	props.ChartInstance.destroyChart?.();
});

defineExpose({
	fetchChartData,
	toggleChart,
	zoomYAxis,
});
</script>
