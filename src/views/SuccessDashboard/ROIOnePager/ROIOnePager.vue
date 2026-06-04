<template>
	<ItemsList :plantItem="plantItem" :perPageItems="perPageItems" />
</template>

<script setup>
import ItemsList from './ItemsList.vue';

defineOptions({ name: 'ROIOnePager' });

defineProps({
	plantItem: { type: Object, default: () => ({}) },
	perPageItems: { type: Array, default: undefined },
});
</script>
