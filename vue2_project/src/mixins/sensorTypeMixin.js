import { sensorTypesList } from '@/constants/global';

const sensorTypeMixin = {
	computed: {
		currentSensorType() {
			const data = this[this.currentSensorTypeDataKey];
			if (data) {
				if (data instanceof Array) {
					return data.map(sensor => {
						return { sensor_id: sensor.id, sensorType: this.getType(sensor) };
					});
				} else {
					return this.getType(data);
				}
			}
			return {};
		},

		currentChartSettingsKey() {
			return this.getChartSettingsKey(
				this[this.currentSensorTypeDataKey],
				this.currentSensorType
			);
		}
	},

	methods: {
		getType(sensor) {
			const { type, data_set } = sensor;
			if (type && data_set) {
			const sensorType = sensorTypesList(type, data_set); /*[type][data_set]*/
				return sensorType ? Object.freeze(sensorType) : {};				
			}
			return {};
		},

		getChartSettingsKey(sensorData, sensorType) {
			// const { currentSensorType /*joinChartsBy*/ } = this;

			if (sensorType.isCustomPDM && sensorData) {
				return sensorType.chartSettingsKey[sensorData.setup_type];
			}

			if (sensorType.isNCDCustom_4_20 && sensorData) {
				return sensorType.chartSettingsKey[sensorData.alarm_type];
			}

			return sensorType.chartSettingsKey;
		}
	}
};

export default () => sensorTypeMixin;
