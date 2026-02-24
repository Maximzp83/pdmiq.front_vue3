import {
	mergeObjects,
	setObjectVal,
	cloneDeep,
	getObjectVal,
	findItemBy
} from '@/helpers';

import {
	generateSeries,
	executeMethodFromList,
	assignEventsForSerie
} from '../helpers/series_generator';
import { setupStatisticsTransformator } from '../dispatchers/StatisticsTransformatorDispatcher';

export default class ChartBase {
	constructor() {
		this.ChartAPI;
		this.chartTitle = '';

		this.options = {
			chart_id: null,
			chart: {
				animation: true,
				panning: { enabled: false },
				events: {
					load: e => this.emitChartLoadEvent(e),
					render: e => this.emitChartRenderEvent(e)
				},
				zooming: {
					mouseWheel: { enabled: false }
				}
			},
			boost: {
				enabled: true,
				// useGPUTranslations: true,
				// usePreallocated: true,
			},
			title: { text: '' },
			legend: {
				enabled: false
			},
			xAxis: {},
			yAxis: {},
			rangeSelector: { enabled: false },
			scrollbar: { liveRedraw: false },
			tooltip: {
				shared: true,
				// valueDecimals: 2,
				valuePrefix: '',
				valueSuffix: ''
			},

			plotOptions: {
				series: {
					point: {
						events: {
							// click: () => {}
						}
					},

					dataGrouping: { enabled: false },
					boostThreshold: 1000,
					turboThreshold: 1000,

					stickyTracking: false,
					animation: true,
					states: {
						hover: { lineWidthPlus: 0 },
						inactive: { opacity: 1 }
					}
				}
			},

			series: []
		};

		this.settings = {
			// fetchStatisticsActionName: '',
			// statisticsTransformatorName: undefined
		};

		this.transformator_settings = {
			events: {
				statisticsTransformReady: (data, settings) =>
					this.handleStatisticsTransformReady(data, settings),
				statisticsTransformUpdated: data =>
					this.handleStatisticsTransformUpdated(data)
			}
		};

		this.events = {
			seriesEvents: events => this.assignSeriesEvents(events)
			// chartOptionsReady: (data) => this.handleChartOptionsReady(data),
			// isLoading: () => {}
		};
		this.seriesEvents = null;

		this.resources;

		this.requestsList = [];
		this.isLoading = false;
		this.isRendering = false;
		this.statisticsResponsesReady = false;
		this.hasStatistics = false;

		this.StatisticsTransformator = null;
		this.seriesConfig = null;

		this.responseCounter = 0;

		this.fetched_statistics_data = {};
		// this.isInitialFetch = true;
		// this.statisticsMemorySize;
	}

