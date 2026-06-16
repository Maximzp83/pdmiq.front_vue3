<template>
	<div :class="['datepicker-container', className]">
		<el-date-picker
			v-if="isPickerMounted"
			ref="pickerRef"
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
			:shortcuts="shortcuts"
			:disabled-date="disabledDate"
			:cell-class-name="cellClassName"
			:disabled-hours="disabledHours"
			:disabled-minutes="disabledMinutes"
			:disabled-seconds="disabledSeconds"
			:default-time="finalDefaultTime"
			:placement="placement"
			@calendar-change="handleCalendarChange"
			@visible-change="handleVisibleChange"
			@blur="emit('blur')"
			show-confirm
			:size="size"
		/>

		<div
			v-else
			:class="[
				'datepicker-mock',
				'el-date-editor',
				`el-date-editor--${type}`,
				size ? `el-input--${size}` : '',
				{
					'is-disabled': disabled,
					'el-input--prefix': true,
					'el-input--suffix': clearable && hasValue,
				},
			]"
			:tabindex="disabled ? -1 : 0"
			role="button"
			@click="activatePicker"
			@keydown.enter.prevent="activatePicker"
			@keydown.space.prevent="activatePicker"
		>
			<div class="el-input__wrapper">
				<span class="el-input__prefix">
					<span class="el-input__prefix-inner">
						<el-icon class="calendar-icon">
							<CalendarIcon />
						</el-icon>
					</span>
				</span>

					<!-- class="el-input__inner datepicker-range-inner" -->
				<template
					v-if="isRangeType"
				>
					<input :class="['el-range-input']"
						:placeholder="rangeStartPlaceholder"
						:value="rangeDisplayStart"/>
					<!-- </span> -->
					<span class="el-range-separator">-</span>
					<input :class="['el-range-input']" 
						:placeholder="rangeEndPlaceholder"
						:value="rangeDisplayEnd"/>
				</template>

				<span v-else :class="['el-input__inner', { 'is-placeholder': !displayValue }]">
					{{ displayValue || finalPlaceholder || '' }}
				</span>

				<span v-if="clearable && !disabled" class="el-input__suffix">
					<span class="el-input__suffix-inner">
						<el-icon class="close-icon" @click.stop="handleInput(null)">
							<CircleCloseIcon />
						</el-icon>
					</span>
				</span>
			</div>
		</div>
	</div>
</template>

<script setup>
// import 'element-ui/lib/theme-chalk/date-picker.css';
import { computed, nextTick, ref } from 'vue';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon, CircleClose as CircleCloseIcon } from '@element-plus/icons-vue';
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
	className: { type: String, default: () => '' },
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
const pickerRef = ref(null);
const isPickerMounted = ref(false);

const legacyPickerOptions = computed(() => {
	let options = {};

	if (props.pickerOptions) {
		options = { ...props.pickerOptions };
	}

	if (props.enableShortcuts) {
		options = { ...options, shortcuts: datePickerShortcuts() };
	}

	return Object.freeze(options);
});
const shortcuts = computed(() =>
	(legacyPickerOptions.value.shortcuts || []).map((shortcut) => {
		if (!shortcut?.onClick) return shortcut;

		return {
			...shortcut,
			onClick: (picker) => {
				shortcut.onClick({
					...picker,
					$emit: (eventName, value) => {
						picker.emit(eventName, normalizePickerValue(value));
					},
				});
			},
		};
	}),
);
const disabledDate = computed(() => legacyPickerOptions.value.disabledDate);
const cellClassName = computed(() => legacyPickerOptions.value.cellClassName);
const disabledHours = computed(() => legacyPickerOptions.value.disabledHours);
const disabledMinutes = computed(() => legacyPickerOptions.value.disabledMinutes);
const disabledSeconds = computed(() => legacyPickerOptions.value.disabledSeconds);
const placement = computed(() => props.xPlacement || legacyPickerOptions.value.placement || 'bottom');
const finalDefaultTime = computed(() => normalizeDefaultTime(props.defaultTime));
const isRangeType = computed(() => props.type?.includes('range'));
const hasValue = computed(() => {
	const value = inputValue.value;
	return Array.isArray(value) ? value.some((item) => item || item === 0) : value || value === 0;
});
const displayValue = computed(() => {
	const value = inputValue.value;
	if (Array.isArray(value)) {
		return value.map(formatDisplayValue).filter(Boolean).join(' - ');
	}

	return formatDisplayValue(value);
});
const rangeDisplayStart = computed(() => {
	const value = inputValue.value;
	return Array.isArray(value) ? formatDisplayValue(value[0]) : '';
});
const rangeDisplayEnd = computed(() => {
	const value = inputValue.value;
	return Array.isArray(value) ? formatDisplayValue(value[1]) : '';
});
const rangeStartPlaceholder = computed(() => tt('phrases.Start_date'));
const rangeEndPlaceholder = computed(() => tt('phrases.End_date'));
const pendingRangeValue = ref(undefined);
const hasPendingCalendarRange = ref(false);

const normalizePickerValue = (value) => {
	if (Array.isArray(value)) {
		return value.map((item) => dayjs(item));
	}

	return value ? dayjs(value) : value;
};

const normalizeDefaultTime = (value) => {
	if (Array.isArray(value)) {
		return value.map((item) => normalizeDefaultTimeItem(item));
	}

	return normalizeDefaultTimeItem(value);
};

const normalizeDefaultTimeItem = (value) => {
	if (!value || value instanceof Date) return value;

	if (typeof value === 'string') {
		const [hours = 0, minutes = 0, seconds = 0] = value.split(':').map(Number);
		return new Date(2000, 0, 1, hours || 0, minutes || 0, seconds || 0);
	}

	return value;
};

const formatDisplayValue = (value) => {
	if (!value && value !== 0) return '';

	const date = dayjs(value);
	return date.isValid() ? date.format(props.format) : `${value}`;
};

const finalPlaceholder = computed(() => {
	if (isRangeType.value) {
		return props.placeholder || `${tt('phrases.start_date')} - ${tt('phrases.end_date')}`;
	}

	return props.placeholder || tt('phrases.Date_range');
});

// ========== Methods ===========
const emit = defineEmits(['update:modelValue', 'input', 'blur']);

const activatePicker = async () => {
	if (props.disabled || isPickerMounted.value) return;

	isPickerMounted.value = true;
	await nextTick();
	pickerRef.value?.handleOpen?.();
	pickerRef.value?.focus?.();
};

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

const emitInputValue = (val) => {
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

const handleInput = (val) => {
	if (isRangeType.value && hasPendingCalendarRange.value) {
		pendingRangeValue.value = val;
		return;
	}

	emitInputValue(val);
}

const handleCalendarChange = (value) => {
	if (isRangeType.value) {
		hasPendingCalendarRange.value = true;
	}

	if (typeof legacyPickerOptions.value.onPick === 'function') {
		legacyPickerOptions.value.onPick({
			minDate: value?.[0],
			maxDate: value?.[1],
		});
	}
};

const handleVisibleChange = (visible) => {
	if (visible || pendingRangeValue.value === undefined) return;

	const value = pendingRangeValue.value;
	pendingRangeValue.value = undefined;
	hasPendingCalendarRange.value = false;
	emitInputValue(value);
};
</script>
