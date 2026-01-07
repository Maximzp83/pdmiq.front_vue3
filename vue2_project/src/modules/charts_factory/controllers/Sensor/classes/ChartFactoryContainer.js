// import ChartsListFactoryBase from '../../../classes/ChartsListFactory';
import ChartFactoryContainerBase from '../../../classes/ChartFactoryContainer';
import { get_sensor_parameter_item } from '../methods';
import { setupLabel } from '@/helpers';
import { DATASET } from '@/constants/global';

class ChartFactoryContainer extends ChartFactoryContainerBase {
	constructor(resources) {
		super();
		// console.log('ChartFactoryContainer', resources)
		this.useResources(resources);
	}
}


class MultiViewChartFactoryContainer extends ChartFactoryContainerBase {
	constructor(resources) {
		super();
		this.useResources(resources);
	}

	setupChartConfig(settings = {}) {
		try {
			const { graph_items } = settings;
			const { graphItemData } = this.resources.payload_1;

			let chart_config = {
				chart_id: `multi_view_chart-${graphItemData.id}`,
				requestsList: graph_items.map(gi => {
				// console.log('gi', gi)
					const parameterItem = get_sensor_parameter_item({
						sensor: gi.sensor,
						parameter_id: gi.metric_type,
						graph_item: gi
					})

					let sensor_name = '';
					const {data_set, device_address_id, controller, fft_sensor_id} = gi.sensor;
					// console.log(gi.sensor)
					if (data_set === DATASET.BANNER_TEMP_VIBE_V2 || data_set === DATASET.BANNER_V2_GENERIC) {
						sensor_name = `${controller && controller.name || ''} D${device_address_id}, S${fft_sensor_id}`;
					} else {
						sensor_name = setupLabel(gi.sensor, {
							accessors: ['asset_numbers', 'data_set', 'controller.name', 'port_number'],
							useGetItemValue: [
								{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }
							],
							delimeter: ','
						});
					}

					return {
						...parameterItem,
						metric_item_id: gi.id,
						sensor_id: gi.sensor.id,
						sensor_name
					}
				})
			};

			// console.log('setupChartConfig', graph_items, chart_config)
			return chart_config;

		} catch (e) {
			console.warn(e);
		}
	}
}


export const executeChartFactoryContainer = (name, settings) => {
	// console.log('executeChartFactoryContainer', name, settings)
	switch (name) {
		case 'MultiViewChartFactoryContainer':
			return new MultiViewChartFactoryContainer(settings);

		default:
			return new ChartFactoryContainer(settings);
	}
};

/*export const executeChartFactoryContainer = settings => {
	// console.log('executeChartFactoryContainer', name, settings)
	return new ChartFactoryContainer(settings);
};*/
