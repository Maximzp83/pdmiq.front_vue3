import ChartBase from '../../../classes/Chart';

import Notification from 'element-ui/lib/notification';
import MessageBox from 'element-ui/lib/message-box';

import {
	fetch_sensor_statistics,
	calculate_thresholds_our,
	save_sensor_level_zones,
	fetch_period_stats_data,
	fetch_multi_views_alerts
} from '../api/index.js';
import {
	mergeObjects,
	setObjectVal,
	cloneDeep,
	getObjectVal,
	findItemBy,
	getRoundedValue,
	updateFormData,
	countDecimalOrder,
	removeDuplicatesObjectsArray
} from '@/helpers';

// import { ncdAxisList } from '@/constants/global';
import { Lang } from '@/localization';

import {
	prepareFilters,
	selectPointsByChartSelection,
	yAxisTickPositioner
} from '../../../helpers';
import {
	getUnitType,
	preparePayloadForCalculateThresholdsBySelectedPoints,
	// setupDraggablePlotLine,
	getZoneValue,
	setupParameterName,
	setupAnnotations,
	setupAnnotationSelectionData,
	collect_specific_points
} from '../methods';
import { METRIC_SYSTEM_TYPES } from '../enums';
import { colorsList } from '../../../enums';

import { setupYAxisPlotlines } from '../../../helpers/series_generator';
// import { setupStatisticsTransformator } from '../StatisticsTransformatorDispatcher';
import {
	defaultSeriesConfig,
	splineSeriesConfigSettings,
	getRequestList
} from '../chartsListsConfig';
import { createDraggablePlotline } from './DraggablePlotline';

class SensorChartBase extends ChartBase {
	constructor() {
		super();
		this.generateSeriesByStatistics = false;

		// -------------- 3 level payload ----------
		// console.log('constructor', resources)
		// resources.payload_3 = {
		let options = {
			chart: { type: 'column' /*animation: false*/ },
			/*xAxis: {
				type: 'datetime',
				ordinal: false,
				minRange: 60000,
				plotBands: []
			},*/
			xAxis: [
				{
					type: 'datetime',
					ordinal: false,
					minRange: 60000,
					plotBands: []
				},
				{
					type: 'datetime',
					opposite: true,
					linkedTo: 0,
					visible: false
				}
			],
			yAxis: [],
			plotOptions: {
			  column: {
			    // pointPlacement: 'on'
			    grouping: false,
			    maxPointWidth: 10,
			    // pointPadding: 0.1,
			    // groupPadding: 0.2,
			  }
			}
		};
		// }

		// console.log(this.seriesConfig)
		this.transformator_settings = {
			...this.transformator_settings,
			events: {
				...this.transformator_settings.events,
				handleUpdateSeries: e => this.handleUpdateSeries(e)
			},
			name: 'sensorStatistics',
			specification: {
				getEdgeStatisticsItems: true,
				setupFlagsData: {
					enable_notes: true,
					enable_crashes: true
				},
				setupPointsData: { method: 'standard_datetime', enableZones: true }
			}
		};

		// ------------------------------
		// console.log('1', options)
		this.injectProps('options', options);
		// this.injectProps('settings', keyValue.inject_settings);
	}

	initialSetup(resources) {
		const { chart_config, filters } = resources;
		const { sensorType, sensorItem, currentSensorType } = resources.payload_1;
		const { chart_id } = resources.chart_config;
		const chart_id_splitted = chart_id.split('-');
		this.chart_parameter_id =
			chart_id_splitted.length > 1
				? +chart_id_splitted[chart_id_splitted.length - 1]
				: null;

		this.sensorItem = sensorItem;
		this.sensorType = sensorType;
		this.currentSensorType = currentSensorType;
		this.chartDataReadySettings = resources.settings_payload.chartDataReadySettings;
		this.measurement = filters.measurement;
		this.lastInitialRedrawComplete;

		// ----------- yAxis custom min values ----------------
		if (sensorType == 'ultrasound') {
			const { isUltrasoundDB, isUltrasoundFullSpectrum } = currentSensorType;
			if (!isUltrasoundDB) {
				chart_config.yAxisOptions = { min: isUltrasoundFullSpectrum ? 19 : 32 };
			}
		}

		if (sensorType == 'banner_sdt_decibell') {
			this.transformator_settings.specification.setupFlagsData.enable_adjustments = true;

			const { isSDTsensorDB420, isSDTsensorDBFullSpectrun } = currentSensorType;

			if (isSDTsensorDB420) {
				chart_config.yAxisOptions = { min: 34 };
			} else if (isSDTsensorDBFullSpectrun) {
				chart_config.yAxisOptions = { min: 19 };
			} else {
				chart_config.yAxisOptions = { min: 36 };
			}
		}

		if (sensorType == 'ncd_ultrasound') {
			this.transformator_settings.specification.setupFlagsData.enable_adjustments = true;
			chart_config.yAxisOptions = { min: 19 };
		}

		if (
			sensorType == 'ultrasound_lube_sdt_c' ||
			sensorType == 'ultrasound_lube_sdt_f'
		) {
			chart_config.yAxisOptions = { min: 0 };
		}

		resources.y_filters = resources.y_filters || {};
		// console.log('1', resources.y_filters, chart_id, resources.y_filters[chart_id])
		resources.y_filters = resources.y_filters[chart_id]
			? { ...resources.y_filters[chart_id] }
			: {};

		if (currentSensorType.isNCDCustom_4_20 && sensorItem.is_linespeed_node) {
			resources.y_filters.y_min = sensorItem.value_4ma;
		}
	}

	handleChartInitiatedEvent({ target }) {
		this.ChartAPI = target;
		setTimeout(() => {
			this.lastInitialRedrawComplete = true;
			this.ChartAPI.redraw(false);
		}, 100);
	}

	setupChartTitle(resources) {
		// console.log('setupChartTitle')
		// const { settings_payload } = resources.settings_payload;
		try {
			let { chart_title_prefix, chart_title_postfix, chart_title_postfix_by_metric } = resources.chart_config;
			const { requestsList, sensorItem } = this;
			let result = '';

			if (this.currentSensorType.isNCDCustom_4_20) {
				return sensorItem.chart_name || `${Lang.tt('no')} ${Lang.tt('name')}`;
			}

			if (chart_title_postfix_by_metric) {
				chart_title_postfix = chart_title_postfix_by_metric[resources.filters.measurement];
				// console.log('setupChartTitle', chart_title_postfix_by_metric, resources.filters.metric, chart_title_postfix)
			}


			if (requestsList && requestsList.length) {
				if (chart_title_prefix) result += chart_title_prefix;
				let pairs = [];

				requestsList.forEach(pi => {
					if (pi.pair_name) {
						pairs.push(pi.pair_name);
					}

					if (pi.suffix_name) result += `${pi.suffix_name},`;
				});

				result = result.slice(0, -1);

				if (!result) {
					if (pairs.length > 1) {
						result += ` ${pairs[0]},`;
					} else {
						const {
							isNCDTempVibe,
							isNCDWiredTempVibe,
							isNCDTempVibeCurr
						} = this.currentSensorType;

						const isNCDSensor =
							isNCDTempVibe || isNCDWiredTempVibe || isNCDTempVibeCurr;
						const key = isNCDSensor ? 'type_key' : 'banner_type_key';

						requestsList.forEach(pi => {
							if (!pi.skipTitle) {
								result +=	setupParameterName({
									parameterItem: pi,
									ncd_active_axial_axis: sensorItem.ncd_active_axial_axis,
									key,
									measurement: resources.filters.measurement
								}) + ',';
							}
						});
					}

					result = result.slice(0, -1);
				}

				if (chart_title_postfix) result += chart_title_postfix;
			}

			// console.log('setupChartTitle', chart_title_postfix, result)
			return result;
		} catch (e) {
			console.warn(e);
		}
	}

	setupUnitTypeName(payload) {
		// const { requestsList } = this;
		if (this.currentSensorType.isNCDCustom_4_20) {
			return (
				this.sensorItem.chart_unit_label ||
				`${Lang.tt('has')} ${Lang.tt('no')} ${Lang.tt('units')}`
			);
		} else {
			return getUnitType(payload);
		}
	}

	checkIsHasStatistics() {
		const isHasStatistics = Object.keys(this.fetched_statistics_data).some(key => {
			return this.fetched_statistics_data[key].statistics.length;
		});

		if (this.resources.payload_1.currentSensorType.isSDTsensorDB420) {
			return isHasStatistics || !this.sensorItem.is_inactive;
		}

		return isHasStatistics;
	}

