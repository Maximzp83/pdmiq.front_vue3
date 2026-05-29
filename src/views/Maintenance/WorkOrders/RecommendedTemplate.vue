<template>
	<div class="card-content">
		<div class="semi-bold" v-text="itemData?.title || '-'"></div>
		<div class="muted" v-text="itemData?.description || ''"></div>
	</div>
</template>

<script setup>
defineOptions({
	name: 'RecommendedTemplate',
});

defineProps({
	itemData: { type: Object, default: () => ({}) },
});
</script>
