<template>
	<div :class="['chart-container-wrapper', additionalProps.chartWrapperClass || '']">
		<component
			:is="componentFile"
			v-if="ChartInstance && componentFile"
			:key="updateChartInstance"
			:ref="`chart_item-${ChartInstance.chart_id}`"
			:class="[additionalProps.chartItemComponentClass || '']"
			:ChartInstance="ChartInstance"
			:rootFilters="finalFilters"
			:rootStatisticsData="rootStatisticsData"
			:additionalProps="additionalProps"
			:dynamicProps="dynamicProps"
			@event="handleEvent"
		>
			<template #custom_mock_sub>
				<slot name="custom_mock"></slot>
			</template>
		</component>
	</div>
</template>

<script setup>
import { computed, ref, watch, defineAsyncComponent } from 'vue';

import { executeChartFactoryContainer } from '@/modules/charts_factory/index.js';
import { useEventHandler } from '@/composables/mixins/useEmitter';

const props = defineProps({
	predefinedFilters: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	dynamicProps: { type: Object, default: () => ({}) },
	buildChartsPayloadProps: { type: Object, default: () => ({}) },
	setupChartsConfigsListSettings: { type: Object, default: () => ({}) },
	rootFilters: { type: Object, default: () => ({}) },
	chartFactoryContainerName: String,
	chartFactoryName: String,
	configsKey: String,
	chartKey: String,
	chartComponentFileLoader: {
		type: Function,
		default: () => import('@/components/charts/CommonChartItemContainer.vue'),
	},
	rootStatisticsData: null,
	chartWrapperIdx: null,
});

const emit = defineEmits(['event']);

defineOptions({
	name: 'CommonChartItemWrapper',
});

const hasStatistics = ref(false);
const chartContainerReady = ref(0);
const chartContainerLoading = ref(false);
const updateChartInstance = ref(0);
const chartInstanceInitialBuild = ref(true);

const componentFile = computed(() => {
	const { chartComponentFileLoader } = props;

	if (chartComponentFileLoader) {
		return defineAsyncComponent(chartComponentFileLoader);
	}
	return null;
});

const chartInstanceContainerEventsList = computed(() => {
	const chartInstanceContainerEvents = props.additionalProps.chartInstanceContainerEvents || {};
	return Object.freeze({
		chartContainerReady: handleChartContainerReady,
		...chartInstanceContainerEvents,
	});
});

const ChartInstanceContainer = computed(() => {
	const chartInstanceContainerPayload = props.additionalProps.chartInstanceContainerPayload || {};
	const chartInstanceContainerSettings = props.additionalProps.chartInstanceContainerSettings || {};

	return executeChartFactoryContainer(props.chartFactoryContainerName, {
		settings: {
			events: chartInstanceContainerEventsList.value,
			...chartInstanceContainerSettings,
		},
		payload_1: {
			...chartInstanceContainerPayload,
		},
	});
});

const buildChartsSettings = computed(() =>
	Object.freeze({
		chartFactoryName: props.chartFactoryName,
		setupChartsConfigsListSettings: {
			configsKey: props.configsKey,
			chartKey: props.chartKey,
			...props.setupChartsConfigsListSettings,
		},
	}),
);

const ChartInstance = computed(() => {
	if (updateChartInstance.value || chartContainerReady.value) {
		return ChartInstanceContainer.value.getChart();
	}
	return null;
});

const finalFilters = computed(() => ({
	...props.rootFilters,
	...(props.predefinedFilters || {}),
}));

const handleChartContainerReady = ({ hasStatistics: hasStats, isChartDataReady }) => {
	hasStatistics.value = hasStats;
	chartContainerReady.value += 1;
	chartContainerLoading.value = !isChartDataReady;
	emit('event', {
		eventName: 'handleChartContainerReady',
		data: {
			chartContainerReady: chartContainerReady.value,
			hasStatistics: hasStatistics.value,
			resultData: ChartInstance.value?.resultData,
		},
		onward: true,
	});
};

const buildChart = ({ settings, payload } = {}) => {
	ChartInstanceContainer.value.buildChart({
		settings,
		payload_1: { ...(payload || {}), ...props.buildChartsPayloadProps },
		filters: { ...finalFilters.value },
	});

	if (chartInstanceInitialBuild.value) {
		chartInstanceInitialBuild.value = false;
	}

	updateChartInstance.value += 1;

	if (window.location.origin === 'http://localhost:5173') {
		window[`ChartInstanceContainer_${props.chartsContainerIdx || 0}`] = ChartInstanceContainer;
	}
};

const callChartMethod = (methodName, data) => ChartInstance.value?.callChartMethod(methodName, data);

const { handleEvent } = useEventHandler({}, emit);

watch(finalFilters, (filters) => {
	ChartInstanceContainer.value.setFiltersToChart(filters, { refetchData: true });
});

buildChart({ settings: buildChartsSettings.value });

defineExpose({
	ChartInstance,
	ChartInstanceContainer,
	buildChart,
	callChartMethod,
});
</script>
