<template>
	<el-form ref="itemFormRef" class="option-item-container mrow" :model="formData">
		<el-form-item prop="name" class="mcol-xs-7">
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item prop="file" class="mcol-xs-5 upload-form-item">
			<FileUploadBlock
				:ref="(el) => setSubItemRef('FileUploadBlock', el, 0)"
				deleteFileId
				hidePreview
				accept="all"
				:pictures="files"
				:buttonText="tt('phrases.upload_file')"
				buttonIcon="icomoon icon-clip"
				@onSelectFile="handleSelectFile"
			/>
		</el-form-item>

		<div>
			<el-button
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="removeItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';

const { tt } = Lang;

defineOptions({ name: 'ProductionLineAttachmentItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
});
const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const refsMap = ref({ FileUploadBlock: [] });
const formData = ref({
	id: null,
	name: '',
	file_name: '',
});

const files = computed(() =>
	props.itemData?.full_file_name ? [{ full_file_name: props.itemData.full_file_name }] : [],
);
const subItemsSettings = Object.freeze([{ ref: 'FileUploadBlock' }]);
const { setSubItemRef, validateSubItemsForm, collectDataFromSubItems } = useSubItemsList({
	formData,
	refsMap,
});
const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	deleteNewId: true,
	emit,
});
const handleSelectFile = (file) => {
	formData.value.name = file?.name || formData.value.name;
};

defineExpose({ validateItemForm, getFormData, removeItem });
</script>
