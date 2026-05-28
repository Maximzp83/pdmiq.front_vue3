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
			<el-form-item :label="`${tt('Work_Order')} ${tt('Type')} ${tt('name')}`" prop="name">
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
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

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'MaintenanceCategoriesItemForm',
});

const props = defineProps(buildProps());

const emit = defineEmits(['submit', 'onCancel', 'event']);

const itemFormRef = ref(null);
const formData = ref({
	name: '',
});

const rules = {
	name: required,
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'MaintenanceCategories',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	emit,
});

defineExpose({
	validateForm,
});
</script>
