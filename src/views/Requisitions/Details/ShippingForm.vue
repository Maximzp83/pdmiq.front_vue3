<template>
	<div class="edit-form-container">
		<el-form ref="itemFormRef" class="item-edit-form" label-width="150px" :model="formData" :rules="rules">
			<el-form-item :label="tt('phrases.Shipping_Method')" prop="shipping_method">
				<CustomInput v-model="formData.shipping_method" />
			</el-form-item>
			<el-form-item :label="`${tt('Tracking')} #`" prop="shipping_tracking">
				<CustomInput v-model="formData.shipping_tracking" />
			</el-form-item>
			<el-form-item :label="tt('phrases.Expected Receive Date')" prop="shipping_receive_date">
				<Datepicker v-model="formData.shipping_receive_date" />
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

import Datepicker from '@/components/common/Datepicker.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionShippingForm' });

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);
const { concludeRequisition } = usePlantRequisitions();
const itemFormRef = ref(null);
const formData = ref({ shipping_method: '', shipping_tracking: '', shipping_receive_date: '' });
const rules = {
	shipping_method: required,
	shipping_tracking: required,
	shipping_receive_date: required,
};
const itemData = computed(() => props.itemData);
const localSubmit = (data) =>
	concludeRequisition({ itemId: props.itemData?.id, data }).then(() => emit('event', 'successModalSubmit'));
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
