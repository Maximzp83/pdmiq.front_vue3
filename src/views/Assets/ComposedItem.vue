<template>
	<el-form ref="itemFormRef" class="option-item-container mrow" :model="formData" :rules="rules">
		<el-form-item prop="equipment_type_id" class="mcol-xs-8">
			<label v-if="itemIndex === 0">{{ tt('Item_Type') }}</label>
			<CustomSelectV2
				v-model="formData.equipment_type_id"
				:optionsLoading="equipmentTypesLoading"
				:optionsList="equipmentTypesList"
				:placeholder="`${tt('Select')} ${tt('type')}`"
			/>
		</el-form-item>

		<el-form-item prop="count" class="mcol-xs-4">
			<label v-if="itemIndex === 0">{{ tt('Count') }}</label>
			<CustomInput v-model="formData.count" :placeholder="tt('count')" />
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

import { required as requiredRule } from '@/constants/validation';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({ name: 'AssetComposedItem' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	required: Boolean,
	equipmentTypesLoading: Boolean,
	equipmentTypesList: { type: Array, default: () => [] },
});
const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	equipment_type_id: null,
	count: '',
});
const rules = computed(() => ({
	count: props.required ? requiredRule : null,
	equipment_type_id: props.required ? requiredRule : null,
}));

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	deleteNewId: true,
	emit,
});

defineExpose({ validateItemForm, getFormData, removeItem });
</script>
