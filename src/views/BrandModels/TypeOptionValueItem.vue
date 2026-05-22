<template>
	<el-form
		ref="itemFormRef"
		class="option-item-container type-option-value-item mrow"
		:model="formData"
	>
		<el-form-item prop="equipment_type_option_id" class="mcol-xs-8 events-none">
			<SimpleSpinner :active="equipmentTypesLoading" />
			<label v-if="itemIndex === 0">{{ `${tt('Item_Type')} ${tt('option')}` }}</label>
			<CustomInput :modelValue="itemData?.name" />
		</el-form-item>

		<el-form-item v-if="!predefinedValuesList.length" prop="value" class="mcol-xs-4">
			<label v-if="itemIndex === 0">{{ tt('Value') }}</label>
			<CustomInput v-model="formData.value" :placeholder="tt('value')" />
		</el-form-item>

		<el-form-item
			v-else
			prop="predefined_value_ids"
			class="select-input outside-form-item mcol-xs-8"
		>
			<SimpleSpinner :active="equipmentTypesLoading" />
			<label v-if="itemIndex === 0">{{ tt('Predefined_Values') }}</label>
			<CustomSelectV2
				v-model="formData.predefined_value_ids"
				multiple
				collapse-tags
				:optionsList="predefinedValuesList"
				:placeholder="`${tt('Select')} ${tt('values')}`"
				labelKey="value"
			/>
		</el-form-item>
	</el-form>
</template>

<script setup>
import { computed, ref } from 'vue';

import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useSubItem } from '@/composables/mixins/useSubItem';

const { tt } = Lang;

defineOptions({
	name: 'BrandModelsTypeOptionValueItem',
});

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	itemIndex: { type: Number, default: 0 },
	equipmentTypesLoading: Boolean,
	brandItemData: { type: Object, default: null },
	currentDataList: { type: Array, default: () => [] },
});

const itemFormRef = ref(null);
const formData = ref({
	id: null,
	equipment_type_option_id: null,
	value: '',
	predefined_value_ids: [],
});

const predefinedValuesList = computed(() => {
	if (props.itemData?.has_predefined_values) {
		return props.itemData.predefined_values || [];
	}

	return [];
});

const localSetupPageHook = (item) => {
	const currentItem = findItemBy('equipment_type_option_id', item.id, props.currentDataList);

	return {
		itemForSetup: currentItem,
		next: !!currentItem,
	};
};

const localSetupPageActions = (item) => {
	formData.value.equipment_type_option_id = item?.id || null;
};

const localGetFormDataCallback = (data) => {
	const nextData = {
		...data,
		value: `${data.value ?? ''}`,
	};

	if (!nextData.value) {
		delete nextData.value;
	}
	if (!nextData.id) {
		delete nextData.id;
	}

	return nextData;
};

const { validateItemForm, getFormData, removeItem } = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageHook,
	localSetupPageActions,
	localGetFormDataCallback,
});

defineExpose({
	validateItemForm,
	getFormData,
	removeItem,
});
</script>