	// --------- Y Axis -------------
	localSetupYAxis({ resources, requestsList }) {
		try {
			const { plotlinesData } = this.seriesConfig;

			if (resources.payload_1.editThresholdsByStagesEnabled) {
				if (
					plotlinesData &&
					plotlinesData.plotlinesConfigsList[0]
				) {
					plotlinesData.plotlinesConfigsList[0].forEach(pi => {
						if (pi.id === 'warning-plotline') {
							pi.customSettings.data_accessor_max = null;
							// console.log('p;otline config', pi.customSettings)
						}
					});
				}
			}
			// -----------------
			const YAxisList = resources.chart_config.YAxisList || [requestsList[0]];
			const yAxisOptions = resources.chart_config.yAxisOptions || {};
			// const { customYAxisTickPositioner } = resources.chart_config;
			// console.log('localSetupYAxis', requestsList[0])
			const units = requestsList[0] && requestsList[0].units;
			let unit_type_name = units || this.setupUnitTypeName({
				parameterItem: requestsList[0],
				measurement: this.measurement
			});

			this.options.yAxis = [];
			YAxisList.forEach((axisSettings = {}) => {
				let axis = {
					max: -9999999,
					min: 0,
					softMax: 1,
					title: {
						// useHTML: true,
						text: unit_type_name || ''
					},
					startOnTick: true,
					opposite: false,
					/*tickPositioner:
						customYAxisTickPositioner !== undefined
							? customYAxisTickPositioner
							: yAxisTickPositioner,*/
					// alignTicks: false,
					...yAxisOptions,
					// ...injectOptions
				};
				// console.log('axisSettings', axisSettings)
				if (axisSettings.injectOptions) {
					axis = mergeObjects(axis, axisSettings.injectOptions);
				}

				if (
					!axisSettings.skipPlotlines &&
					plotlinesData &&
					plotlinesData.plotlinesConfigsList &&
					plotlinesData.plotlinesConfigsList[0]
				) {
					axis.plotLines = setupYAxisPlotlines({
						plotlinesConfigsList: plotlinesData.plotlinesConfigsList[0]
					});
				}

				if (!axisSettings.skipPlotlines) {
					axis.plotLines = axis.plotLines || [];
					axis.plotLines.push({
						color: 'rgb(230, 230, 230)',
						width: 2,
						value: 0,
						// zIndex:0,
						// customSettings: {}
					});
				}

				if (this.localSetupYAxisHook) axis = this.localSetupYAxisHook(axis);

				this.options.yAxis.push(axis);
			});
		} catch (e) {
			console.warn(e);
		}
	}

	assignDataToYAxis(resultData, additionalProps = {}) {
		// console.log('assignDataToYAxis',resultData, resultData.chart_all_data_max_value)
		try {
			const {
				chart_all_data_max_value,
				chart_all_data_min_value,
				chart_points_max_value /*chart_points_min_value*/
			} = resultData;
			const {
				withoutReserveForMax,
				withoutReserveForMin,
				yAxisOptions
			} = this.resources.chart_config;
			const { yAxisMax, yAxisSoftMax } = this.resources.payload_1;
			let yAxis = cloneDeep(this.options.yAxis[0]);
			// console.log('localSetupYAxis')
			if (yAxisMax) {
				yAxis.max = yAxisMax;
				// yAxis.startOnTick = false;
				yAxis.endOnTick = false;
			} else {
				yAxis.max = withoutReserveForMax
					? chart_all_data_max_value
					: chart_all_data_max_value + chart_all_data_max_value / 9;
			}

			if (yAxisSoftMax) {
				yAxis.softMax = yAxisSoftMax;
			} else {
				yAxis.softMax = withoutReserveForMax
				? chart_points_max_value
				: chart_points_max_value + chart_points_max_value / 9;
			}
			
			// yAxis.title.text = this.unit_type_name || '-';
			// console.log('assignDataToYAxis', yAxis)

			yAxis.max = yAxis.max || 0.1;

			if (!yAxisOptions || !yAxisOptions.min) {
				yAxis.min =
					chart_all_data_min_value < 0
						? // ? chart_all_data_min_value + chart_all_data_min_value / 3
						  -chart_all_data_max_value
						: 0;

				yAxis.softMin = withoutReserveForMin
					? chart_all_data_min_value
					: chart_all_data_min_value + chart_all_data_min_value / 3;
				// yAxis.softMin = undefined
			}

			// console.log('assignDataToYAxis', yAxis, 	additionalProps)
			this.options.yAxis[0] = { ...yAxis, ...additionalProps };
			if (this.isPlotLinesReady !== undefined) {
				this.isPlotLinesReady = false;
				this.isDraggablePlotLinesReady = false;
			}

			if (this.localAssignDataToYAxisCallback) this.localAssignDataToYAxisCallback();
		} catch (e) {
			console.warn(e);``
		}
	}

	// --------- Series -------------
	isUpdateSeries(resources) {
		return this.measurement !== resources.filters.measurement;
	}

	getSeriesConfig(payload) {
		// console.log(payload)
		return defaultSeriesConfig(payload);
	}
	
	// seriesConfig - step 3
	modifySeriesConfig({ requestsList, resources, seriesConfig }) {
		const { filters, chart_config } = resources;
		const units = requestsList[0] && requestsList[0].units;

		this.measurement = filters.measurement;
		const { ncd_active_axial_axis } = this.sensorItem;
			// console.log('requestsList', requestsList)
		requestsList.forEach((parameterItem, idx) => {
			const unit_type_name = units || this.setupUnitTypeName({
				parameterItem,
				measurement: this.measurement
			});
			seriesConfig.pointsData.seriesConfigsList[
				idx
			] = seriesConfig.pointsData.seriesConfigsList[idx].map(item => {
				if (item.id == 'transparent-serie') return item;
				// console.log(parameterItem, setupParameterName(parameterItem, ncd_active_axial_axis))

				let prefix;
				if (this.currentSensorType.isNCDCustom_4_20) {
					prefix = '';
				} else {
					const {
						isNCDTempVibe,
						isNCDWiredTempVibe,
						isNCDTempVibeCurr
					} = this.currentSensorType;
					const isNCDSensor =
						isNCDTempVibe || isNCDWiredTempVibe || isNCDTempVibeCurr;
					const key = isNCDSensor ? 'type_key' : 'banner_type_key';
					prefix = setupParameterName({
						parameterItem,
						ncd_active_axial_axis,
						key,
						measurement: this.measurement
					})
						// parameterItem, ncd_active_axial_axis, key);

					// prefix = setupParameterName(parameterItem, ncd_active_axial_axis);
				}

				return mergeObjects(item, {
					inject: {
						name: prefix,
						tooltip: { valueSuffix: ` ${unit_type_name}` }
					}
				});
			});
		});

		if (resources.payload_1.oneChartOnly) {
			seriesConfig.flagsData.seriesConfigsList[0] = seriesConfig.flagsData.seriesConfigsList[0].map(
				ci => {
					if (ci.id == 'lube-flag-serie') {
						ci.inject = ci.inject ? { ...ci.inject } : { y: -120 };
					}
					return ci;
				}
			);
		}

		if (chart_config.seriesConfigSettings) {
			// console.log(chart_config.seriesConfigSettings)
			for (const configKey in chart_config.seriesConfigSettings) {
				const settings = chart_config.seriesConfigSettings[configKey];

				settings.forEach(setting => {
					const { path, value, idx } = setting;
					let changeableVal = getObjectVal(seriesConfig, path);

					if (changeableVal) {
						switch (configKey) {
							case 'add':
								if (changeableVal instanceof Array) changeableVal.push(value);
								break;
							case 'inject':
								changeableVal = mergeObjects(changeableVal, value);
								break;
							case 'replace':
								changeableVal = value;
								break;
							case 'remove':
								if (changeableVal instanceof Array) {
									if (idx) {
										idx.forEach(i => (changeableVal[i] = null));
										changeableVal = changeableVal.filter(v => v !== null);
									}
								}
								break;
						}
						setObjectVal(seriesConfig, path, changeableVal);
					}
				});
			}
		}

		// ----------------------
		if (this.transformator_settings.name) {
			// console.log('transformator_settings', this.transformator_settings)
			/*const inject_specification = this.updateTransformatorSpecificationFor(statisticsKey, 'pointsData');
			
			const actualSpecification = inject_specification ? 
				mergeObjects(specification, inject_specification) :
				specification;*/

		}
		// ----------------------

		if (this.localModifySeriesConfig) {
			seriesConfig = this.localModifySeriesConfig({
				requestsList,
				resources,
				seriesConfig
			});
		}

		// console.log('modifySeriesConfig', seriesConfig)

		return mergeObjects(seriesConfig, this.setupAdditionalOptionsForSeries());
	}

	setupAdditionalOptionsForSeries() {
		return {};
	}
	// -----------------

	fetchChartDataAction(settings = {}) {
		try {
			const sensorId = this.sensorItem.id;

			if (this.generateSeriesByStatistics) {
				this.mainSeriesReady = false;
			}

			let headers;
			
			if (this.resources.payload_1.timezone_offset) {
				headers = {
					'X-Timezone-Offset': this.resources.payload_1.timezone_offset
				}
			}

			this.requestsList.forEach(ri => {
				let alreadyInUse;
				if (ri.checkForDuplicates) {
					alreadyInUse = this.events.checkRequestForDuplicates(ri);
				} 
				
				// console.log('fetchChartDataAction', ri)
				if (alreadyInUse) {
					ri.waitingForDuplicateResponse = true;
					// setTimeout(() => { this.checkStatisticsResponses(); }, 30);
				} else {
					if (ri.checkForDuplicates) ri.alreadyInUse = true;
					 
					const params = {
						parameter: ri.id,
						...prepareFilters(this.resources.filters, {
							...settings /*convertToUTC: true*/
						})
					};

					fetch_sensor_statistics({ sensorId, params, headers })
						.then(response => {
							// console.log('2 response', response)
							try {
								this.fetched_statistics_data[`parameter_${ri.id}`] = {
									parameter_item: ri,
									...response
								};

								if (ri.checkForDuplicates) {
									this.events.duplicateRequestResponse({
										requestItem: ri,
										response
									});
								}

								setTimeout(() => {
									if (ri.checkForDuplicates) ri.alreadyInUse = false;
									this.checkStatisticsResponses();
								}, 30);
							} catch (e) {
								console.warn(e);
							}
						})
						.catch(e => {
							// console.log('catch')
							setTimeout(() => {
								this.checkStatisticsResponses(e);
							}, 30);
						});					
				}

			});
		} catch (e) {
			console.warn(e);
		}
	}

