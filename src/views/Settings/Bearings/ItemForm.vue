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
			<el-form-item :label="tt('phrases.outside_diameter')" prop="outside_diameter">
				<el-input-number v-model="formData.outside_diameter" :min="0" />
			</el-form-item>

			<el-form-item :label="tt('Number')" prop="number">
				<CustomInput v-model="formData.number" :placeholder="tt('number')" />
			</el-form-item>

			<el-form-item :label="tt('Width')" prop="width">
				<el-input-number v-model="formData.width" :min="0" />
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

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'SettingsBearingForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);
const itemFormRef = ref(null);

const formData = ref({
	number: '',
	width: 0,
	outside_diameter: 0,
});

const rules = {
	number: required,
	width: required,
	outside_diameter: required,
};

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'Bearings',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	emit,
});

defineExpose({ validateForm });
</script>
