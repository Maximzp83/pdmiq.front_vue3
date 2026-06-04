<template>
	<div class="mrow flex wrap el-form-item">
		<el-form-item :label="label" class="mcol-xs-12">
			<el-input v-model="localValue.description" type="textarea" :rows="3" />
		</el-form-item>
	</div>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({ name: 'ROIOnePagerDynamicFormItem' });

const props = defineProps({
	modelValue: { type: Object, default: () => ({}) },
	label: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const localValue = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
});
</script>
