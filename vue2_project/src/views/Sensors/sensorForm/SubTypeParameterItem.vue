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
			label="Metric Unit"
			prop="metric_unit_id"
			class="mcol-xs-9 label_pt-5 mini"
		>
			<CustomSelect
				class="mini"
				clearable
				filterable
				:optionsList="metricMeasurementUnitsOptions"
				placeholder="Select Metric Unit"
				v-model="formData.metric_unit_id"
				@change="handleMetricUnitChange"
			/>
		</el-form-item>

		<el-form-item
			label="Imperial Unit"
			prop="imperial_unit_id"
			class="mcol-xs-9 label_pt-5 mini"
		>
			<CustomSelect
				class="mini"
				clearable
				filterable
				:optionsList="imperialMeasurementUnitsOptions"
				placeholder="Select Imperial Unit"
				v-model="formData.imperial_unit_id"
				@change="handleImperialUnitChange"
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
import {
	getMeasurementUnitsOptionsBySystem
} from '@/helpers/measurementUnits';
import { METRIC_SYSTEM_TYPES } from '@/modules/charts_factory/controllers/Sensor/enums';

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
				metric_unit_id: null,
				imperial_unit_id: null,
				formula: '',
				graph_type: null,
				is_line_speed: false
			}
		};
	},

	computed: {
		chartTypesList: () => Object.freeze(chartTypesList()),
		metricMeasurementUnitsOptions() {
			return Object.freeze(
				getMeasurementUnitsOptionsBySystem(
					this.measurementUnitsList,
					METRIC_SYSTEM_TYPES.METRIC
				)
			);
		},
		imperialMeasurementUnitsOptions() {
			return Object.freeze(
				getMeasurementUnitsOptionsBySystem(
					this.measurementUnitsList,
					METRIC_SYSTEM_TYPES.IMPERIAL
				)
			);
		},
		tooltipContent() {
			return this.$t('aliases.subtype_formula_tooltip');
		}
	},

	methods: {
		handleMetricUnitChange(value) {
			if (value != null) {
				this.formData.imperial_unit_id = null;
			}
		},

		handleImperialUnitChange(value) {
			if (value != null) {
				this.formData.metric_unit_id = null;
			}
		},

		localGetFormDataCallback(formData) {
			const newFormData = { ...formData };
			delete newFormData.units;
			return newFormData;
		}
	}
};
</script>
