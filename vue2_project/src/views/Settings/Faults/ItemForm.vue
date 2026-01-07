<template>
	<div
		class="edit-form-container "
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="`${tt('Name')} EN`" prop="title_en" class="mcol-xs-12">
				<CustomInput v-model="formData.title_en" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item :label="`${tt('Name')} ESP`" prop="title_es" class="mcol-xs-12">
				<CustomInput v-model="formData.title_es" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item
				class="mcol-xs-12"
				label="Type of equipments"
				prop="equipment_types"
			>
				<SimpleSpinner :active="equipmentTypesLoading" />

				<el-select
					collapse-tags
					multiple
					:placeholder="`${tt('select')} ${tt('phrases.type_of_equipments')}`"
					:disabled="!equipmentTypesList.length"
					v-model="formData.equipment_types"
				>
					<el-option
						v-for="item in equipmentTypesList"
						:key="'equipment_type-id-' + item.id"
						:label="item.name"
						:value="item.id"
					>
					</el-option>
				</el-select>
			</el-form-item>

			<el-form-item
				class="mcol-xs-12"
				label="Parameters"
				prop="sensor_parameter_types"
			>
				<!-- <SimpleSpinner :active="parametersLoading" /> -->
				<el-select
					collapse-tags
					multiple
					:placeholder="`${tt('select')} ${tt('parameters')}`"
					:disabled="!sensorParametersList.length"
					v-model="formData.sensor_parameter_types"
				>
					<el-option
						v-for="item in sensorParametersList"
						:key="'parameter_type-id-' + item.id"
						:label="item.name"
						:value="item.id"
					>
					</el-option>
				</el-select>
			</el-form-item>

			<el-form-item class="mcol-xs-12" label="Alert rules" prop="alert_rules">
				<el-select
					collapse-tags
					multiple
					:placeholder="`${tt('select')} ${tt('alert')} ${tt('rules')}`"
					:disabled="!alertRulesList.length"
					v-model="formData.alert_rules"
				>
					<el-option
						v-for="item in alertRulesList"
						:key="'alert_rules-id-' + item.id"
						:label="item.name"
						:value="item.id"
					>
					</el-option>
				</el-select>
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
import { /*mapState,*/ mapActions } from 'vuex';
// import { updateFormData } from '@/helpers';
import {
	// sensorParametersListNCD,
	alertRulesList,
	FAULTS_TYPES
} from '@/constants/global';

import { sensorParametersList } from '@/modules/charts_factory/controllers/Sensor/enums';

import { required } from '@/constants/validation';
import { itemFormMixin, requestsListMixin } from '@/mixins';

export default {
	mixins: [itemFormMixin(), requestsListMixin()],

	data() {
		return {
			equipmentTypesList: [],
			equipmentTypesLoading: false,

			formData: {
				type: FAULTS_TYPES.BASE,
				title: null,
				title_en: null,
				title_es: null,
				equipment_types: [],
				sensor_parameter_types: [],
				alert_rules: []
			}
		};
	},

	computed: {
		/*sensorParametersList: () => sensorParametersListNCD.filter(pi => {
			return ['acceleration','velocity','temperature','current'].some(type=>type==pi.type);
		}),*/
		sensorParametersList: () => Object.freeze(sensorParametersList()),
		alertRulesList: () => alertRulesList(),

		rules: () => ({
			title_en: required,
			equipment_types: required,
			sensor_parameter_types: required,
			alert_rules: required
		}),

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_equipment_types',
					localProp: 'equipmentTypesList',
					localLoadProp: 'equipmentTypesLoading'
				}
			])
	},

	methods: {
		...mapActions({
			fetch_equipment_types: 'equipment_types/fetch_equipment_types',
			save_item: 'equipments/save_equipments_fault'
		}),

		localSetupPage(item) {
			if (item) {
				this.formData.type = item.type;
			}
		},

		localPrepareSubmitData(formData) {
			if (!formData.title_en) delete formData.title_en;
			if (!formData.title_es) delete formData.title_es;
			return formData;
		}
	}
};
</script>
