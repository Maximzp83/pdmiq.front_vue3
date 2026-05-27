<template>
	<div :class="['table-row custom-table-row table-header']">
		<div class="cells-list">
			<div v-if="!disableSelection" class="table-cell selection-column">
				<el-checkbox
					@change="handleCheckAllChange"
					:model-value="checkAll"
					:indeterminate="isIndeterminate"
					:disabled="disableCheckAll"
				/>
			</div>

			<TableHeaderCell
				v-for="(column, idx) in columns"
				:key="`header-cell-${idx}`"
				@event="handleEvent"
				:columnIdx="idx"
				:column="column"
				:activeSortingFilters="activeSortingFilters"
			/>

			<div
				v-if="operationsWidth && operationsWidth !== '0'"
				class="table-cell operations-column-cell"
				:style="`min-width: ${operationsWidth}; max-width: ${operationsWidth};`"
			>
				{{ tt('Operations') }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { getActivePinia } from 'pinia';

import { useEventHandler } from '@/composables/mixins/useEmitter';
import { Lang } from '@/localization';

import TableHeaderCell from './TableHeaderCell.vue';

defineOptions({
	name: 'TableHeader',
});

const props = defineProps({
	columns: { type: Array, required: true },
	itemsName: { type: Object, required: true },
	className: { type: String, default: '' },
	disableSelection: Boolean,
	disableCheckAll: Boolean,
	checkAll: Boolean,
	isIndeterminate: Boolean,
	operationsWidth: { type: String, default: '0' },
});

const emit = defineEmits(['event']);
const { tt } = Lang;

const normalizeKey = (value) => `${value || ''}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const activeSortingFilters = computed(() => {
	const instanceName = props.itemsName?.instanceName || props.itemsName?.mult || '';
	const filtersStateKey = props.itemsName?.filtersName || 'filters';
	const normalizedInstanceName = normalizeKey(instanceName);

	if (!normalizedInstanceName) {
		return {};
	}

	const pinia = getActivePinia();
	const storesState = pinia?.state?.value || {};
	const storeKey = Object.keys(storesState).find((key) =>
		normalizeKey(key).startsWith(normalizedInstanceName)
	);
	const filtersState = storeKey ? storesState[storeKey]?.[filtersStateKey] : null;

	if (!filtersState) {
		return {};
	}

	return Object.freeze({
		orderByColumn: filtersState.orderByColumn,
		orderByMethod: filtersState.orderByMethod,
	});
});

const handleCheckAllChange = () => {
	emit('event', { eventName: 'handleChecked' });
};

const methodsMap = {};
const { handleEvent } = useEventHandler(methodsMap, emit);
</script>
