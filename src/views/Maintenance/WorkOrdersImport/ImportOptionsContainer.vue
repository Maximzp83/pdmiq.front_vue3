<template>
	<div class="content-row">
		<el-form class="item-edit-form" label-position="top">
			<el-form-item :label="tt('file')">
				<FileUploadBlock
					ref="fileUploadBlockRef"
					uploadBlockType="inline"
					:buttonText="tt('phrases.click_to_upload')"
					accept=".xls,.xlsx,.csv"
					@onSelectFile="handleFileSelected"
				/>
			</el-form-item>

			<div class="flex align-center">
				<el-button
					type="primary"
					:loading="isImporting"
					:disabled="!uploadedFileId"
					@click="handleImport"
				>
					{{ tt('Import') }}
				</el-button>
				<el-button
					v-if="currentImportId"
					type="warning"
					:loading="isImporting"
					@click="handleRevert"
				>
					{{ tt('Revert') }}
				</el-button>
			</div>

			<div v-if="progressText" class="content-row semi-bold" v-text="progressText"></div>
		</el-form>
	</div>
</template>

<script setup>
import { ref } from 'vue';

import { Lang } from '@/localization';
import { useMaintenance } from '@/composables/useMaintenance';

import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';

const { tt } = Lang;

defineOptions({
	name: 'WorkOrdersImportOptionsContainer',
});

const { uploadWorkOrder, importWorkOrder, revertImportWorkOrder, getImportWorkOrderProgress } = useMaintenance();
const fileUploadBlockRef = ref(null);
const uploadedFileId = ref(null);
const currentImportId = ref(null);
const isImporting = ref(false);
const progressText = ref('');

const handleFileSelected = (file) => {
	const data = new FormData();
	data.append('file', file?.raw || file);
	isImporting.value = true;
	uploadWorkOrder({ data, withFile: true })
		.then(({ value }) => {
			uploadedFileId.value = value?.id || value?.file_id || value;
		})
		.finally(() => {
			isImporting.value = false;
		});
};

const handleImport = () => {
	if (!uploadedFileId.value) return;
	isImporting.value = true;
	importWorkOrder({ data: { file_id: uploadedFileId.value } })
		.then(({ value }) => {
			currentImportId.value = value?.id || value?.import_id || uploadedFileId.value;
			return getImportWorkOrderProgress({ itemId: currentImportId.value });
		})
		.then(({ value }) => {
			progressText.value = value?.message || value?.status || tt('Success');
		})
		.finally(() => {
			isImporting.value = false;
		});
};

const handleRevert = () => {
	if (!currentImportId.value) return;
	isImporting.value = true;
	revertImportWorkOrder({ itemId: currentImportId.value })
		.then(() => {
			progressText.value = tt('Success');
		})
		.finally(() => {
			isImporting.value = false;
		});
};
</script>
