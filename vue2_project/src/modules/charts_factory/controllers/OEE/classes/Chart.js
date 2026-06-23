import ChartBase from '../../../classes/Chart';

import { fetch_process_statistics } from '../api/index.js';
import { cloneDeep, getObjectVal /*, findItemBy*/ } from '@/helpers';

import { prepareFilters } from '../../../helpers';
import { groupDataByTime, oeeTooltipFormatter } from '../methods';
import { setupYAxisPlotlines } from '../../../helpers/series_generator';
// import { setupStatisticsTransformator } from '../StatisticsTransformatorDispatcher';
import { defaultSeriesConfig } from '../chartsListsConfig';

class OEEChart extends ChartBase {
	constructor(resources) {
		// console.log('SensorChart resources', resources)
		super();
		const { processData, breakSerieByDay } = resources.payload_1;
		// const { chart_id, /*config_settings*/ } = resources.chart_config;
		this.processData = processData;
		this.breakSerieByDay = breakSerieByDay;
		this.groupByTimeValue = null;
		// -------------- 3 level payload ----------
		// console.log('constructor', oeeTooltipFormatter())
		let options = {
			chart: { type: 'line', marginBottom: 40, zoomType: 'x' },
			tooltip: {
				shared: false,
				formatter: oeeTooltipFormatter()
			},
			boost: { enabled: false },
			xAxis: {
				type: 'datetime',
				ordinal: false,
				minRange: 60000,
				plotBands: []
			},
			plotOptions: {
				series: { marker: { radius: 3 } }
			}
		};

		this.seriesConfig = this.getSeriesConfig();

		// console.log(this.seriesConfig)
		this.transformator_settings = {
			...this.transformator_settings,
			events: {
				...this.transformator_settings.events,
				handleUpdateSeries: e => this.handleUpdateSeries(e)
			},
			name: 'OEEStatistics',
			specification: {
				getEdgeStatisticsItems: true,
				setupPointsData: {
					method: this.breakSerieByDay
						? 'counters_breakSerieByDay'
						: 'standard_counters',
					offsetWorkBreaks: this.processData.offsetWorkBreaks,
					work_breaks: this.processData.work_breaks
				},
				setupFlagsData: {
					enable_downtimes: true
				}
			}
		};

		// ------------------------------
		// console.log('1', options)
		this.injectProps('options', options);
		// -----------------------------------------
		this.finalSetup(resources, { skipSeriesGeneration: true });
	}

	handleChartInitiatedEvent({ target }) {
		this.ChartAPI = target;
	}

	checkIsHasStatistics() {
		return true;
	}

	handleChangeGroupByTime(val) {
		// console.log('groupByTimeValue', val)
		this.setValue('groupByTimeValue', val);
		try {
			const newResultData = this.statisticsPostTransform(
				this.getTransformedStatistics()
			);
			this.assignDataToYAxis(newResultData);

			const { base } = newResultData.statistics_result.counters.pointsData;
			const settingsList = base.map((statistics, idx) => ({
				serie_id: `counters-serie-${idx}`,
				key: 'data',
				value: statistics
			}));
			this.handleUpdateSeries({ settingsList, emitOptionsUpdate: true });
		} catch (e) {
			console.warn(e);
		}

		// this.emitChartOptionsReady();
	}

	statisticsPostTransform(resultData) {
		if (this.groupByTimeValue) {
			let newResultData = cloneDeep(resultData);
			let { base } = newResultData.statistics_result.counters.pointsData;
			let newBase = [],
				newMax = -999999;

			if (!this.breakSerieByDay) base = [base];

			base.forEach(statistics => {
				const { groupedStatistics, max_value } = groupDataByTime({
					statistics,
					groupByTimeValue: this.groupByTimeValue
				});
				newBase.push(groupedStatistics);
				if (max_value > newMax) newMax = max_value;
			});

			// console.log(newBase)
			newResultData.statistics_result.counters.pointsData.base = newBase;
			newResultData.chart_points_max_value = newMax;

			return newResultData;
		}

		return resultData;
	}

	localHandleStatisticsTransformUpdated(resultData) {
		if (this.breakSerieByDay) {
			const { base } = resultData.statistics_result.counters.pointsData;
			this.seriesConfig = this.modifySeriesConfigByStatistics({
				seriesConfig: this.seriesConfig,
				statistics: base
			});
			this.options.series = this.generateSeries({
				seriesConfig: this.seriesConfig,
				seriesEvents: this.seriesEvents,
				chart_id: this.chart_id
			});
		}
		this.assignDataToYAxis(resultData);
		this.assignDataToSeries(resultData);
		this.setupPlotBands(resultData);
		this.emitChartOptionsReady();
	}
	// --------- X Axis -------------
	setupPlotBands(resultData) {
		const {
			work_breaks_statistics
		} = resultData.statistics_result.counters.pointsData;

		this.options.xAxis.plotBands = work_breaks_statistics.map(wb => ({
			...wb,
			color: 'rgba(0, 0, 0, 0.2)',
			zIndex: 10,
			className: 'break-time-plotband',
			events: {
				click: () =>
					this.events.plotBandsClickEvent({
						work_break: wb.payload.work_break,
						chartId: this.chart_id
					})
			}
			// payload: {}
		}));
	}

