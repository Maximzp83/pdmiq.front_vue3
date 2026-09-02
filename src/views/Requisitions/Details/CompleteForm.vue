<template>
	<div class="edit-form-container maintenance-form work-order-details-item card">
		<SimpleSpinner :active="processing" />

		<div class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title }}</div>
		</div>

		<div class="card-content flex top">
			<el-form
				ref="itemFormRef"
				:class="['item-edit-form relative section-row', { showJustInfo }]"
				label-width="150px"
				:model="formData"
				:rules="rules"
				:label-position="isMobile || !fromModal ? 'top' : 'left'"
			>
				<el-form-item prop="execution_times">
					<div class="inline-form-items-list vertical-fluid">
						<ExecTimesItem
							v-for="(item, idx) in execTimesItemsList"
							:key="`exec-times-item-${item.id}`"
							:ref="(el) => setSubItemRef('ExecTimesItem', el, idx)"
							:itemData="item"
							:itemIndex="idx"
							:isLast="execTimesItemsList.length === idx + 1"
							:hideCreateButton="showJustInfo"
							@onCreate="addFormItem(execTimesItemsList, 'et_i-')"
							@onRemove="(id) => removeFormItem(id, execTimesItemsList)"
							@calcTotalTime="calcTotalTime"
						/>
					</div>
				</el-form-item>

				<el-form-item :label="tt('phrases.Total_Hours')" class="showJustInfo">
					<div class="el-form-item__content">
						<b>{{ localExecutionTotalTime }}</b>
					</div>
				</el-form-item>

				<el-form-item :label="tt('Attachments')" prop="attachments">
					<FileUploadBlock
						ref="attachmentsUploadBlockRef"
						uploadBlockType="files-list"
						multiple
						enableLinkToFile
						showDeleteButton
						accept=" "
						:disabled="showJustInfo"
						:buttonText="tt('phrases.upload_files')"
						:pictures="attachmentsList"
					/>
				</el-form-item>

				<el-form-item :label="tt('Details')" prop="execution_report_details">
					<el-input
						v-model="formData.execution_report_details"
						type="textarea"
						:rows="5"
						:disabled="showJustInfo"
					/>
				</el-form-item>

				<div v-if="!showJustInfo" class="no-left-margin FormOperationsButtons">
					<el-button
						class="item-action-button"
						native-type="button"
						@click="onSave(0)"
					>
						<span class="uppercase">{{ tt('COMPLETE') }}</span>
					</el-button>

					<el-button
						type="primary"
						class="item-action-button"
						native-type="button"
						@click="onSave(1)"
					>
						<span class="uppercase">{{ tt('phrases.SAVE_PROGRESS') }}</span>
					</el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElMessageBox } from 'element-plus';

import { convertMsToHours, formatTime } from '@/helpers';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import ExecTimesItem from './ExecTimesItem.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionCompleteForm' });

const props = defineProps(buildProps({
	orderData: { type: Object, default: () => ({}) },
	orderStatus: { type: Object, default: () => ({}) },
	isFabManager: Boolean,
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const { completeRequisition } = usePlantRequisitions();

const itemFormRef = ref(null);
const attachmentsUploadBlockRef = ref(null);
const refsMap = ref({
	AttachmentsUploadBlock: [attachmentsUploadBlockRef],
});
const execTimesItemsList = ref([]);
const attachmentsList = ref([]);
const localExecutionTotalTime = ref('');
const processing = ref(false);
const formData = ref({
	execution_times: [],
	execution_report_details: '',
	attachments: [],
});
const rules = {
	execution_report_details: required,
};

const title = computed(() =>
	props.itemData?.technician
		? props.itemData.technician.full_name
		: 'Technician is missing',
);
const isTechnician = computed(() =>
	!!props.itemData?.technician && authStore.authUser?.id === props.itemData.technician.id,
);
const showAsForm = computed(() => isTechnician.value || props.isFabManager);
const showJustInfo = computed(() => !showAsForm.value);
const subItemsSettings = computed(() =>
	Object.freeze([
		{
			ref: 'ExecTimesItem',
			targetProp: 'execution_times',
			conditionSettings: {
				conditions: [
					{ prop: 'date', method: 'notEmpty' },
					{ prop: 'time', method: 'notEmpty' },
					{ prop: 'time', method: '!=', control_value: '00:00' },
				],
			},
		},
		{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments' },
	]),
);

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const calcTotalTime = () => {
	setTimeout(() => {
		let totalMs = 0;
		const refs = refsMap.value.ExecTimesItem || [];
		refs.filter(Boolean).forEach((item) => {
			const hours = Number(item.actualHours?.value || 0);
			const minutes = Number(item.actualMinutes?.value || 0);
			totalMs += (hours * 3600000) + (minutes * 60000);
		});

		const { total_hours, total_mins } = convertMsToHours(totalMs);
		localExecutionTotalTime.value = formatTime(`${total_hours}:${total_mins}`, 'H:M');
	}, 10);
};

const localSetupPage = (item) => {
	if (item?.total_time !== undefined && item?.total_time !== null) {
		const { total_hours, total_mins } = convertMsToHours(Number(item.total_time) * 1000);
		localExecutionTotalTime.value = formatTime(`${total_hours}:${total_mins}`, 'H:M');
	}

	execTimesItemsList.value = item?.executionTimes?.length
		? setupFormSubItemsList(item.executionTimes, 'et_i')
		: [];
	if (!execTimesItemsList.value.length) {
		addFormItem(execTimesItemsList, 'et_i-');
	}

	attachmentsList.value = item?.attachments?.length
		? item.attachments.map((attachment) => ({ ...attachment }))
		: [];
};

const preparePayload = (data, keep) => {
	const payload = {
		itemId: props.itemData?.id,
		data: {
			...data,
			keep,
		},
	};

	delete payload.data.id;

	if (payload.data.attachments?.some((attachment) => !!attachment.file)) {
		payload.withFile = true;
	}

	return payload;
};

const localSubmit = (data, { keep } = {}) => {
	processing.value = true;
	return completeRequisition(preparePayload(data, keep))
		.then(() => {
			emit('event', 'reloadPage');
			emit('event', 'successModalSubmit');
			handleCancel();
		})
		.finally(() => {
			processing.value = false;
		});
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localSubmit,
	emit,
});

const onSave = (keep) => {
	ElMessageBox.confirm('Are You sure?', {
		confirmButtonText: 'OK',
		cancelButtonText: tt('CANCEL'),
		type: 'warning',
	}).then(() => validateForm({ keep }));
};

defineExpose({ validateForm });
</script>
