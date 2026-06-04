<template>
	<div class="notes-item">
		<el-form-item :label="label || tt('notes')">
			<el-input v-model="localValue" type="textarea" :rows="rows" :disabled="disabled" />
		</el-form-item>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardNotesItem' });

const props = defineProps({
	modelValue: { type: String, default: '' },
	label: String,
	rows: { type: Number, default: 3 },
	disabled: Boolean,
});
const emit = defineEmits(['update:modelValue']);

const localValue = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
});
</script>
