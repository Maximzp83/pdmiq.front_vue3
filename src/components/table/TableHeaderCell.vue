<template>
	<div :class="['table-cell', (column.meta && column.meta.cell_class) || '']" :style="cellStyles">
		<div>
			<span v-text="column.label"></span>
			<span v-if="column.label_postfix" v-text="column.label_postfix"></span>

			<span v-if="column.sortable" class="sort-buttons">
				<div :class="['triangle pos-top', { active: isActiveSort.asc }]" @click="handleSort('asc')"></div>
				<div
					:class="['triangle pos-bottom', { active: isActiveSort.desc }]"
					@click="handleSort('desc')"
				></div>
			</span>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

import { getCellStyles } from '@/helpers/specialHelpers';

defineOptions({
	name: 'TableHeaderCell',
});

const props = defineProps({
	column: { type: Object, required: true },
	activeSortingFilters: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);

const isActiveSort = computed(() => {
	const controlProp = props.column.meta && props.column.meta.sortBy ? props.column.meta.sortBy : props.column.prop;
	return Object.freeze({
		asc:
			controlProp === props.activeSortingFilters.orderByColumn &&
			props.activeSortingFilters.orderByMethod === 'asc',
		desc:
			controlProp === props.activeSortingFilters.orderByColumn &&
			props.activeSortingFilters.orderByMethod === 'desc',
	});
});

const cellStyles = computed(() => getCellStyles(props.column));

const handleSort = (order) => {
	const controlProp = props.column.meta && props.column.meta.sortBy ? props.column.meta.sortBy : props.column.prop;

	const payload = {
		orderByColumn: order ? controlProp : null,
		orderByMethod: order,
	};

	if (
		payload.orderByColumn === props.activeSortingFilters.orderByColumn &&
		payload.orderByMethod === props.activeSortingFilters.orderByMethod
	) {
		payload.orderByColumn = null;
		payload.orderByMethod = null;
	}

	emit('event', {
		eventName: 'setFilters',
		data: payload,
		onward: true,
	});
};
</script>
