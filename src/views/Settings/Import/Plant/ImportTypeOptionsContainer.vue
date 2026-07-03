<template>
	<div>
		<div class="cell-item item-drop-zone bold flex align-center">
			<img :src="itemType.full_file_name" alt="" class="type-img div-block" />
			<span class="article-title uppercase div-block">{{ itemType.name }}</span>
		</div>

		<DragDropCellItem ref="dragDropCellItemRefs" :equipmentTypeId="itemType.id" :itemData="{ name: 'QTY' }" />
		<DragDropCellItem
			ref="dragDropCellItemRefs"
			:equipmentTypeId="itemType.id"
			:itemData="{ name: 'Brand', required: !itemType.without_brand }"
		/>
		<DragDropCellItem
			ref="dragDropCellItemRefs"
			:equipmentTypeId="itemType.id"
			:itemData="{ name: 'Part Number', required: true }"
		/>

		<div class="cells-block">
			<DragDropCellItem
				v-for="(item, idx) in itemType.type_options"
				ref="dragDropCellItemRefs"
				:key="`type-option-${item.id}-${idx}`"
				:itemData="item"
				:optionId="item.id"
				:equipmentTypeId="itemType.id"
			/>
		</div>

		<div class="cell-item">
			<div>
				<el-button
					class="action-button create-button with-text"
					size="small"
					type="success"
					@click="addOption(itemType)"
				>
					<span>{{ `${tt('add')} ${tt('option')}` }}</span>
					<i class="icomoon icon-plus"></i>
				</el-button>
			</div>
		</div>

		<div class="cell-item item-drop-zone bold">Images:</div>

		<DragDropCellItem
			ref="dragDropCellItemRefs"
			:equipmentTypeId="itemType.id"
			:itemData="{ name: `${itemType.name} Image` }"
		/>
		<DragDropCellItem
			ref="dragDropCellItemRefs"
			:equipmentTypeId="itemType.id"
			:itemData="{ name: `Nameplate ${itemType.name} Image` }"
		/>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';

import DragDropCellItem from '@/components/Import/DragDropCellItem.vue';

const { tt } = Lang;

defineOptions({ name: 'PlantImportTypeOptionsContainer' });

const props = defineProps({
	itemType: { type: Object, required: true },
});
const emit = defineEmits(['event']);
const globalStore = useGlobalStore();
const dragDropCellItemRefs = ref([]);

const predefinedTypeOptions = computed(() => Object.freeze([
	{ id: 1, name: 'type', formKey: 'type_id', required: true },
	{ id: 6, name: 'QTY', formKey: 'qty' },
	{ id: 2, name: 'Brand', formKey: 'brand_column_name', required: !props.itemType.without_brand },
	{ id: 3, name: 'Part Number', formKey: 'brand_model_column_name', required: true },
	{ id: 4, name: 'Storeroom location', formKey: 'equipment_picture_column_name' },
	{ id: 5, name: 'Location', formKey: 'equipment_nameplate_column_name' },
]));

const addOption = (itemData) => {
	globalStore.show_edit_modal({
		show: true,
		instanceName: 'EquipmentTypes',
		formComponentFileLoader: () => import('@/views/EquipmentTypes/ItemForm.vue'),
		instanceData: itemData,
		title: 'Add new Type options',
		activeSpinner: true,
		spinnerText: `${tt('loading')}...`,
		settings: { createNewOptionsOnly: true },
		callback: updateEquipmentTypes,
	});
};
const updateEquipmentTypes = () => {
	emit('event', 'updateEquipmentTypes');
};
const prepareFormData = () => {
	const droppedItems = document.querySelectorAll(
		`.headings-list .drag-n-drop-item[data-equipment-type-id="${props.itemType.id}"]`,
	);
	const data = {
		type_id: props.itemType.id,
		qty: '',
		brand_column_name: '',
		brand_model_column_name: '',
		options: [],
		equipment_picture_column_name: '',
		equipment_nameplate_column_name: '',
	};

	for (const nodeItem of droppedItems) {
		const { itemName, optionId } = nodeItem.dataset;
		const columnName = nodeItem.parentElement.parentElement.querySelector('[data-column-name]')?.dataset.columnName;

		if (itemName === 'QTY') data.qty = columnName;
		else if (itemName === 'Brand') data.brand_column_name = columnName;
		else if (itemName === 'Part Number') data.brand_model_column_name = columnName;
		else if (itemName === `${props.itemType.name} Image`) data.equipment_picture_column_name = columnName;
		else if (itemName === `Nameplate ${props.itemType.name} Image`) data.equipment_nameplate_column_name = columnName;
		else if (optionId) data.options.push({ id: +optionId, column_name: columnName });
	}

	return data;
};
const validateItemForm = () => {
	const requiredOptions = predefinedTypeOptions.value.filter((item) => item.required);
	const data = prepareFormData();
	return requiredOptions.every((item) => !!data[item.formKey]);
};
const getFormData = () => {
	const data = prepareFormData();
	Object.keys(data).forEach((key) => {
		if (!data[key]) delete data[key];
	});
	return data;
};

defineExpose({
	validateItemForm,
	getFormData,
});
</script>
