<template>
	<div :class="['edit-form-container maintenance-form', { 'work-order-details-item card content-row': !fromModal }]">
		<SimpleSpinner :active="processing" />

		<div v-if="!fromModal" class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title || `${tt('Requisition')} ${tt('Plant')} ${tt('Details')}` }}</div>
		</div>

		<div :class="['card-content', { 'flex top': !fromModal }]">
			<div v-if="!fromModal" class="header-block flex align-center">
				<div class="step-number bold span-block">
					<span>{{ progress || 1 }}</span>
				</div>
			</div>

			<el-form
				ref="itemFormRef"
				:class="['item-edit-form relative section-row', { 'half-width': !fromModal }]"
				label-width="150px"
				:model="formData"
				:rules="rules"
				:label-position="isMobile || !fromModal ? 'top' : 'left'"
			>
				<el-form-item :label="tt('fab_plant')" prop="fabrication_plant_id">
					<CustomSelectV2
						v-model="formData.fabrication_plant_id"
						filterable
						:optionsLoading="plantsLoading"
						:optionsList="plantsList"
						:placeholder="`${tt('Select')} ${tt('plant')}`"
					/>
				</el-form-item>

				<el-form-item :label="tt('Category')" prop="category">
					<CustomSelectV2
						v-model="formData.category"
						:optionsList="requisitionCategoriesListOptions"
						:placeholder="`${tt('Select')} ${tt('category')}`"
					/>
				</el-form-item>

				<el-form-item :label="tt('Work_Type')" prop="work_type" class="radio-inputs-inline">
					<RadioButtonsBlock
						v-model="formData.work_type"
						:settings="workTypeRadioOptions"
						:optionsList="requisitionWorkTypesListOptions"
					/>
				</el-form-item>

				<el-form-item :label="`${tt('Equipment')} ${tt('Description')}`" prop="equipment_details">
					<el-input v-model="formData.equipment_details" type="textarea" :rows="5" />
				</el-form-item>

				<el-form-item :label="tt('Details')" prop="requisition_details">
					<el-input v-model="formData.requisition_details" type="textarea" :rows="5" />
				</el-form-item>

				<el-form-item :label="tt('phrases.See_Visit_Required')" prop="site_visit" class="content-row">
					<CustomSelectV2
						v-model="formData.site_visit"
						:optionsList="siteVisitOptionsList"
						:placeholder="`${tt('select')} ${tt('phrases.site_visit')}`"
					/>
				</el-form-item>

				<div class="content-row flex">
					<el-form-item
						:label="tt('Due_Date')"
						prop="complete_at"
						:class="['mcol-xs-7 inline-form-item', { 'inline-label': fromModal }]"
					>
						<Datepicker
							v-model="formData.complete_at"
							:placeholder="`${tt('Select')} ${tt('date')}`"
							:picker-options="pickerOptions"
						/>
					</el-form-item>

					<el-form-item
						:label="tt('Budget')"
						prop="proposed_cost"
						:class="['mcol-xs-5 inline-form-item']"
					>
						<CustomInput  v-model="formData.proposed_cost" :placeholder="`${tt('input')} ${tt('cost')}`" />
					</el-form-item>
				</div>

				<el-form-item :label="`${tt('Attachments')}:`" prop="attachments" class="content-row">
					<FileUploadBlock
						ref="attachmentsUploadBlockRef"
						uploadBlockType="files-list"
						multiple
						enableLinkToFile
						showDeleteButton
						accept=" "
						:buttonText="tt('phrases.upload_files')"
						:pictures="attachmentsList"
					/>
				</el-form-item>

				<div :class="[{ 'dialog-decorate-footer': fromModal }, 'no-left-margin']">
					<FormOperationsButtons @onCancel="deleteRequisition" @onSave="validateForm" />
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';

import {
	PLANT_WORK_ORDER_TYPES,
	USER_ROLES_TYPES,
	requisitionCategoriesList,
	requisitionWorkTypesList,
	siteVisitOptionsList,
} from '@/constants/global';
import { required } from '@/constants/validation';
import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';
import { useNotify } from '@/composables/useNotify';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionsItemForm' });

