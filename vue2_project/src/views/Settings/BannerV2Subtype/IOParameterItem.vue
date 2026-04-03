<template>
	<el-form
		ref="itemForm"
		class="form-subitem-container io-parameter-item-container border-top-devider"
		:model="formData"
		:rules="rules"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item
			:label="tt('name')"
			prop="name"
			:class="{ 'mcol-xs-6': !fromModal }"
		>
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item
			label="Measurement Unit"
			prop="measurement_unit_id"
			:class="{ 'mcol-xs-6': !fromModal }"
		>
			<CustomSelect
				clearable
				filterable
				:optionsLoading="measurementUnitsLoading"
				:optionsList="measurementUnitsOptions"
				placeholder="Select Measurement Unit"
				v-model="formData.measurement_unit_id"
			/>
		</el-form-item>

		<!--
		<el-form-item
			:label="tt('units')"
			prop="units"
			:class="{ 'mcol-xs-6': !fromModal }"
		>
			<CustomInput v-model="formData.units" :placeholder="tt('units')" />
		</el-form-item>
		-->

		<el-form-item
			:label="tt('formula')"
			prop="formula"
			:class="{ 'mcol-xs-6': !fromModal }"
		>
			<CustomInput v-model="formData.formula" :placeholder="tt('formula')" />
		</el-form-item>

		<el-form-item
			:label="`${tt('constants.Alarm')} ${tt('Type')}`"
			prop="alarm_type"
			:class="{ 'mcol-xs-6': !fromModal }"
		>
			<CustomSelect
				:optionsList="ncdAlarmTypesList"
				:placeholder="`${tt('Select')} ${tt('type')}`"
				v-model="formData.alarm_type"
			/>
		</el-form-item>

		<el-form-item
			:label="`${tt('Chart')} ${tt('Type')}`"
			prop="graph_type"
			:class="{ 'mcol-xs-6': !fromModal }"
		>
			<CustomSelect
				:optionsList="chartTypesList"
				:placeholder="`${tt('Select')} ${tt('type')}`"
				v-model="formData.graph_type"
			/>
		</el-form-item>

		<el-form-item
			:label="tt('customizable')"
			prop="is_customizable"
		>
			<el-switch
				v-model="formData.is_customizable"
				:active-value="1"
				:inactive-value="0"
			/>
		</el-form-item>

		<el-form-item
			:label="tt('Signed')"
			prop="is_signed"
		>
			<el-switch
				v-model="formData.is_signed"
				:active-value="1"
				:inactive-value="0"
			/>
		</el-form-item>

		<el-form-item
			:label="tt('phrases.Visible_by_default')"
			prop="is_visible_by_default"
		>
			<el-switch
				v-model="formData.is_visible_by_default"
				:active-value="1"
				:inactive-value="0"
			/>
		</el-form-item>

		<el-form-item label=" ">
			<el-button
				class="ml-auto action-button remove-button"
				size="mini"
				type="danger"
				icon="icomoon icon-cross"
				@click="removeItem"
			/>
		</el-form-item>
	</el-form>
</template>

<script>
import { ncdAlarmTypesList, chartTypesList } from '@/constants/global';
import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';
import { getMeasurementUnitsOptions } from '@/helpers/measurementUnits';

export default {
	mixins: [subItemMixin()],
	props: {
		// isMobile: Boolean,
		fromModal: Boolean,
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
				units: '',
				measurement_unit_id: null,
				formula: '',
				alarm_type: null,
				graph_type: null,
				is_customizable: 0,
				is_signed: 0,
				is_visible_by_default: 0
			}
		};
	},

	computed: {
		ncdAlarmTypesList: () => Object.freeze(ncdAlarmTypesList()),
		chartTypesList: () => Object.freeze(chartTypesList()),
		measurementUnitsOptions() {
			return Object.freeze(getMeasurementUnitsOptions(this.measurementUnitsList));
		},

		rules: () => ({
			name: required,
			formula: required,
			alarm_type: required,
		}),

		deleteNewId: () => true,
	},

	methods: {
		localGetFormDataCallback(formData) {
			const newFormData = { ...formData };
			delete newFormData.units;
			return newFormData;
		}
	}
};
</script>