	resolveDuplicateResponse({request, response}) {
		try {
			// console.log('resolveDuplicateResponse', request, response)
			request.waitingForDuplicateResponse = false;
			this.fetched_statistics_data[`parameter_${request.id}`] = {
				parameter_item: request,
				...response
			};

			setTimeout(() => {
				this.checkStatisticsResponses();
			}, 30);
		} catch (e) {
			console.warn(e);
		}
	}

	//-------------------------
	/*updateTransformatorSpecificationFor(statisticsKey, configKey) {
		let findedItems = [];

		if (this.resources.chart_config.seriesConfig) {
			const seriesConfigsList = getObjectVal(
				this.resources.chart_config.seriesConfig,
				`${configKey}.seriesConfigsList`
			);

			if (seriesConfigsList) {
				Object.values(seriesConfigsList).forEach(ci => {
					for (let i = 0; i < ci.length; i++) {
						if (ci[i].responseDataKey == statisticsKey) {
							findedItems.push(ci[i]);
							break;
						}
					}
				});
			}

			const result = findedItems.filter(fi => fi.transformator_settings);
				// console.log('findedItems', findedItems)
			return result.length ? result[0].transformator_settings.specification : null;
		}

		return null;
	}*/

	setupSkipDataPointsListForAllCharts({belowValue}) {
		this.preTransformSettings.skipDataPointsListForAllCharts = [];
		let statisticsArray = this.StatisticsTransformator.getStatisticsArrayFromStatiticsData(
			this.fetched_statistics_data
		);
		
		// console.log(statisticsArray)
		if (statisticsArray.some(param_stat => param_stat.length > 200000)) {
			statisticsArray.forEach(ai => {
				this.preTransformSettings.skipDataPointsListForAllCharts = this.preTransformSettings.skipDataPointsListForAllCharts.concat(
					collect_specific_points({
						statistics: ai,
						belowValue
					})
				);
			});
		}
	}

	setupSkipDataPointsList({belowValue, belowValueByMetric}) {
		this.preTransformSettings.skipDataPointsList = [];
		let statisticsArray = this.StatisticsTransformator.getStatisticsArrayFromStatiticsData(
			this.fetched_statistics_data
		);
		
		let finalBelowValue = belowValue;
		
		if (belowValueByMetric) {
			finalBelowValue = belowValueByMetric[this.measurement];
		}

		statisticsArray.forEach(ai => {
			this.preTransformSettings.skipDataPointsList = this.preTransformSettings.skipDataPointsList.concat(
				collect_specific_points({
					statistics: ai,
					belowValue: finalBelowValue
				})
			);
		});
	}

	chartDataReadyCallback() {
		if (this.ChartAPI) { // reset navigator zoom
			// console.log('chartDataReadyCallback', this.ChartAPI.xAxis);
			if (this.ChartAPI.xAxis) {
				this.ChartAPI.xAxis[0].setExtremes(null, null);	//todo Cannot read properties of undefined (reading '0')
			}
		}
	}
}

class SensorChart extends SensorChartBase {
	constructor(resources) {
		super();
		this.initialSetup(resources);
		// console.log('SensorChart resources', resources)

		this.mainSeriesReady = false;

		this.allowYAxisMinChange =
			resources.chart_config.requestsList[0]['type'] == 'temperature';

		const { editThresholdsByStagesEnabled } = resources.payload_1;
		this.isPlotLinesReady = false;
		this.isDraggablePlotLinesReady = false;

		this.editThresholdsByStagesEnabled = editThresholdsByStagesEnabled;
		this.isWarningThresholdLessThanAlarm = true;

		this.initialPlotlinesValues = {};
		if (editThresholdsByStagesEnabled) {
			this.updateThresholdsData = {};
			this.current_position_alarm_zone = 0;
			this.current_position_warning_zone = 0;
		}
		/*if (resources.payload_1.enableAxisSelector && sensorItem.ncd_active_axial_axis) {
			resources.chart_config.requestsList = this.modifyParamsByActiveAxialAxis(
				sensorItem.ncd_active_axial_axis,
				resources.chart_config.requestsList,
			);
		}*/

		// -------------- 3 level payload ----------
		// resources.payload_3 = {
		let options = {
			chart: {},
			boost: {
				// enabled: false,
				// usePreallocated: true,
			},
			// navigator: { enabled: false }
		};
		// }

		// console.log('resources:', resources)
		const { chart_config } = resources;

		if (chart_config.canBeHidden) {
			this.chartIsHidden = false;
		}

		// seriesConfig - step 1
		this.seriesConfig = this.createSeriesConfig(resources);
		// console.log('init', this.seriesConfig)
		this.showCalculateThresholdsButton =
			chart_config.config_settings &&
			chart_config.config_settings.showCalculateThresholdsButton;
		if (this.showCalculateThresholdsButton) {
			options.chart.events = {
				selection: e => this.calculateThresholdsBySelectedPoints(e)
			};
		}

		if (!resources.settings_payload.disableNavigator) {
			options.navigator = {
				// enabled: false,
				adaptToUpdatedData: true,
				series: {
					dataGrouping: { approximation: 'high' },
					type: 'column'
				}
			};
		}

		this.generateSeriesByStatistics =
			chart_config.config_settings &&
			chart_config.config_settings.generateSeriesByStatistics;

		const setupPlotlinesData =
			this.seriesConfig.plotlinesSeriesData &&
			this.seriesConfig.plotlinesSeriesData.seriesConfigsList[0];
		// console.log(this.seriesConfig)
		this.transformator_settings.specification = {
			...this.transformator_settings.specification,
			setupPlotlinesData,
			/*setupAdditionalSeriesData: [
				{ data_path: 'data_average_value', method: '', skipMaxValues:true }
			],*/
			includeProblems: true,
		};

		if (this.generateSeriesByStatistics) {
			this.transformator_settings.specification.generateSeriesByStatistics = {
				...this.generateSeriesByStatistics,
				joinIntersections: true
			}
		}

		// ------------------------------
		this.injectProps('options', options);
		// this.injectProps('settings', keyValue.inject_settings);

		// -----------------------------------------
		this.finalSetup(resources, {
			generateSeriesByStatistics: this.generateSeriesByStatistics
		});

		if (this.resources.payload_1.overlayChartOptions) {
			this.updateOverlayChartOptions(this.resources.payload_1.overlayChartOptions);
		}
	}

	allSettingsParsedCallback(resources) {
		const { rpmOverlayValue } = resources.payload_1;
		// console.log('allSettingsParsedCallback', resources, this.seriesConfig, this.requestsList)
		
		if (rpmOverlayValue) {
			// this.
			let rpmYAxis = { 
				skipPlotlines: true,
				injectOptions: {
					title: { text: 'RPM' }, opposite: true,
				}
			}

			if (rpmOverlayValue) {
				rpmYAxis.injectOptions.max = rpmOverlayValue + rpmOverlayValue * 0.2;

				rpmYAxis.injectOptions.plotLines = [{
					className: 'rpm-overlay',
					color: 'black',
					// customSettings : {data_accessor: 'levelZoneData.alarm_zone', data_path: 'alarm_zone', draggable: true, data_accessor_min: 'levelZoneData.warning_zone'},
					id: 'rpm-overlay-plotline',
					value: rpmOverlayValue,
					width: 2,
					zIndex: 20,
				}]
			}

			resources.chart_config.YAxisList = [ this.requestsList[0], rpmYAxis ];
		}
	}

	finalSetupReadyCallback() {
		var { transformator_settings } = this;
		if (transformator_settings) {
			this.disableThresholds = !transformator_settings.specification.setupPlotlinesData;			
		}
	}

	handleChartRenderEvent({ target }) {
		// const { plotlinesConfigsList } = this.seriesConfig.plotlinesData;
		const { plotLines } = this.options.yAxis[0];
		// const { plotLinesAndBands } = target.yAxis[0];
		// console.log('render', plotLines)

		if (
			plotLines &&
			plotLines.length &&
			plotLines.some(pi => pi.customSettings && pi.customSettings.draggable)
		) {
			// console.log('handleChartRenderEvent', this.chartTitle, this.isPlotLinesReady , this.isDraggablePlotLinesReady, plotLines)
			if (this.isPlotLinesReady /*&& !this.isDraggablePlotLinesReady*/) {
				plotLines.forEach(pi => {
					if (pi.customSettings && pi.customSettings.draggable) {
						this.setupDraggablePlotLine(pi, target.yAxis[0]);
					}
				});
				this.isDraggablePlotLinesReady = true;
			}
		}
	}

	localHandleStatisticsTransformUpdated(resultData) {
		if (this.generateSeriesByStatistics) {
			let updatedSeriesConfig = this.seriesConfig;

			// console.log('updatedSeriesConfig', updatedSeriesConfig)
			if (this.generateSeriesByStatistics.seriesConfigMethod) {
				updatedSeriesConfig = this[
					this.generateSeriesByStatistics.seriesConfigMethod
				]({
					statistics: Object.values(resultData.statistics_result)[0].pointsData,
					seriesConfig: cloneDeep(this.seriesConfig)
				});
			}

			let overlaySerie;

			if (this.resources.payload_1.overlayChartOptions) {
				overlaySerie = findItemBy(
					'custom_type',
					'overlay_serie',
					this.options.series
				);
			}
			this.options.series = this.generateSeries({
				seriesConfig: updatedSeriesConfig,
				seriesEvents: this.seriesEvents,
				chart_id: this.chart_id
			});

			if (overlaySerie) {
				console.log('push overlay serie')
				this.options.series.push(overlaySerie);
			}
		}
		this.assignDataToYAxis(resultData);

		if (this.options.yAxis[0].plotLines && !this.isPlotLinesReady) {
			this.assignDataToPlotlines(resultData);
			this.isPlotLinesReady = true;
		}
		const exceptList = [{ key: 'custom_type', val: 'overlay_serie' }];

		this.assignDataToSeries(resultData, { exceptList });
		// console.log('assignDataToSeries result', resultData, this.options.series[0].data)
			// console.log('this.options.series', this.options.series[2])
		// this.options.series = this.options.series.filter(si => si.data && si.data.length);
		// --------------
		this.emitChartOptionsReady();
		this.mainSeriesReady = true;
	}

