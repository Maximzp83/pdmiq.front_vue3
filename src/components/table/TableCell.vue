<template>
	<div
		v-if="column.meta"
		:class="['table-cell', column.meta.cell_class || '', { 'no-value': !hasValue }]"
		:style="cellStyles"
	>
		<div
			v-if="hasValue"
			:class="[
				{ 'table-button-container': column.meta.additionalActions },
				column.meta.cell_container_class || ''
			]"
		>
			<TableAction
				v-if="column.meta.action"
				@event="handleEvent"
				:rowData="rowData"
				:rowIndex="rowIndex"
				:action="column.meta.action"
				:isProccessing="isProccessing"
			/>

			<DynamicComponentWrapper
				v-else-if="column.meta.cellComponent"
				ref="dynamicComponentWrapper"
				:propsData="rowData"
				:additionalProps="column"
				:componentPath="column.meta.cellComponent.componentPath"
			/>

			<span v-else-if="column.prop" v-html="cellValue"></span>

			<img v-if="column.meta.img" :src="column.meta.img.src" alt="img error" />
			<i v-if="column.meta.icon" :class="column.meta.icon" />

			<div
				v-if="column.meta.htmlBlock"
				v-html="column.meta.htmlBlock.html"
				:class="column.meta.htmlBlock.className || ''"
			></div>

			<div v-if="column.meta.additionalContent" class="cell-additional-block">
				<DynamicComponentWrapper
					ref="actionPopoverContent"
					:propsData="rowData"
					:additionalProps="column"
					:componentPath="column.meta.additionalContent.component.componentPath"
				/>
			</div>

			<div
				v-if="column.meta.additionalActions"
				:class="['additionalActions', column.meta.additionalActionsClassName || '']"
			>
				<TableAction
					v-for="(action, idx) in column.meta.additionalActions"
					:key="`cell_additionalAction-${action.name}-${idx}`"
					@event="handleEvent"
					:rowData="rowData"
					:rowIndex="rowIndex"
					:action="action"
					:isProccessing="isProccessing"
				/>
			</div>
		</div>
	</div>

	<div v-else class="table-cell" :style="cellStyles">
		<span v-if="hasValue" v-html="cellValue"></span>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';

import { getCellValue, validateBySettings } from '@/helpers';
import { getCellStyles } from '@/helpers/specialHelpers';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import TableAction from './TableAction.vue';

const DynamicComponentWrapper = defineAsyncComponent(
	() => import('../common/DynamicComponentWrapper.vue')
);

defineOptions({
	name: 'TableCell',
});

const props = defineProps({
	rowData: { type: Object, default: () => ({}) },
	rowIndex: { type: Number, default: 0 },
	column: { type: Object, required: true },
	className: { type: String, default: '' },
	isProccessing: Boolean,
});

const emit = defineEmits(['event']);

const cellValue = computed(() => getCellValue(props.rowData, props.column, props.rowIndex));

const hasValue = computed(() => {
	if (props.column.conditionSettings) {
		return validateBySettings({
			...props.column.conditionSettings,
			data_value: cellValue.value,
			dataObj: props.rowData,
		});
	}

	if (props.column.show_anyway) {
		return true;
	}

	return !!cellValue.value && cellValue.value !== ' ';
});

const cellStyles = computed(() => getCellStyles(props.column));

const methodsMap = {};
const { handleEvent } = useEventHandler(methodsMap, emit);
</script>
