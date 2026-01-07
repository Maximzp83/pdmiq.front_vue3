<template>
	<div class="filter-option-item">
		<el-checkbox v-model="isChecked">{{ optionData.name }}</el-checkbox>
		<el-input v-model="value" />
	</div>
</template>

<script>
import { isNumber } from '@/utils/validate';
// import { cloneDeep } from '@/helpers';

export default {
	props: {
		optionData: {
			type: Object,
			required: true
		},
		filterData: {
			type: null
		}
	},

	data() {
		return {
			isChecked: false,
			value: ''
		};
	},

	computed: {
		sensorParameterId: that => that.optionData.id,

		/*init_filter_data() {
			return {
				data: {
					value: null,
					// sensorParameterId: this.optionData.id
				},
				isValid: true
			};
		}*/
	},
	methods: {
		/*checkFilterItem() {
			const { isChecked, value } = this;
			let payload = cloneDeep(this.init_filter_data);
			if (isChecked) {
				if (value && isNumber(value)) {
					payload.data.value = +value;
				} else {
					payload.isValid = false;
				}
			}

			this.$emit('ready', payload);
		},*/

		getFormData() {
			const { isChecked, value, sensorParameterId } = this;
			var payload = {	
				sensorParameterId,
				value: null,
				isValid: true
			};
			// let payload = cloneDeep(this.init_filter_data);
			if (isChecked) {
				if (value && isNumber(value)) {
					payload.value = +value;
				} else {
					payload.isValid = false;
				}
			}
			return payload;
		},

		clearFilter() {
			this.isChecked = false;
			this.value = null;

			this.$emit('ready', { ...this.init_filter_data });

			// this.searchSubmit();
		}
	},

	watch: {
		value(val) {
			if (val && !this.isChecked) {
				this.isChecked = true;
			}
		}
	},

	created() {
		// console.log('created')
		this.value = this.filterData ? this.filterData.y_min : null;
	}
};
</script>
