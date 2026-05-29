<template>
	<div class="material-item">
		<span>{{ itemData?.name || '-' }}</span>
		<span>{{ itemData?.cost || '-' }}</span>
	</div>
</template>

<script setup>
defineOptions({ name: 'RequisitionMaterialItem' });
defineProps({ itemData: { type: Object, default: () => ({}) } });
</script>
