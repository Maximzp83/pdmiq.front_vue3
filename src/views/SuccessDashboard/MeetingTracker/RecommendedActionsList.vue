<template>
	<div class="recommended-actions-list">
		<NextActivityFormItem
			v-for="item in itemsList"
			:key="item.id || item._id"
			:itemData="item"
			:sensorsList="sensorsList"
			showJustInfo
			:showDeleteButton="false"
		/>
	</div>
</template>

<script setup>
import NextActivityFormItem from './NextActivityFormItem.vue';

defineOptions({ name: 'SuccessDashboardRecommendedActionsList' });

defineProps({
	itemsList: { type: Array, default: () => [] },
	sensorsList: { type: Array, default: () => [] },
});
</script>
