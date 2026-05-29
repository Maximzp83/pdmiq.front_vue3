<template>
	<span>{{ preparedValue }}</span>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
	name: 'SensorTypeTableCell',
});

const props = defineProps({
	value: { type: [String, Number], default: '' },
	payload: { type: Object, default: () => ({}) },
});

const preparedValue = computed(() => {
	if (props.payload?.isMacAddress) return props.value || '-';
	if (props.payload?.isDataset && props.payload?.dataSetsList) {
		const item = props.payload.findItemBy?.('id', props.value, props.payload.dataSetsList);
		return item?.name || props.value || '-';
	}
	return props.value || '-';
});
</script>
