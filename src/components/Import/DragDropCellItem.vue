<template>
	<div
		class="cell-item item-drop-zone draggable-dropzone--occupied"
		:data-dropzone-name="itemData.name"
	>
		{{ itemData.name }}
		<div
			:class="['drag-n-drop-item', { 'is-common': isCommon }]"
			:data-equipment-type-id="equipmentTypeId"
			:data-option-id="optionId"
			:data-media-id="mediaId"
			:data-item-name="itemData.name"
			:data-item-form-key="itemData.formKey"
		>
			<span v-if="itemData.required" class="alarm-color span-block">
				<sup>*&nbsp;</sup>
			</span>

			{{ itemData.name }}

			<el-upload
				v-if="fileUpload"
				ref="uploadContainerRef"
				:on-change="(file) => onSelectFile(file, 'zip_file')"
				:on-remove="() => onRemoveFile('zip_file')"
				action="#"
				:auto-upload="false"
			>
				<el-button size="small">ZIP file</el-button>
			</el-upload>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';

defineOptions({ name: 'ImportDragDropCellItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	fileUpload: Boolean,
	optionId: Number,
	equipmentTypeId: Number,
	mediaId: Number,
	isCommon: Boolean,
});

const uploadContainerRef = ref(null);
const formData = ref({
	optionId: props.optionId,
	mediaId: props.mediaId,
	name: props.itemData.name,
	zip_file: null,
});
const selectedFile = ref(null);

const clearValidate = () => null;
const onSelectFile = (file, propName) => {
	const rawFile = file?.raw || file;
	clearValidate();
	formData.value[propName] = rawFile;
	if (uploadContainerRef.value) uploadContainerRef.value.uploadFiles = [file];
	selectedFile.value = rawFile ? { name: rawFile.name } : null;
};
const onRemoveFile = (propName) => {
	formData.value[propName] = null;
	selectedFile.value = null;
};

defineExpose({
	formData,
	clearValidate,
});
</script>
