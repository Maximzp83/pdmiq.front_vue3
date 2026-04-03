import ChartsListFactoryBase from '../../../classes/ChartsListFactory';
import { findItemBy, convertDateToISOString } from '@/helpers';
import { isValidPointsData } from '../methods';

// import { sensorParametersGetter, /*sensorChartsResourcesGetter*/ } from '../../helpers';
// import { executeChartFactory } from '../../classes/Chart';
import { Lang } from '@/localization';
import { ADJUSTMENT_STATUSES } from '@/constants/ultrasound';

const localChartsListDataReady = (ChartsFactory, payload) => {
	let finalSkipDataPointsListForAllCharts = [];
	// console.log('localChartsListDataReady', ChartsFactory)
	ChartsFactory.chartsInstancesList.forEach(Chart => {
		if (Chart.preTransformSettings) {
			const { skipDataPointsListForAllCharts } = Chart.preTransformSettings;

			if (skipDataPointsListForAllCharts) {
				finalSkipDataPointsListForAllCharts = finalSkipDataPointsListForAllCharts.concat(skipDataPointsListForAllCharts);
			}
		}
	})
		// console.log('finalSkipDataPointsListForAllCharts 1', finalSkipDataPointsListForAllCharts)
		// console.time('delete duplicates')
	finalSkipDataPointsListForAllCharts = Array.from(new Set(finalSkipDataPointsListForAllCharts));

		// console.timeEnd('delete duplicates')
	let allDataCount;
	Object.keys(ChartsFactory.chartsInstancesList[0].fetched_statistics_data).forEach(key => {
		allDataCount = ChartsFactory.chartsInstancesList[0].fetched_statistics_data[key].statistics.length
	})

	console.log('All fetched Data Points count: ', allDataCount);
	console.log('Data Points for Delete count: ', finalSkipDataPointsListForAllCharts.length)

	ChartsFactory.chartsInstancesList.forEach(Chart => {
		if (Chart.preTransformSettings) {
			let transformSettings = {};
			const { 
				filterStatisticsBySkipDataPointsList_AllCharts,
				filterStatisticsBySkipDataPointsList,
				skipDataPointsList,
				skipStandardTransform
			} = Chart.preTransformSettings;


			if (filterStatisticsBySkipDataPointsList_AllCharts) {
				transformSettings.skipDataPointsList = finalSkipDataPointsListForAllCharts;
			}

			if (filterStatisticsBySkipDataPointsList) {
				transformSettings.skipDataPointsList = transformSettings.skipDataPointsList || [];
				transformSettings.skipDataPointsList = transformSettings.skipDataPointsList.concat(skipDataPointsList);
			}
			// console.log(Chart.chart_id, Chart.preTransformSettings)

			if (skipStandardTransform) {
				Chart.transformStatistics(transformSettings);					
			}

			Chart.preTransformSettings = null;
		}
	})
	let statistics_result = ChartsFactory.chartsInstancesList[0].getTransformedStatistics({
		statistics_result:1,
		// parameterId: ChartsFactory.chartsInstancesList[0].requestsList[0].id
	});

	if (statistics_result && statistics_result.pointsData) {
		let {alarm, base, warning} = statistics_result.pointsData;
		alarm = alarm || [];
		base = base || [];
		warning = warning || [];
		console.log('Data Points Rendered on Each Chart: ', alarm.length + base.length + warning.length);
	}

		// --------------------------------
	ChartsFactory.isChartsDataReady = true;
	ChartsFactory.handleChartsListDataReady(payload);

	if (ChartsFactory.events.chartsListWrapperLoading) {
		ChartsFactory.events.chartsListWrapperLoading(false);
	}
}

class SensorChartsListFactory extends ChartsListFactoryBase {
	constructor(resources) {
		super();
		this.sensorItem = resources.payload_1.sensorItem;
		this.currentSensorType = resources.payload_1.currentSensorType;
		this.localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		
		if (this.currentSensorType.isBannerV2_1) {
			this.events.checkRequestForDuplicates = e => this.handleCheckRequestForDuplicates(e);
			this.events.duplicateRequestResponse = e => this.handleDuplicateRequestResponse(e);
		}
		this.events.navigatorChangeHandler = e => this.syncNavigatorPositionInCharts(e);

		this.useResources(resources);
		// console.log('SensorChartsListFactory', resources, this)
	}

	/*if (metricSystemType === METRIC_SYSTEM_TYPES.IMPERIAL) {
								data.unit = data.imperial_unit_value;
							} else if (metricSystemType === METRIC_SYSTEM_TYPES.METRIC) {
								data.unit = data.metric_unit_value;
							}*/

