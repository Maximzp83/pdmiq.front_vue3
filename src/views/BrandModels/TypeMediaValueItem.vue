<template>
	<el-form
		ref="itemFormRef"
		class="option-item-container type-media-value-item mrow"
		:model="formData"
	>
		<el-form-item prop="equipment_type_media_id" class="mcol-xs-3 events-none">
			<SimpleSpinner :active="equipmentTypesLoading" />
			<label v-if="itemIndex === 0">{{ `${tt('Item_Type')} ${tt('Media')}` }}</label>
			<CustomInput :modelValue="itemData?.name" />
		</el-form-item>

		<el-form-item prop="file" class="mcol-xs-3 ImgUploadBlockWrapper">
			<label v-if="itemIndex === 0">{{ tt('File') }}</label>

			<FileUploadBlock
				ref="fileUploadBlockRef"
				:pictures="uploadPictures"
				:multiple="false"
				:showDeleteButton="true"
				:showLinkToFileButton="true"
				:enableLinkToFile="true"
				:buttonText="tt('phrases.click_to_upload')"
				filePropName="file"
				hidePreview
			/>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';

const { tt } = Lang;

defineOptions({
	name: 'BrandModelsTypeMediaValueItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	equipmentTypesLoading: Boolean,
	brandItemData: { type: Object, default: null },
	currentDataList: { type: Array, default: () => [] },
});

const fileUploadBlockRef = ref(null);
const itemFormRef = ref(null);
const formData = ref({
	id: null,
	equipment_type_media_id: null,
	file: null,
	img_rotate: 0,
	full_file_name: '',
	file_name: '',
});

const refsMap = computed(() => ({
	FileUploadBlock: fileUploadBlockRef.value,
}));

const subItemsSettings = computed(() =>
	Object.freeze([
		{
			ref: 'FileUploadBlock',
			destructure: true,
		},
	]),
);

const uploadPictures = computed(() => {
	const currentFile = formData.value.file;
	const hasExistingFile = formData.value.full_file_name || formData.value.file_name;

	if (currentFile?.name) {
		return [
			{
				id: formData.value.id || `new-${props.itemIndex}`,
				name: currentFile.name,
				raw: currentFile,
			},
		];
	}

	if (hasExistingFile) {
		return [
			{
				id: formData.value.id || `existing-${props.itemIndex}`,
				full_file_name: formData.value.full_file_name,
				file_path: formData.value.full_file_name,
				name: formData.value.file_name,
			},
		];
	}

	return [];
});

const localSetupPageHook = (item) => {
	const currentItem = findItemBy('equipment_type_media_id', item.id, props.currentDataList);

	return {
		itemForSetup: currentItem,
		next: !!currentItem,
	};
};

const localSetupPageActions = (item) => {
	formData.value.equipment_type_media_id = item?.id || null;
};

const localGetFormDataCallback = (data) => {
	const nextData = { ...data };

	delete nextData.full_file_name;
	delete nextData.file_name;

	if (!nextData.id) {
		delete nextData.id;
	}

	return nextData;
};

const { validateSubItemsForm, collectDataFromSubItems } = useSubItemsList({
	formData,
	refsMap,
});

const { validateItemForm, getFormData, removeItem, handleResetValidate } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	localSetupPageHook,
	localSetupPageActions,
	localGetFormDataCallback,
	deleteNewId: true,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
	handleResetValidate,
});
</script>
