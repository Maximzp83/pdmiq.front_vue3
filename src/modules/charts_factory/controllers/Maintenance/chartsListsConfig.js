import { cloneDeep } from '@/helpers';

const chartsListsConfig1 = {
	main: {
		chart_id: `main-statistics`,
		requestsList: [{ id: 'counters' }]
	}
};

const defaultSeriesConfig1 = {
	pointsData: {
		seriesConfigsList: {
			0: [{ id: 'main-serie', data_path: 'base', template: 'bar.base' }]
		}
	}
};

const RSSISeriesConfig1 = {
	pointsData: {
		commonOptions: { name: 'rssi' },
		seriesConfigsList: {
			0: [
				// { id: 'main-serie', data_path: 'base', template: 'bar.base'}
				{ id: 'base-serie', data_path: 'base', template: 'sensor.base' },
				{ id: 'warning-serie', data_path: 'warning', template: 'sensor.warning' },
				{ id: 'alarm-serie', data_path: 'alarm', template: 'sensor.alarm' }
			]
		}
	}
};

export const chartsListsConfig = key => cloneDeep(chartsListsConfig1[key]);
export const defaultSeriesConfig = () => cloneDeep(defaultSeriesConfig1);
export const RSSISeriesConfig = () => cloneDeep(RSSISeriesConfig1);
