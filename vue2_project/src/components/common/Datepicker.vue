<template>
	<div :class="className">
		<el-date-picker
			@input="handleInput"
			:disabled="disabled"
			:value="value"
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
		/>
	</div>
</template>

<script>
// import 'element-ui/lib/theme-chalk/date-picker.css';
import { datePickerShortcuts } from '@/constants/date_time';
import { getDateRange } from '@/helpers';

export default {
	props: {
		// name: {	type: String,	default: 'standard-fade-250' },
		// tag: { type: String,	default: 'div' },
		// group: Boolean,
		// trigger: null
		value: null,
		className: { type: String, default: () => 'datepicker-container' },
		pickerOptions: { type: Object, default: () => undefined },
		xPlacement: { type: String, default: () => undefined },
		defaultTime: null,
		type: { type: String, default: 'date' },
		format: { type: String, default: 'yyyy/MM/dd' },
		valueFormat: { type: String, default: 'yyyy-MM-dd' },
		placeholder: String,
		clearable: Boolean,
		clearingTo: { type: String, default: 'today' },
		setupDaterangeFilter: Boolean,
		enableShortcuts: Boolean,
		disabled: Boolean
		// duration: {type: Number, default: 1000 }
	},

	components: {
		ElDatePicker: () =>
			import(/* webpackChunkName: "ElDatePicker" */ 'element-ui/lib/date-picker')
	},

	computed: {
		finalPickerOptions() {
			let options = {};

			if (this.pickerOptions) {
				options = { ...this.pickerOptions };
			}

			if (this.enableShortcuts) {
				options = { ...options, shortcuts: datePickerShortcuts() };
			}

			return Object.freeze(options);
		}
	},

	methods: {
		prepareDateRange(range /*settings*/) {
			// console.log(range);
			let value = range ? [...range] : null;
			let next;

			// console.log(value , this.value)
			if (value != this.value) {
				if (!value && !this.clearable) {
					value = getDateRange(this.clearingTo, {
						getDateString: true,
						withTime: this.type == 'datetime' || this.type == 'datetimerange'
					});
				}
				next = true;
			}

			return {
				daterange: value,
				next: next
			};
		},

		handleInput(value) {
			// console.log('handleInput', value)
			if (this.setupDaterangeFilter) {
				const { daterange, next } = this.prepareDateRange(value);
				if (next) {
					// console.log(this.setupDaterangeFilter, daterange)
					this.$emit('input', daterange);
				}
			} else {
				this.$emit('input', value);
			}
		}
	}
};
</script>
