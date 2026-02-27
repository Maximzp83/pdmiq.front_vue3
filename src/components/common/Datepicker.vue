<template>
	<div :class="className">
		<el-date-picker
			@update:modelValue="handleInput"
			:modelValue="inputValue"
			:disabled="disabled"
			:type="type"
			range-separator="-"
			:format="format"
			:value-format="valueFormat"
			:start-placeholder="`${tt('phrases.Start_date')}`"
			:end-placeholder="`${tt('phrases.End_date')}`"
			:placeholder="placeholder"
			:unlink-panels="type == 'daterange'"
			align="right"
			:picker-options="finalPickerOptions"
			:default-time="defaultTime"
			:x-placement="xPlacement"
			show-confirm
			:size="size"
		/>
	</div>
</template>

<script setup>
// import 'element-ui/lib/theme-chalk/date-picker.css';
import { computed } from 'vue';
import { Lang } from '@/localization';
const { tt } = Lang;

import { datePickerShortcuts } from '@/constants/date_time';
import { getDateRange } from '@/helpers';

defineOptions({
	name: 'CommonDatepicker',
});
// =========================
const props = defineProps({
	modelValue: null,
	value: null,
	className: { type: String, default: () => 'datepicker-container' },
	pickerOptions: { type: Object, default: () => undefined },
	xPlacement: { type: String, default: () => undefined },
	defaultTime: null,
	type: { type: String, default: 'date' },
	format: { type: String, default: 'YYYY/MM/DD' },
	valueFormat: { type: String, default: 'YYYY-MM-DD' },
	placeholder: String,
	clearable: Boolean,
	clearingTo: { type: String, default: 'today' },
	setupDaterangeFilter: Boolean,
	enableShortcuts: Boolean,
	disabled: Boolean,
	size: String
});
// ========== Computed ===========
const inputValue = computed(() => props.modelValue ?? props.value ?? '');

const finalPickerOptions = computed(() => {
	let options = {};

	if (props.pickerOptions) {
		options = { ...props.pickerOptions };
	}

	if (props.enableShortcuts) {
		options = { ...options, shortcuts: datePickerShortcuts() };
	}

	return Object.freeze(options);
});

// ========== Methods ===========
const emit = defineEmits(['update:modelValue', 'input']);

const prepareDateRange = (range, currentValue) => {
	let result_value = range ? [...range] : null;
	let next;

	if (result_value != currentValue) {
		if (!result_value && !props.clearable) {
			result_value = getDateRange(props.clearingTo, {
				getDateString: true,
				withTime: props.type == 'datetime' || props.type == 'datetimerange'
			});
		}
		next = true;
	}

	return {
		daterange: result_value,
		next: next
	};
};

const handleInput = (val) => {
	// console.log(val)
	if (props.setupDaterangeFilter) {
		const { daterange, next } = prepareDateRange(val, inputValue.value);
		if (next) {
			emit('update:modelValue', daterange);
			emit('input', daterange);
		}
	} else {
		emit('update:modelValue', val);
		emit('input', val);
	}
}
</script>
