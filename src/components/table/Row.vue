<template>
	<div class="table-row custom-table-row">
		<div class="cells-list">
			<div v-if="!disableSelection" class="table-cell selection-column">
				<el-checkbox
					@change="handleChecked"
					:model-value="canSelect ? selectedIds.some((sid) => sid === rowData.id) : false"
					:disabled="!canSelect"
				/>
			</div>

			<TableCell
				v-for="(column, columnIdx) in columns"
				:key="`row-${rowIndex}_tableColumn-${columnIdx}`"
				@event="handleEvent"
				:rowData="rowData"
				:rowIndex="rowIndex"
				:columnIdx="columnIdx"
				:column="column"
				:isProccessing="itemsSaving"
			/>

			<div
				v-if="operations"
				:class="['table-cell operations-column-cell']"
				:style="`min-width: ${operationsWidth}; max-width: ${operationsWidth};`"
			>
				<div class="operations-list">
					<TableAction
						v-for="(action, idx) in actionsList"
						:key="`tableAction-${action.name}-${idx}`"
						@event="handleEvent"
						:rowData="rowData"
						:rowIndex="rowIndex"
						:action="action"
						:isProccessing="itemsSaving"
					/>
				</div>

				<div v-if="actionsListSecondRow.length" class="operations-list">
					<TableAction
						v-for="(action, idx) in actionsListSecondRow"
						:key="`tableActionSecond-${action.name}-${idx}`"
						@event="handleEvent"
						:rowData="rowData"
						:rowIndex="rowIndex"
						:action="action"
						:isProccessing="itemsSaving"
					/>
				</div>
			</div>
		</div>

		<div v-if="rowData.id !== 'tableHeader' && expandedRowSettings" class="expanded-row">
			<DynamicComponentWrapper
				ref="actionButtonContent"
				:propsData="rowData"
				:componentFileLoader="expandedRowSettings.componentFileLoader"
				:componentPath="expandedRowSettings.componentPath"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, watch } from 'vue';
import { validateBySettings } from '@/helpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import TableAction from './TableAction.vue';
import TableCell from './TableCell.vue';

const DynamicComponentWrapper = defineAsyncComponent(
	() => import('../common/DynamicComponentWrapper.vue')
);

defineOptions({
	name: 'TableRow',
});

const props = defineProps({
	rowData: { type: Object, default: () => ({}) },
	rowIndex: { type: Number, default: 0 },
	columns: { type: Array, required: true },
	operations: { type: Object, default: null },
	expandedRowSettings: { type: Object, default: null },
	disableSelection: Boolean,
	selectedIds: { type: Array, default: () => [] },
	itemsSaving: Boolean,
	canDeleteSettings: Boolean,
	operationsWidth: { type: String, default: '0' },
});

const emit = defineEmits(['event']);

const actionsList = computed(() => {
	if (props.operations) {
		return Object.freeze(props.operations.actions || []);
	}
	return [];
});

const actionsListSecondRow = computed(() => {
	if (props.operations && props.operations.actions_second_row) {
		return Object.freeze(props.operations.actions_second_row);
	}
	return [];
});

const canSelect = computed(() => {
	if (actionsList.value.length) {
		const deleteActions = actionsList.value.filter(
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
						dataObj: props.rowData,
					})
				) {
					allowedActionsCount++;
				}
			});

			return allowedActionsCount > 0;
		}
	}

	return true;
});

const handleChecked = () => {
	emit('event', {
		eventName: 'handleChecked',
		data: props.rowData.id,
		onward: true,
	});
};

const calcOperationsWidth = (count) => {
	emit('event', {
		eventName: 'calcOperationsWidth',
		data: count,
		onward: true,
	});
};

const methodsMap = {};
const { handleEvent } = useEventHandler(methodsMap, emit);

watch(actionsList, (list) => {
	calcOperationsWidth(list.length);
});

onMounted(() => {
	calcOperationsWidth(
		actionsList.value.length > actionsListSecondRow.value.length
			? actionsList.value.length
			: actionsListSecondRow.value.length
	);
});
</script>
