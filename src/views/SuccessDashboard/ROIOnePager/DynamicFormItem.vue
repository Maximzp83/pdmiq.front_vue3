<template>
	<el-form ref="itemFormRef" class="special-decorated-form-item" :model="formData">
		<div class="form-items flex mrow">
			<el-checkbox
				v-if="enableCheckbox"
				v-model="formData.include"
				class="mcol-xs-1"
				:false-value="0"
				:true-value="1"
			/>

			<el-form-item class="text-form-item mcol-xs-11 fluid" prop="title">
				<CustomInput
					ref="titleInputRef"
					v-model="formData.title"
					:disabled="showJustInfo"
					:placeholder="tt('title')"
				/>
			</el-form-item>
		</div>

		<div v-if="!showJustInfo" class="mcol-xs-2 button-container">
			<el-button
				v-if="isLast"
				class="action-button create-button inverted"
				size="small"
				type="primary"
				@click="emit('onCreate')"
			>
				<i class="icomoon icon-plus"></i>
			</el-button>

			<el-button
				v-else
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="emit('onRemove', formData.id)"
			>
				<i class="icomoon icon-plus"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({ name: 'ROIOnePagerDynamicFormItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	isLast: Boolean,
	showJustInfo: Boolean,
	enableCheckbox: Boolean,
	itemAsValue: Boolean,
});
const emit = defineEmits(['onCreate', 'onRemove']);

const titleInputRef = ref(null);
const formData = ref({
	id: null,
	title: '',
	include: false,
});

const setupPage = (item = {}) => {
	formData.value = {
		id: item.id || null,
		title: props.itemAsValue ? item.value || '' : item.title || '',
		include: item.include || false,
	};

	if (item.focus === 'title') {
		nextTick(() => titleInputRef.value?.focus?.());
	}
};

const getFormData = () => {
	const data = { ...formData.value };
	if (!props.enableCheckbox) delete data.include;
	if (typeof data.id === 'string') delete data.id;
	return data;
};

watch(() => props.itemData, setupPage, { immediate: true, deep: true });

defineExpose({ getFormData });
</script>
