<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative section-row half-width"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div v-if="itemId" class="custom-form-item el-form-item">
				<div class="el-form-item__label">{{ tt('Controller') }} id</div>
				<div
					class="value-instead-input el-form-item__content bold"
					v-text="itemId"
				></div>
			</div>

			<el-form-item :label="`${tt('Controller')} ${tt('name')}`" prop="name">
				<CustomInput v-model="formData.name" :placeholder="`${tt('input')} ${tt('name')}`" />
			</el-form-item>

			<el-form-item
				v-if="!hideCompanies && isIndustrialMatrix"
				:label="tt('Company')"
				prop="company_id"
			>
				<CustomSelectV2
					v-model="formData.company_id"
					filterable
					:optionsLoading="companiesLoading"
					:optionsList="companiesList"
					:placeholder="`${tt('Select')} ${tt('company')}`"
				/>
			</el-form-item>

			<el-form-item v-if="!hidePlants" :label="tt('plant')" prop="plant_id">
				<CustomSelectV2
					v-model="formData.plant_id"
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="`${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('time_zone')" prop="time_zone">
				<CustomSelectV2
					v-model="formData.time_zone"
					:optionsList="timeZonesList"
					:placeholder="`${tt('select')} ${tt('time_zone')}`"
					labelKey="label"
				/>
			</el-form-item>

			<el-form-item class="upload-form-item" :label="`${tt('Cofigure')} ${tt('file')}`" prop="configure_file">
				<FileUploadBlock
					:ref="(el) => setSubItemRef('FileUploadBlock', el, 0)"
					uploadBlockType="inline"
					deleteFileId
					showDeleteButton
					keepFilePath
					filePropName="configure_file"
					accept=".xml"
					:buttonText="tt('phrases.click_to_upload')"
					buttonIcon=" "
					buttonClass=" "
					:pictures="itemConfigFile"
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

<script setup>
import { computed, reactive, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { timeZonesList as getTimeZonesList } from '@/constants/date_time';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'ControllerItemFormUltraSoundWhiteRiver',
});

const props = defineProps(buildProps({
	hideCompanies: Boolean,
	hidePlants: Boolean,
	new_item_type: Number,
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const companiesEntity = ENTITIES.Companies;
const plantsEntity = ENTITIES.Plants;

const itemFormRef = ref(null);
const refsMap = reactive({});
const companiesLoading = ref(false);
const companiesList = shallowRef([]);
const plantsLoading = ref(false);
const plantsList = shallowRef([]);

const formData = ref({
	type: null,
	name: '',
	plant_id: null,
	company_id: null,
	time_zone: 0,
	configure_file: null,
});

const isIndustrialMatrix = computed(() => authStore.isIndustrialMatrix);
const timeZonesList = computed(() => Object.freeze(getTimeZonesList()));

const rules = Object.freeze({
	name: required,
	plant_id: required,
});

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'FileUploadBlock', cleanIfEmpty: { prop: 'configure_file', val: null } },
	])
);

const itemConfigFile = computed(() => {
	if (props.itemData?.configure_file_link) {
		return [
			{
				file_path: props.itemData.configure_file_link,
				name: props.itemData.configure_file_name,
			},
		];
	}

	return [];
});

const localPrepareSubmitData = (data) => {
	const preparedData = { ...data };

	if (!preparedData.configure_file) {
		delete preparedData.configure_file;
	}

	return preparedData;
};

const methodsMap = {
	fetch_companies: createGetRequest(companiesEntity.apiBase),
	fetch_plants: createGetRequest(plantsEntity.apiBase),
};

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_companies,
			localProp: companiesList,
			localLoadProp: companiesLoading,
		},
		{
			action: methodsMap.fetch_plants,
			bindTo: [
				{
					getValue: () => formData.value.company_id,
					param: 'companyId',
				},
			],
			localProp: plantsList,
			localLoadProp: plantsLoading,
		},
	])
);

const {
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	setSubItemRef,
} = useSubItemsList({
	formData,
	refsMap,
});

const { isMobile, itemId, validateForm, handleCancel } = useItemForm({
	entityKey: 'Controllers',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	fromAnotherInstance: props.fromAnotherInstance,
	new_item_type: props.new_item_type,
	localPrepareSubmitData,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
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
