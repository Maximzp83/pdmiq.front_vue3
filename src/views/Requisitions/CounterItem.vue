<template>
	<div :class="['requisition-counter-item', { active: isActiveCard }]">
		<div class="card content-row" @click="handleClick">
			<div class="card-content">
				<div class="flex align-center space-between">
					<div>
						<div class="muted">{{ counterData.title }}</div>
						<div class="title semi-bold">{{ counterData.count || 0 }}</div>
					</div>
					<span class="requisition-status-label" :style="{ backgroundColor: counterData.statusColor }"></span>
				</div>
				<div v-if="counterData.hours || counterData.money" class="muted">
					<span>{{ counterData.hours || '-' }}</span>
					<span class="ml-5">{{ counterData.money || '' }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	counterData: { type: Object, default: () => ({}) },
	filters: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const isActiveCard = computed(() => props.filters?.status === props.counterData?.status);
const handleClick = () => emit('event', 'setFilters', { status: props.counterData.status ?? null });
</script>
