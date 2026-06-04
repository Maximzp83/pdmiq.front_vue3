<template>
	<el-form
		ref="itemFormRef"
		:class="['option-item-container mrow sub-row']"
		:model="formData"
		label-position="top"
	>
		<el-form-item prop="value" :label="tt('Predefined_value')" required>
			<CustomInput v-model="formData.value" :placeholder="tt('value')" />
		</el-form-item>

		<div class="el-form-item upload-wrapper">
			<el-form-item prop="file_name" class="upload-form-item">
				<FileUploadBlock
					ref="fileUploadBlockRef"
					rotate
					deleteFileId
					:pictures="picture"
					buttonClass="inverted"
					buttonSize="small"
				/>
			</el-form-item>
		</div>

		<el-form-item prop="is_crossover_excluded">
			<label>{{ tt('phrases.Crossover_exluded') }}</label>
			<el-switch
				v-model="formData.is_crossover_excluded"
				class="without-margin"
				:active-value="1"
				:inactive-value="0"
			/>
		</el-form-item>

		<el-button
			class="action-button remove-button"
			size="small"
			type="danger"
			@click="removeItem"
		>
			<i class="icomoon icon-cross"></i>
		</el-button>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';

const { tt } = Lang;

defineOptions({
	name: 'EquipmentTypesPredefinedValueItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['onRemove']);

const fileUploadBlockRef = ref(null);
const itemFormRef = ref(null);
const formData = ref({
	id: null,
	value: '',
	img_rotate: 0,
	is_crossover_excluded: 0,
});

const picture = computed(() => {
	if (props.itemData?.full_file_name) {
		return [{ full_file_name: props.itemData.full_file_name }];
	}
	return [];
});

const localGetFormDataCallback = (data) => {
	const nextData = { ...data };
	const files = fileUploadBlockRef.value?.getFormData?.();

	if (files?.length) {
		if (files[0]?.file) {
			nextData.file = files[0].file;
		}
		nextData.img_rotate = files[0]?.img_rotate ?? nextData.img_rotate;
	}

	return nextData;
};

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localGetFormDataCallback,
	deleteNewId: true,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
