<template>
	<div
		class="edit-form-container"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<el-form
			class="item-edit-form"
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

			<el-form-item label="Primary System" prop="primary_system">
				<el-radio-group v-model="formData.primary_system">
					<el-radio-button
						v-for="item in metricSystemsList"
						:key="`measurement-system-${item.id}`"
						:label="item.id"
					>
						{{ item.name }}
					</el-radio-button>
				</el-radio-group>
			</el-form-item>

			<el-form-item label="Conversion Formula" prop="to_secondary_formula">
				<CustomInput
					className="lowercase"
					v-model="formData.to_secondary_formula"
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
import {
	metricSystemsList,
	METRIC_SYSTEM_TYPES
} from '@/modules/charts_factory/controllers/Sensor/enums';

export default {
	mixins: [itemFormMixin()],

	data() {
		return {
			formData: {
				metric_name: '',
				imperial_name: '',
				primary_system: METRIC_SYSTEM_TYPES.METRIC,
				to_secondary_formula: ''
			}
		};
	},

	computed: {
		rules: () => ({
			metric_name: required,
			imperial_name: required,
			primary_system: required
		}),

		metricSystemsList: () => Object.freeze(metricSystemsList()),
	},

	methods: {
		...mapActions({
			save_item: 'measurement_units/save_measurement_unit'
		}),

		localPrepareSubmitData(data) {
			const newData = { ...data };

			if (!newData.to_secondary_formula) {
				newData.to_secondary_formula = null;
			}

			return newData;
		}
	}
};
</script>
