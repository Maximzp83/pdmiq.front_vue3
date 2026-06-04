<template>
	<div :class="['health-statistics-card card no-shadow', statusClass]">
		<div class="card-content text-center">
			<div class="title semi-bold">{{ healthData.name || healthData.asset_name || '-' }}</div>
			<div class="page-title semi-bold">{{ score }}</div>
			<div class="small-text">{{ healthData.status || healthData.type || '' }}</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({ name: 'SuccessDashboardHealthStatisticsCard' });

const props = defineProps({
	healthData: { type: Object, default: () => ({}) },
});

const score = computed(() => props.healthData.score ?? props.healthData.health_score ?? props.healthData.value ?? '-');
const statusClass = computed(() => {
	const status = `${props.healthData.status || props.healthData.state || ''}`.toLowerCase();
	if (status.includes('alarm')) return 'alarm';
	if (status.includes('warning')) return 'warning';
	return 'good';
});
</script>
