<template>
	<div
		class="edit-form-container"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<el-form
			:class="['item-edit-form', {'showJustInfo': formData.is_locked}]"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item label="Metric Name" prop="metric_name">
				<CustomInput
					v-model="formData.metric_name"
					placeholder="Metric Name"
				/>
			</el-form-item>

			<el-form-item label="Imperial Name" prop="imperial_name">
				<CustomInput
					v-model="formData.imperial_name"
					placeholder="Imperial Name"
				/>
			</el-form-item>

			<el-form-item :label="tt('phrases.Metric_To_imperial_formula')" prop="to_imperial_formula">
				<CustomInput
					className="lowercase"
					v-model="formData.to_imperial_formula"
					placeholder="{value} * 2.20462"
				/>
			</el-form-item>

			<el-form-item :label="tt('phrases.Imperial_To_Metric_formula')" prop="to_metric_formula">
				<CustomInput
					className="lowercase"
					v-model="formData.to_metric_formula"
					placeholder="{value} * 2.20462"
				/>
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { required } from '@/constants/validation';
import { itemFormMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin()],

	data() {
		return {
			formData: {
				metric_name: '',
				imperial_name: '',
				to_metric_formula: '',
				to_imperial_formula: '',
				is_locked: 0
			}
		};
	},

	computed: {
		rules: () => ({
			metric_name: required,
			imperial_name: required,
			to_metric_formula: required,
			to_imperial_formula: required,
		})
	},

	methods: {
		...mapActions({
			save_item: 'measurement_units/save_measurement_unit'
		}),

		localPrepareSubmitData(data) {
			return { ...data };
		}
	}
};
</script>
