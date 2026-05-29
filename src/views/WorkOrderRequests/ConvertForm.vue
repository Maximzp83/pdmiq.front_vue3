<template>
	<div class="edit-form-container maintenance-form" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative section-row bolded-labels"
			label-width="150px"
			label-position="top"
			:model="formData"
			:rules="rules"
		>
			<div class="el-form-item flex mrow wrap">
				<div class="mcol-xs-12 mcol-sm-6">
					<div class="el-form-item">
						<div class="mrow flex bottom">
							<el-form-item :label="tt('Due_Date')" prop="finish_date" class="mcol-xs-6" required>
								<Datepicker
									v-model="formData.finish_date"
									:placeholder="`${tt('Select')} ${tt('date')}`"
									className=" "
								/>
							</el-form-item>
						</div>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item :label="tt('Status')" prop="status" required>
						<CustomSelectV2
							v-model="formData.status"
							:optionsList="workOrdersStatusesList"
							:placeholder="`${tt('select')} ${tt('status')}`"
						/>
					</el-form-item>
				</div>
			</div>
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { WORK_ORDER_STATUSES_TYPES, workOrdersStatusesList as getWorkOrdersStatusesList } from '@/constants/global';
import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useMaintenance } from '@/composables/useMaintenance';

import Datepicker from '@/components/common/Datepicker.vue';

const { tt } = Lang;

defineOptions({
	name: 'WorkOrderRequestConvertForm',
});

const props = defineProps(buildProps());
const emit = defineEmits(['submit', 'onCancel', 'event']);

const { convertMaintenanceRequest } = useMaintenance();
const itemFormRef = ref(null);
const formData = ref({
	id: null,
	finish_date: '',
	status: WORK_ORDER_STATUSES_TYPES.PENDING,
});
const rules = {
	finish_date: required,
	status: required,
};

const workOrdersStatusesList = computed(() => Object.freeze(getWorkOrdersStatusesList()));

const localSubmit = (data) =>
	convertMaintenanceRequest({
		itemId: props.itemData?.id,
		data,
	}).then((response) => {
		props.editModal?.callback?.(response);
		return response;
	});

const { isMobile, validateForm } = useItemForm({
	itemData: computed(() => props.itemData),
	formData,
	fromModal: props.fromModal,
	editModal: props.editModal,
	formRef: itemFormRef,
	localSubmit,
	emit,
});

defineExpose({
	validateForm,
});
</script>
