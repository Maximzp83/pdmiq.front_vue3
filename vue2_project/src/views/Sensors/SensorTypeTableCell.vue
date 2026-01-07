<template>
	<div class="">
		<el-popover
			:disabled="value.disablePopover"
			:placement="'bottom'"
			:popper-class="`text-popover`"
			:title="tt('phrases.mismatch_in_sensor_type_please_check_configuration')"
			trigger="hover"
			width="150"
			:close-delay="0"
		>
			<span
				:class="{ 'alarm-color': !value.disablePopover }"
				slot="reference"
				v-text="value.content"
			></span>
		</el-popover>
	</div>
</template>

<script>
// import { MAINTENANCE_TYPES } from '@/constants/global';

export default {
	// functional: true,
	props: {
		propsData: Object, // row
		additionalProps: Object // column
	},

	computed: {
		value() {
			const { propsData: sensor, additionalProps: column } = this;
			const { dataSetsList, findItemBy, isDataset, isMacAddress } = column.payload;
			let result = {
				content: '-',
				disablePopover: true
			};

			if (isDataset) {
				const dataset = findItemBy('id', sensor.data_set, dataSetsList);
				if (dataset) {
					result.content = dataset.label;
					// console.log(dataset, result)
					if (sensor.ncd_data_set && sensor.ncd_data_set != sensor.data_set) {
						result.disablePopover = false;
					}
				}
			} else if (isMacAddress) {
				result.content = sensor.mac_address;
				if (sensor.ncd_mac_address && sensor.ncd_mac_address != sensor.mac_address) {
					result.disablePopover = false;
				}
			}

			return result;
		}
	}
};
</script>