	handlePointsLiveUpdate(data) {
		// const { time_zone } = this.sensorItem.controller;
		data.signal_date_at = convertDateToISOString(data.signal_date_at, {
			timeZone: this.localTimeZone
		});
		// console.log(this.localTimeZone, data.signal_date_at)
		const { daterange } = this.resources.filters;
		// console.log('handlePointsLiveUpdate', daterange)
		if (isValidPointsData({ data, daterange })) {
			const chart_id = `chart-${data.parameter_type}`;
			const ChartInstance = findItemBy(
				'chart_id',
				chart_id,
				this.chartsInstancesList
			);
			if (ChartInstance) {
				if (ChartInstance.localLiveUpdateDataModify) {
					data = ChartInstance.localLiveUpdateDataModify(data);
				}

				ChartInstance.addToFetchedStatistics({
					values: [
						{ accessor: `parameter_${data.parameter_type}.statistics`, value: data }
					],
					transformatorSettings: {
						useCurrentResultData: true,
						specification: ChartInstance.transformator_settings.specification
						// updateSeries: [{ serie_id: 'count' }]
					}
				});
			}
		}
	}

	handleLubePointsLiveUpdate(data) {
		if (data && this.chartsInstancesList[0]) {
			// console.log(data)
			data.created_at = convertDateToISOString(data.created_at, {
				timeZone: this.localTimeZone
			});

			this.chartsInstancesList[0].addToFetchedStatistics({
				values: [
					{
						accessor: 'lube.history',
						value: data,
						useFirstStatisticsParameter: true
					}
				],
				transformatorSettings: {
					useCurrentResultData: true,
					specification: {
						setupFlagsData: this.chartsInstancesList[0].transformator_settings
							.specification.setupFlagsData
					},
					updateSeries: [{ serie_id: 'lube-flag-serie' }]
				}
			});
		}
	}

	handleAdjustmentsLiveUpdate({ data, settings }) {
		if (data && this.chartsInstancesList[0]) {
			if (data.sensor_id === this.sensorItem.id) {
				let type = '',
					title = '',
					message = '';
				const { set_sensor_state, $notify } = settings;

				if (data.status === ADJUSTMENT_STATUSES.PROCESS) {
					type = 'success';
					message = Lang.tt(`phrases.command_sent_successfully`);
				} else if (data.status === ADJUSTMENT_STATUSES.CONTROLLER_TIMEOUT) {
					type = 'error';
					title = Lang.tt('error');
					message = Lang.tt(`phrases.controller_timeout`);

					set_sensor_state({
						stateProp: 'gainAdjustmentInProcess',
						value: false
					});
				} else {
					if (data.status === ADJUSTMENT_STATUSES.SUCCESS) {
						type = 'success';
						message = Lang.tt(`phrases.gain_adjustment_successful`);
					} else if (data.status === ADJUSTMENT_STATUSES.FAIL) {
						type = 'error';
						message = Lang.tt(`phrases.gain_adjustment_failed`);
					}

					data.created_at = convertDateToISOString(data.created_at, {
						timeZone: this.localTimeZone
					});

					this.chartsInstancesList[0].addToFetchedStatistics({
						values: [
							{
								accessor: 'gainAdjustments',
								value: data,
								useFirstStatisticsParameter: true
							}
						],
						transformatorSettings: {
							useCurrentResultData: true,
							specification: {
								setupFlagsData: this.chartsInstancesList[0].transformator_settings
									.specification.setupFlagsData
							}
							// updateSeries: [{ serie_id: 'lube-serie' }]
						}
					});
					set_sensor_state({
						stateProp: 'gainAdjustmentInProcess',
						value: false
					});
				}
				$notify({ type, title, message });
			}
		}
	}

	setYFiltersToCharts(y_filters) {
		this.chartsInstancesList.forEach(Chart => {
			const forThisChartFilters = y_filters[Chart.chart_id];
			if (forThisChartFilters) {
				if (Chart.resources.y_filters.y_min != forThisChartFilters.y_min) {
					Chart.setYFilters(forThisChartFilters);
				}
			}
		});
	}

	/*localAdditionalChartsConfigsListSetup(charts_configs) {
		// console.log('localAdditionalChartsConfigsListSetup', this)
		const { parseChartsConfigsListForDuplicates } = this.resources.settings;
		
		if (parseChartsConfigsListForDuplicates) {
			//
		}

		return charts_configs;
	}*/

