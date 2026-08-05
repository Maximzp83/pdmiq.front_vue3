<template>
	<div class="edit-form-container import-form">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative mrow flex wrap"
			label-width="0"
			:model="formData"
			:rules="rules"
		>
			<div class="form-item mcol-xs-12 mcol-md-4">
				<el-form-item prop="file">
					<el-upload
						ref="uploadContainerRef"
						:on-preview="clearValidate"
						:on-change="(file) => onSelectFile(file, 'file')"
						:on-remove="handleRemove"
						action="#"
						:auto-upload="false"
					>
						<el-button size="small">Click to select file</el-button>
					</el-upload>
				</el-form-item>
			</div>

			<div class="form-item mcol-xs-12 mcol-md-4">
				<el-button
					type="primary"
					native-type="button"
					class="item-action-button"
					:loading="isUploading"
					@click="validateForm"
				>
					<span>UPLOAD</span>
				</el-button>
			</div>

			<div v-if="showStart" class="form-item mcol-xs-12 mcol-md-4">
				<el-button
					native-type="button"
					class="item-action-button"
					:disabled="disableStart"
					:loading="isImporting"
					@click="handleStart"
				>
					<span>START</span>
				</el-button>
			</div>

			<div v-if="showRevert" class="form-item mcol-xs-12 mcol-md-4">
				<el-button
					native-type="button"
					class="item-action-button"
					:loading="isProcessingRevert"
					@click="handleRevert"
				>
					<span>REVERT</span>
				</el-button>
			</div>
		</el-form>
	</div>
</template>

<script setup>
import { ref } from 'vue';

import { required } from '@/constants/validation';
import { useTestingStore } from '@/stores/TestingStore';

defineOptions({ name: 'ImportForm' });

const props = defineProps({
	showStart: Boolean,
	showRevert: Boolean,
	isProcessingRevert: Boolean,
	isUploading: Boolean,
	isImporting: Boolean,
	submitAction: Function,
	submitActionProp: String,
	disableStart: Boolean,
});

const emit = defineEmits(['event']);
const testingStore = useTestingStore();

const itemFormRef = ref(null);
const uploadContainerRef = ref(null);
const formData = ref({ file: null });
const rules = Object.freeze({ file: required });

const clearValidate = () => itemFormRef.value?.clearValidate?.();
const onSelectFile = (file, propName) => {
	formData.value[propName] = file?.raw || file;
	if (uploadContainerRef.value) uploadContainerRef.value.uploadFiles = [file];
	clearValidate();
};
const onRemoveFile = (propName) => {
	formData.value[propName] = null;
};
const handleRemove = () => {
	onRemoveFile('file');
	emit('event', 'clearImportData');
};
const clearFiles = () => {
	uploadContainerRef.value?.clearFiles?.();
};
const handleStart = () => {
	emit('event', 'onStart');
};
const handleRevert = () => {
	emit('event', 'onRevert');
};
const validateForm = () => {
	itemFormRef.value?.validate?.((valid) => {
		if (!valid) return;

		const action =
			props.submitAction ||
			testingStore[props.submitActionProp] ||
			testingStore.import_settings;
		emit('event', { eventName: 'toggleSaving', data: true });
		action({
			data: { ...formData.value },
			withFile: true,
		})
			.then((response) => {
				emit('event', { eventName: 'successModalSubmit', data: response });
			})
			.finally(() => {
				emit('event', { eventName: 'toggleSaving', data: false });
			});
	});
};

defineExpose({
	clearFiles,
});
</script>
