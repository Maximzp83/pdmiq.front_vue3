<template>
	<!-- <div :class="['table-cell']" :style="{flexBasis: '20%'}"> -->
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
			<!-- <div > -->
			<TableAction
				v-if="column.meta.action"
				@event="handleEventNew"
				:rowData="rowData"
				:rowIndex="rowIndex"
				:action="column.meta.action"
				:isProccessing="isProccessing"
			/>
			<!-- </div> -->

			<DynamicComponentWrapper
				v-else-if="column.meta.cellComponent"
				ref="DynamicComponentWrapper"
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

			<div class="cell-additional-block" v-if="column.meta.additionalContent">
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
					@event="handleEventNew"
					:rowData="rowData"
					:rowIndex="rowIndex"
					:action="action"
					:isProccessing="isProccessing"
				/>
			</div>
		</div>
		<!-- :tableSettings="tableSettings" -->
	</div>

	<div v-else :class="['table-cell']" :style="cellStyles">
		<span v-if="hasValue" v-html="cellValue"></span>
	</div>
</template>

<script>
import { getCellValue, validateBySettings } from '@/helpers';
import { getCellStyles } from '@/helpers/specialHelpers';

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		TableAction: () => import('./TableAction.vue'),
		DynamicComponentWrapper: () => import('../common/DynamicComponentWrapper.vue')
	},

	props: {
		rowData: null,
		rowIndex: Number,

		// tableSettings: {	type: Object, required: true },
		column: { type: Object, required: true },

		className: String,
		isProccessing: Boolean
	},

	computed: {
		cellValue() {
			// const x = getCellValue(this.rowData, this.column, this.rowIndex);
			// console.log('1', x)
			// return x;
			return getCellValue(this.rowData, this.column, this.rowIndex);
		},

		hasValue() {
			const { cellValue, column, rowData } = this;

			if (column.conditionSettings) {
				// const dataObj = column.conditionSettings.controlObj || this.rowData;

				/*return validateBySettings({
					data_value: cellValue,
					dataObj: dataObj,
					settings: column.conditionSettings
				});*/

				return validateBySettings({
					...column.conditionSettings,
					data_value: cellValue,
					dataObj: rowData
				});
			}

			if (column.show_anyway) return true;

			return !!cellValue && cellValue != ' ';
		},

		cellStyles: that => getCellStyles(that.column)
	}
};
</script>
