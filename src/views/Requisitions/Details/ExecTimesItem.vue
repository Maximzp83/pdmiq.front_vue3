<template>
	<div class="exec-times-item">
		<span>{{ itemData?.date || '-' }}</span>
		<span>{{ itemData?.time || '-' }}</span>
	</div>
</template>

<script setup>
defineOptions({ name: 'RequisitionExecTimesItem' });
defineProps({ itemData: { type: Object, default: () => ({}) } });
</script>
