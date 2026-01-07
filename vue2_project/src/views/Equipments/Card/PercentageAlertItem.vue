<template>
	<div>
		<span>{{ parameterName }}</span>
		<b
			:class="className"
			v-text="value"
		></b>
	</div>
</template>

<script>

import {
	sensorParametersList,
	sensorParametersListNCD,
	// sensorExtraVibrationParametersList,
	bannerV21vibrationParametersList
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { getRoundedValue } from '@/helpers';

export default {
	props: {
		itemData: {
			type: Object,
			default: () => ({})
		},
	},

	computed: {
		className() {
			const { alarm_percent, warning_percent } = this.itemData;
			// console.log(alarm_percent, warning_percent, alarm_percent && !warning_percent)
			if ((alarm_percent && warning_percent) || alarm_percent) {
				return 'alarm';
			}
			return warning_percent ? 'warning' : '';
		},

		parameterName() {
			const { parameter } = this.itemData;
			let parameterItem =
				sensorParametersList(parameter) ||
				bannerV21vibrationParametersList(parameter) ||
				// sensorExtraVibrationParametersList(parameter) ||
				sensorParametersListNCD(parameter);
			return parameterItem ? (parameterItem.short_name || parameterItem.name) : '-'; 
		},

		value() {
			if (this.itemData.total_percent) {
				return `${getRoundedValue(this.itemData.total_percent, 0, this.itemData.total_percent < 1 ? 1 : 0)}%`;

			}
			return '';
		}
	},
};
</script>
