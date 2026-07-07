<template>
	<div :class="['value-cell', cellSettings.cell_class || '']" :style="cellStyles">
		<div v-if="cellSettings.icon" class="icon-block">
			<el-icon
				v-if="legacyIconComponent"
				:class="['legacy-report-icon qweasd', cellSettings.icon]"
			>
				<component class="qweasd" :is="legacyIconComponent" />
			</el-icon>
			<i v-else :class="cellSettings.icon"></i>
		</div>

		<div class="info-block">
			<div v-if="cellSettings.label" class="label">{{ cellSettings.label }}</div>
			<div v-if="cellSettings.prop" class="value">
				<span v-if="cellSettings.valuePrefix">{{ cellSettings.valuePrefix }}</span>
				<span v-html="cellValue"></span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { Calendar, Setting } from '@element-plus/icons-vue';

import { getCellValue, validateBySettings } from '@/helpers';
import { getCellStyles } from '@/helpers/specialHelpers';

defineOptions({ name: 'RequisitionReportValueCell' });

const props = defineProps({
	itemData: { type: Object, default: () => ({}) },
	cellSettings: { type: Object, required: true },
	className: String,
});

const cellValue = computed(() => getCellValue(props.itemData, props.cellSettings));
const legacyIconsMap = Object.freeze({
	'el-icon-date': Calendar,
	'el-icon-setting': Setting,
});
const legacyIconComponent = computed(() => legacyIconsMap[props.cellSettings.icon] || null);
const hasValue = computed(() => {
	if (props.cellSettings.conditionSettings) {
		return validateBySettings({
			...props.cellSettings.conditionSettings,
			data_value: cellValue.value,
			dataObj: props.itemData,
		});
	}
	return !!cellValue.value && cellValue.value !== ' ';
});
const cellStyles = computed(() => getCellStyles(props.cellSettings));

defineExpose({ hasValue });
</script>
