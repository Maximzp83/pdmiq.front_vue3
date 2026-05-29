<template>
	<div :class="['edit-form-container maintenance-form', { 'work-order-details-item card content-row': !fromModal }]">
		<div v-if="!fromModal" class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title }}</div>
		</div>

		<div class="card-content flex top">
			<div v-if="!fromModal" class="header-block flex align-center">
				<div class="step-number bold span-block">
					<span>{{ progress || 2 }}</span>
				</div>
			</div>

			<el-form ref="itemFormRef" class="item-edit-form relative section-row" label-width="150px" :model="formData" :rules="rules">
				<el-form-item :label="tt('Work_Station')" prop="work_station_id">
					<CustomInput v-model="formData.work_station_id" :disabled="showJustInfo" />
				</el-form-item>
				<el-form-item :label="tt('Technician')" prop="technical_executor_id">
					<CustomInput v-model="formData.technical_executor_id" :disabled="showJustInfo" />
				</el-form-item>
				<el-form-item :label="tt('phrases.additional_work_order_details')" prop="fab_shop_manager_notes">
					<el-input v-model="formData.fab_shop_manager_notes" type="textarea" rows="4" :disabled="showJustInfo" />
				</el-form-item>
				<FormOperationsButtons v-if="!showJustInfo" @onCancel="handleCancel" @onSave="validateForm" />
			</el-form>
		</div>
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

defineOptions({ name: 'RequisitionApproveForm' });

const props = defineProps(buildProps({
	progress: Number,
	title: String,
	showJustInfo: Boolean,
	isCompleted: Boolean,
	isFabManager: Boolean,
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);
const { approveRequisition } = usePlantRequisitions();
const itemFormRef = ref(null);
const formData = ref({
	work_station_id: null,
	technical_executor_id: null,
	fab_shop_manager_notes: '',
});
const rules = {
	work_station_id: required,
	technical_executor_id: required,
};
const itemData = computed(() => props.itemData);
const localSubmit = (data) =>
	approveRequisition({ itemId: props.itemData?.id, data }).then(() => emit('event', 'successModalSubmit'));
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
