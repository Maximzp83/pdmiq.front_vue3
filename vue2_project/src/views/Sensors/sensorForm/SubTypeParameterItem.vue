<template>
	<el-form
		ref="itemForm"
		class="form-subitem-container io-parameter-item-container border-top-devider"
		:model="formData"
		label-width="150px"
		:label-position="isMobile ? 'top' : 'left'"
	>
		<el-form-item
			:label="tt('parameter')"
			class="label_pt-5 mini showJustInfo"
		>
			<div>{{ itemData.title }}</div>
		</el-form-item>

		<el-form-item
			:label="tt('name')"
			prop="name"
			class="mcol-xs-9 label_pt-5 mini"
		>
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item
			label="Measurement Unit"
			prop="measurement_unit_id"
			class="mcol-xs-9 label_pt-5 mini"
		>
			<CustomSelect
				class="mini"
				clearable
				filterable
				:optionsList="measurementUnitsOptions"
				placeholder="Select Measurement Unit"
				v-model="formData.measurement_unit_id"
			/>
		</el-form-item>

		<!--
		<el-form-item
			:label="tt('units')"
			prop="units"
			class="mcol-xs-9 label_pt-5 mini"
		>
			<CustomInput v-model="formData.units" :placeholder="tt('units')" />
		</el-form-item>
		-->

		<el-form-item
			prop="formula"
			class="mcol-xs-9 label_pt-5 mini"
		>
			<template v-slot:label>
				<span class="span-block">{{ tt('formula') }}</span>
				<span class="span-block">
					<el-tooltip class="" effect="dark" placement="bottom">
						<i class="el-icon-info"></i>
						<div slot="content" v-html="tooltipContent"></div>
					</el-tooltip>
				</span>
			</template>

			<CustomInput v-model="formData.formula" :placeholder="tt('formula')" />
		</el-form-item>

		<el-form-item
			:label="`${tt('Chart')} ${tt('Type')}`"
			prop="graph_type"
			class="mcol-xs-9 label_pt-5 mini"
		>
			<CustomSelect
				class="mini"
				:optionsList="chartTypesList"
				:placeholder="`${tt('Select')} ${tt('type')}`"
				v-model="formData.graph_type"
			/>
		</el-form-item>

		<el-form-item
			:label="`${tt('line')} ${tt('speed')}`"
			prop="is_line_speed"
		>
			<el-switch
				v-model="formData.is_line_speed"
				:active-value="1"
				:inactive-value="0"
			/>
		</el-form-item>

	</el-form>
</template>

<script>
import { chartTypesList } from '@/constants/global';
import { subItemMixin } from '@/mixins';
import { getMeasurementUnitsOptions } from '@/helpers/measurementUnits';

export default {
	mixins: [subItemMixin()],
	props: {
		fromModal: Boolean,
		measurementUnitsList: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			formData: {
				id: null,
				name: '',
				units: '',
				measurement_unit_id: null,
				formula: '',
				graph_type: null,
				is_line_speed: false
			}
		};
	},

	computed: {
		chartTypesList: () => Object.freeze(chartTypesList()),
		measurementUnitsOptions() {
			return Object.freeze(getMeasurementUnitsOptions(this.measurementUnitsList));
		},
		tooltipContent() {
			return this.$t('aliases.subtype_formula_tooltip');
		}
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
