<template>
	<div class="card block-item vertical-fluid">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase">{{ title || tt('Statistics') }}</div>
		</div>
		<div class="card-content">
			<CommonChartItemWrapper
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="SuccessGaugeChart"
				configsKey="maintenanceChartListsConfig"
				:chartKey="chartKey || 'main'"
				:rootFilters="rootFilters"
				:predefinedFilters="predefinedFilters"
				:additionalProps="chartProps"
				:buildChartsPayloadProps="buildChartsPayload"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import { Lang } from '@/localization';
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

highchartsMore(Highcharts);

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardGaugeStatisticsContainer' });

const props = defineProps({
	title: String,
	chartKey: String,
	plantItem: { type: Object, default: () => ({}) },
	predefinedFilters: { type: Object, default: () => ({}) },
	rootFilters: { type: Object, default: () => ({}) },
	selectedColumnsNumber: { type: Object, default: () => ({ id: null }) },
});

const chartProps = computed(() =>
	Object.freeze({
		nodataMock: true,
		showWithoutStatistics: true,
		useSimpleSpinnerAsPreloader: true,
		hcInstance: Highcharts,
		chartInstanceContainerPayload: {
			fetch_action_url: props.plantItem?.id ? `plants/${props.plantItem.id}/roi-cost` : null,
			billing_plan_cost: props.plantItem?.billing_plan_cost,
		},
	}),
);
const buildChartsPayload = computed(() =>
	Object.freeze({
		selectedColumnsNumber: props.selectedColumnsNumber?.id,
	}),
);
</script>