	modifySeriesConfigByHistory({ statistics, seriesConfig }) {
		const transparentSerie = findItemBy(
			'id',
			'transparent-serie',
			seriesConfig.pointsData.seriesConfigsList[0]
		);
		// console.log(seriesConfig.pointsData.seriesConfigsList[0])
		const baseSerie = findItemBy(
			'id',
			'base-serie',
			seriesConfig.pointsData.seriesConfigsList[0]
		);
		let newSeriesConfigsList = [transparentSerie];
		// console.log('statistics', statistics)
		if (statistics.history.length) {
			statistics.history.forEach((hi, idx) => {
				newSeriesConfigsList.push({
					...baseSerie,
					id: `base-serie-${idx}`,
					data_path: `history.${idx}.base`,
					customSettings: {
						setupSeriePropValue: [
							{
								key: 'zones',
								methodName: 'setupSerieLowHighZones',
								payload: { levelZoneData: hi.levelZoneData }
							}
						]
					}
				});
			});
		} else {
			newSeriesConfigsList.push(baseSerie);
		}

		const otherPointsDataConfigs = seriesConfig.pointsData.seriesConfigsList[0].filter(ci => ci.id !== 'transparent-serie' && ci.id !== 'base-serie');
		seriesConfig.pointsData.seriesConfigsList[0] = newSeriesConfigsList.concat(otherPointsDataConfigs);
			// console.log('modifySeriesConfigByHistory', newSeriesConfigsList, otherPointsDataConfigs);
		return seriesConfig;
	}

	localEmitChartOptionsUpdate() {
		// console.log('localEmitChartOptionsUpdate', this.chartTitle)
		this.isDraggablePlotLinesReady = false;
	}

	// --------- Y Axis -------------
	assignDataToPlotlines(resultData) {
		try {
			let yAxis = cloneDeep(this.options.yAxis[0]);
			yAxis.plotLines.forEach(plotline => {
				if (plotline.customSettings) {
					let {
						responseDataKey,
						data_accessor,
						data_accessor_min,
						data_accessor_max
					} = plotline.customSettings;
					
					/*if (plotline.id == 'warning-plotline') {
						console.log('assignDataToPlotlines', data_accessor_max)
					}*/
					const parameterId = this.requestsList[0]?.id;

					responseDataKey =
						responseDataKey || (parameterId ? `parameter_${parameterId}` : null);

					const statistics = resultData.statistics_result[responseDataKey];
					if (statistics) {
						if (plotline.zone_key == 'lubeline_zone') {
							plotline.value =
								statistics.levelZoneData &&
								statistics.levelZoneData.is_lube_zone_included
									? getObjectVal(statistics, data_accessor)
									: 0;
						} else {
							plotline.value = getObjectVal(statistics, data_accessor);
						}
						// console.log(data_accessor_min, plotline)
						data_accessor_min
							? (plotline.min_value = getObjectVal(statistics, data_accessor_min))
							: null;
						data_accessor_max
							? (plotline.max_value = getObjectVal(statistics, data_accessor_max))
							: null;

					}
				}
			});

			this.options.yAxis[0].plotLines = yAxis.plotLines.filter(pl => pl.value !== undefined);
		} catch (e) {
			console.warn(e);
		}
	}

	// --------- Series ------------

	createSeriesConfig(resources) {
		const { chart_config } = resources;

		const seriesGroupsList = [
			'pointsData',
			'flagsData',
			'historyData',
			'plotlinesSeriesData',
			'plotlinesData',
			'additionalSeriesData'
		];
		return this.getSeriesConfig({
			sensorType: this.sensorType,
			chart_config,
			seriesGroupsList
		});
	}

	setupAdditionalOptionsForSeries(/*payload*/) {
		// const { parameterItem, unit_type_name } = payload;

		return {
			/*pointsData: {
				commonOptions: {
					// name: parameterItem.name,
					// tooltip: { valueSuffix: ` ${unit_type_name}` },
					customSettings: { event_key: 'pointClickEvent' }
					// point: { events: {} }
				},
			}*/
		};
	}

	localHandleUpdateSerie() {
		// console.log('localHandleUpdateSerie', this.chartTitle)
		this.isDraggablePlotLinesReady = false;
	}

	localLiveUpdateDataModify(data) {
		if (
			data.imperial_unit_value !== undefined &&
			this.measurement === METRIC_SYSTEM_TYPES.IMPERIAL
		) {
			data.unit = data.imperial_unit_value;
		} else if (
			data.metric_unit_value !== undefined &&
			this.measurement === METRIC_SYSTEM_TYPES.METRIC
		) {
			data.unit = data.metric_unit_value;
		}
		return data;
	}

	// -------Overlay Chart------
	setupOverlayPlotlines(rpm_value) {
		// console.log('setupOverlayPlotlines', rpm_value)
		if (!rpm_value) return;
		this.options.yAxis.push({ 
			title: { text: 'RPM' },
			opposite: true,
			max: rpm_value + rpm_value * 0.2,
			min: 0,
			custom_id: 'overlay_chart_axis',
			plotLines: [{
				className: 'rpm-overlay',
				color: 'black',
				id: 'rpm-overlay-plotline',
				value: rpm_value,
				width: 2,
				zIndex: 20,
			}]
		});
	}

	updateOverlayChartOptions(chartOptions) {
		if (chartOptions.series.length) {
			const overlay_series = chartOptions.series.filter(
				si => si.custom_type == 'overlay_serie'
			);
			// debugger

			const { index: serieIdx } = findItemBy(
				'custom_type',
				'overlay_serie',
				this.options.series,
				{ returnIndex: 1 }
			);
			const { index: yAxisIdx } = findItemBy(
				'custom_id',
				'overlay_chart_axis',
				this.options.yAxis,
				{ returnIndex: 1 }
			);
			if (yAxisIdx != null)
				this.options.yAxis[yAxisIdx] = chartOptions.yAxis[0];
			else this.options.yAxis.push(chartOptions.yAxis[0]);

			if (overlay_series.length) {
				if (serieIdx != null)
					this.options.series[serieIdx].data = overlay_series[0].data;
				else this.options.series.push(overlay_series[0]);
			}

			// console.log('updateOverlayChartOptions', overlay_series[0], serieIdx)
			if (this.mainSeriesReady) {
				this.emitChartOptionsUpdate();
			}
		}
	}

	cleanOverlayChartData() {
		this.options.yAxis = this.options.yAxis.filter(axis => axis.custom_id != 'overlay_chart_axis');

		const { index: serieIdx } = findItemBy(
			'custom_type',
			'overlay_serie',
			this.options.series,
			{ returnIndex: 1 }
		);
		
		if (serieIdx != null) {
			this.options.series[serieIdx].data = [];
		}

		if (this.mainSeriesReady) {
			this.emitChartOptionsUpdate();
		}
	}

	// -----------------
	calculateThresholdsBySelectedPoints(e) {
		const selectedPoints = selectPointsByChartSelection(e, this.options.series);

		this.setOption(
			// 'xAxis.plotBands',
			'xAxis.0.plotBands',
			[
				{
					from: selectedPoints[0][0],
					to: selectedPoints[selectedPoints.length - 1][0]
				}
			],
			{ emitChartOptionsUpdate: true }
		);

		MessageBox({
			title: 'Warning',
			message: `${Lang.tt('phrases.Do_you_really_want_to')} ${Lang.tt(
				'phrases.Rebase_Line_by_selected_range'
			)}? ${Lang.tt('Continue')}?`,
			confirmButtonText: Lang.tt('Confirm'),
			showCancelButton: true,
			cancelButtonText: Lang.tt('Cancel'),
			iconClass: 'icomoon icon-warning',
			type: 'warning'
		})
			.then(() => {
				try {
					// console.log('confirmed', calculateThresholdsBySelectedPoints)
					const payload = preparePayloadForCalculateThresholdsBySelectedPoints({
						selectedPoints,
						sensorItem: this.sensorItem,
						measurement: this.measurement,
						parameterItem: this.requestsList[0]
					});

					/*if (payload) {
						console.log(payload)
						return
					}*/

					if (payload) {
						this.setValue('isLoading', true);
						calculate_thresholds_our(payload)
							.then(() => {
								this.setOption('xAxis.0.plotBands', [], {
									emitChartOptionsUpdate: true
								});
								this.handleCalculateThresholdsBySelectedPointsResponse(true);
							})
							.catch(() => {
								this.setOption('xAxis.0.plotBands', [], {
									emitChartOptionsUpdate: true
								});
								this.handleCalculateThresholdsBySelectedPointsResponse(false);
							});
					}
				} catch (e) {
					console.warn(e);
				}
			})
			.catch(() => {
				this.setOption('xAxis.0.plotBands', [], { emitChartOptionsUpdate: true });
			});
		return false;
	}

	handleCalculateThresholdsBySelectedPointsResponse(isSuccess) {
		if (this.events.handleCalculateThresholdsBySelectedPointsResponse) {
			this.events.handleCalculateThresholdsBySelectedPointsResponse(isSuccess);
		}

		if (isSuccess) {
			this.fetchChartData();
		} else {
			Notification({
				title: Lang.tt('Error'),
				message: Lang.tt('phrases.Something_went_wrong'),
				type: 'error'
			});
		}

		this.setValue('isLoading', false);
	}

