<template>
	<div class="row-types-columns-block">
		<div
			v-for="(typeItem, idx) in typesRowsList"
			:key="`type-row-${typeItem.id || idx}`"
			class="equipment-type-row"
		>
			<div class="type-info-block">
				<div class="imgWrapper">
					<img
						v-if="typeItem.type?.full_file_name"
						:src="typeItem.type.full_file_name"
						alt="img not found"
					/>
				</div>
				<div class="bold">{{ typeItem.type ? typeItem.type.name : '-' }}:</div>
			</div>

			<div
				v-for="(item, columnIdx) in typeItem.columns"
				:key="`column-row-${item.label}-${columnIdx}`"
				:class="[
					'column-type-item',
					{
						enableRadio:
							item.errorItem &&
							!!(item.errorItem.imported_value && item.errorItem.existing_values),
					},
				]"
			>
				<div class="label">{{ item.label }}:</div>
				<ColumnCellItem ref="columnCellItemRefs" :cellData="item" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { findItemBy } from '@/helpers';

import ColumnCellItem from './ColumnCellItem.vue';

defineOptions({ name: 'ImportLogRowTypesColumnsBlock' });

const props = defineProps({
	rowData: { type: Object, required: true },
	logData: { type: Object, required: true },
	errors: { type: Array, default: () => [] },
	equipmentTypesList: { type: Array, default: () => [] },
});

const columnCellItemRefs = ref([]);
const importColumnsNameTypes = computed(() => props.logData.import_columns_name?.types || []);
const rowDataValuesTypes = computed(() => props.rowData.values?.types || []);
const currentRowId = computed(() => props.rowData.row_number);

const prepareLabel = (str) => `${str || ''}`.split('_').join(' ');
const getTypeLabel = (typeValue, typeItem) => {
	let label = typeValue;
	if (typeItem) {
		const keys = Object.keys(typeItem);
		for (const key of keys) {
			if (typeValue === typeItem[key]) {
				const splitted = key.split('_column_name');
				label = splitted.length > 1 ? splitted[0] : typeValue;
				break;
			}
		}
	}
	return prepareLabel(label);
};
const findInErrors = ({ column_name: columnName }) => {
	const currentRowErrors = props.errors.filter((item) => item.row_number === currentRowId.value);
	return findItemBy('column_name', columnName, currentRowErrors);
};
const setupTypeItemColumn = ({ label, column_name: columnName, type_id: typeId, value }) => {
	const columnsNameTypeItem = findItemBy('type_id', typeId, importColumnsNameTypes.value);
	return {
		errorItem: findInErrors({ column_name: columnName }),
		column_name: columnName,
		label: label || getTypeLabel(columnName, columnsNameTypeItem),
		value,
	};
};
const typesRowsList = computed(() => {
	const typeRows = [];
	rowDataValuesTypes.value.forEach((typeRowItem) => {
		const { type_id: typeId } = typeRowItem;
		const rowItem = {
			type: findItemBy('id', typeId, props.equipmentTypesList),
			columns: [],
		};
		for (const typeMainKey in typeRowItem) {
			const value = typeRowItem[typeMainKey];
			if (typeMainKey === 'type_id') {
				continue;
			}
			if (typeMainKey === 'options') {
				for (const optionKey in value) {
					const entries = Object.entries(value[optionKey]);
					rowItem.columns.push(setupTypeItemColumn({
						type_id: typeId,
						column_name: optionKey,
						label: entries.length ? entries[0][0] : '-',
						value: entries.length ? entries[0][1] : '-',
					}));
				}
			} else {
				rowItem.columns.push(setupTypeItemColumn({
					type_id: typeId,
					column_name: typeMainKey,
					label: typeMainKey,
					value,
				}));
			}
		}
		typeRows.push(rowItem);
	});
	return typeRows;
});
const getFormData = () => columnCellItemRefs.value.map((item) => item.getFormData());

defineExpose({ getFormData });
</script>
