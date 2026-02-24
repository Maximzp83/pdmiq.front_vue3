<template>
	<div class="" v-if="content">
		<el-tooltip	effect="dark" placement="bottom" >
			<span class="table-cell-icon sensor-firmware-status-icon">
				<img :src="attention_icon_2" />
			</span>

			<span	slot="content" v-text="content"></span>
		</el-tooltip>
	</div>
</template>

<script>
import { attention_icon_2, DATASET } from '@/constants/global';

// import { MAINTENANCE_TYPES } from '@/constants/global';

export default {
	// functional: true,
	props: {
		propsData: Object, // row
		additionalProps: Object // column
	},

	computed: {
		attention_icon_2: () => attention_icon_2,

		content() {
			const { device_data, data_set } = this.propsData;
			// console.log(data_set, device_data ? device_data.SenFwVer : '')
			if (data_set !== DATASET.BANNER_V2_GENERIC && data_set !== DATASET.BANNER_M25) {
				if (device_data && device_data.SenFwVer && device_data.SenFwVer > 300) {
					return `${this.tt('phrases.Wrong_sensor_firmware_version')}: ${device_data.SenFwVer}`;
				}
			}

			return null;
		},
	}
};
</script>