const props = defineProps(buildProps({
	progress: Number,
	title: String,
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const { authUser } = storeToRefs(authStore);
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { saveRequisition } = usePlantRequisitions();
const { Notify } = useNotify();

const itemFormRef = ref(null);
const attachmentsUploadBlockRef = ref(null);
const plantsList = shallowRef([]);
const plantsLoading = ref(false);
const processing = ref(false);
const attachmentsList = ref([]);
const refsMap = ref({
	AttachmentsUploadBlock: [attachmentsUploadBlockRef],
});

const initialFormData = {
	requisition_plant_id: null,
	fabrication_plant_id: null,
	requisition_details: '',
	complete_at: '',
	attachments: [],
	category: null,
	work_type: null,
	equipment_details: '',
	site_visit: null,
	proposed_cost: '',
};
const formData = ref({ ...initialFormData });

const rules = {
	fabrication_plant_id: required,
	requisition_details: required,
	complete_at: required,
	category: required,
	work_type: required,
	equipment_details: required,
	site_visit: required,
	proposed_cost: required,
};

const requisitionCategoriesListOptions = computed(() => Object.freeze(requisitionCategoriesList()));
const requisitionWorkTypesListOptions = computed(() => Object.freeze(requisitionWorkTypesList()));
const isIndustrialMatrix = computed(
	() => authStore.isIndustrialMatrix || authUser.value?.role?.type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX,
);
const requisitionPlantId = computed(() =>
	isIndustrialMatrix.value
		? globalFilters.value?.plantId || null
		: authUser.value?.plant_id || null,
);
const workTypeRadioOptions = Object.freeze({
	className: 'radio-input',
	inline: true,
	isRadio: true,
});
const pickerOptions = Object.freeze({
	disabledDate(date) {
		const today = new Date().getTime() - 3600000 * 24;
		return date.getTime() < today;
	},
});

const subItemsSettings = computed(() =>
	Object.freeze([{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments' }]),
);
const {
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const methodsMap = {
	fetch_plants: createGetRequest(ENTITIES.Plants.apiBase),
};
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: methodsMap.fetch_plants,
			payload: {
				params: {
					workOrderRole: PLANT_WORK_ORDER_TYPES.FABRICATION,
					companyId: authUser.value?.company_id,
				},
			},
			localProp: plantsList,
			localLoadProp: plantsLoading,
		},
	]),
);

const itemData = computed(() => props.itemData);

const resolveRequisitionPlantId = () =>
	itemData.value?.id
		? formData.value.requisition_plant_id || requisitionPlantId.value
		: requisitionPlantId.value;

const localSetupPage = (item) => {
	formData.value.requisition_plant_id =
		item?.requisition_plant_id || requisitionPlantId.value;
	attachmentsList.value = item?.newOrderAttachments?.length
		? item.newOrderAttachments.map((attachment) => ({ ...attachment }))
		: [];
};

const localValidationHook = () => {
	formData.value.requisition_plant_id = resolveRequisitionPlantId();

	if (formData.value.requisition_plant_id) return true;

	Notify({
		type: 'warning',
		title: tt('phrases.form_isnt_ready'),
		message: isIndustrialMatrix.value
			? tt('phrases.Select_Plant_first')
			: tt('phrases.Please_check_fields_errors_first'),
	});
	return false;
};

const localSubmit = (data) => {
	const payload = { data };
	if (payload.data.attachments?.length) {
		payload.withFile = payload.data.attachments.some((attachment) => !!attachment.file);
	}

	processing.value = true;
	return saveRequisition(payload)
		.then(() => {
			emit('event', 'successModalSubmit');
		})
		.finally(() => {
			processing.value = false;
		});
};

const { isMobile, validateForm } = useItemForm({
	entityKey: 'Requisitions',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	localValidationHook,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localSubmit,
	emit,
});

const deleteRequisition = () => {
	if (props.itemData?.id) {
		emit('event', 'handleDeleteRequisition', props.itemData.id);
		return;
	}
	emit('event', { eventName: 'handleCloseEditModal' });
	emit('onCancel');
};

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({ validateForm });
</script>
