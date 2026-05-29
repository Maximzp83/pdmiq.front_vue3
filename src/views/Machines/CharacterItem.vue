<template>
	<el-form ref="itemFormRef" class="option-item-container mrow" :model="formData">
		<el-form-item prop="key" class="mcol-xs-6">
			<label v-if="itemIndex === 0">{{ tt('Title') }}</label>
			<CustomInput v-model="formData.key" :placeholder="tt('key')" />
		</el-form-item>

		<el-form-item prop="value" class="mcol-xs-6">
			<label v-if="itemIndex === 0">{{ tt('Value') }}</label>
			<CustomInput v-model="formData.value" :placeholder="tt('value')" />
		</el-form-item>

		<div>
			<el-button
				class="action-button remove-button"
				size="small"
				type="danger"
				icon="icomoon icon-cross"
				@click="$emit('onRemove', itemData.id)"
			/>
		</div>
	</el-form>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { Lang } from '@/localization';

const { tt } = Lang;

defineOptions({
	name: 'MachineCharacterItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: Number,
});

defineEmits(['onRemove']);

const formData = reactive({
	key: '',
	value: '',
});

const collectData = () => ({ ...formData });
const validateForm = () => true;

watch(
	() => props.itemData,
	(item = {}) => {
		formData.key = item.key || '';
		formData.value = item.value || '';
	},
	{ immediate: true },
);

defineExpose({
	collectData,
	validateForm,
	formData,
});
</script>
