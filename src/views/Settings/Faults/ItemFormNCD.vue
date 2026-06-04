<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Name')" prop="title" class="mcol-xs-12">
				<CustomInput v-model="formData.title" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item class="mcol-xs-12" label="Type of equipments" prop="equipment_types">
				<SimpleSpinner :active="equipmentTypesLoading" />
				<el-select
					v-model="formData.equipment_types"
					collapse-tags
					multiple
					:placeholder="`${tt('select')} ${tt('phrases.type_of_equipments')}`"
					:disabled="!equipmentTypesList.length"
				>
					<el-option
						v-for="item in equipmentTypesList"
						:key="`equipment_type-id-${item.id}`"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item class="mcol-xs-12" label="Parameters" prop="sensor_parameter_types">
				<el-select
					v-model="formData.sensor_parameter_types"
					collapse-tags
					multiple
					:placeholder="`${tt('select')} ${tt('parameters')}`"
					:disabled="!sensorParametersList.length"
				>
					<el-option
						v-for="item in sensorParametersList"
						:key="`parameter_type-id-${item.id}`"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item class="mcol-xs-12" label="Alert rules" prop="alert_rules">
				<el-select
					v-model="formData.alert_rules"
					collapse-tags
					multiple
					:placeholder="`${tt('select')} ${tt('alert')} ${tt('rules')}`"
					:disabled="!alertRulesList.length"
				>
					<el-option
						v-for="item in alertRulesList"
						:key="`alert_rules-id-${item.id}`"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { FAULTS_TYPES, alertRulesList as getAlertRulesList } from '@/constants/global';
import { sensorParametersListNCDOnly as getSensorParametersListNCDOnly } from '@/modules/charts_factory/controllers/Sensor/enums';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { buildProps, useItemForm } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSettings } from '@/composables/useSettings';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'SettingsFaultNCDForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);
const { fetchEquipmentTypes } = useSettings();
const itemFormRef = ref(null);
const equipmentTypesList = shallowRef([]);
const equipmentTypesLoading = ref(false);

const formData = ref({
	type: FAULTS_TYPES.NCD,
	title: null,
	equipment_types: [],
	sensor_parameter_types: [],
	alert_rules: [],
});

const rules = {
	title: required,
	equipment_types: required,
	sensor_parameter_types: required,
	alert_rules: required,
};

const sensorParametersList = computed(() => Object.freeze(getSensorParametersListNCDOnly()));
const alertRulesList = computed(() => Object.freeze(getAlertRulesList()));

const localSetupPage = (item) => {
	if (item) formData.value.type = item.type;
};

const requestsToDoList = computed(() => [
	{
		action: fetchEquipmentTypes,
		localProp: equipmentTypesList,
		localLoadProp: equipmentTypesLoading,
	},
]);

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'EquipmentFaults',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	emit,
	localSetupPage,
});

useRequestsList({ requestsToDoList });

defineExpose({ validateForm });
</script>
