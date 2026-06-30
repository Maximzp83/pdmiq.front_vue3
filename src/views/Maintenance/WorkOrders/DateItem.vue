<template>
	<div class="flex align-center content-row">
		<Datepicker v-model="localDate" :pickerOptions="pickerOptions" class="mini span-block"/>
		<el-button
			type="danger"
			class="action-button mini span-block"
			@click="$emit('onRemove', itemData.id)"
		>
			<i class="icomoon icon-cross"></i>
		</el-button>
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
