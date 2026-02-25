import { getObjectVal, cloneDeep, setObjectVal, getMaxValue } from '@/helpers';

// import { chartsListsConfig } from './chartsListsConfig';
import { pointsDataMethodSelector } from '../dispatchers/StatisticsTransformatorDispatcher';

export default class StatisticsTransformatorBase {
	constructor() {
		this.resultData = {
			// chart_id: this.chart_id,
			statistics_result: {}
		};
	}

	getStatisticsKeys() {
		return Object.keys(this.resultData.statistics_result);
	}

	setFilters(filters) {
		this.filters = { ...this.filters, ...filters };
	}

	setupDataAccessor(parameterId) {
		let data_accessor;
		
		const finalParameterId = parameterId || this.requestsList[0]?.id;
		if (finalParameterId) {
			data_accessor = `statistics_result.parameter_${finalParameterId}`;				
		} else {
			data_accessor = `statistics_result.${
				Object.keys(this.resultData.statistics_result)[0]
			}`;
		}
		return data_accessor;
	}

	updateResultData({ settingsList, additionalSettings }) {
		try {
			settingsList.forEach(si => {
				const {
					to_statistics_result,
					accessor,
					value,
					updateSeries,
					emitOptionsUpdate,
					parameterId,
					data_key
				} = si;

				let data_accessor = this.setupDataAccessor(parameterId);
				if (to_statistics_result) {
					Object.values(this.resultData.statistics_result).forEach(responseData => {
						// console.log('updateResultData', this.chart_id, responseData.chart_first_statistics_item)
						if (!responseData.chart_first_statistics_item) return;

						setObjectVal(responseData, accessor, value);
					});
				} else if (accessor) {
					// console.log(accessor, value)
					setObjectVal(this.resultData, accessor, value);
				}	else if (data_key) {
					data_accessor += `.${data_key}`;
					setObjectVal(this.resultData, data_accessor, value);
				}
				
				// console.log('updateResultData', this.resultData)
				updateSeries && this.events.handleUpdateSeries
					? this.events.handleUpdateSeries({
							settingsList: updateSeries,
							emitOptionsUpdate
					  })
					: null;
			});

			if (additionalSettings) {
				if (
					additionalSettings.updateAllSeries &&
					this.events.statisticsTransformUpdated
				) {
					this.events.statisticsTransformUpdated(
						this.resultData,
						additionalSettings
					);
				}

				if (additionalSettings.callback) {
					additionalSettings.callback(this.resultData);
				}
			}
		} catch (e) {
			console.warn(e);
		}
	}

	getTransformedStatistics(settings = {}) {
		// console.log(settings)
		const { accessor, data_key, statistics_result, parameterId } = settings;
		let data_accessor = this.setupDataAccessor(parameterId);
		
		/*const finalParameterId = parameterId || this.requestsList[0]?.id;
		if (finalParameterId) {
			data_accessor = `statistics_result.parameter_${finalParameterId}`;				
		} else {
			data_accessor = `statistics_result.${
				Object.keys(this.resultData.statistics_result)[0]
			}`;
		}*/

		if (accessor) {
			return getObjectVal(this.resultData, accessor);
		} else if (data_key) {
			data_accessor += `.${data_key}`;
			return getObjectVal(this.resultData, data_accessor);
		} else if (statistics_result) {
			return getObjectVal(this.resultData, data_accessor);
		} else {
			return cloneDeep(this.resultData);
		}
	}

	pointsDataMethodSelector(method, payload) {
		return pointsDataMethodSelector(method, payload);
	}

	findFirstStatisticsItem(statistics) {
		let first;
		const { edgeStatisticsItems, flagsData } = statistics;

		if (edgeStatisticsItems) {
			first = edgeStatisticsItems.first_statistics_item;

			if (first && flagsData) {
				Object.values(flagsData).forEach(flagStat => {
					flagStat.forEach(flagItem => {
						if (flagItem.x < first[0]) {
							first = [flagItem.x, 0];
						}
					});
				});
			}
		}
		return first;
	}

