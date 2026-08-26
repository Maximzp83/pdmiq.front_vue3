import { executeChartsListFactory as executeSensorChartsListFactory } from './controllers/Sensor/classes/ChartsListFactory';
import { executeChartFactoryContainer as executeOEEChartFactoryContainer } from './controllers/OEE/classes/ChartFactoryContainer';
import { executeChartFactoryContainer as executeMaintenanceChartFactoryContainer } from './controllers/Maintenance/classes/ChartFactoryContainer';
import { executeChartFactoryContainer as executeSensorChartsFactoryConatiner } from './controllers/Sensor/classes/ChartFactoryContainer';
import { executeChartFactoryContainer as execute3DChartFactoryContainer } from './controllers/Sensor/classes/ChartFactoryContainer';

export const executeChartsListFactory = (name, settings) => {
	switch (name) {
		case 'sensorChartsListFactory':
		case 'sensorAlarmsChartsListFactory':
		case 'FFTChartsListFactory':
			return executeSensorChartsListFactory(name, settings);
		default:
			return null;
	}
};

export const executeChartFactoryContainer = (name, settings) => {
	// console.log(settings)
	switch (name) {
		case 'OEEChartFactoryContainer':
			return executeOEEChartFactoryContainer(settings);
		case 'MaintenanceChartFactoryContainer':
			return executeMaintenanceChartFactoryContainer(name, settings);
		case 'ManualRouteChartFactoryContainer':
		case 'MultiViewChartFactoryContainer':
			return executeSensorChartsFactoryConatiner(name, settings);
		case '3DChartFactoryContainer':
			return execute3DChartFactoryContainer(name, settings);
		default:
			return null;
	}
};