	finalSetup(resources, settings = {}) {
		// сомнительно
		const { chart_config, events } = resources;
		this.resources = resources;
		this.options.chart_id = chart_config.chart_id;
		this.chart_id = chart_config.chart_id;
		this.chartTitle = chart_config.chartTitle;
		this.events = mergeObjects(this.events, events);
		this.initialPreTransformSettings = chart_config.preTransformSettings;
		if (this.initialPreTransformSettings) {
			this.preTransformSettings = cloneDeep(this.initialPreTransformSettings);			
		}

		// console.log('finalSetup', this.chart_id, chart_config)
		// ------Parse settings payloads---------
		this.parsePayloads(resources, [
			{ prop: 'setFilters', method: 'setFilters' },
			{ prop: 'requestsList', method: 'injectProps', to: 'requestsList' },
			{
				prop: 'transformator_settings',
				method: 'injectProps',
				to: 'transformator_settings'
			}
		]);

		// this.transformator_settings = this.setupTransformatorSettings(this.resources);

		if (this.allSettingsParsedCallback)
			this.allSettingsParsedCallback(this.resources);

		// ------Parse payloads for final injections ---------
		this.parsePayloads(resources, [
			{ prop: 'inject_options', method: 'injectProps', to: 'options' },
			{ prop: 'inject_settings', method: 'injectProps', to: 'settings' },
			// seriesConfig - step 2 (use data from chart_config)
			{ prop: 'seriesConfig', method: 'injectProps', to: 'seriesConfig' }, 
			{ prop: 'setValue', method: 'setValue' }
		]);
		// console.log('seriesConfig step 2', this.chart_id, this.seriesConfig)

		// --------Building-----
		if (!this.chartTitle && this.setupChartTitle) {
			this.chartTitle = this.setupChartTitle(this.resources);
		}

		this.setupYAxis({
			resources: this.resources,
			requestsList: this.requestsList
		});

		this.setupXAxis({
			resources: this.resources,
			requestsList: this.requestsList
		});
		
		// seriesConfig - step 3
		this.seriesConfig = this.modifySeriesConfig({
			seriesConfig: this.seriesConfig,
			requestsList: this.requestsList,
			resources: this.resources
		});
		// seriesConfig - finish (should be)

		/*if (this.chart_id === 'chart-25') {
			console.log('seriesConfig final', this.chart_id, this.seriesConfig)
		}*/

		if (!settings.generateSeriesByStatistics) {
			this.options.series = this.generateSeries({
				seriesConfig: this.seriesConfig,
				seriesEvents: this.seriesEvents,
				chart_id: this.chart_id
			});
			
			if (this.seriesCreatedCallback) {
				this.seriesCreatedCallback(this.options.series);
			}
		}

		if (this.transformator_settings.name) {
			// console.log('create StatisticsTransformator')
			this.StatisticsTransformator = this.createStatisticsTransformator({
				transformator_settings: this.transformator_settings,
				resources: this.resources,
				chart_id: this.chart_id,
				seriesConfig: this.seriesConfig,
				// events: this.events,
			});
		}

		if (this.finalSetupReadyCallback) this.finalSetupReadyCallback(this.resources);

		this.emitChartOptionsInitiated();
		// console.log('initial', this.requestsList)
		// this.emitChartOptionsReady();
	}

	parsePayloads(resources, settingsList = []) {
		try {
			// revert to settingsList.forEach
			[
				'chart_config',
				'constructor_payload',
				'settings_payload',
				'payload_1'
			].forEach(key => {
				const keyValue = resources[key];
				if (keyValue) {
					settingsList.forEach(({ prop, method, to }) => {
						// console.log('parsePayloads', key, keyValue, prop, method, to)
						if (keyValue[prop]) {
							if (method == 'setValue') this.setValue(...keyValue[prop]);
							else if (method == 'setFilters') this.setFilters(keyValue[prop]);
							else this[method](to, keyValue[prop]);
						}
					});
				}
			});
		} catch (e) {
			console.warn(e);
		}
	}

	getChartOptions() {
		return cloneDeep(this.options);
	}

	createStatisticsTransformator({
		transformator_settings,
		resources,
		seriesConfig,
		chart_id
	}) {
		const { name, specification, events } = transformator_settings;
		return setupStatisticsTransformator(name, {
			specification,
			resources,
			events,
			seriesConfig,
			chart_id
		});
	}

	assignChartEvents(events) {
		let finalEventsList = { ...events };

		if (this.localChartEvents) {
			finalEventsList = { ...finalEventsList, ...this.localChartEvents };
		}
		if (finalEventsList) {
			this.options.chart.events = {
				...this.options.chart.events,
				...finalEventsList
			};
		}
	}

	assignSeriesEvents(eventsList) {
		try {
			let finalEventsList = { ...eventsList };

			if (this.localSeriesEvents) {
				finalEventsList = { ...finalEventsList, ...this.localSeriesEvents };
			}
			// console.log('assignSeriesEvents', finalEventsList)
			if (finalEventsList) {
				this.options.series = this.options.series.map(serie => {
					return assignEventsForSerie({
						serieItem: serie,
						eventsList: finalEventsList,
						// finalEventsList,
						chart_id: this.chart_id
					});
				});
			}
		} catch (e) {
			console.warn(e);
		}
	}

	assignPlotOptionsEvents(eventsList) {
		try {
			if (eventsList) {
				eventsList.forEach(eventItem => {
					this.options.plotOptions[eventItem.plotOptionKey] = this.options
						.plotOptions[eventItem.plotOptionKey] || {
						point: { events: {} }
					};

					this.options.plotOptions[eventItem.plotOptionKey].point.events[
						eventItem.name
					] = eventItem.event;
				});
			}
		} catch (e) {
			console.warn(e);
		}
	}

