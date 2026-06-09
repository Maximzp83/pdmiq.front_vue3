import StatisticsTransformatorBase from '../../../classes/StatisticsTransformator';

import {
	getEdgeStatisticsItems,
	setupPlotlinesData,
	setupZonesList,
	setupCrashesStatistics,
	setupGainAdjustmentsStatistics,
	setupLubeStatistics,
	setupLubeLockLogStatistics,
	setupNotesStatistics,
	setupFlagsFFTStatistics,
	setupRuntimeTrackersStatistics,
	setupFFTLockStatistics,
	setupFlatMetricDataAnomalyFlags
	// pointsDataMethodSelector
} from '../methods';

import { BANNER_FFT_STATUSES_TYPES } from '@/constants/global';
import { getObjectVal, mergeObjects } from '@/helpers';

// import { chartsListsConfig } from './chartsListsConfig';

class statisticsTransformator extends StatisticsTransformatorBase {
	constructor({ specification, resources, events, chart_id, seriesConfig }) {
		super();

		const {
			settings_payload,
			payload_1,
			chart_config,
			sensorType,
			filters,
			y_filters
		} = resources;
		this.sensorType = sensorType;
		this.sensorItem = payload_1.sensorItem;
		this.filters = { ...filters, ...y_filters };
		this.specification = specification || {};
		this.chart_id = chart_id;
		this.requestsList = chart_config.requestsList;
		this.seriesConfig = seriesConfig;
		// this.requestsList = chart_config.requestsList;

		// const disablePlotlines = settings_payload.disablePlotlines || payload_1.disablePlotlines;

		const { enableZones } = specification.setupPointsData;
		if (enableZones) {
			this.zonesKeysList = chart_config.zonesKeysList ||
				settings_payload.zonesKeysList || ['alarm', 'warning'];
		}

		// if (setupFlagsData) {}

		// -------------- 4 level payload ----------
		this.resources = resources;
		this.events = events;
	}

	getEdgeStatisticsItems(payload, filters, settings) {
		return getEdgeStatisticsItems(payload, filters, settings);
	}

	actualizeSpecificationFor({statisticsKey, configKey, baseSpecification}) {
		// Helper function to find and extract specification
		const findSpecification = (seriesConfigSource) => {
			// console.log(seriesConfigSource, configKey)
			if (!seriesConfigSource) return null;

			const seriesConfigsList = getObjectVal(seriesConfigSource, `${configKey}.seriesConfigsList`);

			if (!seriesConfigsList) return null;

			for (const configItems of Object.values(seriesConfigsList)) {
				const found = configItems.find(item => item.responseDataKey == statisticsKey);
				if (found?.transformator_settings?.specification) {
					return found.transformator_settings.specification;
				}
			}

			return null;
		};

		// Get specifications from different sources (ordered by priority)
		const chartConfigSpecification = findSpecification(this.resources.chart_config.seriesConfig);
		const seriesSpecification = findSpecification(this.seriesConfig);

		let result = baseSpecification;

		if (chartConfigSpecification) {
			result = result ? mergeObjects(result, chartConfigSpecification) : chartConfigSpecification;
		}

		if (seriesSpecification) {
			result = result ? mergeObjects(result, seriesSpecification) : seriesSpecification;
		}

		return result;
	}

	setupPlotlinesData(payload) {
		return setupPlotlinesData(payload);
	}

	setupCrashesStatistics(arg1, arg2) {
		return setupCrashesStatistics(arg1, arg2);
	}
	setupGainAdjustmentsStatistics(payload) {
		return setupGainAdjustmentsStatistics(payload);
	}
	setupLubeStatistics(payload) {
		return setupLubeStatistics(payload);
	}
	setupLubeLockLogStatistics(payload) {
		return setupLubeLockLogStatistics(payload);
	}

	setupNotesStatistics(payload) {
		return setupNotesStatistics(payload);
	}
	setupFlagsFFTStatistics(payload) {
		return setupFlagsFFTStatistics(payload);
	}
	setupRuntimeTrackersStatistics(payload) {
		return setupRuntimeTrackersStatistics(payload);
	}
	setupFlatMetricDataAnomalyFlags(payload) {
		return setupFlatMetricDataAnomalyFlags(payload);
	}

