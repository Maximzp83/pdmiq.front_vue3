<template>
	<div class="edit-form-container">
		<SimpleSpinner :active="isSaving" />

		<el-form
			ref="itemFormRef"
			label-width="120px"
			class="item-edit-form section-row flex justify-center"
			:model="formData"
			:rules="rules"
			label-position="left"
		>
			<el-form-item prop="value" :label="tt('phrases.Amount_Cycles')">
				<el-input-number v-model="formData.value" :min="0" />
			</el-form-item>
		</el-form>

		<div class="dialog-footer section-row text-center">
			<el-button
				type="primary"
				class="uppercase"
				:loading="isSaving"
				@click="validateForm"
			>
				{{ tt('SAVE') }}
			</el-button>
			<el-button class="uppercase" @click="closeDialog">
				{{ tt('Cancel') }}
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentShotsCounterForm' });

const props = defineProps({
	shotsCounterData: { type: Object, required: true },
	visible: Boolean,
});
const emit = defineEmits(['closeDialog', 'success']);

const itemFormRef = ref(null);
const isSaving = ref(false);
const formData = reactive({ value: 0 });
const rules = Object.freeze({});

const setupFormData = (visible) => {
	if (visible && props.shotsCounterData?.pump) {
		const { lube_cycle_max_count, lube_cycle_spent_count } = props.shotsCounterData.pump;
		formData.value = lube_cycle_max_count - lube_cycle_spent_count;
		return;
	}

	formData.value = 0;
};

const closeDialog = () => {
	emit('closeDialog');
};

const submitForm = () => {
	isSaving.value = true;
	api_request.put(`/ultrasound/commands/${props.shotsCounterData.id}/shots-count`, {
		data: { ...formData },
	})
		.then(({ value }) => {
			emit('success', value);
			closeDialog();
		})
		.finally(() => {
			isSaving.value = false;
		});
};

const validateForm = () => {
	itemFormRef.value?.validate((valid) => {
		if (valid) submitForm();
	});
};

watch(
	() => props.visible,
	(visible) => setupFormData(visible),
	{ immediate: true },
);
</script>
