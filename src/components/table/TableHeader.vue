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
	activeSortingFilters: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);
const { tt } = Lang;

const handleCheckAllChange = () => {
	emit('event', { eventName: 'handleChecked' });
};

const methodsMap = {};
const { handleEvent } = useEventHandler(methodsMap, emit);

void props;
</script>
