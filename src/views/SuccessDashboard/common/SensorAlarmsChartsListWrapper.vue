<template>
	<div class="sensor-alarms-charts-list-wrapper">
		<SensorAlarmsChartItemContainer
			v-for="item in chartsList"
			:key="item.chartKey || item.id"
			:chartKey="item.chartKey || item.id"
			:rootFilters="rootFilters"
			:statisticsData="statisticsData"
			@event="(payload) => emit('event', payload)"
		/>
	</div>
</template>

<script setup>
import SensorAlarmsChartItemContainer from './SensorAlarmsChartItemContainer.vue';

defineOptions({ name: 'SuccessDashboardSensorAlarmsChartsListWrapper' });

defineProps({
	chartsList: { type: Array, default: () => [{ id: 'main' }] },
	rootFilters: { type: Object, default: () => ({}) },
	statisticsData: { type: Array, default: () => [] },
});
const emit = defineEmits(['event']);
</script>
