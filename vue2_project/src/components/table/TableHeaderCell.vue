<template>
	<!-- <div :class="['table-cell']" :style="{flexBasis: '20%'}"> -->
	<div
		:class="['table-cell', (column.meta && column.meta.cell_class) || '']"
		:style="cellStyles"
	>
		<div>
			<span v-text="column.label"></span>
			<span v-if="column.label_postfix" v-text="column.label_postfix"></span>

			<span class="sort-buttons" v-if="column.sortable">
				<div
					:class="['triangle pos-top', { active: isActiveSort.asc }]"
					@click="handleSort('asc')"
				></div>
				<div
					:class="['triangle pos-bottom', { active: isActiveSort.desc }]"
					@click="handleSort('desc')"
				></div>
			</span>
		</div>
	</div>
</template>

<script>
// import { getCellValue } from '@/helpers';

import { getCellStyles } from '@/helpers/specialHelpers';

export default {
	props: {
		column: { type: Object, required: true },
		activeSortingFilters: { type: Object, default: () => ({}) }
	},

	computed: {
		isActiveSort() {
			const { activeSortingFilters, column } = this;
			let control_prop =
				column.meta && column.meta.sortBy ? column.meta.sortBy : column.prop;
			return Object.freeze({
				asc:
					control_prop == activeSortingFilters.orderByColumn &&
					activeSortingFilters.orderByMethod == 'asc',
				desc:
					control_prop == activeSortingFilters.orderByColumn &&
					activeSortingFilters.orderByMethod == 'desc'
			});
		},

		cellStyles: that => getCellStyles(that.column)
	},

	data() {
		return {
			// hasError: false
		};
	},

	methods: {
		handleSort(order) {
			const { column } = this;
			const control_prop =
				column.meta && column.meta.sortBy ? column.meta.sortBy : column.prop;

			let payload = {
				orderByColumn: order ? control_prop : null,
				orderByMethod: order
			};

			const { orderByColumn, orderByMethod } = this.activeSortingFilters;

			if (
				payload.orderByColumn == orderByColumn &&
				payload.orderByMethod == orderByMethod
			) {
				payload.orderByColumn = null;
				payload.orderByMethod = null;
			}
			// console.log(payload)
			this.$emit('event', {
				eventName: 'setFilters',
				data: payload,
				onward: true
			});
		}
	}
};
</script>
