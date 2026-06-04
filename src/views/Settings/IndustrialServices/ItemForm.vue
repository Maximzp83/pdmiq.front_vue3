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
				<CustomInput v-model="formData.name" :placeholder="`${tt('input')} ${tt('name')}`" />
			</el-form-item>

			<el-form-item :label="tt('image')" prop="file" class="upload-form-item">
				<FileUploadBlock
					ref="fileUploadRef"
					deleteFileId
					showDeleteButton
					:pictures="itemPictures"
				/>
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { buildProps, useItemForm } from '@/composables/mixins/useItemForm';
import { useNotify } from '@/composables/useNotify';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;
const { Notify } = useNotify();

defineOptions({
	name: 'SettingsIndustrialServiceForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);
const itemFormRef = ref(null);
const fileUploadRef = ref(null);
const refsMap = computed(() => ({ FileUploadBlock: fileUploadRef.value }));

const formData = ref({
	name: '',
	file: null,
});

const rules = {
	name: required,
};

const itemPictures = computed(() => (props.itemData?.file ? [{ file: props.itemData.file }] : []));

const subItemsSettings = computed(() => [
	{
		ref: 'FileUploadBlock',
		destructure: true,
		setIfEmpty: { prop: 'delete_file', val: 1 },
		cleanIfEmpty: { prop: 'file', val: null },
	},
]);

const { validateSubItemsForm, collectDataFromSubItems } = useSubItemsList({
	formData,
	refsMap,
});

const localPreSubmitHook = (payload) => {
	if (!payload.data.file && payload.data.delete_file) {
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('phrases.image_is_required'),
		});
		return { next: false };
	}

	return { next: true };
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'IndustrialServices',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	emit,
	uploadSettings: { fileProp: 'file' },
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	localPreSubmitHook,
});

defineExpose({ validateForm });
</script>