	updateDataMaxValues(resultData, statistics_result) {
		/*console.log('updateDataMaxValues', this.chart_id, statistics_result)
		if (this.chart_id === 'chart-25') {
			// debugger
		}*/
		const stat_max_values = [statistics_result.stat_max_value].concat(
			statistics_result.plotlinesMaxValues || []
		);
		statistics_result.points_and_plotlines_max_value = getMaxValue(stat_max_values);

		if (
			resultData.chart_points_max_value === undefined ||
			statistics_result.points_and_plotlines_max_value > resultData.chart_points_max_value
		) {
			resultData.chart_points_max_value = statistics_result.points_and_plotlines_max_value;
		}

		if (resultData.chart_points_min_value === undefined) {
			resultData.chart_points_min_value = statistics_result.stat_min_value;
		}

		const max_values = [statistics_result.stat_max_value].concat(
			statistics_result.historyMaxValues || [],
			statistics_result.plotlinesMaxValues || []
		);
		const min_values = [statistics_result.stat_min_value].concat(
			statistics_result.historyMinValues || []
		);

		statistics_result.all_data_max_value = getMaxValue(max_values);
		statistics_result.all_data_min_value = getMaxValue(min_values, {
			returnMinMax: 1
		}).min;

		if (
			resultData.chart_all_data_max_value === undefined ||
			statistics_result.all_data_max_value > resultData.chart_all_data_max_value
		) {
			resultData.chart_all_data_max_value = statistics_result.all_data_max_value;
		}

		if (
			resultData.chart_all_data_min_value === undefined ||
			statistics_result.all_data_min_value < resultData.chart_all_data_min_value
		) {
			resultData.chart_all_data_min_value = statistics_result.all_data_min_value;
		}

		if (
			resultData.chart_x_max_value === undefined ||
			statistics_result.stat_x_max_value > resultData.chart_x_max_value
		) {
			resultData.chart_x_max_value = statistics_result.stat_x_max_value;
		}
		/*if (this.requestsList[0].id === 2) {
			console.log(resultData.chart_all_data_max_value, statistics_result.all_data_min_value)			
		}*/
		return resultData;
	}

	reCalculateDataMaxValues(statistics_data, settings = {}) {
		this.resultData.chart_points_max_value = undefined;
		this.resultData.chart_points_min_value = undefined;
		this.resultData.chart_all_data_max_value = undefined;
		this.resultData.chart_all_data_min_value = undefined;
		this.resultData.chart_x_max_value = undefined;

		Object.keys(statistics_data).forEach((statisticsKey, keyIdx) => {
			let statistics_result = this.resultData.statistics_result[statisticsKey] || {};
			// console.log(keyIdx, statisticsKey, statistics_result)
			if (settings.resultsQuantity) {
				if (keyIdx < settings.resultsQuantity) {
					this.resultData = this.updateDataMaxValues(
						this.resultData,
						statistics_result
					);
				}
			} else {
				this.resultData = this.updateDataMaxValues(
					this.resultData,
					statistics_result
				);
			}
		});

		// console.log(this.resultData)
		if (settings.triggerStatisticsTransformUpdated) {
			if (this.events.statisticsTransformUpdated) {
				this.events.statisticsTransformUpdated(this.resultData);
			}
		}
	}

	getStatisticsArrayFromStatiticsData(statistics_data) {
		let result = [];
		for (const statisticsKey in statistics_data) {
			result.push( statistics_data[statisticsKey].statistics );
		}
		return result;
	}

	transform(statistics_data, settings = {}) {
		settings.specification = settings.specification || this.specification;

		if (settings.useCurrentResultData) {
			settings.currentResultData = cloneDeep(this.resultData);
		} else {
			settings.currentResultData = {
				chart_id: this.chart_id,
				statistics_result: {}
			};
		}
		// console.time('transform')
		/*this.resultData = {
			chart_id: this.chart_id,
			statistics_result: {}
		};*/
		// console.log('call transformAction', statistics_data)

		this.resultData = this.transformAction(statistics_data, settings);

		// console.timeEnd('transform')
		if (settings.updateSeries && this.events.handleUpdateSeries) {
				// console.log('transform', this.resultData)
			
			this.events.handleUpdateSeries({
				settingsList: settings.updateSeries,
				resultData: this.resultData,
				emitOptionsUpdate: true
			});
		} else if (this.events.statisticsTransformReady) {
			this.events.statisticsTransformReady(this.resultData, settings);
		}
	}
}

// export const SensorStatisticsTransformator = settings => new SensorStatisticsTransformator1(settings);
