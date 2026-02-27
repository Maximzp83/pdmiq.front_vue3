<template>
	<div :class="['items-table-container relative', tableSettings.tableClass || '']">
		<VueElementLoadingWrapper :isLoading="itemsLoading" :itemsName="itemsName.mult" />

		<div v-if="tableData.length" class="flex-table custom-table-container">
			<TableHeader
				v-if="!hideHeader"
				:columns="tableSettings.columns"
				:isIndeterminate="isIndeterminate"
				:checkAll="checkAll"
				:itemsName="itemsName"
				:operationsWidth="operationsWidth"
				:disableSelection="disableSelection"
				:activeSortingFilters="activeSortingFilters"
				@event="handleEvent"
			/>

			<Row
				v-for="(row, rowIndex) in tableData"
				:key="`table-row-${row.id || row.name || row.label || row[tableSettings.rowIdKey]}-index-${rowIndex}`"
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
				@event="handleEvent"
			/>
		</div>

		<div v-else-if="!itemsLoading" class="errors-block">
			<div v-if="Lang.currentLangId === LANGUAGE_TYPES.ENGLISH" class="text-center section-block">
				{{ `${itemsName.mult} ${tt('phrases.not_found')}` }}...
			</div>
			<div
				v-else-if="Lang.currentLangId === LANGUAGE_TYPES.SPANISH"
				class="text-center section-block"
			>
				{{ `${tt('phrases.not_found')} ${itemsName.mult}` }}...
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { LANGUAGE_TYPES } from '@/localization/utils';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import Row from './Row.vue';
import TableHeader from './TableHeader.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt } = Lang;

defineOptions({
	name: 'CustomDataListTable',
});

const props = defineProps({
	itemsName: { type: Object, required: true },
	tableData: { type: Array, default: () => [] },
	tableSettings: { type: Object, default: () => ({}) },
	itemsLoading: Boolean,
	itemsSaving: Boolean,
	canDeleteSettings: null,
	disableSelection: Boolean,
	hideHeader: Boolean,
	alwaysShowOperations: Boolean,
});

const emit = defineEmits(['event']);

const checkAll = ref(false);
const isIndeterminate = ref(false);
const selectedIds = ref([]);
const actionsLength = ref(0);

const showOperations = computed(() => true);

const activeSortingFilters = computed(() => {
	const filtersSource = props.tableSettings?.activeSortingFilters || props.tableSettings?.filters || {};
	return Object.freeze({
		orderByColumn: filtersSource.orderByColumn,
		orderByMethod: filtersSource.orderByMethod,
	});
});

const operationsWidth = computed(() => {
	if (props.tableSettings.operations && props.tableSettings.operations.width) {
		return props.tableSettings.operations.width;
	}
	if (showOperations.value && actionsLength.value) {
		const width = 39 * actionsLength.value - 5;
		return width < 69 ? '69px' : `${width}px`;
	}
	return '0';
});

const handleChecked = (id) => {
	const tableData = props.tableData || [];
	if (id) {
		selectedIds.value.some((sid) => sid === id)
			? (selectedIds.value = selectedIds.value.filter((sid) => sid !== id))
			: selectedIds.value.push(id);
	} else {
		selectedIds.value = isIndeterminate.value || !selectedIds.value.length
			? tableData.map((row) => row.id)
			: [];
	}

	const checkedCount = selectedIds.value.length;
	checkAll.value = checkedCount === tableData.length;
	isIndeterminate.value = checkedCount > 0 && checkedCount < tableData.length;
};

const calcOperationsWidth = (num) => {
	if (num > actionsLength.value) {
		actionsLength.value = num;
	}
};

const methodsMap = {
	handleChecked,
	calcOperationsWidth,
};

const { handleEvent } = useEventHandler(methodsMap, emit);

void Lang;
</script>
