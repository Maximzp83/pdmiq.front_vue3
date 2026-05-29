<template>
	<div>
		<el-color-picker
			v-model="formData.color_scheme"
			class="span-block"
			:predefine="predefineColors"
			color-format="hex"
			size="small"
			@change="handleChange"
		/>
		<span class="span-block">{{ itemData.label }}</span>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { useSubItem } from '@/composables/mixins/useSubItem';

defineOptions({
	name: 'ChartColorPickerItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	predefineColors: { type: Array, default: () => [] },
});

const emit = defineEmits(['saveColorScheme', 'changeActiveColor', 'onRemove']);

const itemFormRef = ref(null);
const currentColorScheme = ref('');
const formData = ref({
	threshold_level: null,
	color_scheme: '',
});

const handleChange = (color) => {
	if (color) {
		emit('saveColorScheme', color);
	} else {
		formData.value.color_scheme = currentColorScheme.value;
	}
};

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions: (itemData) => {
		if (itemData) {
			currentColorScheme.value = itemData.color_scheme;
		}
	},
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