	handleCheckRequestForDuplicates(requestItem) {
		return this.chartsInstancesList.some(Chart => {
			return Chart.requestsList.some(request => {
				// console.log('request', request.id, requestItem.id, request.alreadyInUse)
				return request.id === requestItem.id && request.alreadyInUse;
			})
		});
	}

	/*handleCheckRequestHasStatistics(requestItem) {
		this.chartsInstancesList.forEach(Chart => {
			Chart.requestsList.forEach(request => {
				if (request.id === requestItem.id && request.waitingForDuplicateResponse) {
					Chart.resolveDuplicateResponse({request, response});
				}
			})
		})
	}*/

	handleDuplicateRequestResponse({requestItem, response}) {
		this.chartsInstancesList.forEach(Chart => {
			Chart.requestsList.forEach(request => {
				if (request.id === requestItem.id && request.waitingForDuplicateResponse) {
					Chart.resolveDuplicateResponse({request, response});
				}
			})
		})
	}

	syncNavigatorPositionInCharts(payload) {
		this.chartsInstancesList.forEach(Chart => {
			if (Chart.syncNavigatorPosition) {
				Chart.syncNavigatorPosition(payload);
			}
		});
	}

	localChartsListDataReady(payload) {
		return localChartsListDataReady(this, payload);
	}

	chartsListWrapperReadyCallback() {
		let duplicate_notes_statistics = [];

		this.chartsInstancesList.forEach(Chart => {
			const chart_notes = Chart.getTransformedStatistics({data_key: 'flagsData.notes_statistics'});
			if (chart_notes) {
				duplicate_notes_statistics = duplicate_notes_statistics.concat(chart_notes);
			}
		});


		if (this.hasStatistics && duplicate_notes_statistics.length) {
			this.chartsInstancesList.forEach(Chart => {
				if (Chart.hasStatistics) {
					// console.log('chartsListWrapperReadyCallback', Chart)
					Chart.StatisticsTransformator.updateResultData({
						settingsList: [
							{
								to_statistics_result: true,
								accessor: 'flagsData.duplicate_notes_statistics',
								value: duplicate_notes_statistics,
								emitOptionsUpdate: true,
								updateSeries: [
									{
										serie_id: 'duplicate-note-flag-serie',
										accessor: 'data',
										value: duplicate_notes_statistics
									}
								]
							}
						],
						additionalSettings: {}
					});
				}
			});
		}
	}
	
}

class FFTChartsListFactory extends ChartsListFactoryBase {
	constructor(resources) {
		super();
		this.events = {
			...this.events,
			rpmCursorDragFactoryHandler: payload => this.syncRpmCursorsInCharts(payload)
		};
		// this.sensorItem = resources.payload_1.sensorItem;
		this.useResources(resources);
		// console.log('SensorChartsListFactory', resources, this)
	}
}

class SensorAlarmsChartsListFactory extends ChartsListFactoryBase {
	constructor(resources) {
		super();
		this.sensorItem = resources.payload_1.sensorItem;
		this.currentSensorType = resources.payload_1.currentSensorType;
		this.localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		
		if (this.currentSensorType.isBannerV2_1) {
			this.events.checkRequestForDuplicates = e => this.handleCheckRequestForDuplicates(e);
			this.events.duplicateRequestResponse = e => this.handleDuplicateRequestResponse(e);
		}
		this.useResources(resources);
	}

	getSensorsAlarmsChartsForms() {
		return this.chartsInstancesList.map(ChartInstance =>
			ChartInstance.getFormData()
		);
	}

	localChartsListDataReady(payload) {
		return localChartsListDataReady(this, payload);
	}

	handleCheckRequestForDuplicates(requestItem) {
		return this.chartsInstancesList.some(Chart => {
			return Chart.requestsList.some(request => {
				return request.id === requestItem.id && request.alreadyInUse;
			});
		});
	}

	handleDuplicateRequestResponse({requestItem, response}) {
		this.chartsInstancesList.forEach(Chart => {
			Chart.requestsList.forEach(request => {
				if (request.id === requestItem.id && request.waitingForDuplicateResponse) {
					Chart.resolveDuplicateResponse({request, response});
				}
			});
		});
	}
}

export const executeChartsListFactory = (name, settings) => {
	switch (name) {
		case 'sensorChartsListFactory':
			return new SensorChartsListFactory(settings);
		case 'sensorAlarmsChartsListFactory':
			return new SensorAlarmsChartsListFactory(settings);
		case 'FFTChartsListFactory':
			return new FFTChartsListFactory(settings);

		default:
			return null;
	}
};
