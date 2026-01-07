<template>
	<div :class="['table-row custom-table-row table-header']">
		<div class="cells-list">
			<div class="table-cell selection-column" v-if="!disableSelection">
				<el-checkbox
					@change="handleCheckAllChange"
					:value="checkAll"
					:indeterminate="isIndeterminate"
				></el-checkbox>
			</div>

			<TableHeaderCell
				v-for="(column, idx) in columns"
				:key="`header-cell-${idx}`"
				@event="handleEventNew"
				:columnIdx="idx"
				:column="column"
				:activeSortingFilters="activeSortingFilters"
			/>

			<div
				class="table-cell operations-column-cell"
				:style="`min-width: ${operationsWidth}; max-width: ${operationsWidth};`"
				v-if="operationsWidth && operationsWidth != '0'"
			>
				{{ $t('Operations') }}
			</div>
		</div>
	</div>
</template>

<script>
// import { isEmptyString } from '@/utils/validate';
import { /*navigation,*/ eventHandler } from '@/mixins';

export default {
	mixins: [/*navigation,*/ eventHandler()],
	components: {
		TableHeaderCell: () => import('./TableHeaderCell.vue')
	},
	props: {
		columns: { type: Array, required: true },
		itemsName: { type: Object, required: true },
		className: String,
		disableSelection: Boolean,
		checkAll: Boolean,
		isIndeterminate: Boolean,
		operationsWidth: String
	},

	data() {
		return {
			// hasError: false
		};
	},

	computed: {
		activeSortingFilters() {
			const instanceName = this.itemsName.instanceName || this.itemsName.mult || '';
			const instanceState = this.$store.state[instanceName.toLowerCase()];
			const filtersState = this.itemsName.filtersName || 'filters';

			// console.log(instanceName, this.$store.state)
			if (instanceState) {
				return Object.freeze({
					orderByColumn: instanceState[filtersState].orderByColumn,
					orderByMethod: instanceState[filtersState].orderByMethod
				});
			}
			console.warn('instanceState in table header not found');
			return {};
		}
	},

	methods: {
		handleCheckAllChange() {
			this.$emit('event', { eventName: 'handleChecked' });
		}
	}
};
</script>
