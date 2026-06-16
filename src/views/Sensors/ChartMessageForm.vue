<template>
	<div class="edit-form-container">
		<SimpleSpinner :active="isSaving" />
		<el-form
			ref="itemFormRef"
			label-width="80px"
			class="item-edit-form section-row"
			:model="formData"
			:rules="rules"
			label-position="left"
		>
			<el-form-item prop="message" :label="tt('note')">
				<CustomInput v-model="formData.message" type="textarea" rows="4" />
			</el-form-item>

			<el-form-item :label="tt('File')" prop="file" class="upload-form-item">
				<FileUploadBlock
					ref="fileUploadBlockRef"
					uploadBlockType="files-list"
					enableLinkToFile
					showLinkToFileButton
					showDeleteButton
					rotate
					:buttonText="tt('phrases.upload_file')"
					:pictures="itemPictures"
				/>
			</el-form-item>
		</el-form>

		<div class="dialog-footer section-row text-center">
			<el-button
				type="primary"
				:loading="sensorJobSaving"
				class="uppercase"
				@click="validateForm"
			>
				{{ tt('SAVE') }}
			</el-button>
			<el-button @click="closeDialog">{{ tt('Cancel') }}</el-button>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { required } from '@/constants/validation';
import { useSensors } from '@/composables/useSensors';
import { useSensorsStore } from '@/stores/SensorsStore';
import { useItemForm } from '@/composables/mixins/useItemForm';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';

const { tt } = Lang;
const { saveChartNote } = useSensors();

defineOptions({
	name: 'ChartMessageForm',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	parameter_type: Number,
	visible: Boolean,
	sensorId: Number,
});

const emit = defineEmits(['closeDialog', 'success']);
const sensorsStore = useSensorsStore();
const { sensorJobSaving } = storeToRefs(sensorsStore);

const itemFormRef = ref(null);
const fileUploadBlockRef = ref(null);
const isSaving = ref(false);
const initialFormData = {
	message: '',
	file: null,
	image_angle: 0,
	graph_timestamp: '',
	metric_type: null,
	metric_issue_alert_id: null,
};
const formData = ref({ ...initialFormData });
const rules = {
	message: required,
};

const itemPictures = computed(() => {
	if (props.itemData?.attachment_file_url) {
		return [{
			full_file_name: props.itemData.attachment_file_url,
			name: props.itemData.attachment_file_name,
		}];
	}
	return [];
});

const closeDialog = () => {
	emit('closeDialog', props.itemData?.chartId);
};

const refsMap = computed(() => ({
	FileUploadBlock: fileUploadBlockRef.value,
}));

const {
	validateSubItemsForm,
	resetFormDataBySubItems,
	collectDataFromSubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const subItemsSettings = computed(() =>
	Object.freeze([
		{
			ref: 'FileUploadBlock',
			setIfEmpty: { prop: 'is_file_deleted', val: 1 },
			cleanIfEmpty: { prop: 'file', val: null },
		},
	])
);

/*const localSetupPage = (item = {}) => {
	formData.value.metric_type = item.metric_type || props.parameter_type || null;
};*/

const localSubmit = (submitData) => {
	const noteId = props.itemData?.id || null;
	const data = { ...submitData };
	delete data.id;

	if (data.metric_issue_alert_id) {
		delete data.graph_timestamp;
	}

	/*if (data) {
		console.log('ChartMessageForm', {
			sensorId: props.sensorId,
			noteId,
			method: noteId ? 'PUT' : 'POST',
			data,
			withFile: !!data.file,
		});
		return;
	}*/

	isSaving.value = true;
	saveChartNote({
		sensorId: props.sensorId,
		noteId,
		method: noteId ? 'PUT' : 'POST',
		data,
		withFile: !!data.file,
	})
		.then(() => {
			emit('success', props.itemData?.chartId);
			closeDialog();
		})
		.finally(() => {
			isSaving.value = false;
		});
};

const { validateForm } = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	initialFormData,
	formRef: itemFormRef,
	cleanFormDataAfterClose: true,
	// localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localSubmit,
	emit,
});
</script>
