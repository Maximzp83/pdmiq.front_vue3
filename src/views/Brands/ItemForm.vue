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
			<el-form-item :label="`${tt('Brand')} ${tt('name')}`" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>

			<el-form-item
				:label="tt('phrases.crossover_exluded')"
				prop="is_crossover_excluded"
				class="half-width"
			>
				<el-switch v-model="formData.is_crossover_excluded" />
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'BrandsItemForm',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
});

const emit = defineEmits(['submit', 'onCancel']);

const itemFormRef = ref(null);
const isMobile = ref(false);

const initialFormData = {
	name: '',
	is_crossover_excluded: false,
};

const formData = ref({ ...initialFormData });

const rules = {
	name: required,
};

const setupForm = (item) => {
	if (item) {
		formData.value = {
			name: item.name ?? '',
			is_crossover_excluded: item.is_crossover_excluded ?? false,
		};
		return;
	}

	formData.value = { ...initialFormData };
};

const submitForm = () => {
	emit('submit', { ...formData.value });
};

const validateForm = () => {
	if (!itemFormRef.value?.validate) return;

	itemFormRef.value.validate((valid) => {
		if (valid) {
			submitForm();
		}
	});
};

const handleCancel = () => {
	emit('onCancel');
};

watch(
	() => props.itemData,
	(item) => {
		setupForm(item);
	},
	{ immediate: true }
);

onMounted(() => {
	isMobile.value = window.innerWidth < 768;
});

defineExpose({
	validateForm,
});
</script>