	assignSpecificOptionsEvents(eventsList) {
		try {
			if (eventsList) {
				eventsList.forEach(eventItem => {
					setObjectVal(this.options, eventItem.accessor, eventItem.event);
				});
			}
		} catch (e) {
			console.warn(e);
		}
	}

	// ----------Series---------
	generateSeries(payload) {
		return generateSeries(payload);
	}

	updateSeries({ requestsList, resources, seriesConfig }) {
		// refactor
		this.seriesConfig = this.modifySeriesConfig({
			requestsList,
			resources,
			seriesConfig
		});
		// console.log('updateSeries', this.seriesConfig)
		this.options.series = this.generateSeries({
			seriesConfig: this.seriesConfig,
			seriesEvents: this.seriesEvents,
			chart_id: this.chart_id
		});
	}

	handleUpdateSeries({ settingsList, emitOptionsUpdate, resultData }) {
		settingsList.forEach(si => {
			let { findBy, serie_id, accessor, key, value, isLast } = si;
			findBy = findBy || 'id';
			let serie = findItemBy(findBy, serie_id, this.options.series, {
				last: isLast
			});

			// console.log('handleUpdateSeries', this.chartTitle)
			if (serie) {
				if (value) {
					// console.log(key, serie, accessor, value)
					if (key) serie[key] = value;
					else setObjectVal(serie, accessor, value);
				} else {
					this.assignDataToSpecificSerie(serie, resultData);
				}
			}
		});

		if (this.localHandleUpdateSerie) {
			this.localHandleUpdateSerie({ settingsList, emitOptionsUpdate, resultData });
		}
		if (emitOptionsUpdate && this.events.chartOptionsUpdate) {
			this.events.chartOptionsUpdate(this.options);
		}
	}

	assignDataToSpecificSerie(serie, resultData) {
		let {
			responseDataKey,
			data_accessor,
			setupSeriePropValue
		} = serie.customSettings;
		// console.log(serie, resultData, this.requestsList)
		if (resultData) {
			// console.log('assignDataToSpecificSerie', responseDataKey, serie, Object.keys(resultData.statistics_result))
			const parameterId = this.requestsList[0]?.id;

			responseDataKey =
				responseDataKey ||
				(parameterId ? `parameter_${parameterId}` : null);

			// console.log(/*resultData.statistics_result,*/ this.chart_id, serie.id, responseDataKey, /*resultData.statistics_result[responseDataKey]*/)
			if (!resultData.statistics_result[responseDataKey]) {
				responseDataKey = 'main';
			}

			if (resultData.statistics_result[responseDataKey]) {
				serie.data = getObjectVal(
					resultData.statistics_result[responseDataKey],
					data_accessor
				) || [];

				if (setupSeriePropValue) {
					setupSeriePropValue.forEach(oi => {
						const { key, data_accessor, methodName, payload } = oi;
						if (methodName) {
							serie[key] = executeMethodFromList(methodName)({
								statistics: resultData.statistics_result[responseDataKey],
								resources: this.resources,
								payload
							});
						} else {
							serie[key] = getObjectVal(
								resultData.statistics_result[responseDataKey],
								data_accessor
							);
						}
					});
				}
			} else {
				console.warn('Wrong responseDataKey - ', responseDataKey);
			}
		}
	}

	assignDataToSeries(resultData, settings = {}) {
		try {
			// console.log('assignDataToSeries', this.options.series)
			this.options.series.forEach(serie => {
				if (
					!settings.exceptList ||
					!settings.exceptList.some(ei => serie[ei.key] == ei.val)
				) {
					this.assignDataToSpecificSerie(serie, resultData);
				}
			});
			// console.log('assignDataToSeries', resultData.chart_id, resultData.chart_first_statistics_item )

			// this.options.series = this.options.series.filter(serie => serie.data);
			// console.log('assignDataToSeries end')
			if (this.assignDataToSeriesReadyCallback) {
				this.assignDataToSeriesReadyCallback(this.options.series);
			}
		} catch (e) {
			console.warn(e);
		}
	}

