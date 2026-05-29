<template>
	<div class="description-table-cell" v-html="cellValue || '-'"></div>
</template>

<script setup>
defineOptions({
	name: 'MaintenanceDescriptionTableCell',
});

defineProps({
	cellValue: { type: [String, Number], default: '' },
});
</script>
