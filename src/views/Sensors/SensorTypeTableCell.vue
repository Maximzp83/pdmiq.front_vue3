<template>
	<div>
		<el-popover
			:disabled="value.disablePopover"
			placement="bottom"
			popper-class="text-popover"
			:title="tt('phrases.mismatch_in_sensor_type_please_check_configuration')"
			trigger="hover"
			width="150"
			:close-delay="0"
		>
			<template #reference>
				<span
					:class="{ 'alarm-color': !value.disablePopover }"
					v-text="value.content"
				></span>
			</template>
		</el-popover>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { Lang } from '@/localization';

defineOptions({
	name: 'SensorTypeTableCell',
});

const props = defineProps({
	propsData: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
});

const { tt } = Lang;

const value = computed(() => {
	const sensor = props.propsData;
	const {
		dataSetsList = [],
		findItemBy,
		isDataset,
		isMacAddress,
	} = props.additionalProps?.payload || {};
	const result = {
		content: '-',
		disablePopover: true,
	};

	if (isDataset && typeof findItemBy === 'function') {
		const dataset = findItemBy('id', sensor.data_set, dataSetsList);

		if (dataset) {
			result.content = dataset.label;
			if (sensor.ncd_data_set && sensor.ncd_data_set != sensor.data_set) {
				result.disablePopover = false;
			}
		}
	} else if (isMacAddress) {
		result.content = sensor.mac_address || '-';
		if (sensor.ncd_mac_address && sensor.ncd_mac_address != sensor.mac_address) {
			result.disablePopover = false;
		}
	}

	return result;
});
</script>