	// -------------------------------
	cleanupSeriesData() {
		this.options.series.forEach(serie => {
			serie.data = [];
		});
	}

	transformStatistics(settings = {}) {
		const methodName = settings.transformMethodName || 'transform';

		// console.time('transformStatistics')
		this.StatisticsTransformator[methodName](this.fetched_statistics_data, {
			...settings
		});
		// console.timeEnd('transformStatistics')
	}

	usePreTransformSettings(settings) {
		const { callMethod, skipStandardTransform } = settings;
		let returns = { next: true };
		// console.log(settings)
		if (callMethod && this[callMethod.name]) {
			this[callMethod.name](callMethod.payload);
		}

		if (skipStandardTransform) {
			returns.next = false;
		}
		return returns;
	}

	checkStatisticsResponses(settings = {}) {
		const requestsQuantity = settings.requestsQuantity || this.requestsList.length;
		this.responseCounter++;
		// console.log('checkStatisticsResponses', this.chart_id, this.responseCounter, 'requestsQuantity', requestsQuantity, 'settings', settings.requestsQuantity, 'this.requestsList: ', this.requestsList.length)
		if (this.responseCounter === requestsQuantity) {
			if (this.onStatisticsResponsesReady) {
				this.onStatisticsResponsesReady();
			}
			// console.log('3', this.responseCounter, requestsQuantity)
			this.setValue('statisticsResponsesReady', true);
			this.setValue('hasStatistics', this.checkIsHasStatistics());

			let isTransform = (this.StatisticsTransformator && this.hasStatistics);

			if (this.preTransformSettings) {
				const {next} = this.usePreTransformSettings(this.preTransformSettings);
				isTransform = next;
			}

			// console.log(isTransform)
			if (isTransform) {
				if (settings.sortStatisticKeys && this.sortStatisticKeys) {
					this.fetched_statistics_data = this.sortStatisticKeys(
						this.fetched_statistics_data
					);
				}

				this.transformStatistics({
					updateChartsReadyCounter: true,
					updateChartDataReady: true,
					...this.preTransformSettings
				});

				// this.handleStatisticsTransformReady();

				// this.statisticsMemorySize = Buffer.from(JSON.stringify(this.fetched_statistics_data)).length;
			} else {
				if (!this.hasStatistics) this.cleanupSeriesData();

				if (this.events.handleChartDataReady) {
					this.events.handleChartDataReady({
						isReady: true,
						hasStatistics: this.hasStatistics
					});
				} else if (this.events.changeChartsReadyCounter) {
					this.events.changeChartsReadyCounter(1, {
						chart_id: this.chart_id,
						hasStatistics: this.hasStatistics
					});
				}

					// console.log('dfg', this.preTransformSettings)
				if (!this.preTransformSettings || !this.preTransformSettings.skipStandardTransform) {
					this.setValue('isLoading', false);
				}
				// this.setValue('isRendering', false);
			}

			if (this.localStatisticsResponsesReady) {
				this.localStatisticsResponsesReady();
			}
		}
	}

	fetchChartData(settings = {}) {
		try {
			if (this.initialPreTransformSettings) {
				this.preTransformSettings = cloneDeep(this.initialPreTransformSettings);			
			}
			if (this.events.handleChartDataReady) {
				this.events.handleChartDataReady({
					isReady: false,
					hasStatistics: this.hasStatistics
				});
			} else if (this.events.changeChartsReadyCounter) {
				this.events.changeChartsReadyCounter(-1);
			}
			this.setValue('statisticsResponsesReady', false);
			this.responseCounter = 0;

			// if (Object.keys(filters).length) this.setFilters(filters);

			if (this.isUpdateSeries(this.resources)) {
				this.updateSeries({
					requestsList: this.requestsList,
					resources: this.resources,
					seriesConfig: this.seriesConfig
				});
				this.setupYAxis({
					resources: this.resources,
					requestsList: this.requestsList
				});
			}

			this.setValue('isLoading', true);
			// console.log('fetchChartData 2')

			this.fetchChartDataAction(settings);
		} catch (e) {
			console.warn(e);
		}
	}

