import StatisticsTransformatorBase from '../../../classes/StatisticsTransformator';

import { updateTime, updateDateRange } from '@/helpers';
import { getEdgeStatisticsItems } from '../../Sensor/methods';
import { setupDownTimesData } from '../methods';
import { setupFlagsStatistics } from '../../../helpers';
// import { METRIC_SYSTEM_TYPES, UNIT_TYPES } from '@/constants/global';

// import { chartsListsConfig } from './chartsListsConfig';

class StatisticsTransformator extends StatisticsTransformatorBase {
	constructor({ specification, resources, events, chart_id }) {
		super();

		const { filters } = resources;
		const { breakSerieByDay, processData } = resources.payload_1;
		this.filters = filters;
		this.specification = specification || {};
		this.chart_id = chart_id;
		this.processData = processData;
		this.breakSerieByDay = breakSerieByDay;
		// this.requestsList = chart_config.requestsList;

		// const disablePlotlines = settings_payload.disablePlotlines || payload_1.disablePlotlines;

		this.resultData = {
			statistics_result: {}
		};

		// if (setupFlagsData) {}

		// -------------- 4 level payload ----------
		this.resources = resources;
		this.events = events;
	}

	getEdgeStatisticsItems(payload, filters, settings) {
		return getEdgeStatisticsItems(payload, filters, settings);
	}

	transformAction(statistics_data, settings = {}) {
		const { specification, currentResultData } = settings;
		/*if (settings.useCurrentResultData) {

		debugger
		}*/
		let resultData = currentResultData;
		// console.log(statistics_data, settings)
		let { counters, downtimes } = statistics_data;

		try {
			// --------------------
			let statistics_result = resultData.statistics_result['counters']
				? resultData.statistics_result['counters']
				: {
						stat_max_value: undefined,
						all_data_max_value: undefined,
						chart_first_statistics_item: undefined,
						chart_id: this.chart_id,
						plotlines_data: {
							max_ability_value: this.processData.max_capacity,
							real_ability_value: this.processData.real_capacity,
							production_hourly_rate: this.processData.production_hourly_rate
						}
				  };

			if (specification.getEdgeStatisticsItems) {
				statistics_result.edgeStatisticsItems = this.getEdgeStatisticsItems(
					counters,
					updateDateRange(this.filters, {
						start: `T${updateTime(this.processData.start_work_day, {
							h: -1
						})}.000000Z`,
						finish: `T${updateTime(this.processData.finish_work_day, {
							h: 1
						})}.000000Z`,
						concat: true
					}),
					{ val_prop: 'processed_count' }
				);
			}

			if (specification.setupPointsData) {
				const { method } = specification.setupPointsData;
				// console.log(statistics_result)
				statistics_result.pointsData = this.pointsDataMethodSelector(method, {
					...specification.setupPointsData,
					statistics: counters,
					filters: this.filters || {},
					edgeStatisticsItems: statistics_result.edgeStatisticsItems
				});

				statistics_result.stat_max_value = statistics_result.pointsData.max_value;
			}

			if (specification.setupFlagsData) {
				statistics_result.flagsData = {};
				const { enable_downtimes } = specification.setupFlagsData;

				if (enable_downtimes && downtimes.length) {
					statistics_result.flagsData.downtimes_statistics = setupFlagsStatistics({
						statisticsData: downtimes,
						options: {
							created_at_prop: 'start_time',
							data_props: [
								'fault_id',
								'machine_id',
								'cause_description',
								'id',
								'plant_id',
								'is_processed',
								'origin_type',
								'loss_count',
								'start_time',
								'finish_time'
							]
						},
						modifyByMethod: setupDownTimesData
					});
				}
			}

			// -------------Max Values--------
			resultData = this.updateDataMaxValues(resultData, statistics_result);

			// console.log(statistics_result, resultData)
			resultData.statistics_result['counters'] = statistics_result;

			return resultData;
		} catch (e) {
			console.warn(e);
		}
	}
}

export const executeTransformator = (name, settings) => {
	switch (name) {
		case 'OEEStatistics':
			return new StatisticsTransformator(settings);
		default:
			return null;
	}
};
