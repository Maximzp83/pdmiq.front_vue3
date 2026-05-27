<template>
	<div :class="['items-table-container relative', tableSettings.tableClass || '']">
		<VueElementLoadingWrapper :isLoading="itemsLoading" :itemsName="itemsName.mult" />

		<div v-if="tableData.length" class="flex-table custom-table-container">
				<TableHeader
					v-if="!hideHeader"
					:columns="tableSettings.columns"
					:isIndeterminate="isIndeterminate"
					:checkAll="checkAll"
					:disableCheckAll="isAllRowsSelectionDisabled"
					:itemsName="itemsName"
					:operationsWidth="operationsWidth"
					:disableSelection="disableSelection"
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
					:canSelect="selectableRowIds.some((id) => id === row.id)"
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
import { computed, ref, watch } from 'vue';

import { validateBySettings } from '@/helpers';
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

const canSelectRow = (rowData) => {
	const actions =
		showOperations.value && props.tableSettings?.operations?.actions
			? props.tableSettings.operations.actions
			: [];

	if (actions.length) {
		const deleteActions = actions.filter(
			(action) =>
				(action.name === 'handleDeleteItems' ||
					action.name === 'handleDeleteWorkOrders') &&
				action.conditionSettings
		);

		if (deleteActions.length) {
			let allowedActionsCount = 0;

			deleteActions.forEach((action) => {
				if (
					action.conditionSettings &&
					validateBySettings({
						...action.conditionSettings,
						dataObj: rowData,
					})
				) {
					allowedActionsCount++;
				}
			});

			return allowedActionsCount > 0;
		}
	}

	return true;
};

const selectableRowIds = computed(() =>
	(props.tableData || [])
		.filter((row) => canSelectRow(row))
		.map((row) => row.id)
);

const isAllRowsSelectionDisabled = computed(() => !selectableRowIds.value.length);

const syncSelectionState = () => {
	selectedIds.value = selectedIds.value.filter((id) =>
		selectableRowIds.value.some((selectableId) => selectableId === id)
	);

	const checkedCount = selectedIds.value.length;
	checkAll.value =
		!!selectableRowIds.value.length && checkedCount === selectableRowIds.value.length;
	isIndeterminate.value =
		checkedCount > 0 && checkedCount < selectableRowIds.value.length;
};

const handleChecked = (id) => {
	if (id) {
		selectedIds.value.some((sid) => sid === id)
			? (selectedIds.value = selectedIds.value.filter((sid) => sid !== id))
			: selectedIds.value.push(id);
	} else {
		selectedIds.value = isIndeterminate.value || !selectedIds.value.length
			? [...selectableRowIds.value]
			: [];
	}

	syncSelectionState();
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

defineExpose({
  selectedIds
});

const { handleEvent } = useEventHandler(methodsMap, emit);

watch(
	() => props.tableData,
	() => {
		syncSelectionState();
	},
	{ deep: true }
);

void Lang;
</script>
