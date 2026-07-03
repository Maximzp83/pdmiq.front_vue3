<template>
	<el-form
		ref="itemFormRef"
		:class="['option-item-container mrow']"
		:model="formData"
		:rules="rules"
	>
		<el-form-item prop="title" class="name-input fluid">
			<label v-if="itemIndex === 0">{{ tt('Name') }}</label>
			<CustomInput v-model="formData.title" required :placeholder="tt('title')" />
		</el-form-item>

		<div>
				<el-button
					v-if="!hideRemove"
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

import { required as requiredRule } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

import CustomInput from '@/components/form/CustomInput.vue';

const { tt } = Lang;

defineOptions({
	name: 'ProcessFaultItem',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	itemIndex: { type: Number, default: 0 },
	required: Boolean,
	hideRemove: Boolean,
});

const emit = defineEmits(['onRemove', 'onCreate']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	title: '',
});

const rules = computed(() => ({
	title: props.required ? requiredRule : null,
}));

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
