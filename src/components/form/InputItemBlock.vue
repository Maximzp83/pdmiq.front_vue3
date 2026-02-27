<template>
	<div class="input-item-block">
		<el-input v-model="value" />
	</div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
	options: {
		type: Object,
		default: () => ({}),
	},
	additional_payload: {
		type: Object,
		default: () => ({}),
	},
});

const emit = defineEmits(['blockReady']);

const value = ref('');

const cleanBlock = () => {
	value.value = '';
};

const validateBlock = () => {
	try {
		const payload = { isValid: null, data: {} };
		const { validate, addToPayload } = props.options;

		if (addToPayload) {
			payload.additional_payload = { ...props.additional_payload };
		}

		payload.isValid = validate ? !!value.value : true;
		payload.data.value = value.value;

		emit('blockReady', payload);
	} catch (error) {
		console.warn(error);
	}
};

defineExpose({ cleanBlock, validateBlock });
</script>
