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
				<CustomInput v-model="formData.name" />
			</el-form-item>

			<el-form-item
				:label="tt('phrases.crossover_exluded')"
				prop="is_crossover_excluded"
				class="half-width switcher"
			>
				<el-switch v-model="formData.is_crossover_excluded" />
			</el-form-item>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';

import CustomInput from '@/components/form/CustomInput.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'BrandsItemForm',
});

const props = defineProps(buildProps());

const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);

const formData = ref({
	name: '',
	is_crossover_excluded: false,
});

// const formData = ref({ ...initialFormData });

const rules = {
	name: required,
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Brands',
	itemData: computed(() => props.itemData),
	formData,
	fromModal: props.fromModal,
	editModal: props.editModal,
	formRef: itemFormRef,
	emit,
	// debug: true
});

defineExpose({
	validateForm,
});
</script>
