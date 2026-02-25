// import ChartsListFactoryBase from '../../../classes/ChartsListFactory';
import ChartFactoryContainerBase from '../../../classes/ChartFactoryContainer';

class ChartFactoryContainer extends ChartFactoryContainerBase {
	constructor(resources) {
		super();
		this.useResources(resources);
		// console.log('SensorChartsListFactory', resources, this)
	}
}

export const executeChartFactoryContainer = settings => {
	// console.log('executeChartFactoryContainer', name, settings)
	return new ChartFactoryContainer(settings);
};
