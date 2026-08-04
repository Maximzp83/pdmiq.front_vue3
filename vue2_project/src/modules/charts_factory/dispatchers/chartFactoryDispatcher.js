import { executeChartFactory as executeSensorChartFactory } from '../controllers/Sensor/classes/Chart';
import { executeChartFactory as executeFFTChartFactory } from '../controllers/Sensor/classes/FFTChart';
import { executeChartFactory as executeOEEChartFactory } from '../controllers/OEE/classes/Chart';
import { executeChartFactory as executeMaintenanceChartFactory } from '../controllers/Maintenance/classes/Chart';

export const executeChartFactory = (name, resources) => {
	// console.log('executeChartFactory',  name, resources)
	switch (name) {
		// case 'SensorChart': return SensorChart(resources);
		case 'SensorChart':
		case 'SensorAlarmsChart':
		case 'SensorOverlayChart':
		case 'ManualRouteChart':
		case 'MultiViewChart':
			return executeSensorChartFactory(name, resources);
		case 'FFTChart':
		case 'FFTWaterfall3DChart':
			return executeFFTChartFactory(name, resources);
		case 'OEEChart':
			return executeOEEChartFactory(name, resources);

		case 'WObarChart':
		case 'RequisitionStatisticsChart':
		case 'WOStatisticsChart':
		case 'BreakdownMachinesChart':
		case 'SuccessDashboardProblemsChart':
		case 'HealthCardChart':
		case 'SuccessGaugeChart':
		case 'RSSIChart':
		case 'PDMStatisticsPieChart':
			return executeMaintenanceChartFactory(name, resources);
		default:
			return null;
	}
};
