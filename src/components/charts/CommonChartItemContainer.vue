<template>
	<div class="chart-height-auto">
		<SimpleSpinner
			v-if="!disablePreloader && useSimpleSpinnerAsPreloader"
			:active="chartLoading"
		/>

		<VueElementLoadingWrapper
			v-else-if="!disablePreloader"
			:isLoading="chartLoading"
			:itemsName="tt('chart')"
			:disableText="disablePreloaderText"
		/>

		<div
			v-if="customChartHeader && customChartHeaderFile"
			v-show="hasStatistics"
			class="card-header chart-card-header"
		>
			<component
				:is="customChartHeaderFile"
				:propsData="additionalProps"
				:ChartInstance="ChartInstance"
				:chartOptionsUpdate="chartOptionsUpdate"
				:chartIsInit="chartRendering"
				:dynamicProps="dynamicProps"
				@event="handleEvent"
			/>
		</div>

		<div v-show="isShowChart" :class="['chart-container', additionalProps.chartContainerClass || '']">
			<ChartWrapper :chartOptions="chartOptions" :hcInstance="hcInstance" />
		</div>

		<div v-if="customMock" v-show="!isShowChart" class="custom-mock-container">
			<slot name="custom_mock_sub"></slot>
		</div>

		<div
			v-else-if="nodataMock"
			v-show="!isShowChart"
			class="page-title bold gray-color outside-bg-addition"
		>
			{{ tt('phrases.no_data') }}
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import ChartWrapper from '@/components/charts/ChartWrapper.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt } = Lang;

defineOptions({
	name: 'CommonChartItemContainer',
});

const props = defineProps({
	ChartInstance: { type: Object, required: true },
	rootFilters: { type: Object, default: () => ({}) },
	rootStatisticsData: null,
	additionalProps: { type: Object, default: () => ({}) },
	dynamicProps: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);

const chartIsInit = ref(false);
const chartOptionsUpdate = ref(0);
const chartLoading = ref(false);
const chartRendering = ref(false);
const initialFetch = ref(true);
const hasStatistics = ref(false);
const statisticsResponsesReady = ref(false);

const disablePreloader = computed(() => props.additionalProps.disablePreloader);
const disablePreloaderText = computed(() => props.additionalProps.disablePreloaderText);
const useSimpleSpinnerAsPreloader = computed(() => props.additionalProps.useSimpleSpinnerAsPreloader);
const nodataMock = computed(() => props.additionalProps.nodataMock);
const customMock = computed(() => props.additionalProps.customMock);
const customChartHeader = computed(() => props.additionalProps.customChartHeader);
const showWithoutStatistics = computed(() => props.additionalProps.showWithoutStatistics);
const hcInstance = computed(() => props.additionalProps.hcInstance);
const isShowChart = computed(() => initialFetch.value || hasStatistics.value || showWithoutStatistics.value);
const chartOptions = computed(() =>
	chartOptionsUpdate.value ? Object.freeze(props.ChartInstance.getChartOptions()) : null,
);

const componentModules = {
	...import.meta.glob('/src/components/**/*.vue'),
	...import.meta.glob('/src/views/**/*.vue'),
};

const customChartHeaderFile = computed(() => {
	const componentPath = customChartHeader.value?.componentPath;
	if (!componentPath) return null;
	return componentModules[`/src/${componentPath}.vue`] || null;
});

const handleStatisticsResponsesReady = (ready) => {
	statisticsResponsesReady.value = ready;
	if (ready) {
		initialFetch.value = false;
	}
};

const handleChartOperation = (actionName, data) => {
	emit('event', {
		eventName: actionName,
		data,
		onward: true,
	});
};

const chartInstanceEventsList = computed(() => {
	let list = {
		isLoading: (value) => {
			chartLoading.value = value;
		},
		isRendering: (value) => {
			chartRendering.value = value;
		},
		isInitiated: () => {
			chartIsInit.value = true;
		},
		statisticsResponsesReady: handleStatisticsResponsesReady,
		hasStatistics: (value) => {
			hasStatistics.value = value;
		},
		chartOptionsReady: () => {
			chartOptionsUpdate.value += 1;
		},
		chartOptionsUpdate: () => {
			chartOptionsUpdate.value += 1;
		},
		chartLoadEvent: (event) => handleChartOperation('chartLoadEvent', event),
	};

	if (props.additionalProps.chartInstanceEventsList) {
		list = Object.assign(list, props.additionalProps.chartInstanceEventsList);
	}

	return Object.freeze(list);
});

const { handleEvent } = useEventHandler({}, emit);

watch(
	() => props.rootStatisticsData,
	(data) => {
		props.ChartInstance.fetchChartData({ rootStatisticsData: data });
	},
);

onMounted(() => {
	props.ChartInstance.injectProps('events', chartInstanceEventsList.value);

	if (props.additionalProps.chartEventsList) {
		props.ChartInstance.assignChartEvents(props.additionalProps.chartEventsList);
	}
	if (props.additionalProps.chartPlotOptionsEventsList) {
		props.ChartInstance.assignPlotOptionsEvents(props.additionalProps.chartPlotOptionsEventsList);
	}
	if (props.additionalProps.chartSpecificEvents) {
		props.ChartInstance.assignSpecificOptionsEvents(props.additionalProps.chartSpecificEvents);
	}
	if (props.additionalProps.chartPointsEventsList) {
		props.ChartInstance.setValue('seriesEvents', props.additionalProps.chartPointsEventsList);
	}

	props.ChartInstance.fetchChartData({
		rootStatisticsData: props.rootStatisticsData,
	});
});
</script>
