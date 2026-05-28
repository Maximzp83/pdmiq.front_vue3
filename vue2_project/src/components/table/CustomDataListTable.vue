<template>
	<div :class="['items-table-container', tableSettings.tableClass || '']">
		<VueElementLoadingWrapper
			:isLoading="itemsLoading"
			:itemsName="itemsName.mult"
		/>

		<div class="flex-table custom-table-container" v-if="tableData.length">
			<!-- <template> -->
			<TableHeader
				v-if="!hideHeader"
				@event="handleEventNew"
				:columns="tableSettings.columns"
				:isIndeterminate="isIndeterminate"
				:checkAll="checkAll"
				:itemsName="itemsName"
				:operationsWidth="operationsWidth"
				:disableSelection="disableSelection"
			/>

			<Row
				ref="tableRow"
				@event="handleEventNew"
				v-for="(row, rowIndex) in tableData"
				:key="
					`table-row-${row.id ||
						row.name ||
						row.label ||
						row[tableSettings.rowIdKey]}-index-${rowIndex}`
				"
				:rowData="row"
				:rowIndex="rowIndex"
				:columns="tableSettings.columns"
				:operations="showOperations ? tableSettings.operations : null"
				:expandedRowSettings="tableSettings.expandedRowSettings"
				:selectedIds="selectedIds"
				:itemsSaving="itemsSaving"
				:operationsWidth="operationsWidth"
				:disableSelection="disableSelection"
				:canDeleteSettings="canDeleteSettings"
			/>
		</div>

		<div class="errors-block" v-else-if="!itemsLoading">
			<div
				class="text-center section-block"
				v-if="$Lang.currentLangId === LANGUAGE_TYPES.ENGLISH"
			>
				{{ `${itemsName.mult} ${tt('phrases.not_found')}` }}...
			</div>
			<div
				class="text-center section-block"
				v-else-if="$Lang.currentLangId === LANGUAGE_TYPES.SPANISH"
			>
				{{ `${tt('phrases.not_found')} ${itemsName.mult}` }}...
			</div>
		</div>
	</div>
</template>

<script>
import { /*navigation,*/ eventHandler } from '@/mixins';
import { LANGUAGE_TYPES } from '@/localization/utils';

export default {
	mixins: [/*navigation,*/ eventHandler()],
	components: {
		Row: () => import('./Row.vue'),
		TableHeader: () => import('./TableHeader.vue')
	},
	props: {
		itemsName: { type: Object, required: true },
		tableData: {
			type: Array,
			default: () => []
		},
		tableSettings: {
			type: Object,
			default: () => ({})
		},
		itemsLoading: Boolean,
		itemsSaving: Boolean,
		canDeleteSettings: null,
		disableSelection: Boolean,
		hideHeader: Boolean,
		// disableSort: Boolean,
		// emptyText: String,
		alwaysShowOperations: Boolean
		// checkIsDisabled: Boolean
		// clearable: Boolean,
		// query: String
	},

	data() {
		return {
			checkAll: false,
			isIndeterminate: false,
			selectedIds: [],
			actionsLength: 0
			// activeRowIdx: null
		};
	},
	computed: {
		LANGUAGE_TYPES: () => LANGUAGE_TYPES,

		showOperations() {
			return true;
			/*return (
				authUserType !== USER_TYPES.PLANT_USER ||
				this.alwaysShowOperations ||
				this.tableSettings.alwaysShowOperations
			);*/
		},

		/*finalTableData() {
			if (this.tableData.length) {
				let data = [{id: 'tableHeader'}];
				return Object.freeze(data.concat(this.tableData))				
			}
			return [];
		},*/

		operationsWidth() {
			const { actionsLength, showOperations, tableSettings } = this;
			if (tableSettings.operations && tableSettings.operations.width) {
				return tableSettings.operations.width;
			}
			if (showOperations && actionsLength) {
				const width = 39 * actionsLength - 5; // 39 - button width + margin
				return width < 69 ? '69px' : `${width}px`;
			}
			return '0';
		}
	},
	methods: {
		/*toConsole(val) {
			console.log(val);
		},*/

		handleChecked(id) {
			const { tableData } = this;
			if (id) {
				this.selectedIds.some(sid => sid === id)
					? (this.selectedIds = this.selectedIds.filter(sid => sid !== id))
					: this.selectedIds.push(id);
			} else {
				this.selectedIds =
					this.isIndeterminate || !this.selectedIds.length
						? tableData.map(row => row.id)
						: [];
			}

			let checkedCount = this.selectedIds.length;
			this.checkAll = checkedCount === tableData.length;
			this.isIndeterminate = checkedCount > 0 && checkedCount < tableData.length;
			// console.log(id, this.isIndeterminate)
		},

		calcOperationsWidth(num) {
			if (num > this.actionsLength) {
				this.actionsLength = num;
			}
		}
	}
};
</script>
