<template>
	<div :class="['table-row custom-table-row']">
		<div class="cells-list">
			<div class="table-cell selection-column" v-if="!disableSelection">
				<el-checkbox
					@change="handleChecked"
					:value="canSelect ? selectedIds.some(sid => sid === rowData.id) : false"
					:disabled="!canSelect"
				></el-checkbox>
			</div>

			<TableCell
				v-for="(column, columnIdx) in columns"
				:key="`row-${rowIndex}_tableColumn-${columnIdx}`"
				@event="handleEventNew"
				:rowData="rowData"
				:rowIndex="rowIndex"
				:columnIdx="columnIdx"
				:column="column"
				:isProccessing="itemsSaving"
			/>
			<!-- :tableSettings="tableSettings" -->

			<div
				:class="['table-cell operations-column-cell']"
				:style="`min-width: ${operationsWidth}; max-width: ${operationsWidth};`"
				v-if="operations"
			>
				<div class="operations-list">
					<TableAction
						v-for="(action, idx) in actionsList"
						:key="`tableAction-${action.name}-${idx}`"
						@event="handleEventNew"
						:rowData="rowData"
						:rowIndex="rowIndex"
						:action="action"
						:isProccessing="itemsSaving"
					/>
				</div>

				<div class="operations-list" v-if="actionsListSecondRow.length">
					<TableAction
						v-for="(action, idx) in actionsListSecondRow"
						:key="`tableActionSecond-${action.name}-${idx}`"
						@event="handleEventNew"
						:rowData="rowData"
						:rowIndex="rowIndex"
						:action="action"
						:isProccessing="itemsSaving"
					/>
				</div>
			</div>
		</div>

		<div
			class="expanded-row"
			v-if="rowData.id !== 'tableHeader' && expandedRowSettings"
		>
			<DynamicComponentWrapper
				ref="actionButtonContent"
				:propsData="rowData"
				:componentPath="expandedRowSettings.componentPath"
			/>
		</div>
	</div>
</template>

<script>
import { /*navigation,*/ eventHandler } from '@/mixins';

export default {
	mixins: [/*navigation,*/ eventHandler()],
	components: {
		TableCell: () => import('./TableCell.vue'),
		// TableHeaderCell: () => import('./TableHeaderCell.vue'),
		TableAction: () => import('./TableAction.vue'),
		DynamicComponentWrapper: () => import('../common/DynamicComponentWrapper.vue')
	},
	props: {
		rowData: null,
		rowIndex: Number,
		columns: { type: Array, required: true },
		operations: null,
		expandedRowSettings: null,
		disableSelection: Boolean,
		selectedIds: Array,
		canSelect: { type: Boolean, default: true },
		itemsSaving: Boolean,
		canDeleteSettings: Boolean,
		operationsWidth: String
		// className: String,
	},

	/*data() {
		return {
			// hasError: false
		};
	},*/

	computed: {
		actionsList() {
			if (this.operations) {
				return Object.freeze(this.operations.actions);
			}

			return [];
		},
		actionsListSecondRow() {
			if (this.operations && this.operations.actions_second_row) {
				return Object.freeze(this.operations.actions_second_row);
			}

			return [];
		}
	},

	methods: {
		handleChecked() {
			this.$emit('event', {
				eventName: 'handleChecked',
				data: this.rowData.id,
				onward: true
			});
		}
	},

	watch: {
		actionsList(list) {
			this.$emit('event', {
				eventName: 'calcOperationsWidth',
				data: list.length,
				onward: true
			});
		}
	},

	mounted() {
		this.$emit('event', {
			eventName: 'calcOperationsWidth',
			data:
				this.actionsList.length > this.actionsListSecondRow.length
					? this.actionsList.length
					: this.actionsListSecondRow.length,
			onward: true
		});
	}
};
</script>
