<template>
	<div class="edit-form-container">
		<el-form ref="itemFormRef" class="item-edit-form" label-width="150px" :model="formData" :rules="rules">
			<el-form-item :label="tt('phrases.Reject_Reason')" prop="rejection_reason_details">
				<el-input v-model="formData.rejection_reason_details" type="textarea" rows="4" />
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

defineOptions({ name: 'RequisitionDenyForm' });

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);
const { denyRequisition } = usePlantRequisitions();
const itemFormRef = ref(null);
const formData = ref({ rejection_reason_details: '' });
const rules = { rejection_reason_details: required };
const itemData = computed(() => props.itemData);
const localSubmit = (data) =>
	denyRequisition({ itemId: props.itemData?.id, data }).then(() => emit('event', 'successModalSubmit'));
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
