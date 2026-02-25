import { cloneDeep } from '@/helpers';

const chartsListsConfig1 = {
	oee_proccess: {
		chart_id: `chart-oee-process`,
		YAxisList: [
			{
				title: { text: 'Count' }
			},
			{
				title: { text: 'Total workday count' },
				opposite: true
			}
		],
		requestsList: [{ id: 'counters' }]
	}
};

const defaultSeriesConfig1 = {
	pointsData: {
		seriesConfigsList: {
			0: [
				{
					id: 'transparent-serie',
					data_path: 'transparent',
					customSettings: {
						responseDataKey: 'counters',						
					},
					template: 'edgeTransparent'
				},
				{
					id: 'counters-serie',
					type: 'counters-serie',
					data_path: 'base',
					customSettings: {
						responseDataKey: 'counters',						
					},
					template: 'oee.counters'
				},
				{
					id: 'totalWorkdayCount-serie',
					type: 'totalWorkdayCount-serie',
					data_path: 'base',
					template: 'oee.totalWorkday',
					customSettings: {
						responseDataKey: 'counters',						
					},
					axis_index: 1
				}
			]
		}
	},

	flagsData: {
		seriesConfigsList: {
			0: [
				{
					id: 'downtime-flag-serie',
					data_path: 'downtimes_statistics',
					template: 'oee.downtime_flag',
					customSettings: {
						responseDataKey: 'counters',						
					},
					event_key: 'downtimeClickEvent'
				}
			]
		}
	},

	plotlinesData: {
		plotlinesConfigsList: {
			0: [
				{
					id: 'max_ability-plotline',
					data_path: 'max_ability_value',
					template: 'oee.plotline_ability',
					customSettings: {
						responseDataKey: 'counters',						
					},
					axis_index: 1
				},
				{
					id: 'real_ability-plotline',
					data_path: 'real_ability_value',
					template: 'oee.plotline_real_ability',
					customSettings: {
						responseDataKey: 'counters',						
					},
					axis_index: 1
				},
				{
					id: 'production_hourly_rate-plotline',
					data_path: 'production_hourly_rate',
					template: 'oee.plotline_production_hourly_rate',
					customSettings: {
						responseDataKey: 'counters',						
					},
					axis_index: 0
				}
			]
		}
	}
};

export const chartsListsConfig = key => cloneDeep(chartsListsConfig1[key]);
export const defaultSeriesConfig = () => cloneDeep(defaultSeriesConfig1);