	handleUpdateThresholdByDragResponse(isSuccess) {
		this.setValue('isLoading', false);

		if (isSuccess) {
			this.fetchChartData();
		}

		if (this.events.handleUpdateThresholdByDragResponse) {
			this.events.handleUpdateThresholdByDragResponse(isSuccess);
		}
	}

	// ---------------------
	handleFiltersChange({filters, old_filters}) {
		// console.log('handleFiltersChange', this.chart_id)
		this.measurement = filters.measurement;

		this.initialPlotlinesValues = {};
		const { updateChartTitleByMetric } = this.resources.chart_config;
		
		if (updateChartTitleByMetric) {
			if (this.measurement !== old_filters.measurement) {
				this.chartTitle = this.setupChartTitle(this.resources);

				if (this.chartIsHidden) {
					this.emitChartOptionsUpdate();
				}
				// console.log(this.measurement, old_filters.measurement)
			}
		}
	}

	updatePlotLines({ zone_key, new_val, alarm_value, warning_value }) {
		this.options.yAxis[0].plotLines.forEach(pli => {
			if (zone_key == 'alarm_zone') {
				switch (pli.id) {
					case 'alarm-plotline':
						pli.value = alarm_value || new_val;
						break;
					case 'warning-plotline':
						if (!this.editThresholdsByStagesEnabled) {
							pli.max_value = alarm_value || new_val;
						}
						break;
				}
			} else if (zone_key == 'warning_zone') {
				switch (pli.id) {
					case 'alarm-plotline':
						pli.min_value = warning_value || new_val;
						break;
					case 'warning-plotline':
						pli.value = warning_value || new_val;
						break;
				}
			}
		});

		if (new_val) this[`current_position_${zone_key}`] = new_val;
		else if (zone_key == 'alarm_zone')
			this[`current_position_${zone_key}`] = alarm_value;
		else if (zone_key == 'warning_zone')
			this[`current_position_${zone_key}`] = warning_value;
		this.isWarningThresholdLessThanAlarm =
			this[`current_position_warning_zone`] < this[`current_position_alarm_zone`];
		const { chart_all_data_max_value } = this.StatisticsTransformator.resultData;

		if (this[`current_position_${zone_key}`] >= chart_all_data_max_value) {
			let max =
				this[`current_position_warning_zone`] < this[`current_position_alarm_zone`]
					? this[`current_position_alarm_zone`]
					: this[`current_position_warning_zone`];
			this.options.yAxis[0].max = max + max / 9;
		}

		this.emitChartOptionsUpdate();
	}

	setupDraggablePlotLine(plotLine, axis) {
		let settings = { axis, plotLineId: plotLine.id };

		if (
			this.initialPlotlinesValues[plotLine.id] === undefined ||
			(this.editThresholdsByStagesEnabled &&
				this.initialPlotlinesValues[plotLine.id] === undefined)
		) {
			const optionsPlotline = findItemBy(
				'id',
				plotLine.id,
				this.options.yAxis[0].plotLines
			);
			if (optionsPlotline) {
				this.initialPlotlinesValues[plotLine.id] = optionsPlotline.value;
				this[`current_position_${plotLine.zone_key}`] = optionsPlotline.value;
			}
		}

		const DraggablePlotlineInstance = createDraggablePlotline(settings);
		// console.log('DraggablePlotlineInstance', DraggablePlotlineInstance)
		if (this.handlePlotlineDragChange) {
			DraggablePlotlineInstance.onDragChange = new_val =>
				this.handlePlotlineDragChange({ new_val, plotLine });
			// settings.onDragChange = new_val => this.handlePlotlineDragChange({ new_val, plotLine });
		}
		if (this.handlePlotlineDragFinish) {
			DraggablePlotlineInstance.onDragFinish = new_val =>
				this.handlePlotlineDragFinish({ new_val, plotLine });
			// settings.onDragFinish = new_val => this.handlePlotlineDragFinish({ new_val, plotLine });
		}
		// console.log('setupDraggablePlotLine', plotLine, axis)
		// setupDraggablePlotLine(settings);
	}

	handlePlotlineDragChange(e) {
		if (this.events.onPlotlineDragChange) {
			this.events.onPlotlineDragChange(e);
		}
		/*console.log(this.options.yAxis[0]['min'], e.new_val)
		if (this.allowYAxisMinChange && e.new_val == this.options.yAxis[0]['min']) {
			const newExtremes = { min: e.new_val + (e.new_val * 0.15) };
			= this.ChartAPI.yAxis[0].setExtremes();

		}*/
	}

	handlePlotlineDragFinish(e) {
		// console.log('handlePlotlineDragFinish', e)
		this.updateThresholdByDragEvent(e);

		if (this.events.onPlotlineDragFinish) {
			this.events.onPlotlineDragFinish(e);
		}
	}

	updateThresholdByDragEvent({ new_val, plotLine }) {
		// console.log(Lang.tt, new_val, plotLine)
		if (this.editThresholdsByStagesEnabled) {
			const { zone_key } = plotLine;
			this.updateThresholdsData = {
				...this.updateThresholdsData,
				[zone_key]: new_val
			};

			this.updatePlotLines({ zone_key, new_val });

			if (this.events.chartThresholdsUpdate) {
				this.events.chartThresholdsUpdate({ open_dialog: true });
			}
		} else {
			MessageBox({
				title: 'Warning',
				message: `${Lang.tt('phrases.Do_you_really_want_to')} ${Lang.tt(
					'change'
				)} <b>${Lang.tt(plotLine.zone_label)}</b>? ${Lang.tt('Continue')}?`,
				confirmButtonText: Lang.tt('Confirm'),
				showCancelButton: true,
				cancelButtonText: Lang.tt('Cancel'),
				dangerouslyUseHTMLString: true,
				iconClass: 'icomoon icon-warning',
				type: 'warning'
			})
				.then(() => {
					// console.log('confirm', new_val, plotLine)
					try {
						const { requestsList, sensorItem } = this;
						const levelZoneData = this.getTransformedStatistics({
							data_key: 'levelZoneData',
							parameterId: requestsList[0].id
						});

						let getZoneSettings = {
							currentSensorType: this.currentSensorType,
							isOffAlarm: !!levelZoneData.off_alarm_zone,
							zonesData: levelZoneData,
							value: new_val
						};

						const requestPayload = {
							sensorId: sensorItem.id,
							zoneId: levelZoneData.id,
							method: 'PUT',
							data: {
								metric_system_type: this.measurement,
								parameter_type: requestsList[0].id,
								level: plotLine.zone_id,
								value: getZoneValue(
									plotLine.customSettings.data_path,
									getZoneSettings
								)
							}
						};

						/*if (requestPayload) {
							console.log(requestPayload)
							this.handleUpdateThresholdByDragResponse(true);
							return;
						}*/

						if (requestPayload) {
							this.setValue('isLoading', true);
							save_sensor_level_zones(requestPayload)
								.then(() => {
									this.handleUpdateThresholdByDragResponse(true);
								})
								.catch(() => {
									this.handleUpdateThresholdByDragResponse(false);
								});
						}
					} catch (e) {
						console.warn(e);
					}
				})
				.catch(() => {
					this.discardThresholdsChanges();
				});
		}
	}

	handleUpdateAlarmThresholdByWarningValue(openDialog) {
		const { warning_zone } = this.updateThresholdsData;
		if (warning_zone) {
			const alarm_value = warning_zone * 1.25;

			this.updateThresholdsData = {
				...this.updateThresholdsData,
				alarm_zone: alarm_value
			};

			['alarm_zone', 'warning_zone'].forEach(zone_key => {
				this.updatePlotLines({ zone_key, alarm_value, warning_value: warning_zone });
			});

			if (this.events.chartThresholdsUpdate) {
				this.events.chartThresholdsUpdate({ open_dialog: openDialog });
			}
		}
	}

	submitNewThresholds(settings = {}) {
		if (Object.keys(this.updateThresholdsData).length) {
			this.submitNewThresholdsAction({
				...settings,
				chartThresholdsUpdate: true
			});
		}
	}

	submitNewThresholdsAction(settings = {}) {
		const { sensorItem } = this;
		const levelZoneData = this.getTransformedStatistics({
			data_key: 'levelZoneData',
			parameterId: this.requestsList[0].id
		});

		if (levelZoneData && sensorItem) {
			let payload = {
				sensorId: sensorItem.id,
				method: 'POST',
				data: {
					...levelZoneData,
					metric_system_type: this.measurement
				}
			};

			delete payload.data.id;

			if (settings.data) {
				payload.data = { ...payload.data, ...settings.data };
			}

			if (settings.chartThresholdsUpdate) {
				const { updateThresholdsData } = this;

				for (const key in updateThresholdsData) {
					payload.data[key] = getRoundedValue(updateThresholdsData[key], 0, 4);
				}
			}

			/*if (payload) {
				console.log(payload, settings);
				if (settings.redirectTo) {
					this.updateThresholdsData = {};
					this.events.chartThresholdsUpdate({ open_dialog: false, settings });
				}
				return;
			}*/

			save_sensor_level_zones(payload)
				.then(() => {
					if (settings.chartThresholdsUpdate) {
						this.updateThresholdsData = {};
						if (this.events.chartThresholdsUpdate) {
							this.events.chartThresholdsUpdate({ open_dialog: false, settings });
						}
					}

					if (!settings.redirectTo) {
						this.fetchChartData();
					} /*else {
						// this.emitChartOptionsUpdate();						
					}*/
				})
				.catch(() => {
					if (settings.chartThresholdsUpdate) {
						this.discardThresholdsChanges();
					}
				});
		}
	}

