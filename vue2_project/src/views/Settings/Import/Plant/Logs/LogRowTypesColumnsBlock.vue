<template>
	<div class="row-types-columns-block">
		<div
			class="equipment-type-row"
			v-for="(typeItem, idx) in typesRowsList"
			:key="`type-row-${typeItem.id}_idx-${idx}`"
		>
			<div class="type-info-block">
				<div class="imgWrapper">
					<img
						v-if="typeItem.type && typeItem.type.full_file_name"
						:src="typeItem.type.full_file_name"
						alt="img not found"
					/>
				</div>
				<div class="bold">{{ typeItem.type ? typeItem.type.name : '-' }}:</div>
			</div>

			<div
				:class="[
					'column-type-item',
					{
						enableRadio:
							item.errorItem &&
							!!(item.errorItem.imported_value && item.errorItem.existing_values)
					}
				]"
				v-for="(item, idx) in typeItem.columns"
				:key="`column-row-${item.label}_idx-${idx}`"
			>
				<div class="label">{{ item.label }}:</div>

				<ColumnCellItem ref="ColumnCellItem" :cellData="item" />
			</div>
		</div>
	</div>
</template>

<script>
// import { required } from '@/constants/validation';
import { subItemsListMixin } from '@/mixins';
import { findItemBy } from '@/helpers';

export default {
	mixins: [subItemsListMixin()],
	components: {
		ColumnCellItem: () => import('./ColumnCellItem.vue')
	},

	props: {
		rowData: { type: Object, required: true },
		logData: { type: Object, required: true },
		errors: { type: Array },

		equipmentTypesList: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			formData: {}
		};
	},

	computed: {
		import_columns_name_types: that =>
			Object.freeze(that.logData.import_columns_name.types),
		rowDataValuesTypes: that => Object.freeze(that.rowData.values.types),

		// errors: that => Object.freeze(that.logData.items),
		/*errors: that => Object.freeze(
			that.logData.items.map(item => ({
				...item,
				existing_values: item.existing_values ? item.existing_values.concat( item.existing_values + '_2') : null
			}))
		),*/

		subItemsSettings: () => Object.freeze([
			{ ref: 'ColumnCellItem', returnArray: true }
		]),

		currentRowId: that => that.rowData.row_number,

		typesRowsList() {
			const {
				import_columns_name_types,
				rowDataValuesTypes,
				equipmentTypesList
			} = this;
			let typeRows = [];

			rowDataValuesTypes.forEach(typeRowItem => {
				const { type_id } = typeRowItem;
				let rowItem = {
					type: findItemBy('id', type_id, equipmentTypesList),
					columns: []
				};

				for (const typeMainKey in typeRowItem) {
					const value = typeRowItem[typeMainKey];

					if (typeMainKey == 'type_id') {
						//
					} else if (typeMainKey == 'options') {
						for (const optionKey in value) {
							const entries = Object.entries(value[optionKey]);
							// console.log(entries[0][0])
							rowItem.columns.push(
								this.setupTypeItemColumn({
									// type_id: type_id,
									column_name: optionKey,
									import_columns_name_types: import_columns_name_types,
									label: entries.length ? entries[0][0] : '-',
									value: entries.length ? entries[0][1] : '-'
								})
							);
						}
					} else {
						rowItem.columns.push(
							this.setupTypeItemColumn({
								type_id: type_id,
								column_name: typeMainKey,
								import_columns_name_types: import_columns_name_types,
								label: typeMainKey,
								value: value
							})
						);
					}
				}

				typeRows.push(rowItem);
			});

			return Object.freeze(typeRows);
		}
	},

	methods: {
		prepareLabel(str) {
			return str.split('_').join(' ');
		},

		getTypeLabel(typeValue, typeItem) {
			let label = typeValue;

			if (typeItem) {
				const keys = Object.keys(typeItem);

				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
					if (typeValue == typeItem[key]) {
						const splitted = key.split('_column_name');
						label = splitted.length > 1 ? splitted[0] : typeValue;
					}
				}
			}

			return this.prepareLabel(label);
		},

		setupTypeItemColumn({
			label,
			column_name,
			import_columns_name_types,
			type_id,
			value
		}) {
			const columns_name_type_item = findItemBy(
				'type_id',
				type_id,
				import_columns_name_types
			);

			const errorItem = this.findInErrors({ column_name: column_name });

			return {
				errorItem: errorItem,
				column_name: column_name,
				label: label || this.getTypeLabel(column_name, columns_name_type_item),
				value: value
				// label: this.getTypeLabel(column_nalabelme, columns_name_type_item),
			};
		},

		findInErrors({ column_name }) {
			const { errors, currentRowId } = this;
			const currentRowErrors = errors.filter(ei => ei.row_number === currentRowId);
			// console.log('column_name', column_name, currentRowErrors)
			return findItemBy('column_name', column_name, currentRowErrors);
		},

		getFormData() {
			return this.collectDataFromSubItems(this.subItemsSettings).result;
		},
	}
};
</script>
