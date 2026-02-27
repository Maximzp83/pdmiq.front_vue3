<template>
	<el-form-item :class="['FormOperationsButtons', className]">
		<el-button class="item-action-button" native-type="button" @click="onCancel">
			<span class="uppercase">{{ cancelButtonText || tt('CANCEL') }}</span>
		</el-button>

		<el-button class="item-action-button" type="primary" native-type="button" @click="onSave">
			<span class="uppercase">{{ saveButtonText || tt('save') }}</span>
		</el-button>
	</el-form-item>
</template>

<script setup>
import { Lang } from '@/localization';

const { tt } = Lang;

defineProps({
	className: {
		type: String,
		default: '',
	},
	saveButtonText: {
		type: String,
		default: '',
	},
	cancelButtonText: {
		type: String,
		default: '',
	},
});

const emit = defineEmits(['onSave', 'onCancel']);

const onSave = () => emit('onSave');
const onCancel = () => emit('onCancel');
</script>