	setupYAxis(payload) {
		if (this.localSetupYAxis) {
			this.localSetupYAxis(payload);
		} else {
			// this.options.yAxis = {};
		}
	}

	setupXAxis(payload) {
		if (this.localSetupXAxis) {
			this.localSetupXAxis(payload);
		} else {
			// this.options.yAxis = {};
		}
	}

	getTransformedStatistics(settings = {}) {
		if (this.StatisticsTransformator) {
			if (settings.includeResources) {
				return {
					...this.StatisticsTransformator.getTransformedStatistics(settings),
					resources: this.resources
				};
			} else {
				return this.StatisticsTransformator.getTransformedStatistics(settings);
			}
		}
		return null;
	}

	// getIsStatisticsResponsesReady() {return this.statisticsResponsesReady;}

	// ----------Setters----------
	addToFetchedStatistics({ values, transformatorSettings = {} }) {
		if (this.fetched_statistics_data) {
			// this.fetched_statistics_data.writable = true;
			// console.log('addToFetchedStatistics', values, this.fetched_statistics_data)
			values.forEach(vi => {
				let { value, accessor, useFirstStatisticsParameter } = vi;

				if (useFirstStatisticsParameter) {
					accessor = `${Object.keys(this.fetched_statistics_data)[0]}.${accessor}`;
				}

				// console.time('addToFetchedStatistics')
				// let newFetchedStatistics = this.fetched_statistics_data[statistics_key];
				// let newFetchedStatistics = this.fetched_statistics_data;
				let current_value = accessor
					? getObjectVal(this.fetched_statistics_data, accessor)
					: this.fetched_statistics_data;
				// console.log('current_value', accessor, current_value, value)
				if (current_value instanceof Array) {
					current_value.push(value);
				} else if (typeof current_value == 'object') {
					current_value = mergeObjects(current_value, value);
				} else {
					current_value = value;
				}
				if (accessor) {
					setObjectVal(this.fetched_statistics_data, accessor, current_value);
				} else {
					this.fetched_statistics_data = current_value;
				}
				// console.log(accessor, this.fetched_statistics_data, current_value)
				// this.fetched_statistics_data = newFetchedStatistics;
			});

			// console.log('addToFetchedStatistics', this.fetched_statistics_data)
			let isTransform = true;
			
			if (this.preTransformSettings) {
				const {next} = this.usePreTransformSettings(this.preTransformSettings);
				isTransform = next;
			}

			if (this.StatisticsTransformator && isTransform) {
				this.transformStatistics(transformatorSettings)

				/*if (transformatorSettings.transformMethodName) {
					this.StatisticsTransformator[transformatorSettings.transformMethodName](
						this.fetched_statistics_data,
						transformatorSettings
					);
				} else {
					this.StatisticsTransformator.transform(
						this.fetched_statistics_data,
						transformatorSettings
					);
				}*/
			}
			// console.timeEnd('addToFetchedStatistics')
		}
		// console.log('updateFetchedStatistics', this.fetched_statistics_data, data)
	}

	setValue(optionName, value) {
		this[optionName] = value;
		// console.log(optionName, value)
		if (this.events[optionName]) {
			this.events[optionName](value);
		}
	}

	injectProps(key, value, settings = {}) {
		/*if (key == 'seriesConfig') {debugger}*/
		// console.log(key)
		if (typeof key === 'object' && key !== null) {
			({ key, value, settings = {} } = key);
		}
		/*if (typeof this[key] !== 'object' || this[key] === null) {
			this[key] = {};
		}*/

		this[key] = mergeObjects(this[key], value);

		if (key == 'options' && settings.emitChartOptionsUpdate) {
			this.emitChartOptionsUpdate();
		}
	}

	setOption(accessor, value, settings = {}) {
		setObjectVal(this.options, accessor, value);
		// console.log(accessor, value)
		if (settings.emitChartOptionsUpdate) {
			this.emitChartOptionsUpdate();
		}
	}

