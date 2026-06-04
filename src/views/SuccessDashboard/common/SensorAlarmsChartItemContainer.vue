<template>
	<div class="sensor-alarms-chart-item-container">
		<CommonChartItemWrapper
			chartFactoryContainerName="MaintenanceChartFactoryContainer"
			chartFactoryName="SuccessDashboardProblemsChart"
			configsKey="maintenanceChartListsConfig"
			:chartKey="chartKey"
			:rootFilters="rootFilters"
			:rootStatisticsData="statisticsData"
			@event="(payload) => emit('event', payload)"
		/>
	</div>
</template>

<script setup>
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

defineOptions({ name: 'SuccessDashboardSensorAlarmsChartItemContainer' });

defineProps({
	chartKey: { type: String, default: 'main' },
	rootFilters: { type: Object, default: () => ({}) },
	statisticsData: { type: Array, default: () => [] },
});
const emit = defineEmits(['event']);
</script>
