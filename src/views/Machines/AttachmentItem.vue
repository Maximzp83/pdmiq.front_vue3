<template>
	<el-form class="option-item-container mrow" :model="formData">
		<el-form-item prop="name" class="mcol-xs-6">
			<label v-if="itemIndex === 0">{{ tt('Title') }}</label>
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<el-form-item prop="file" class="mcol-xs-6">
			<label v-if="itemIndex === 0">{{ tt('File') }}</label>
			<CustomInput v-model="formData.full_file_name" :placeholder="tt('File')" />
		</el-form-item>

		<div>
			<el-button
				class="action-button remove-button"
				size="small"
				type="danger"
				icon="icomoon icon-cross"
				@click="$emit('onRemove', itemData.id)"
			/>
		</div>
	</el-form>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'MachineAttachmentItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: Number,
});

defineEmits(['onRemove']);

const formData = reactive({
	name: '',
	full_file_name: '',
	file: null,
});

const collectData = () => ({ ...formData });
const validateForm = () => true;

watch(
	() => props.itemData,
	(item = {}) => {
		formData.name = item.name || '';
		formData.full_file_name = item.full_file_name || item.file_url || '';
		formData.file = item.file || null;
	},
	{ immediate: true },
);

defineExpose({
	collectData,
	validateForm,
	formData,
});
</script>
