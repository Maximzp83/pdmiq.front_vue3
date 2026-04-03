<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container type-option-item']"
		:model="formData"
	>
		<div class="flex mrow content-container content-row analysis">
			<el-form-item prop="name" class="mcol-xs-2" required>
				<label>{{ tt('Name') }}</label>
				<CustomInput v-model="formData.name" :placeholder="tt('name')"/>
			</el-form-item>

			<el-form-item prop="measurement_unit_id" class="mcol-xs-2">
				<label>Measurement Unit</label>
				<CustomSelect
					clearable
					filterable
					:optionsLoading="measurementUnitsLoading"
					:optionsList="measurementUnitsOptions"
					placeholder="Select Measurement Unit"
					v-model="formData.measurement_unit_id"
				/>
			</el-form-item>

			<el-form-item prop="crossover_tags" class="mcol-xs-3" required>
				<label>{{ tt('crossover_tags') }}</label>
				<CustomInput v-model="formData.crossover_tags" placeholder="DA, NDA e.t.c..."/>
			</el-form-item>

			<el-form-item prop="formula" class="mcol-xs-20">
				<label>{{ tt('formula') }}</label>
				<CustomInput v-model="formData.formula" placeholder="{rpm}/{value}"/>
			</el-form-item>

			<el-form-item prop="harmonics" class="mcol-xs-2">
				<label>{{ tt('harmonics') }}</label>
				<CustomInput v-model="formData.harmonics" :placeholder="tt('harmonics')"/>
			</el-form-item>

			<el-form-item prop="is_visible" class="mcol-xs-1 switchers-block">
				<label class="small-lh">{{ tt('phrases.Show_in_analysis') }}</label>
				<el-switch
					class="without-margin"
					v-model="formData.is_visible"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item prop="is_editable" class="mcol-xs-1 switchers-block">
				<label class="small-lh">{{ tt('editable') }}</label>
				<el-switch
					class="without-margin"
					v-model="formData.is_editable"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<div>
				<el-button
					class="action-button remove-button"
					size="mini"
					type="danger"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>
			</div>
		</div>
	</el-form>
</template>

<script>
import { getMeasurementUnitsOptions } from '@/helpers/measurementUnits';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		measurementUnitsList: {
			type: Array,
			default: () => []
		},
		measurementUnitsLoading: Boolean
	},
	data() {
		return {
			formData: {
				id: null,
				name: '',
				unit: '',
				measurement_unit_id: null,
				crossover_tags: '',
				is_visible: 0,
				is_editable: 0,

				formula: '',
				harmonics: 5
			}
		};
	},

	computed: {
		deleteNewId: () => true,
		measurementUnitsOptions() {
			return Object.freeze(getMeasurementUnitsOptions(this.measurementUnitsList));
		}
	},

	methods: {
		localGetFormDataCallback(formData) {
			const newFormData = { ...formData };
			delete newFormData.unit;
			return newFormData;
		}
	}
};
</script>
