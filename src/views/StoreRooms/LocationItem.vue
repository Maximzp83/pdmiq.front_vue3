<template>
	<el-form ref="itemFormRef" class="option-item-container mrow" :model="formData" :rules="rules">
		<el-form-item prop="name" class="mcol-xs-10" required>
			<label v-if="itemIndex === 0">{{ tt('name') }}</label>
			<CustomInput v-model="formData.name" :placeholder="tt('name')" />
		</el-form-item>

		<div>
			<el-button
				class="action-button remove-button"
				size="small"
				type="danger"
				@click="removeItem"
			>
				<i class="icomoon icon-cross"></i>
			</el-button>
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { required } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'StoreRoomsLocationItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	name: '',
});

const rules = {
	name: required,
};

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	emit,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
