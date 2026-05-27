<template>
	<div :class="['checkboxes-matrix-row', rowData.className || '']">
		<div class="row-label label">{{ rowData.title }}</div>

		<div class="cell-item">
			<el-checkbox v-model="formData.is_email" :true-value="1" :false-value="0" />
		</div>

		<div class="cell-item">
			<el-checkbox v-model="formData.is_push" :true-value="1" :false-value="0" />
		</div>

		<div class="cell-item">
			<el-checkbox
				v-model="formData.is_sms"
				:true-value="1"
				:false-value="0"
				:disabled="!isPhoneVerified"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue';

defineOptions({
	name: 'UsersNotificationRow',
});

const props = defineProps({
	rowData: { type: Object, default: () => ({}) },
	isPhoneVerified: Boolean,
});

const formData = ref({
	message_type: null,
	is_email: 0,
	is_sms: 0,
	is_push: 0,
});

const setupFormData = (data) => {
	formData.value = {
		message_type: null,
		is_email: 0,
		is_sms: 0,
		is_push: 0,
		...(data || {}),
	};

	if (!props.isPhoneVerified) {
		formData.value.is_sms = 0;
	}
};

const getFormData = () => formData.value;
const setFormData = (key, value) => {
	formData.value[key] = value;
};

watch(
	() => props.rowData,
	(value) => {
		setupFormData(value?.formData);
	},
	{ immediate: true, deep: true },
);

watch(
	() => props.isPhoneVerified,
	(isVerified) => {
		if (!isVerified) {
			formData.value.is_sms = 0;
		}
	},
);

defineExpose({
	getFormData,
	setFormData,
});
</script>
