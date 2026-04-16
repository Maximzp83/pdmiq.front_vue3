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
			<el-form-item :label="tt('Name')" prop="name">
				<CustomInput v-model="formData.name" />
			</el-form-item>

			<el-form-item :label="`${tt('Contact')} ${tt('name')}`" prop="contact_name">
				<CustomInput v-model="formData.contact_name" />
			</el-form-item>

			<el-form-item :label="tt('Email')" prop="email">
				<el-input v-model="formData.email" type="email" autocomplete="new-password" />
			</el-form-item>

			<el-form-item :label="tt('Phone')" prop="phone_number">
				<CustomInput v-model="formData.phone_number" :placeholder="tt('number')" />
			</el-form-item>

			<el-form-item :label="`${tt('Enable')} ${tt('one_click')}`" prop="is_one_click">
				<el-switch v-model="formData.is_one_click" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelectV2
					v-model="formData.plant_id"
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<el-form-item prop="equipment_type_for_buy_ids" :label="`${tt('Equipment_types')} ${tt('for_buy')}`">
				<CustomSelectV2
					v-model="formData.equipment_type_for_buy_ids"
					filterable
					multiple
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('types')}`"
				/>
			</el-form-item>

			<el-form-item
				prop="equipment_type_for_service_ids"
				:label="`${tt('Equipment_types')} ${tt('for_service')}`"
			>
				<CustomSelectV2
					v-model="formData.equipment_type_for_service_ids"
					filterable
					multiple
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('types')}`"
				/>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useGlobalStore } from '@/stores/GlobalStore';

import CustomInput from '@/components/form/CustomInput.vue';
import CustomSelectV2 from '@/components/form/CustomSelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'PlantsVendorsItemForm',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
});

const emit = defineEmits(['submit', 'onCancel']);

const globalStore = useGlobalStore();
const plantsEntity = ENTITIES.Plants;
const equipmentTypesEntity = ENTITIES.EquipmentTypes;

const itemFormRef = ref(null);
const plantsLoading = ref(false);
const plantsList = ref([]);
const equipmentTypesLoading = ref(false);
const equipmentTypesList = ref([]);

const initialFormData = {
	plant_id: null,
	name: '',
	contact_name: '',
	email: '',
	phone_number: '',
	is_one_click: 1,
	equipment_type_for_buy_ids: [],
	equipment_type_for_service_ids: [],
};

const formData = ref({ ...initialFormData });

const rules = {
	name: required,
	email: required,
	plant_id: required,
	phone_number: [required],
};

const requestsToDoList = computed(() => [
	{
		action: 'fetch_plants',
		localProp: plantsList,
		localLoadProp: plantsLoading,
		payload: {
			params: {
				max: -1,
				orderByColumn: 'name',
				orderByMethod: 'asc',
			},
		},
	},
	{
		action: 'fetch_equipment_types',
		localProp: equipmentTypesList,
		localLoadProp: equipmentTypesLoading,
		payload: {
			params: {
				max: -1,
				orderByColumn: 'name',
				orderByMethod: 'asc',
			},
		},
	},
]);

const methodsMap = {
	fetch_plants: createGetRequest(plantsEntity.apiBase),
	fetch_equipment_types: createGetRequest(equipmentTypesEntity.apiBase),
};

const localSetupPage = (item) => {
	if (item) {
		formData.value.plant_id = item.plant_id ?? item.plant?.id ?? null;
		formData.value.is_one_click = item.is_one_click ?? 1;
		formData.value.equipment_type_for_buy_ids =
			item.equipment_type_for_buy_ids ?? item.equipment_type_for_buy?.map((type) => type.id) ?? [];
		formData.value.equipment_type_for_service_ids =
			item.equipment_type_for_service_ids ??
			item.equipment_type_for_service?.map((type) => type.id) ??
			[];
		return;
	}

	const globalPlantId = globalStore.globalFilters?.plantId;
	const navbarPlantId = globalStore.navbarSettings?.showPlantName?.id;
	formData.value.plant_id = globalPlantId || navbarPlantId || null;
	formData.value.is_one_click = 1;
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	initialFormData,
	formRef: itemFormRef,
	localSetupPage,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({
	validateForm,
});
</script>
