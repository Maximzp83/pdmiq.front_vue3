<template>
	<el-form
		ref="itemFormRef"
		:class="['option-item-container type-option-item']"
		:model="formData"
	>
		<div class="flex content-container content-row component-item">
			<el-form-item prop="name" class="mcol-xs-4" required>
				<label>{{ tt('Name') }}</label>
				<CustomInput v-model="formData.name" :placeholder="tt('name')" />
			</el-form-item>

			<el-form-item prop="child_type_ids" class="mcol-xs-6">
				<label>{{ `${tt('Child')} ${tt('Item_type')}` }}</label>
				<CustomSelectV2
					v-model="formData.child_type_ids"
					clearable
					filterable
					multiple
					collapse-tags
					:optionsLoading="equipmentTypesLoading"
					:optionsList="equipmentTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
				/>
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
		</div>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'EquipmentTypesComponentItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	equipmentTypesList: { type: Array, default: () => [] },
	equipmentTypesLoading: Boolean,
});

const emit = defineEmits(['onRemove']);

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	name: '',
	child_type_ids: [],
});

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
