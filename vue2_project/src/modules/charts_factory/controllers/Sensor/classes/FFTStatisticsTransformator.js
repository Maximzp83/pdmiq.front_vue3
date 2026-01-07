import StatisticsTransformatorBase from '../../../classes/StatisticsTransformator';

// import { getMaxValue } from '@/helpers';
import { getUnitType /*setupFFTCursorsList*/ } from '../methods';
import { METRIC_SYSTEM_TYPES, UNIT_TYPES, SENSOR_PARAMETERS_TYPES } from '../enums';
const {X_AXIS_ACCELERATION, Y_AXIS_ACCELERATION, Z_AXIS_ACCELERATION} = SENSOR_PARAMETERS_TYPES;
class StatisticsTransformator extends StatisticsTransformatorBase {
	constructor({ specification, resources, events, chart_id }) {
		super();

		const { payload_1, sensorType, filters, chart_config } = resources;
		this.sensorType = sensorType;
		this.sensorItem = payload_1.sensorItem;
		this.filters = filters;
		this.specification = specification || {};
		this.chart_id = chart_id;
		this.parameterItem = payload_1.parameterItem;
		this.currentSensorType = payload_1.currentSensorType;
		this.isRequestTypeEnvelope = payload_1.isRequestTypeEnvelope;
		this.requestsList = chart_config.requestsList;

		this.resultData = {
			statistics_result: {}
		};

		// -------------- 4 level payload ----------
		this.resources = resources;
		this.events = events;
	}

	setupUnitTypeName(payload) {
		return getUnitType(payload);
	}

	transformAction(statistics_data, settings = {}) {
		const { specification, currentResultData } = settings;
		let resultData = currentResultData;

		Object.keys(statistics_data).forEach((statisticsKey, keyIdx) => {
			// console.log('transformAction', keyIdx)
			// for (const statisticsKey in statistics_data) {
			let { points } = statistics_data[statisticsKey];
			let statistics_result = /*resultData.statistics_result[statisticsKey] ||*/ {
				stat_max_value: undefined,
				all_data_max_value: undefined,
				chart_first_statistics_item: undefined,
				statisticsKey,
				chart_id: this.chart_id
			};

			try {
				// --------------------
				if (specification.setupPointsData) {
					const { is3D } = specification;
					const { measurement } = this.filters;
					const { /*isBannerTempVibe2,*/ isRequestTypeEnvelope } = this.currentSensorType;
					const { parameterItem } = this;
					if (points.length) {
						points = points.slice(1);
					}

					let max_value = -999999999999;
					let min_value = 999999999999;
					statistics_result.pointsData = {};

					const unitTypeItem = this.setupUnitTypeName({
						parameterItem: parameterItem,
						measurement,
						returnItem: true
					});

					let formula_x = x => x;
					let formula_y = y => y;

					if (
						measurement === METRIC_SYSTEM_TYPES.IMPERIAL &&
						parameterItem.type != 'waveform'
					) {
						formula_x = x => x * 60;
					}

					if (unitTypeItem.id === UNIT_TYPES.INCHES_SEC) {
						formula_y = y => y / 25.4;
					}

					const skipMaxForFirstPoint = isRequestTypeEnvelope && 
						( parameterItem.id == X_AXIS_ACCELERATION ||
							parameterItem.id == Y_AXIS_ACCELERATION ||
							parameterItem.id == Z_AXIS_ACCELERATION
						)

					const skipMaxForPointsXaxisBelow = {
						[METRIC_SYSTEM_TYPES.METRIC]: 6,
						[METRIC_SYSTEM_TYPES.IMPERIAL]: 360 
					};

					statistics_result.pointsData.base = [];

					points.forEach((di, idx) => {
						const y = formula_y(+di.y);
						const x = formula_x(+di.x);
						
						const point = [x, y];
						if (is3D) {
							point.push(keyIdx + 1);
						}

						if (/*isBannerTempVibe2 &&*/ parameterItem.type != 'waveform') {
							if (di.x > 1) {
								if (y > max_value && (idx != 0 || !skipMaxForFirstPoint)) {
									// console.log(x, skipMaxForPointsXaxisBelow[metric])
									if (x > skipMaxForPointsXaxisBelow[measurement]) {
										max_value = y;
									}
								}
								if (y < min_value) min_value = y;
								statistics_result.pointsData.base.push(point);
							}
						} else {
							if (y > max_value && (idx != 0 || !skipMaxForFirstPoint)) max_value = y;
							if (y < min_value) min_value = y;
							statistics_result.pointsData.base.push(point);
						}
						
					});

					if (is3D) {
						// statistics_result.pointsData.base = statistics_result.pointsData.base.slice(0,6);
					}

					// const { method } = specification.setupPointsData;
					// const executiveMethod = pointsDataMethodSelector(setupPointsData.method);

					/*statistics_result.pointsData = this.pointsDataMethodSelector(
						method,
						{
							...specification.setupPointsData,
							points,
							// transformatorData: statistics_result,
							// resources: this.resources,
							filters: this.filters || {},
						}
					)*/

					statistics_result.stat_max_value = max_value;
					statistics_result.stat_min_value = min_value;

					statistics_result.stat_x_max_value = statistics_result.pointsData.base
						.length
						? statistics_result.pointsData.base[
								statistics_result.pointsData.base.length - 1
						  ][0]
						: 0;
				}

				/*if (specification.setupFlagsData) {
					if (specification.setupFlagsData.setupCursorsData) {
						cons
						let { cursors_list } = statistics_data[statisticsKey];

						statistics_result.flagsData = {
							cursors_list: setupFFTCursorsList(cursors_list)
						};
					}
				}*/

				// -------------Max Values--------
				resultData = this.updateDataMaxValues(resultData, statistics_result);

				resultData.chart_first_statistics_item = this.findFirstStatisticsItem(
					statistics_result
				);

				resultData.statistics_result[statisticsKey] = statistics_result;
			} catch (e) {
				console.warn(e);
			}
		});
		return resultData;
	}
}

export const executeTransformator = (name, settings) => {
	switch (name) {
		case 'FFTStatistics':
			return new StatisticsTransformator(settings);
		default:
			return null;
	}
};

// export const executeFFTStatisticsTransformator = settings =>
// new FFTStatisticsTransformator(settings);