	setFilters(filters, settings = {}) {
		const old_filters = cloneDeep(this.resources.filters);
		// console.log('setFilters', old_filters, this.resources.filters, filters)
		this.resources.filters = { ...this.resources.filters, ...filters };

		if (this.StatisticsTransformator) {
			this.StatisticsTransformator.setFilters(this.resources.filters);
		}

		if (settings.refetchData && !this.chartIsHidden) {
			this.fetchChartData(settings);
		}

		if (this.handleFiltersChange) {
			this.handleFiltersChange({filters, old_filters});
		}
		// console.log('setFilters', filters, this.resources.filters, settings)
	}

	resetZoom() {
		if (this.ChartAPI) {
			this.ChartAPI.yAxis[0].setExtremes();

			if (this.ChartAPI.zoom) {
				this.ChartAPI.zoom();				
			}
		}
	}

	// ----------Events---------

	handleStatisticsTransformReady(resultData, settings = {}) {
		// console.log('handleStatisticsTransformReady', this.chart_id, settings, this.events)
		this.handleStatisticsTransformUpdated(resultData);

		if (settings.updateChartsReadyCounter && this.events.changeChartsReadyCounter) {
			this.events.changeChartsReadyCounter(1, {
				chart_id: this.chart_id,
				resultData,
				chartDataReadySettings: this.chartDataReadySettings
			});
		} else if (settings.updateChartDataReady && this.events.handleChartDataReady) {
			this.events.handleChartDataReady({
				isReady: true,
				hasStatistics: this.hasStatistics
			});
		}
		// this.events.handleChartDataReady();
	}

	handleStatisticsTransformUpdated(resultData) {
		// console.log('handleStatisticsTransformUpdated', this.chart_id, resultData.statistics_result)
		if (this.statisticsPostTransform) {
			resultData = this.statisticsPostTransform(resultData);
		}

		if (this.localHandleStatisticsTransformUpdated) {
			this.localHandleStatisticsTransformUpdated(resultData);
		} else {
			this.assignDataToYAxis(resultData);
			this.assignDataToSeries(resultData);
			this.emitChartOptionsReady();
		}

		if (this.chartDataReadyCallback) this.chartDataReadyCallback();
	}

	emitChartOptionsInitiated() {
		if (this.events.chartOptionsInitiated) {
			this.events.chartOptionsInitiated(cloneDeep(this.options));
		}
	}

	emitChartOptionsReady(settings = {}) {
		// console.log('emitChartOptionsReady')
		this.setValue('isRendering', true);
		this.setValue('isLoading', false);

		this.emitChartOptionsUpdate(settings);
	}

	emitChartOptionsUpdate(settings = {}) {
		if (this.localEmitChartOptionsUpdate) {
			this.localEmitChartOptionsUpdate(settings);
		}
		if (this.events.chartOptionsUpdate) {
			// console.log('emitChartOptionsUpdate', this.chart_id, this.options.series[0].data)
			this.events.chartOptionsUpdate(this.options, settings);
			// console.log('chartOptionsUpdate')
			// this.ChartAPI.redraw();
		}

		// this.events.onEvent({handler: 'isLoading', payload: false})
	}

	/*emitChartOptionsFinalReady() {
		// this.setValue('isLoading', false);
		if (this.events.chartOptionsFinalReady) {
			this.events.chartOptionsFinalReady(this.options);
		}
	}*/

	emitChartLoadEvent(e) {
		if (this.handleChartInitiatedEvent) {
			this.handleChartInitiatedEvent(e);
		}
		if (this.events.chartLoadEvent) {
			this.events.chartLoadEvent(e);
		}
		if (this.events.isInitiated) {
			this.events.isInitiated();
		}
	}
	emitChartRenderEvent(e) {
		// console.log('emitChartRenderEvent', this.chartTitle)
		// console.log('emitChartRenderEvent', e)
		this.setValue('isRendering', false);
		// console.log(this.events.chartRenderEvent)
		if (this.handleChartRenderEvent) this.handleChartRenderEvent(e);
		if (this.events.chartRenderEvent) this.events.chartRenderEvent(e, this);
	}

	callChartMethod(methodName, payload) {
		if (this[methodName]) {
			return this[methodName](payload);
		}
	}
}

/*class StandardChart extends Chart {
	constructor() {
		super();
	}
}*/
