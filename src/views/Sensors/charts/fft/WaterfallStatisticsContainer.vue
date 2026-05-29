<template>
	<div class="waterfall-statistics-container">
		<CommonChartItemWrapper
			v-if="chartMainData.sensorItem"
			:rootFilters="rootFilters"
			:additionalProps="additionalProps"
			:buildChartsPayloadProps="buildChartsPayloadProps"
			chartFactoryContainerName="3DChartFactoryContainer"
			chartFactoryName="WaterfallChart"
			configsKey="FFTChartsListsConfig"
			chartKey="waterfall"
		/>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

defineOptions({
	name: 'WaterfallStatisticsContainer',
});

const props = defineProps({
	currentFFTChartStatistics: { type: Object, default: () => ({}) },
	prevFFTItems: { type: Array, default: () => [] },
	chartMainData: { type: Object, default: () => ({}) },
	rootFilters: { type: Object, default: () => ({}) },
});

const additionalProps = computed(() => Object.freeze({
	disablePreloaderText: true,
	showWithoutStatistics: true,
	hcInstance: null,
}));

const buildChartsPayloadProps = computed(() => Object.freeze({
	currentFFTChartStatistics: props.currentFFTChartStatistics,
	prevFFTItems: props.prevFFTItems,
	...props.chartMainData,
}));
</script>
