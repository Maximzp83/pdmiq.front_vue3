import { computed } from 'vue';
import { sensorTypesList } from '@/constants/global';

export function useSensorType({ currentSensorTypeData } = {}) {
	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const getType = (sensor) => {
		const { type, data_set } = sensor || {};
		if (type && data_set) {
			const sensorType = sensorTypesList(type, data_set);
			return sensorType ? Object.freeze(sensorType) : {};
		}
		return {};
	};

	const currentSensorType = computed(() => {
		const data = resolve(currentSensorTypeData);
		if (data) {
			if (Array.isArray(data)) {
				return data.map((sensor) => ({
					sensor_id: sensor.id,
					sensorType: getType(sensor),
				}));
			}
			return getType(data);
		}
		return {};
	});

	const getChartSettingsKey = (sensorData, sensorType) => {
		if (sensorType?.isCustomPDM && sensorData) {
			return sensorType.chartSettingsKey?.[sensorData.setup_type];
		}

		if (sensorType?.isNCDCustom_4_20 && sensorData) {
			return sensorType.chartSettingsKey?.[sensorData.alarm_type];
		}

		return sensorType?.chartSettingsKey;
	};

	const currentChartSettingsKey = computed(() => {
		return getChartSettingsKey(resolve(currentSensorTypeData), currentSensorType.value);
	});

	return { currentSensorType, currentChartSettingsKey, getType, getChartSettingsKey };
}
