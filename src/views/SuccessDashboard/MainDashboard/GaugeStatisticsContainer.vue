<template>
	<div :class="['block-item gauge-chart statistics-block', `columnsNumber-${selectedColumnsNumber.id}`]">
		<div v-if="showStatisticsOutsideChart" class="statistics-outside flex space-between">
			<div class="semi-bold alarm-color">${{ statisticsData.redArea }}</div>
			<div class="semi-bold green-color">${{ statisticsData.currentValue }}</div>
		</div>

		<div class="relative chart-height-auto">
			<CommonChartItemWrapper
				ref="commonChartItemWrapperRef"
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="SuccessGaugeChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:additionalProps="chartProps"
				:rootFilters="rootFilters"
				:buildChartsPayloadProps="buildChartsPayload"
				:chartWrapperIdx="9"
				:rootStatisticsData="alreadyStatisticsData"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Highcharts from '@/config/highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import boost from 'highcharts/modules/boost';
import annotations from 'highcharts/modules/annotations';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { initHighchartsModule } from '@/helpers/charts';

import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

defineOptions({ name: 'SuccessDashboardGaugeStatisticsContainer' });

const props = defineProps({
	plantItem: { type: Object, default: () => null },
	plantsList: { type: Array, default: null },
	selectedColumnsNumber: { type: Object, default: () => ({}) },
	showStatisticsOutsideChart: Boolean,
	rootFilters: { type: Object, default: () => ({}) },
	allPlantsRoiStatistics: null,
	prorateBillingCost: Boolean,
});

const emit = defineEmits(['event']);

const commonChartItemWrapperRef = ref(null);
const statisticsData = ref({});
const alreadyStatisticsData = ref(
	props.plantsList
		? {
			billing_plan_cost: 0,
			roi_cost: 0,
		}
		: null,
);
const hcInstance = computed(() => {
	initHighchartsModule(highchartsMore, Highcharts);
	initHighchartsModule(boost, Highcharts);
	initHighchartsModule(annotations, Highcharts);
	return Highcharts;
});

const chartProps = computed(() => {
	let chartInstanceContainerPayload = {};

	if (props.plantItem) {
		chartInstanceContainerPayload = {
			fetch_action_url: props.plantItem ? `plants/${props.plantItem.id}/roi-cost` : null,
			billing_plan_cost: props.plantItem.billing_plan_cost,
			joined_at: props.plantItem.joined_at,
			prorateBillingCost: props.prorateBillingCost,
		};
	}

	return Object.freeze({
		nodataMock: true,
		showWithoutStatistics: true,
		hcInstance: hcInstance.value,
		chartInstanceContainerPayload,
		useSimpleSpinnerAsPreloader: true,
	});
});
const buildChartsPayload = computed(() =>
	Object.freeze({
		selectedColumnsNumber: props.selectedColumnsNumber?.id,
	}),
);

const callChartMethod = (method, data) => {
	commonChartItemWrapperRef.value?.callChartMethod(method, data);
};
const handleChartContainerReady = (data) => {
	if (data?.hasStatistics) {
		const { base, redArea } = data.resultData.statistics_result.main.pointsData;
		statisticsData.value = {
			redArea,
			currentValue: base[0],
		};

		emit('event', {
			eventName: 'plantRoiStatisticsReady',
			data: { ...statisticsData.value, plantId: props.plantItem?.id },
			onward: true,
		});
	}
};
const setupStatisticsData = (plantsList) => {
	let billing_plan_cost = 0;
	let roi_cost = 0;

	if (plantsList) {
		plantsList.forEach((plant) => {
			billing_plan_cost += plant.billing_plan_cost;
			roi_cost += plant.roi_cost;
		});
	}

	return Object.freeze({
		billing_plan_cost,
		roi_cost,
	});
};

const { handleEvent } = useEventHandler({
	handleChartContainerReady,
});

watch(
	() => props.allPlantsRoiStatistics,
	(val) => {
		if (!val) return;
		alreadyStatisticsData.value = {
			billing_plan_cost: val.redArea,
			roi_cost: val.currentValue,
		};

		callChartMethod('handleResponse', alreadyStatisticsData.value);
	},
);

defineExpose({
	callChartMethod,
	setupStatisticsData,
});
</script>
