<template>
	<div class="card block-item vertical-fluid">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase">{{ title || tt('Problems') }}</div>
		</div>
		<div class="card-content relative">
			<SimpleSpinner :active="statisticsLoading" />
			<CommonChartItemWrapper
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="SuccessDashboardProblemsChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:rootStatisticsData="statisticsData"
			/>
		</div>
	</div>
</template>

<script setup>
import { Lang } from '@/localization';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardProblemsStatisticsContainer' });

defineProps({
	title: String,
	setupProblemsStatisticsProp: String,
	setupProblemsTimeStatisticsProp: String,
	statisticsLoading: Boolean,
	statisticsData: { type: Array, default: () => [] },
});
</script>
