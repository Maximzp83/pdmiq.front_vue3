<template>
	<div :class="['value-cell', cellSettings.cell_class || '']" :style="cellStyles">
		<div v-if="cellSettings.icon" class="icon-block">
			<i :class="cellSettings.icon"></i>
		</div>

		<div class="info-block">
			<div v-if="cellSettings.label" class="label" v-text="cellSettings.label"></div>
			<div v-if="cellSettings.prop" class="value">
				<span
					v-if="cellSettings.valuePrefix"
					v-text="cellSettings.valuePrefix"
				></span>
				<span v-html="cellValue"></span>
			</div>
		</div>
	</div>
</template>

<script>
import { getCellValue, validateBySettings } from '@/helpers';
import { getCellStyles } from '@/helpers/specialHelpers';

// import { eventHandler } from '@/mixins';

export default {
	// mixins: [eventHandler],

	props: {
		itemData: null,
		// tableSettings: {	type: Object, required: true },
		cellSettings: { type: Object, required: true },
		className: String
	},

	computed: {
		cellValue() {
			return getCellValue(this.itemData, this.cellSettings);
		},

		hasValue() {
			const { cellValue, cellSettings, rowData } = this;

			if (cellSettings.conditionSettings) {
				return validateBySettings({
					...cellSettings.conditionSettings,
					data_value: cellValue,
					dataObj: rowData
				});
			}

			return !!cellValue && cellValue != ' ';
		},

		cellStyles: that => getCellStyles(that.cellSettings)
	}
};
</script>
