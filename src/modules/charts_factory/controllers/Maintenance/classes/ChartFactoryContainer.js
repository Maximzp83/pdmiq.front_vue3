import ChartFactoryContainerBase from '../../../classes/ChartFactoryContainer';

class ChartFactoryContainer extends ChartFactoryContainerBase {
	constructor(resources) {
		super();
		this.useResources(resources);
	}
}

export const executeChartFactoryContainer = (name, settings) => {
	// console.log('executeChartFactoryContainer', name, settings)
	switch (name) {
		case 'MaintenanceChartFactoryContainer':
			return new ChartFactoryContainer(settings);
		
		default:
			return null;
	}
};

/*export const executeChartFactoryContainer = settings =>
	new MaintenanceChartFactoryContainer(settings);*/
