<template>
	<div class="row-main-columns-block flex-table custom-table-container">
		<div class="custom-table-row table-header">
			<div class="cells-list semi-bold">
				<div
					v-for="item in mainColumnsList"
					:key="`header-column-row-${item.label}`"
					class="table-cell"
					v-text="item.label"
				></div>
			</div>
		</div>

		<div class="custom-table-row">
			<div class="cells-list">
				<ColumnCellItem
					v-for="item in mainColumnsList"
					ref="columnCellItemRefs"
					:key="`column-row-${item.label}`"
					:cellData="item"
					:hasStoreroomAndLocationConflict="hasStoreroomAndLocationConflict"
					:hasProdlineWithoutMachine="hasProdlineWithoutMachine"
					:plantId="logData.plant_id"
					@event="handleEvent"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { findItemBy } from '@/helpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import ColumnCellItem from './ColumnCellItem.vue';

defineOptions({ name: 'ImportLogRowMainColumnsBlock' });

const props = defineProps({
	rowData: { type: Object, required: true },
	logData: { type: Object, required: true },
	errors: { type: Array, default: () => [] },
});

const columnCellItemRefs = ref([]);
const importColumnsName = computed(() => props.logData.import_columns_name || {});
const mainColumns = Object.freeze([
	{ label: 'Storeroom', import_columns_name_key: 'storeroom_column_name', pair: { import_columns_name_key: 'location_column_name' } },
	{ label: 'Storeroom location', import_columns_name_key: 'storeroom_location_column_name' },
	{ label: 'Location', import_columns_name_key: 'location_column_name', pair: { import_columns_name_key: 'storeroom_column_name' } },
	{ label: 'Production Line', import_columns_name_key: 'production_line_column_name' },
	{ label: 'Machine', import_columns_name_key: 'machine_column_name' },
	{ label: 'Loc on Machine', import_columns_name_key: 'loc_on_machine_column_name' },
	{ label: 'Application', import_columns_name_key: 'application_column_name' },
	{ label: 'IM Asset #', import_columns_name_key: 'asset_column_name' },
]);

const findInErrors = ({ row_number: rowNumber, column_name: columnName }) => {
	const currentRowErrors = props.errors.filter((item) => item.row_number === rowNumber);
	return findItemBy('column_name', columnName, currentRowErrors);
};
const mainColumnsList = computed(() => {
	const columns = [];
	mainColumns.forEach((item) => {
		const columnNameValue = importColumnsName.value[item.import_columns_name_key];
		const pairColumnName = item.pair ? importColumnsName.value[item.pair.import_columns_name_key] : null;
		const errorItem = findInErrors({
			row_number: props.rowData.row_number,
			column_name: columnNameValue,
		});
		columns.push({
			errorItem,
			column_name: columnNameValue,
			label: item.label,
			value: props.rowData.values?.[columnNameValue],
			pair_column_name: pairColumnName,
		});
	});
	return columns;
});
const hasStoreroomAndLocationConflict = computed(() => {
	const storeroom = mainColumnsList.value.find((item) => item.column_name === 'storeroom');
	const location = mainColumnsList.value.find((item) => item.column_name === 'location');
	return storeroom && !!storeroom.value && location && !!location.value;
});
const hasProdlineWithoutMachine = computed(() => {
	const productionLine = mainColumnsList.value.find((item) => item.column_name === 'production_line_name');
	const machine = mainColumnsList.value.find((item) => item.column_name === 'machine_name');
	return productionLine && !!productionLine.value && (!machine || !machine.value);
});
const handleColumnChecked = ({ pair_column_name: pairColumnName, is_checked: isChecked }) => {
	if (!pairColumnName) return;
	const { item, index } = findItemBy('column_name', pairColumnName, mainColumnsList.value, { returnIndex: true });
	if (item && columnCellItemRefs.value[index]) {
		columnCellItemRefs.value[index].columnIsChecked = !isChecked;
	}
};
const getFormData = () => columnCellItemRefs.value.map((item) => item.getFormData());
const { handleEvent } = useEventHandler({ handleColumnChecked });

defineExpose({ getFormData });
</script>