	discardThresholdsChanges(settings) {
		['alarm_zone', 'warning_zone'].forEach(zone_key => {
			this.updatePlotLines({
				zone_key,
				alarm_value: this.initialPlotlinesValues['alarm-plotline'],
				warning_value:
					this.initialPlotlinesValues['warning-plotline'] ||
					this.initialPlotlinesValues['low-alarm-plotline']
			});
		});

		this.updateThresholdsData = {};
		if (this.events.chartThresholdsUpdate) {
			this.events.chartThresholdsUpdate({ open_dialog: false, settings });
		}
	}

	// --------------------
	setYFilters(y_filters) {
		this.resources.y_filters = { ...this.resources.y_filters, ...y_filters };

		if (this.StatisticsTransformator) {
			this.StatisticsTransformator.setFilters(this.resources.y_filters);

			this.StatisticsTransformator.transform(this.fetched_statistics_data, {
				useCurrentResultData: true,
				specification: {
					setupPointsData: { method: 'standard_datetime', enableZones: true }
				}
			});
		}
	}

	toggleChart() {
		this.chartIsHidden = !this.chartIsHidden;
		this.setValue('chartIsHidden', this.chartIsHidden);
	}

	getChartStatsData() {
		const statsData = this.StatisticsTransformator.getTransformedStatistics({
			data_key: 'statsData',
			// parameterId: this.requestsList[0].id
		});

		return statsData;
	}

	setupPeriodStatsData() {
		this.setValue('isLoading', true);
		fetch_period_stats_data({
			sensorId: this.sensorItem.id,
			params: {
				metric_type: this.requestsList[0].id,
				...prepareFilters(this.resources.filters, {
					dateStartKey: 'date_start',
					dateFinishKey: 'date_end'
				}),
				measurement: this.resources.filters.measurement,
			}
		}).then(({value}) => {
			let { average_metric_value, warning_level, alarm_level } = value;
			const edgeStatisticsItems = this.StatisticsTransformator.getTransformedStatistics({
				data_key: 'edgeStatisticsItems',
				// parameterId: this.requestsList[0].id
			});
			// console.log('setupPeriodStatsData', this.requestsList[0], edgeStatisticsItems, warning_level, alarm_level)
			if (edgeStatisticsItems) {
				const {	first_statistics_item, last_statistics_item	} = edgeStatisticsItems;
				if (first_statistics_item && last_statistics_item) {
					let {
						chart_all_data_max_value, chart_points_max_value
					} = this.StatisticsTransformator.getTransformedStatistics();

					const {
						alarm_zone_current, warning_zone_current, actual_average_metric_stat_for_current_period
					} = this.StatisticsTransformator.getTransformedStatistics({
						data_key: 'statsData',
					});
					// console.log(average_metric_value)
					average_metric_value = average_metric_value ? getRoundedValue(average_metric_value, 0, countDecimalOrder(average_metric_value)) : 0;
					warning_level = warning_level ? getRoundedValue(warning_level, 0, countDecimalOrder(warning_level)) : 0;
					alarm_level = alarm_level ? getRoundedValue(alarm_level, 0, countDecimalOrder(alarm_level)) : 0;

					if (average_metric_value > chart_points_max_value) chart_points_max_value = average_metric_value;
					if (warning_level > chart_points_max_value) chart_points_max_value = warning_level;
					if (alarm_level > chart_points_max_value) chart_points_max_value = alarm_level;
					if (chart_points_max_value > chart_all_data_max_value) chart_all_data_max_value = chart_points_max_value;					

					this.StatisticsTransformator.updateResultData({
						settingsList: [
							{
								accessor: 'chart_points_max_value',
								value: chart_points_max_value
							},
							{
								accessor: 'chart_all_data_max_value',
								value: chart_all_data_max_value
							},
							{
								updateSeries: [
									{
										serie_id: 'average_current-threshold-serie',
										accessor: 'data',
										value: actual_average_metric_stat_for_current_period
									}
								]
							},
							{
								updateSeries: [
									{
										serie_id: 'alarm_current-threshold-serie',
										accessor: 'data',
										value: alarm_zone_current
									}
								]
							},
							{
								updateSeries: [
									{
										serie_id: 'warning_current-threshold-serie',
										accessor: 'data',
										value: warning_zone_current
									}
								]
							},
							{
								to_statistics_result: true,
								accessor: 'statsData.average_metric_value',
								value: average_metric_value,
								updateSeries: [
									{
										serie_id: 'period_average_threshold-serie',
										accessor: 'data',
										value: [
											[first_statistics_item[0], average_metric_value],
											[last_statistics_item[0], average_metric_value]
										]
									}
								]
							},
							{
								to_statistics_result: true,
								accessor: 'statsData.warning_level',
								value: warning_level,
								updateSeries: [
									{
										serie_id: 'period_warning_threshold-serie',
										accessor: 'data',
										value: [
											[first_statistics_item[0], warning_level],
											[last_statistics_item[0], warning_level]
										]
									}
								]
							},
							{
								to_statistics_result: true,
								accessor: 'statsData.alarm_level',
								value: alarm_level,
								updateSeries: [
									{
										serie_id: 'period_alarm_threshold-serie',
										accessor: 'data',
										value: [
											[first_statistics_item[0], alarm_level],
											[last_statistics_item[0], alarm_level]
										]
									}
								]
							},
						],
						additionalSettings: {
							callback: (resultData) => {
								this.assignDataToYAxis(resultData);
								this.emitChartOptionsReady();

								setTimeout(() => {
									this.ChartAPI.redraw(false);
								}, 50);
							}
						}
					});
				}

			}

			this.setValue('isLoading', false);
			// this.setValue('periodStatsData', value);
			// console.log(value)
		}).catch((e) => {
			console.warn(e)
			this.setValue('isLoading', false);
		});
	}

	/*updateChartByYfilters(y_filters) {
		if (y_filters[this.chart_id] && y_filters[this.chart_id].y_min) {
			// console.log(
			// 	'updateChartByYfilters',
			// 	this.chart_id,
			// 	y_filters[this.chart_id].y_min
			// );
			this.StatisticsTransformator.transform(this.fetched_statistics_data, {
				useCurrentResultData: true,
				specification: {
					setupPointsData: { method: 'standard_datetime', enableZones: true }
				}
			});
		}
	}*/

	/*modifyParamsByActiveAxialAxis(ncd_active_axial_axis, parameters) {
		return parameters.map(pi => {
			// debugger
			let splittedName = pi.name.split(' ');
			if (splittedName[0] == Lang.tt('axial') || splittedName[0] == Lang.tt('radial')) {
				splittedName[0] = pi.axis_id == ncd_active_axial_axis ? Lang.tt('axial') : Lang.tt('radial');
				console.log(pi, splittedName.join(' '))

				return { ...pi, name:	splittedName.join(' ') }
			} else {
				return pi;
			}
		})
	}*/
}

