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
				@click="removeItem"
			/>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({ name: 'ProductionLineCharacterItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
});
const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	key: '',
	value: '',
});
const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	emit,
});

defineExpose({ validateItemForm, getFormData, removeItem });
</script>