	// --------- Y Axis -------------
	localSetupYAxis({ resources, requestsList }) {
		try {
			const YAxisList = resources.chart_config.YAxisList || [requestsList[0]];
			const yAxisOptions = resources.chart_config.yAxisOptions || {};

			// console.log('localSetupYAxis', resources)
			this.options.yAxis = [];
			YAxisList.forEach((axis_options, axisIdx) => {
				let axis = {
					...axis_options,
					max: -99999,
					...yAxisOptions
				};

				const { plotlinesData } = this.seriesConfig;

				if (
					plotlinesData &&
					plotlinesData.plotlinesConfigsList &&
					plotlinesData.plotlinesConfigsList[0]
				) {
					axis.plotLines = setupYAxisPlotlines({
						plotlinesConfigsList: plotlinesData.plotlinesConfigsList[0],
						axisIdx,
						data_key: 'plotlines_data'
					});
				}

				this.options.yAxis.push(axis);
			});
		} catch (e) {
			console.warn(e);
		}
	}

	assignDataToYAxis(resultData, additionalProps = {}) {
		try {
			let yAxisCopy = cloneDeep(this.options.yAxis);
			const { chart_points_max_value } = resultData;
			const { counters } = resultData.statistics_result;
			const { max_ability_value } = counters.plotlines_data;

			yAxisCopy.forEach((yAxis, idx) => {
				if (idx == 0) {
					yAxis.max = Math.floor(chart_points_max_value * 3);
				} else if (idx == 1 && yAxis.plotLines.length) {
					yAxis.max =
						chart_points_max_value > max_ability_value
							? chart_points_max_value
							: Math.floor(max_ability_value + max_ability_value / 20);
				}
				yAxis = { ...yAxis, ...additionalProps };

				if (yAxis.plotLines) {
					yAxis.plotLines.forEach(plotline => {
						let { data_accessor } = plotline.customSettings;
						plotline.value = getObjectVal(counters, data_accessor);
					});
				}
			});
			// console.log('assignDataToYAxis', yAxisCopy)

			this.options.yAxis = yAxisCopy;
		} catch (e) {
			console.warn(e);
		}
	}

	// --------- Series -------------
	getSeriesConfig(payload) {
		return defaultSeriesConfig(payload);
	}

	modifySeriesConfig({ seriesConfig }) {
		return seriesConfig;
	}

	modifySeriesConfigByStatistics({ statistics, seriesConfig }) {
		let newSeriesConfigsList = seriesConfig.pointsData.seriesConfigsList[0].filter(
			si => si.type != 'counters-serie' && si.type != 'totalWorkdayCount-serie'
		);
		statistics.forEach((day, idx) => {
			newSeriesConfigsList.push(
				{
					id: `counters-serie-${idx}`,
					type: 'counters-serie',
					data_path: `base.${idx}`,
					customSettings: {
						responseDataKey: 'counters',
					},
					template: 'oee.counters'
				},
				{
					id: `totalWorkdayCount-serie-${idx}`,
					type: 'totalWorkdayCount-serie',
					data_path: `total.${idx}`,
					template: 'oee.totalWorkday',
					customSettings: {
						responseDataKey: 'counters',
					},
					axis_index: 1
					// setupSerieOptions: [{ key:'data', method: setupTotalCount, payload: day }]
				}
			);
		});
		seriesConfig.pointsData.seriesConfigsList[0] = newSeriesConfigsList;
		return seriesConfig;
	}

	// -------------Live Update-------
	handleCountersLiveUpdate(answer) {
		const { type, data } = answer;
		const { actual_capacity, counter, downtime, totalDowntime } = data;
		// const safeData = data.data || {};

		let values,
			specification = {};
		// let updateSeries;
		// console.log('handleCountersLiveUpdate', answer)
		if (type.toLowerCase() == 'job') {
			values = [
				{ accessor: `counters`, value: counter },
				{ accessor: `actual_capacity`, value: actual_capacity }
			];

			// updateSeries = [{ findBy: 'custom_id', isLast: true, serie_id: 'count' }];
			specification = {
				setupPointsData: this.transformator_settings.specification.setupPointsData
			};
		} else if (type == 'downtime') {
			values = [
				{ accessor: `downtimes`, value: downtime },
				{ accessor: `totalDowntimes`, value: totalDowntime || {} }
			];
			// updateSeries = [{ serie_id: 'countdowntime-flag-serie' }];
			specification = {
				setupFlagsData: this.transformator_settings.specification.setupFlagsData
			};
		}

		this.addToFetchedStatistics({
			values,
			transformatorSettings: {
				useCurrentResultData: true,
				specification
				// updateSeries
			}
		});
	}

	/*localHandleUpdateSerie({resultData}) {

	}*/

	// -----------------
	isUpdateSeries() {
		return false;
	}

	fetchChartDataAction(settings = {}) {
		try {
			const processId = this.processData.id;

			this.requestsList.forEach(() => {
				const params = { ...prepareFilters(this.resources.filters, settings) };

				fetch_process_statistics({ processId, params })
					.then(({ value }) => {
						// console.log('2 response', value)
						try {
							this.fetched_statistics_data = value;

							this.checkStatisticsResponses();
						} catch (e) {
							console.warn(e);
						}
					})
					.catch(e => {
						// console.log('catch')
						this.checkStatisticsResponses(e);
					});
			});
		} catch (e) {
			console.warn(e);
		}
	}
}

// export const executeOEEChartFactory = resources => new OEEChart(resources);

export const executeChartFactory = (name, resources) => {
	switch (name) {
		case 'OEEChart':
			return new OEEChart(resources);
		default:
			return null;
	}
};
