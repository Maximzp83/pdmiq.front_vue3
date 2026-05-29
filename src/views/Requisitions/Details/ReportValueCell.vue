<template>
	<span>{{ value || '-' }}</span>
</template>

<script setup>
defineOptions({ name: 'RequisitionReportValueCell' });
defineProps({ value: { type: [String, Number], default: '' } });
</script>