	transformAction(statistics_data, settings = {}) {
		const { specification, currentResultData } = settings;
		let resultData = currentResultData;
		for (const statisticsKey in statistics_data) {
			let {
				levelZone,
				statistics,
				// problems,
				history,
				lube,
				crashes,
				fft,
				fft_locks,
				notes,
				sensor,
				problems,
				gainAdjustments,
				runtimeTrackers,
				issue_alerts,
				flat_metric_data_anomalies,
				parameter_item
			} = statistics_data[statisticsKey];
			// console.log('parameter', statistics_data[statisticsKey])

			let statistics_result = resultData.statistics_result[statisticsKey] || {
				edgeStatisticsItems: {},
				levelZoneData: levelZone,
				levelZones: levelZone
					? sensor.levelZones.filter(
							lz => lz.parameter_type === levelZone.parameter_type
					  )
					: [],
				stat_max_value: undefined,
				all_data_max_value: undefined,
				chart_first_statistics_item: undefined,
				statisticsKey,
				chart_id: this.chart_id,
				parameter_item,
				statsData: {
					alarm_level: null,
					warning_level: null,
					average_metric_value: null,
				}
			};

			// statistics_result.levelZones = sensor ? sensor.levelZones : [];
			// console.log(statistics_result )

			try {				
				const actualSpecification = this.actualizeSpecificationFor({
					statisticsKey,
					configKey: 'pointsData',
					baseSpecification: specification
				});

				const { currentSensorType } = this.resources.payload_1;

				let enableOffAlarm = false;

				if (currentSensorType && (currentSensorType.isBannerCM1L || currentSensorType.isBanner)) {
					if (this.requestsList[0].type != 'temperature') {
						enableOffAlarm = true;
					}
				}

				if (statistics_result.levelZoneData && !enableOffAlarm) {
					statistics_result.levelZoneData.off_alarm_zone = undefined;
				}

				if (actualSpecification.getEdgeStatisticsItems) {
					statistics_result.edgeStatisticsItems = this.getEdgeStatisticsItems(
						statistics,
						this.filters,
						{
							// lube_statistics: newData.lube_statistics,
							controllerTimeZone: sensor && sensor.controller ? sensor.controller.time_zone : 0
						}
					);
				}
				// ---------------------
				if (actualSpecification.setupPlotlinesData) {
					// console.log('transform', actualSpecification.setupPlotlinesData)
					// let setupPlotlinesData =
					if (levelZone) {
						const {
							first_statistics_item,
							last_statistics_item
						} = statistics_result.edgeStatisticsItems;
						const {
							plotlinesSeriesData,
							historyData,
							historyMaxValues,
							historyMinValues,
							plotlinesMaxValues,
							statsData
						} = this.setupPlotlinesData({
							history,
							first_statistics_item: first_statistics_item || [],
							last_statistics_item: last_statistics_item || [],
							plotLinesSettings: actualSpecification.setupPlotlinesData,
							...levelZone
						});

						statistics_result.plotlinesSeriesData = plotlinesSeriesData;
						statistics_result.historyData = historyData;
						statistics_result.historyMinValues = historyMinValues;
						statistics_result.historyMaxValues = historyMaxValues;
						statistics_result.plotlinesMaxValues = plotlinesMaxValues;
						statistics_result.statsData = {...statistics_result.statsData, ...statsData};
					}
				}
				// --------------------
				if (actualSpecification.setupPointsData) {
					let zonesList;

					const { method, enableZones, skipMaxMinValues } = actualSpecification.setupPointsData;

					if (enableZones) {
						zonesList = setupZonesList({
							zonesKeysList: this.zonesKeysList,
							levelZone,
							historyData: statistics_result.historyData
						});
					}
					// const executiveMethod = pointsDataMethodSelector(setupPointsData.method);

					statistics_result.pointsData = this.pointsDataMethodSelector(method, {
						statistics,
						// transformatorData: statistics_result,
						// resources: this.resources,
						zonesList,
						filters: this.filters || {},
						edgeStatisticsItems: statistics_result.edgeStatisticsItems,
						plotLinesSettings: actualSpecification.setupPlotlinesData,
						generateSeriesByStatistics: actualSpecification.generateSeriesByStatistics,
						history: history,
						parameter_item,
						flat_metric_data_anomalies,
						...settings,
						...actualSpecification.setupPointsData,
					});
					/*console.log(parameter_item.id, {
						...settings,
						...actualSpecification.setupPointsData,						
					})*/


					// statistics_result.pointsData.statsData = statistics_result.pointsData.statsData || {};

					statistics_result.stat_max_value = skipMaxMinValues ? undefined : statistics_result.pointsData.max_value;
					statistics_result.stat_min_value = skipMaxMinValues ? undefined : statistics_result.pointsData.min_value;
					statistics_result.statsData = {
						...statistics_result.statsData,
						// ...statistics_result.pointsData.statsData
					}
					// console.log(parameter_item.id, parameter_item.name, skipMaxMinValues, statistics_result.pointsData.max_value)
				}
				// ---------------------
				if (actualSpecification.setupFlagsData) {
					statistics_result.flagsData = {};
					const {
						enable_lube,
						enable_notes,
						enable_crashes,
						enable_adjustments,
						enable_fft,
						enable_runtime_tracker,
						enable_issue_alerts
					} = actualSpecification.setupFlagsData;

					if (enable_crashes && crashes.length) {
						statistics_result.flagsData = {
							...this.setupCrashesStatistics(
								crashes,
								this.resources.sensorType == 'banner_humidity' ? 'Alarm' : undefined
							)
						};
					}

					if (enable_adjustments && gainAdjustments.length) {
						statistics_result.flagsData = {
							...statistics_result.flagsData,
							...this.setupGainAdjustmentsStatistics(gainAdjustments)
						};
					}
					if (enable_lube && lube.history.length) {
						const all_lube_statistics = this.setupLubeStatistics({
							lubeData: lube,
							pumpData: this.sensorItem.pump
						});

						// statistics_result.flagsData.lube_statistics_successfull = all_lube_statistics.filter(si => si.isSuccess)
						// statistics_result.flagsData.lube_statistics = all_lube_statistics.filter(si => !si.isSuccess)
						statistics_result.flagsData.lube_statistics = all_lube_statistics;
					}

					if (enable_lube && lube.lock_log.length) {
						statistics_result.flagsData.lube_lock_logs_statistics = this.setupLubeLockLogStatistics({	lubeData: lube });
					}

					if (enable_notes && notes.length) {
						statistics_result.flagsData.notes_statistics = this.setupNotesStatistics(
							notes
						);
					}

					if (enable_fft && fft.length) {
						// statistics_result.flagsData.ncd_fft_statistics = this.setupFlagsFFTStatistics(fft);
						statistics_result.flagsData.pending_fft_statistics = setupFlagsFFTStatistics(
							fft,
							[BANNER_FFT_STATUSES_TYPES.PENDING, BANNER_FFT_STATUSES_TYPES.APPROVED]
						);
						statistics_result.flagsData.failed_fft_statistics = setupFlagsFFTStatistics(
							fft,
							[BANNER_FFT_STATUSES_TYPES.FAILED]
						);
						statistics_result.flagsData.completed_fft_statistics = setupFlagsFFTStatistics(
							fft,
							[BANNER_FFT_STATUSES_TYPES.COMPLETED]
						);
					}

					if (enable_fft && fft_locks.length) {
						statistics_result.flagsData.fft_lock_statistics = setupFFTLockStatistics(
							fft_locks
						);
					}

					if (enable_runtime_tracker && runtimeTrackers && runtimeTrackers.length) {
						statistics_result.flagsData.runtime_trackers_statistics = this.setupRuntimeTrackersStatistics(
							runtimeTrackers
						);
					}

					if (enable_issue_alerts && (issue_alerts && issue_alerts.length)) {
						statistics_result.flagsData = {
							...this.setupCrashesStatistics(
								issue_alerts,
								this.resources.sensorType == 'banner_humidity' ? 'Alarm' : undefined
							)
						};
					}

					if (flat_metric_data_anomalies && flat_metric_data_anomalies.length) {
						statistics_result.flagsData.flat_metric_data_anomaly_statistics =
							this.setupFlatMetricDataAnomalyFlags(flat_metric_data_anomalies);
					}
				}
				// ---------------------
				if (actualSpecification.includeProblems) {
					if (problems) {
						statistics_result.problems = problems;
					}
				}

				// --------------------
				if (actualSpecification.setupAdditionalSeriesData) {
					statistics_result.additionalSeriesData = {};

					/*actualSpecification.setupAdditionalSeriesData.forEach(additionalSerieConfig => {
						const { method, data_path } = actualSpecification.setupPointsData;
						statistics_result.additionalSeriesData[data_path] = 
					})*/
				}
				// ---------------------

				// -------------Max Values--------
				resultData = this.updateDataMaxValues(resultData, statistics_result);
				// -------------------------

				statistics_result.chart_first_statistics_item = this.findFirstStatisticsItem(
					statistics_result
				);

				resultData.statistics_result[statisticsKey] = statistics_result;
				// this.resultData.requestsResponses.push({[statisticsKey]: resultData});
			} catch (e) {
				console.warn(e);
			}
		}
		
		Object.keys(resultData.statistics_result).forEach(key => {
			var { chart_first_statistics_item } = resultData.statistics_result[key];
			
			if (chart_first_statistics_item != null && chart_first_statistics_item.length) {
				if (!resultData.chart_first_statistics_item || chart_first_statistics_item[0] < resultData.chart_first_statistics_item[0]) {
					resultData.chart_first_statistics_item = chart_first_statistics_item;					
				}
			}
		})
		// console.log(`resultData-${this.chart_id}`, resultData.chart_first_statistics_item)
		return resultData;
	}
}

export const executeTransformator = (name, settings) => {
	switch (name) {
		case 'sensorStatistics':
			return new statisticsTransformator(settings);
		default:
			return null;
	}
};
