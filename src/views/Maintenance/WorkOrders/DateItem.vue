<template>
	<div class="flex align-center content-row">
		<Datepicker v-model="localDate" :pickerOptions="pickerOptions" />
		<el-button
			type="danger"
			class="action-button mini"
			icon="icomoon icon-cross"
			@click="$emit('onRemove', itemData.id)"
		/>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue';

import Datepicker from '@/components/common/Datepicker.vue';

defineOptions({
	name: 'WorkOrderDateItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	pickerOptions: { type: Object, default: () => ({}) },
});

defineEmits(['onRemove']);

const localDate = ref(props.itemData.date || null);

watch(
	() => props.itemData.date,
	(value) => {
		localDate.value = value || null;
	},
);

defineExpose({
	getData: () => ({ ...props.itemData, date: localDate.value }),
	validateForm: () => !!localDate.value,
});
</script>
