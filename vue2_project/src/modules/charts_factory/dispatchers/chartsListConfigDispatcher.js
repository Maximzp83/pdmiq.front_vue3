import { chartsListsConfig as sensorChartsListsConfig } from '../controllers/Sensor/chartsListsConfig';
import { chartsListsConfig as FFTChartsListsConfig } from '../controllers/Sensor/FFTChartsListsConfig';
import { chartsListsConfig as OEEChartsListsConfig } from '../controllers/OEE/chartsListsConfig';
import { chartsListsConfig as maintenanceChartListsConfig } from '../controllers/Maintenance/chartsListsConfig';

export const getChartsListsConfig = (configsKey, chartKey, settings) => {
	// console.log('getChartsListsConfig', configsKey, chartKey, settings)
	switch (configsKey) {
		case 'sensorChartsListsConfig':
			return sensorChartsListsConfig(chartKey, settings);
		case 'FFTChartsListsConfig':
			return FFTChartsListsConfig(chartKey, settings);
		case 'OEEChartsListsConfig':
			return OEEChartsListsConfig(chartKey, settings);
		case 'maintenanceChartListsConfig':
			return maintenanceChartListsConfig(chartKey, settings);

		default:
			return null;
	}
};
