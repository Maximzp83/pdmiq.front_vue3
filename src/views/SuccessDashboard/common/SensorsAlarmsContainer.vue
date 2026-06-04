<template>
	<div class="card block-item">
		<div class="card-header filled_2">
			<div class="title semi-bold uppercase">{{ title || tt('Alarms') }}</div>
		</div>
		<div class="card-content">
			<SensorAlarmsChartsListWrapper
				:chartsList="chartsList"
				:rootFilters="rootFilters"
				:statisticsData="statisticsData"
				@event="(payload) => emit('event', payload)"
			/>
		</div>
	</div>
</template>

<script setup>
import { Lang } from '@/localization';
import SensorAlarmsChartsListWrapper from './SensorAlarmsChartsListWrapper.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardSensorsAlarmsContainer' });

defineProps({
	title: String,
	chartsList: { type: Array, default: () => [{ id: 'main' }] },
	rootFilters: { type: Object, default: () => ({}) },
	statisticsData: { type: Array, default: () => [] },
});
const emit = defineEmits(['event']);
</script>
