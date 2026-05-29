<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			:class="['item-edit-form', { showJustInfo }]"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Type')" prop="type">
				<CustomSelectV2
					v-model="formData.type"
					:disabled="showJustInfo"
					:optionsList="rfqsTypesListOptions"
					:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('type')}`"
				/>
			</el-form-item>

			<el-form-item :label="`${tt('Enable')} ${tt('one_click')}`" prop="is_one_click">
				<el-switch v-model="formData.is_one_click" :disabled="showJustInfo" />
			</el-form-item>

			<el-form-item :label="tt('Equipment')" prop="equipment_id">
				<SimpleSpinner :active="equipmentsLoading" />
				<CustomInput :model-value="equipmentLabel" disabled />
			</el-form-item>

			<el-form-item prop="vendor_ids" :label="tt('Vendors')">
				<SimpleSpinner :active="vendorsLoading" />
				<CustomSelectV2
					v-model="formData.vendor_ids"
					multiple
					:disabled="showJustInfo || !vendorsList.length"
					:optionsList="vendorsList"
					:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('vendors')}`"
				/>
			</el-form-item>

			<FormOperationsButtons v-if="!showJustInfo" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';

import { createGetRequest, createGetByIdRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { rfqsTypesList } from '@/constants/global';
import { required } from '@/constants/validation';
import { getValues, setupLabel } from '@/helpers';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({ name: 'RFQSItemForm' });

const props = defineProps(buildProps({
	showJustInfo: Boolean,
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const vendorsList = shallowRef([]);
const vendorsLoading = ref(false);
const equipmentsList = shallowRef([]);
const equipmentsLoading = ref(false);

const initialFormData = {
	type: null,
	equipment_id: null,
	is_one_click: false,
	vendor_ids: [],
};
const formData = ref({ ...initialFormData });

const showJustInfo = computed(() => props.showJustInfo || props.settings?.showJustInfo);
const rules = computed(() => ({
	type: showJustInfo.value ? null : required,
	equipment_id: showJustInfo.value ? null : required,
}));
const itemData = computed(() => props.itemData);
const rfqsTypesListOptions = computed(() => Object.freeze(rfqsTypesList()));
const equipmentLabelOptions = Object.freeze({
	accessors: ['brand_name', 'machine_name', 'production_line_name', 'location_name'],
	delimeter: ',',
});
const equipmentLabel = computed(() => setupLabel(equipmentsList.value, equipmentLabelOptions));

const methodsMap = {
	fetch_vendors: createGetRequest(ENTITIES.PlantsVendors.apiBase),
	fetch_equipment: createGetByIdRequest(ENTITIES.Equipments.apiBase),
};
const requestsToDoList = computed(() => {
	const settings = [
		{
			action: methodsMap.fetch_vendors,
			localProp: vendorsList,
			localLoadProp: vendorsLoading,
		},
		{
			localProp: equipmentsList,
			localLoadProp: equipmentsLoading,
		},
	];

	if (props.itemData?.equipment?.id) {
		settings[1].action = methodsMap.fetch_equipment;
		settings[1].payload = {
			itemId: props.itemData.equipment.id,
			params: { max: null },
		};
	}

	return Object.freeze(settings);
});

const localSetupPage = (item) => {
	if (item?.vendors?.length) {
		formData.value.vendor_ids = getValues('id', item.vendors);
	}
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Rfqs',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({ validateForm });
</script>
