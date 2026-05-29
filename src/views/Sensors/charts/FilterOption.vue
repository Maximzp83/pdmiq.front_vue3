<template>
	<div class="filter-option-item">
		<el-checkbox v-model="isChecked">{{ optionData.name }}</el-checkbox>
		<el-input v-model="value" />
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { isNumber } from '@/utils/validate';

defineOptions({
	name: 'SensorChartFilterOption',
});

const props = defineProps({
	optionData: { type: Object, required: true },
	filterData: null,
});

const emit = defineEmits(['ready']);

const isChecked = ref(false);
const value = ref(props.filterData ? props.filterData.y_min : null);
const sensorParameterId = computed(() => props.optionData.id);

const initFilterData = computed(() => ({
	data: { value: null },
	isValid: true,
}));

const getFormData = () => {
	const payload = {
		sensorParameterId: sensorParameterId.value,
		value: null,
		isValid: true,
	};

	if (isChecked.value) {
		if (value.value && isNumber(value.value)) {
			payload.value = +value.value;
		} else {
			payload.isValid = false;
		}
	}

	return payload;
};

const clearFilter = () => {
	isChecked.value = false;
	value.value = null;
	emit('ready', { ...initFilterData.value });
};

watch(value, (val) => {
	if (val && !isChecked.value) {
		isChecked.value = true;
	}
});

defineExpose({
	getFormData,
	clearFilter,
});
</script>
