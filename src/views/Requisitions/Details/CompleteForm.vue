<template>
	<div class="edit-form-container">
		<el-form ref="itemFormRef" class="item-edit-form" label-width="150px" :model="formData" :rules="rules">
			<el-form-item :label="tt('Report')" prop="execution_report_details">
				<el-input v-model="formData.execution_report_details" type="textarea" rows="5" />
			</el-form-item>
			<el-form-item :label="tt('Hours')" prop="execution_total_time">
				<CustomInput v-model="formData.execution_total_time" />
			</el-form-item>
			<FormOperationsButtons @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionCompleteForm' });

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);
const { completeRequisition } = usePlantRequisitions();
const itemFormRef = ref(null);
const formData = ref({ execution_report_details: '', execution_total_time: '' });
const rules = {
	execution_report_details: required,
	execution_total_time: required,
};
const itemData = computed(() => props.itemData);
const localSubmit = (data) =>
	completeRequisition({ itemId: props.itemData?.id, data }).then(() => emit('event', 'successModalSubmit'));
const { validateForm, handleCancel } = useItemForm({
	itemData,
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	localSubmit,
	emit,
});

defineExpose({ validateForm });
</script>
