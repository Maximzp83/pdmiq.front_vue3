<template>
	<div class="row-main-columns-block flex-table custom-table-container">
		<div class="custom-table-row table-header">
			<div class="cells-list semi-bold">
				<div
					class="table-cell"
					v-for="item in mainColumnsList"
					:key="`header-column-row-${item.label}`"
					v-text="item.label"
				></div>
			</div>
		</div>

		<div class="custom-table-row">
			<div class="cells-list">
				<ColumnCellItem
					ref="ColumnCellItem"
					v-for="item in mainColumnsList"
					:key="`column-row-${item.label}`"
					:cellData="item"
					@event="handleEventNew"
					:hasStoreroomAndLocationConflict="hasStoreroomAndLocationConflict"
					:hasProdlineWithoutMachine="hasProdlineWithoutMachine"
					:plantId="logData.plant_id"
				/>
			</div>
		</div>
	</div>
</template>

<script>
// import { required } from '@/constants/validation';
import { subItemsListMixin, eventHandler } from '@/mixins';
import { findItemBy } from '@/helpers';

export default {
	mixins: [subItemsListMixin(), eventHandler()],
	props: {
		rowData: { type: Object, required: true },
		logData: { type: Object, required: true },
		errors: { type: Array }
	},

	components: {
		ColumnCellItem: () => import('./ColumnCellItem.vue')
	},

	data() {
		return {};
	},

	computed: {
		import_columns_name: that => Object.freeze(that.logData.import_columns_name),
		// errors: that => Object.freeze(that.logData.items),
		subItemsSettings: () => Object.freeze([
			{ ref: 'ColumnCellItem', returnArray: true }
		]),

		/*refsList: () => ['ColumnCellItem'],
		refsOperationsSettings: () =>
			Object.freeze({
				submitActionName: 'submitItemForm',
				dataAsArray: true,
				itemSubmitMethod: 'submitCellForm'
			}),*/

		currentRowId: that => that.rowData.row_number,

		mainColumns() {
			return Object.freeze([
				{
					label: 'Storeroom',
					import_columns_name_key: 'storeroom_column_name',
					pair: { import_columns_name_key: 'location_column_name' }
				},
				{
					label: 'Storeroom location',
					import_columns_name_key: 'storeroom_location_column_name'
				},
				{
					label: 'Location',
					import_columns_name_key: 'location_column_name',
					pair: { import_columns_name_key: 'storeroom_column_name' }
				},
				{
					label: 'Production Line',
					import_columns_name_key: 'production_line_column_name'
				},
				{ label: 'Machine', import_columns_name_key: 'machine_column_name' },
				{
					label: 'Loc on Machine',
					import_columns_name_key: 'loc_on_machine_column_name'
				},
				{ label: 'Application', import_columns_name_key: 'application_column_name' },
				{ label: 'IM Asset #', import_columns_name_key: 'asset_column_name' }
			]);
		},

		mainColumnsList() {
			const { mainColumns, import_columns_name, rowData } = this;
			let columns = [];

			mainColumns.forEach(li => {
				const column_name_value = import_columns_name[li.import_columns_name_key];
				const pair_column_name = li.pair
					? import_columns_name[li.pair.import_columns_name_key]
					: null;

				const errorItem = this.findInErrors({
					row_number: rowData.row_number,
					column_name: column_name_value
				});
				// console.log('column_name', column_name_value, errorItem)

				columns.push({
					errorItem: errorItem,
					column_name: column_name_value,
					label: li.label,
					value: rowData.values[column_name_value],
					pair_column_name
				});
			});

			return Object.freeze(columns);
		},

		hasStoreroomAndLocationConflict() {
			const { mainColumnsList } = this;
			const storeroom = mainColumnsList.find(
				item => item.column_name == 'storeroom'
			);
			const location = mainColumnsList.find(item => item.column_name == 'location');

			return storeroom && !!storeroom.value && location && !!location.value;
		},

		hasProdlineWithoutMachine() {
			const { mainColumnsList } = this;
			const production_line = mainColumnsList.find(
				item => item.column_name == 'production_line_name'
			);
			const machine = mainColumnsList.find(
				item => item.column_name == 'machine_name'
			);

			return (
				production_line && !!production_line.value && (!machine || !machine.value)
			);
			// return (!production_line || !production_line.value) && (machine && !!machine.value);
		}
	},

	methods: {
		handleColumnChecked(data) {
			const { pair_column_name, is_checked } = data;

			if (pair_column_name) {
				const { item, index } = findItemBy(
					'column_name',
					pair_column_name,
					this.mainColumnsList,
					{ returnIndex: true }
				);

				if (item) {
					this.$refs.ColumnCellItem[index].columnIsChecked = !is_checked;
				}
			}
		},

		findInErrors({ row_number, column_name }) {
			const { errors } = this;
			const currentRowErrors = errors.filter(ei => ei.row_number === row_number);
			// console.log('column_name', column_name, currentRowErrors)

			return findItemBy('column_name', column_name, currentRowErrors);
		},

		getFormData() {
			return this.collectDataFromSubItems(this.subItemsSettings).result;
		}
	}
};
</script>
