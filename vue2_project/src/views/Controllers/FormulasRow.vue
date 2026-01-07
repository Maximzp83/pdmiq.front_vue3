<template>
	<el-form
		ref="itemForm"
		:class="['flex mrow standard-form-row align-center']"
		:model="formData"
		:rules="rules"
	>
		<div class="mcol-xs-4 capitalize" v-text="title"></div>
		<el-form-item prop="math_expression" :class="'mcol-xs-4'">
			<CustomInput
				v-model="formData.math_expression"
				placeholder="Expl: ({reg}/20)*5"
			/>
		</el-form-item>

		<el-form-item prop="math_expression_back" :class="'mcol-xs-4'">
			<CustomInput
				v-model="formData.math_expression_back"
				placeholder="Expl: ({reg}/20)*5"
			/>
		</el-form-item>
	</el-form>
</template>

<script>
import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { setupParameterName } from '@/modules/charts_factory/controllers/Sensor/methods';

import { subItemMixin } from '@/mixins';
// import { isEmptyString } from '@/utils/validate';

export default {
	mixins: [subItemMixin()],

	props: {
		formulasData: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			formData: {
				sensor_parameter_type: null,
				math_expression: '',
				math_expression_back: ''
			}
		};
	},

	computed: {
		// title: that => that.itemData.pair_name || that.itemData.name,
		title: that => setupParameterName({parameterItem: that.itemData}),

		rules: that => ({
			math_expression: that.formData.math_expression_back ? required : null,
			math_expression_back: that.formData.math_expression ? required : null
		}),
		deleteId: () => true,
	},

	methods: {
		localSetupPageActions(parameterTypeItem) {
			if (this.formulasData.length) {
				const formulasItem = findItemBy(
					'sensor_parameter_type',
					this.formData.sensor_parameter_type,
					this.formulasData
				);
				if (formulasItem) {
					this.formData = formulasItem;
				}
			} else {
				this.formData = {
					sensor_parameter_type: parameterTypeItem.id,
					math_expression: '',
					math_expression_back: ''
				};
			}
		}
	}
};
</script>