class SensorAlarmsChart extends SensorChartBase {
	constructor(resources) {
		super();
		// console.log('SensorAlarmsChart resources', resources)
		this.initialSetup(resources);

		const { chart_config } = resources;
		const seriesGroupsList = [
			'pointsData',
			'flagsData',
			'historyData',
			'plotlinesSeriesData'
		];
		this.seriesConfig = this.getSeriesConfig({ chart_config, seriesGroupsList });

		let options = {
			chart: {
				spacingBottom: 21,
				height: 210,
				events: {
					selection: e => this.addChartComment(e)
				}
			},
			annotations: [
				{
					events: { click: e => this.editAnnotation(e) },
					draggable: '',
					labelOptions: {
						backgroundColor: 'gray',
						verticalAlign: 'top',
						y: 3,
						x: 3,
						borderWidth: 0,
						allowOverlap: true,
						className: 'pointer'
					},
					zIndex: 50,
					labels: []
				}
			],
			navigator: { enabled: false }
		};

		const setupPlotlinesData =
			this.seriesConfig.plotlinesSeriesData &&
			this.seriesConfig.plotlinesSeriesData.seriesConfigsList[0];
		// console.log(this.seriesConfig)
		this.transformator_settings.specification = {
			...this.transformator_settings.specification,
			setupPlotlinesData
		};

		// -------- Form Data-------------------
		const { alarmItem } = resources.payload_1;
		this.selectionData = {};
		this.showCommentForm = false;

		this.graphItem = findItemBy(
			'parameter',
			this.chart_parameter_id,
			alarmItem.sensorGraphsGroup
		);

		this.chartIsDisabled = null;
		this.formData = {
			is_hidden: false,
			sensor_id: null,
			parameter: null,
			notes: [],
			date_start: '',
			date_finish: '',
			annotations: []
		};

		if (this.graphItem) {
			this.formData = updateFormData(this.graphItem, this.formData);
		}

		// ---------------------------
		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	toggleChart(val) {
		this.formData.is_hidden = val === undefined ? !this.formData.is_hidden : val;
		this.setValue('chartIsDisabled', this.formData.is_hidden);
	}

	handleChartInitiatedEvent({ target }) {
		this.ChartAPI = target;
		const { enableAnnotations } = this.resources.payload_1;

		if (enableAnnotations) {
			this.setupAnnotations({
				e: { target },
				annotations: this.formData.annotations,
				series: this.options.series
			});
		}
	}

	localStatisticsResponsesReady() {
		if (!this.hasStatistics) {
			this.formData.remove_this_graph = true;
			this.setValue('isRemoveChart', this.formData.remove_this_graph);
		}
	}

	// ---------Annotations---------------
	setupAnnotations(payload) {
		const { annotationsLabelsItems, plotBandsItems } = setupAnnotations(payload);

		// if (annotationsLabelsItems.length) {
			this.options.annotations[0].labels = annotationsLabelsItems;
			this.setOption('xAxis.0.plotBands', plotBandsItems, {
				emitChartOptionsUpdate: true
			});
		// }
	}

	addChartComment(e) {
		this.selectionData = setupAnnotationSelectionData({
			e,
			chartSeries: this.options.series
		});
		// console.log(e, yMax, firstPointVal_x, lastPointVal_x)
		if (this.selectionData) {
			this.setValue('showCommentForm', true);
		} else {
			Notification({
				type: 'warning',
				// title: this.$t('phrases.form_isnt_ready'),
				message: Lang.tt(`phrases.selection_out_of_chart_range`)
			});
		}
		return false; // prevent chart zoom
	}

	editAnnotation(e) {
		const item = findItemBy(
			'description',
			e.target.textContent,
			this.formData.annotations
		);
		// console.log(item, e, this.formData.annotations)
		if (item) {
			this.selectionData = { ...item };
			this.setValue('showCommentForm', true);
		}
	}

	// ---------Save annotations ---------
	handleSaveComment({ formData, isNew }) {
		if (isNew) {
			this.formData.annotations.push(formData);
		} else {
			const { annotations } = this.formData;
			const { index } = findItemBy('date_start', formData.date_start, annotations, {
				returnIndex: 1
			});

			if (index != null) {
				this.formData.annotations[index] = cloneDeep(formData);
			}
		}

		this.setupAnnotations({
			e: { target: this.ChartAPI },
			annotations: this.formData.annotations,
			series: this.options.series
		});

		this.setValue('showCommentForm', false);
	}

	handleCancelComment() {
		this.selectionData = null;
		this.setValue('showCommentForm', false);
	}

	handleDeleteComment({ formData }) {
		const { annotations } = this.formData;
		const { index } = findItemBy('date_start', formData.date_start, annotations, {
			returnIndex: 1
		});
		// console.log(formData, annotations, index)
		if (index !== undefined) {
			this.formData.annotations.splice(index, 1);
			this.setupAnnotations({
				e: { target: this.ChartAPI },
				annotations: this.formData.annotations,
				series: this.options.series
			});
			this.selectionData = null;
			this.setValue('showCommentForm', false);
		}
	}

	//-------------Save Form------------------------
	getFormData() {
		if (this.resources.payload_1.enableDescriptionForm && !this.chartIsDisabled) {
			let notes = this.events.handleValidateNotesItems();
			return notes.every(ni => !!ni) ? this.prepareFormForSubmit({ notes }) : false;
		}
		return this.prepareFormForSubmit();
	}

	prepareFormForSubmit(injectToBody = {}) {
		const { filters } = this.resources;
		this.formData.date_start = filters.daterange[0];
		this.formData.date_finish = filters.daterange[1];

		let data = {
			...this['formData'],
			...injectToBody
		};

		data.notes = data.notes.filter(ni => !!ni.description);

		if (data.notes.length) {
			data.machine_id = this.sensorItem.equipment
				? this.sensorItem.equipment.asset.machine_id
				: null;
		}
		return data;
	}
}

class SensorOverlayChart extends SensorChartBase {
	constructor(resources) {
		super();
		// console.log('SensorOverlayChart resources', resources)
		this.initialSetup(resources);
		this.isNCDSensor = this.checkIsNCDSensor(this.currentSensorType);

		let { chart_config, payload_1 } = resources;
		chart_config.seriesConfigSettings = splineSeriesConfigSettings();
		chart_config.seriesConfigIncludes = [];

		if (payload_1.rpmOverlayRequest) {
			const {parameter, get_params} = payload_1.rpmOverlayRequest;

			if (parameter) {
				// debugger
				chart_config.requestsList = getRequestList({
					parameter: payload_1.rpmOverlayRequest.parameter,
					sensor: this.currentSensorType.isBannerV2Generic ? this.sensorItem : null
				});

				if (chart_config.requestsList.length) {
					chart_config.chart_id = `chart-${chart_config.requestsList[0].id}`;
					this.chart_id = chart_config.chart_id;
					this.options.chart_id = this.chart_id;
					this.chart_parameter_id = chart_config.requestsList[0].id;
				}
			}
			// console.log('requestsList', chart_config.requestsList)
			if (get_params) {
				resources.filters = { ...resources.filters, ...get_params };
			}			
		}

		chart_config.customYAxisTickPositioner = (min, max) =>
			yAxisTickPositioner(min, max, { withoutRoundExtremes: true });

		chart_config.YAxisList = [{skipPlotlines:true}];

		const seriesGroupsList = ['pointsData'];
		this.seriesConfig = this.getSeriesConfig({ chart_config, seriesGroupsList });
		// let parameterSerieConfig;

		let options = {
			chart: { type: 'spline' },
			navigator: { enabled: false }
		};

		resources.constructor_payload = {
			transformator_settings: {
				// ...this.transformator_settings,
				specification: {
					// skipSpecificationActualization: true,
					getEdgeStatisticsItems: false,
					setupFlagsData: {
						enable_notes: false,
						enable_crashes: false,
						enable_fft: false,
						enable_runtime_tracker: false
					},
					setupPointsData: { 
						method: 'line_charts_datetime',
						enableZones: false,
						y_formula: payload_1.isMaxPeakFrequency ? y => y * 60 : null
					}
				}
			}
		};
		resources.y_filters = resources.y_filters || {};
		resources.y_filters.y_min = this.sensorItem.value_4ma;

		// ---------------------------
		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	checkIsNCDSensor(currentSensorType) {
		if (currentSensorType) {
			const {
				isNCDTempVibe,
				isNCDWiredTempVibe,
				isNCDTempVibeCurr,
				isNCDSDT,
				isNCDEnv,
				isNCDPressure,
				isNCDCustom_4_20
			} = currentSensorType;

			return (
				isNCDTempVibe ||
				isNCDWiredTempVibe ||
				isNCDTempVibeCurr ||
				isNCDSDT ||
				isNCDEnv ||
				isNCDPressure ||
				isNCDCustom_4_20
			);
		}
		return false;
	}

	setupYAxisByCustomFormula(axis) {
		let yAxis = {
			showLastLabel: true,
			opposite: true,
			alignTicks: false,
			title: { text: 'RPM' },
		};
		// console.log(this.sensorItem.min_ncd_custom_formula_result, this.sensorItem.value_20ma)
		if (this.isNCDSensor) {
			if (
				this.sensorItem.min_ncd_custom_formula_result ||
				this.sensorItem.min_ncd_custom_formula_result == 0
			) {
				yAxis.min = this.sensorItem.min_ncd_custom_formula_result;
				yAxis.softMin = this.sensorItem.min_ncd_custom_formula_result;
			}

			if (this.sensorItem.value_20ma || this.sensorItem.value_20ma == 0) {
				yAxis.max = this.sensorItem.value_20ma; // - (this.sensorItem.value_20ma / 1000);
				yAxis.softMax = this.sensorItem.value_20ma - this.sensorItem.value_20ma / 100;
				// yAxis.max = 0.05;
				// yAxis.softMax = 0.05;
			}
		}

		return { ...axis, ...yAxis };
	}

	localSetupYAxisHook(axis) {
		return this.setupYAxisByCustomFormula(axis);
	}

	localAssignDataToYAxisCallback() {
		this.options.yAxis[0] = this.setupYAxisByCustomFormula(this.options.yAxis[0]);
		// console.log(this.options.yAxis[0])
	}

	// seriesConfig - step 3.1
	localModifySeriesConfig({ requestsList, seriesConfig }) {
		let newSeriesConfig = {
			pointsData: { seriesConfigsList: {} }
		};

		Object.values(seriesConfig.pointsData.seriesConfigsList).forEach((series, key) => {
			series.forEach(si => {
				// console.log(si)
				if (
					si.data_path == 'base' ||
					si.id == 'base-serie'
					// (si.responseDataKey == `parameter_${requestsList[0].id}`
				) {
					newSeriesConfig.pointsData.seriesConfigsList[key] = newSeriesConfig.pointsData.seriesConfigsList[key] || [];

					newSeriesConfig.pointsData.seriesConfigsList[key].push({
						...si,
						responseDataKey: `parameter_${requestsList[0].id}`,
						template: 'sensor.base',
						event_key: '',
						inject: {
							...si.inject,
							id: 'base-serie-overlay',
							type: 'spline',
							color: 'black',
							zIndex: 30,
							custom_id: 'base_series_overlay',
							custom_type: 'overlay_serie',
							navigatorOptions: { type: 'line' },
							yAxis: 1,
							gapSize: 1000 * 60 * 20, //20 mins
							gapUnit: 'value',
							showInNavigator: false,
							name: this.chartTitle,
							tooltip: {valueSuffix: ' RPM'}
							// enableMouseTracking: false
						},

						transformator_settings: mergeObjects(si.transformator_settings, {
							specification: {
								setupPointsData: { enableZones: false, skipMaxMinValues: false }
							}
						}),
						customSettings: { setupSeriePropValue: null }
					});

				}
			})
		})

		// console.log('localModifySeriesConfig', seriesConfig, newSeriesConfig)
		return newSeriesConfig;
	}

	finalSetupReadyCallback() {
		const chart_id = `overlay_${this.chart_id}`;
		this.options.chart_id = chart_id;
		this.chart_id = chart_id;
		this.options.yAxis[0].opposite = true;
		this.options.yAxis[0].custom_id = 'overlay_chart_axis';
	}
}

// --------------------
class MultiViewChart extends ChartBase {
	constructor(resources) {
		super();
		// console.log('resources', resources)
		// this.chartTitle = Lang.tt('phrases.connection_strength_trend');
		this.chartTitle = 'MultiView Chart';
		this.measurement = resources.filters.measurement;

		let options = {
			chart: { type: 'spline', },
			boost: {
				enabled: true,
				useGPUTranslations: false
			},
			navigator: {
				enabled: true,
				series: { type: 'spline' }
			},

			xAxis: [
				{
					type: 'datetime',
					ordinal: false,
					minRange: 60000,
					plotBands: []
				},
				{
					type: 'datetime',
					opposite: true,
					linkedTo: 0,
					visible: false
				}
			],
			yAxis: [],
			plotOptions: {
				series: {
					marker: {enabled: false},
					// stickyTracking: true
				}
			}
		};

		this.seriesConfig = {
			pointsData: {
				seriesConfigsList: {
					0: []
				}
			},
			flagsData: {
				seriesConfigsList: {
					0: [
						{
							id: 'acute-flag-serie',
							data_path: 'acute_statistics',
							template: 'sensor.acute_flag'
						},
						{
							id: 'chronic-flag-serie',
							data_path: 'chronic_statistics',
							template: 'sensor.chronic_flag'
						},
						{
							id: 'crashes-flag-serie',
							data_path: 'crashes_statistics',
							template: 'sensor.crashes_flag'
						},
					]
				}
			}
		}

		this.transformator_settings = {
			...this.transformator_settings,
			events: {
				...this.transformator_settings.events,
				handleUpdateSeries: e => this.handleUpdateSeries(e)
			},
			name: 'sensorStatistics',
			specification: {
				getEdgeStatisticsItems: true,
				setupPointsData: { method: 'line_charts_datetime' },
				setupFlagsData: {
					enable_issue_alerts: true,
				},
			}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	setupChartTitle() {
		// console.log('setupChartTitle', resources)
		try {
			const { requestsList } = this;
			let result = '';

			if (requestsList && requestsList.length) {
				requestsList.forEach(ri => {
					const { sensor_name, name } = ri;
					// console.log('setupChartTitle', sensor_name, name)
					result += `Sensor ${sensor_name} - Metric ${name}, </br>`;					
				});

				result = result.slice(0, -7); // remove last comma
			}

			return result;
		} catch (e) {
			console.warn(e);
		}
	}

	handleChartInitiatedEvent({ target }) {
		this.ChartAPI = target;
		setTimeout(() => {
			this.ChartAPI.redraw(false);			
		}, 100);
	}

	setupUnitTypeName(payload) {
		return getUnitType(payload);
	}

	// --------- Y Axis -------------
	localSetupYAxis({ resources, requestsList }) {
		try {
			// let	paramsBySensors = removeDuplicatesObjectsArray(requestsList, 'sensor_id');
			let	paramsBySensors = removeDuplicatesObjectsArray(requestsList, 'id');

			const YAxisList = resources.chart_config.YAxisList || paramsBySensors;
			const yAxisOptions = resources.chart_config.yAxisOptions || {};
			// const { customYAxisTickPositioner } = resources.chart_config;
			// console.log('localSetupYAxis', this.measurement)

			this.options.yAxis = [];

			YAxisList.forEach((axisSettings = {}, idx) => {
				const units = axisSettings && axisSettings.units;
				let unit_type_name = units || this.setupUnitTypeName({
					parameterItem: axisSettings,
					measurement: this.measurement
				});

				let axis = {
					max: -9999999,
					min: 0,
					softMax: 1,
					title: {
						// useHTML: true,
						text: unit_type_name || ''
					},
					startOnTick: true,
					opposite: !!idx,	
					customSettings: { parameterItem: axisSettings },
					...yAxisOptions,
				};
				// console.log('axisSettings', axisSettings)
				if (axisSettings.injectOptions) {
					axis = mergeObjects(axis, axisSettings.injectOptions);
				}

				this.options.yAxis.push(axis);
			});
		} catch (e) {
			console.warn(e);
		}
	}

	assignDataToYAxis(resultData, additionalProps = {}) {
		// console.log('assignDataToYAxis', resultData.chart_all_data_max_value)
		try {

			this.options.yAxis.forEach(yAxis => {
				const { sensor_id, id } = yAxis.customSettings.parameterItem;
				let sensorStatisticsMax = -999999999;
				let sensorStatisticsMin = 999999999;

				Object.values(resultData.statistics_result).forEach(statisticsItem => {
					if (
						statisticsItem.parameter_item.sensor_id === sensor_id
						&& statisticsItem.parameter_item.id === id
					) {
						if (statisticsItem.all_data_max_value > sensorStatisticsMax) {
							sensorStatisticsMax = statisticsItem.all_data_max_value;
						}
						if (statisticsItem.all_data_min_value < sensorStatisticsMin) {
							sensorStatisticsMin = statisticsItem.all_data_min_value;
						}
					}
				});

				const {
					withoutReserveForMax,
					withoutReserveForMin,
					yAxisOptions
				} = this.resources.chart_config;

				yAxis.max = withoutReserveForMax
					? sensorStatisticsMax
					: sensorStatisticsMax + sensorStatisticsMax / 9;

				yAxis.softMax = withoutReserveForMax
					? sensorStatisticsMax
					: sensorStatisticsMax + sensorStatisticsMax / 9;

				yAxis.max = yAxis.max || 0.1;

				if (!yAxisOptions || !yAxisOptions.min) {
					yAxis.min = sensorStatisticsMin < 0
							? -sensorStatisticsMax
							: 0;

					yAxis.softMin = withoutReserveForMin
						? sensorStatisticsMin
						: sensorStatisticsMin + sensorStatisticsMin / 3;
				}

				yAxis = { ...yAxis, ...additionalProps };
				// console.log(axis, sensor_id, sensorStatisticsMax, sensorStatisticsMin)
			})

		} catch (e) {
			console.warn(e);
		}
	}

	// --------- Series -------------
	isUpdateSeries(resources) {
		return this.measurement !== resources.filters.measurement;
	}

	modifySeriesConfig({ requestsList, seriesConfig }) {
		// const { ncd_active_axial_axis } = this.sensorItem;
		// console.log('modifySeriesConfig', this.measurement, this.options.yAxis)
		requestsList.forEach((parameterItem, idx) => {
			const unit_type_name = this.setupUnitTypeName({
				parameterItem,
				measurement: this.measurement
			});
			const { sensor_id } = parameterItem;
			let actualAxisIdx = 0;

			this.options.yAxis.forEach((axis, idx) => {
				if (
					axis.customSettings.parameterItem.sensor_id === sensor_id
					&& axis.customSettings.parameterItem.id === parameterItem.id
				) {
					actualAxisIdx = idx;
				}
			});

			seriesConfig.pointsData.seriesConfigsList[idx] = [
				{
					id: `serie-${idx}`,
					data_path: '',
					template: 'fft.base',
					responseDataKey: `sensor_${parameterItem.sensor_id}-parameter_${parameterItem.id}`,
					// event_keys: ['pointClickEvent'],
					inject: {
						showInNavigator: true,
						name: `${parameterItem.sensor_name} - ${parameterItem.short_name || parameterItem.name}`,
						tooltip: { valueSuffix: ` ${unit_type_name}` },
						color: colorsList[idx],
						yAxis: actualAxisIdx,
					}
				}
			];
		});

		// console.log('seriesConfig', seriesConfig)
		return seriesConfig;
	}
	// ----------------
	checkIsHasStatistics() {
		return Object.keys(this.fetched_statistics_data).some(key => {
			return this.fetched_statistics_data[key].statistics.length;
		});
	}

	// -----------------
	fetchChartDataAction(/*settings = {}*/) {
		try {
			let requestsQuantity = this.requestsList.length;
			const { graphItemData } = this.resources.payload_1;

			if (this.requestsList.length) {
				if (graphItemData && graphItemData.multi_view_id) {
					requestsQuantity++;
				}

				fetch_multi_views_alerts({
					multiViewId: graphItemData.multi_view_id,
					graphId: graphItemData.id,
					params: { 
						...prepareFilters(this.resources.filters, {
							dateStartKey: 'date_start',
							dateFinishKey: 'date_end'
						})
					}
				}).then(({value}) => {
					// console.log('multi_views_alerts', value)
					const ri = this.requestsList[0];
					const sensorId = ri.sensor_id;

					this.fetched_statistics_data[`sensor_${sensorId}-parameter_${ri.id}`] = {
						...this.fetched_statistics_data[`sensor_${sensorId}-parameter_${ri.id}`],
						issue_alerts: value.issue_alerts
					};

					this.checkStatisticsResponses({requestsQuantity});
				}).catch(() => {
					this.checkStatisticsResponses({requestsQuantity});
				});

				// -----------------------
				
				this.requestsList.forEach(ri => {
					const params = {
						parameter: ri.id,
						...prepareFilters(this.resources.filters)
					};
					const sensorId = ri.sensor_id;

					fetch_sensor_statistics({sensorId, params })
						.then(({statistics}) => {
							// console.log('2 response', response)
							try {
								this.fetched_statistics_data[`sensor_${sensorId}-parameter_${ri.id}`] = {
									...this.fetched_statistics_data[`sensor_${sensorId}-parameter_${ri.id}`],
									parameter_item: ri,
									statistics
								};
								this.checkStatisticsResponses({requestsQuantity});
							} catch (e) {
								console.warn(e);
							}
						})
						.catch(e => {
							console.warn(e)
							this.checkStatisticsResponses({requestsQuantity});
						});
				});

			}
		} catch (e) {
			console.warn(e);
		}
	}
}

export const executeChartFactory = (name, resources) => {
	switch (name) {
		case 'SensorChart':
			return new SensorChart(resources);
		case 'SensorAlarmsChart':
			return new SensorAlarmsChart(resources);
		case 'SensorOverlayChart':
			return new SensorOverlayChart(resources);
		case 'MultiViewChart':
			return new MultiViewChart(resources);
		default:
			return null;
	}
};
