import { mergeObjects, cloneDeep, compareValues, findItemBy } from '@/helpers';
import { getChartsListsConfig } from '../dispatchers/chartsListConfigDispatcher';
import { executeChartFactory } from '../dispatchers/chartFactoryDispatcher';
import { colorsList } from '../enums';
// import { Lang } from '@/localization';

export default class ChartsListFactoryBase {
	constructor() {
		this.chartsConfigsFullList;
		this.chartItemsReadyCount = 0;
		this.chartsInstancesList = [];
		this.firstStatisticsItemForAll;
		this.isChartsDataReady = false;
		this.hasStatistics = false;
		// this.isChartsLoading = false;

		this.events = {
			// chartDataReady: e => this.handleChartsListDataReady(e),
			changeChartsReadyCounter: (e, payload) =>
				this.handleChangeChartsReadyCounter(e, payload)
			// isChartsLoading: value => this.isChartsLoading = value,
		};
	}

	useResources(resources = {}) {
		const events = (resources.settings && resources.settings.events) || {};
		this.resources = cloneDeep(resources);
		this.events = { ...this.events, ...events };
	}

	callMethod(name, payload) {
		if (this[name]) this[name](payload);
	}

	handleChangeChartsReadyCounter(val, payload) {
		this.chartItemsReadyCount += val;
		// console.log('handleChangeChartsReadyCounter', val, this.chartItemsReadyCount, this.chartsInstancesList.length)
		if (this.chartItemsReadyCount === this.chartsInstancesList.length) {
			this.hasStatistics = this.chartsInstancesList.some(
				Chart => Chart.hasStatistics
			);

			if (this.localChartsListDataReady) {
				this.localChartsListDataReady(payload);
				return;
			}
			this.isChartsDataReady = true;
			this.handleChartsListDataReady(payload);

			if (this.events.chartsListWrapperLoading) {
				this.events.chartsListWrapperLoading(false);
			}
		} else {
			if (
				this.events.changeChartsListWrappersReadyCounter &&
				this.isChartsDataReady
			) {
				this.events.changeChartsListWrappersReadyCounter(-1);
			}
			this.isChartsDataReady = false;
			if (this.events.chartsListWrapperLoading) {
				this.events.chartsListWrapperLoading(true);
			}
		}
	}

	handleChartsListDataReady({ /*chart_id, resultData*/ chartDataReadySettings }) {
		// console.log('1', this.chartItemsReadyCount, this.chartsInstancesList.length)
		this.firstStatisticsItemForAll = null;
		// console.log('handleChartsListDataReady')
		if (
			chartDataReadySettings &&
			chartDataReadySettings.useFirstStatisticsItemForAll
		) {
			this.chartsInstancesList.forEach(Chart => {
				const {
					chart_first_statistics_item
				} = Chart.StatisticsTransformator.resultData;

				if (
					!this.firstStatisticsItemForAll ||
					(chart_first_statistics_item &&
						chart_first_statistics_item[0] < this.firstStatisticsItemForAll)
				) {
					this.firstStatisticsItemForAll = chart_first_statistics_item;
				}

			});

			this.chartsInstancesList.forEach(Chart => {
				// console.log('handleChartsListDataReady 2', Chart)
				Chart.StatisticsTransformator.updateResultData({
					settingsList: [
						{
							accessor: 'firstStatisticsItemForAll',
							value: this.firstStatisticsItemForAll
						},
						{
							to_statistics_result: true,
							accessor: 'edgeStatisticsItems.first_statistics_item',
							emitOptionsUpdate: true,
							value: this.firstStatisticsItemForAll,
							parameterId: Chart.chart_parameter_id,
							updateSeries: [
								{
									serie_id: 'transparent-serie',
									accessor: 'data.0',
									value: this.firstStatisticsItemForAll
									// value: [1709596800000, 555]
								}
							]
						}
					],
					additionalSettings: {}
				});
			});
		}
		// ---------------------------------
		if (this.events.changeChartsListWrappersReadyCounter) {
			let chartsStatisticsList = {};
			this.chartsInstancesList.forEach(Chart => {
				chartsStatisticsList = {
					...chartsStatisticsList,
					...Chart.getTransformedStatistics({
						accessor: 'statistics_result',
					})
				};
			});

			this.events.changeChartsListWrappersReadyCounter(1, chartsStatisticsList);
			// this.events.allChartsDataReady(chartsStatisticsList);
		}
		// ------------------------
		if (this.chartsListWrapperReadyCallback) {
			this.chartsListWrapperReadyCallback();
		}

		// -----------------
		if (this.events.chartsListWrapperReady) {
			this.events.chartsListWrapperReady(this.hasStatistics);
		}
	}

	/*getChartsListsConfig(configsKey, chartKey) {
		return getChartsListsConfig(configsKey, chartKey)
	}*/

	setupChartsConfigsList(settings = {}) {
		try {
			const {
				filterParamsBy,
				getParamsByIds,
				getParamsByIdsFilterMethod,
				// returnChartConfigByIdxIfEmptyAfterFiltration,
				modifyParamsMethod,
				joinChartsBy,
				chartKey,
				configsKey
			} = settings;
			// console.log(settings)
			let charts_configs = getChartsListsConfig(configsKey, chartKey, {
				...settings,
				resources: this.resources
			});
			let charts_configs_initial = cloneDeep(charts_configs);
			// console.log(chartKey, cloneDeep(charts_configs_initial))

			if (charts_configs) {
				// console.log(getParamsByIds, filterParamsBy, joinChartsBy, modifyParamsMethod)
				if (getParamsByIds && getParamsByIds.length) {
					const method = getParamsByIdsFilterMethod || 'some';
					// console.log(settings, getParamsByIds, method)
					charts_configs = charts_configs.filter(chart => {
						const { requestsList } = chart;
						if (requestsList && requestsList.length) {
							return requestsList[method](
								request => getParamsByIds.indexOf(request.id) !== -1
							);
						}
					});
				}

				if (filterParamsBy && filterParamsBy.length) {
					// console.log(filterParamsBy)
					charts_configs.forEach(chart => {
						filterParamsBy.forEach(config => {
							let { prop, value, method, exceptCharts, skipWithoutProp } = config;
							method = method || '==';

							if (!exceptCharts || exceptCharts.indexOf(chart.chart_id) === -1) {
								chart.requestsList = chart.requestsList.filter(request => {
									// console.log(prop, request[prop], value, method )
									if (skipWithoutProp && request[prop] === undefined) {
										return true;
									}
									return compareValues({ val1: request[prop], val2: value, method });
								});
							}
						});
					});
				}

				if (joinChartsBy && joinChartsBy.prop) {
					if (joinChartsBy.prop !== 'split') {
						let combined_requests = {};
						let new_charts_configs = [];

						charts_configs.forEach(chart => {
							chart.requestsList.forEach(request => {
								combined_requests[request[joinChartsBy.prop]] =
									combined_requests[request[joinChartsBy.prop]] || [];
								combined_requests[request[joinChartsBy.prop]].push(request);
							});
						});
						// console.log('combined_requests', combined_requests)

						for (let group in combined_requests) {
							let new_chart = {
								chart_id: `chart-${group}`,
								chartTitle: group,
								requestsList: combined_requests[group],
								inject_options: {
									chart: { type: 'line' },
									tooltip: { split: false },
									navigator: { series: { type: 'line' } }
								},
								transformator_settings: {
									specification: {
										setupPointsData: { enableZones: false },
										setupFlagsData: null,
										setupPlotlinesData: null
									}
								},
								seriesConfig: {
									pointsData: { seriesConfigsList: {} },
									historyData: null,
									plotlinesData: null,
									flagsData: null
								}
							};

							new_chart.requestsList.forEach((request, idx) => {
								new_chart.seriesConfig.pointsData.seriesConfigsList[idx] = [
									{
										id: request.id,
										template: 'sensor.base',
										responseDataKey: `parameter_${request.id}`,
										inject: {
											color: colorsList[idx]
										}
									}
								];
							});
							new_charts_configs.push(new_chart);
						}
						charts_configs = new_charts_configs;
					}
				}

				/*if (filterParamsBy) {
					let charts_configs_filtered = [];
					const { exceptCharts } = filterParamsBy;
					
					charts_configs.forEach(chart => {
						const { requestsList, chart_id } = chart;

						if (exceptCharts && exceptCharts.indexOf(chart_id) !== -1) {
							charts_configs_filtered.push(chart);
						} else if (requestsList) {
							const requestsListNew = requestsList.filter(
								p => p[filterParamsBy.prop] == filterParamsBy.value
							)
							// console.log('requestsList', requestsList, requestsListNew)
							if (requestsListNew.length) {
								chart.requestsList = requestsListNew;
								charts_configs_filtered.push(chart);
							}
						}
					})

					charts_configs = charts_configs_filtered;
					// unfiltered_configs = unfiltered_configs.filter(
					// 	p => p[filterParamsBy.prop] == filterParamsBy.value
					// );
				}*/

				if (modifyParamsMethod) {
					charts_configs = modifyParamsMethod(charts_configs);
				}
				// console.log('charts_configs', charts_configs, charts_configs.filter(chart => chart.requestsList.length))
				return {
					charts_configs_initial,
					filtered_charts_configs: charts_configs.filter(
						chart => chart.requestsList.length
					)
				};
			} else {
				console.warn(`charts_configs for "${chartKey}" not found`);
			}
		} catch (e) {
			console.warn(e);
		}
	}

	getCharts() {
		return this.chartsInstancesList;
	}
	getChartsStatistics(settings = {}) {
		if (settings.transformed) {
			return this.chartsInstancesList.map(Chart =>
				Chart.getTransformedStatistics(settings)
			);
		} else {
			return this.chartsInstancesList.map(Chart => Chart.fetched_statistics_data);
		}
	}

	reloadCharts(ids, settings={}) {
		this.firstStatisticsItemForAll = null;
		const { reloadAll } = settings;

		if (reloadAll) {
			this.chartsInstancesList.forEach(Chart => {
				Chart.fetchChartData();
			});
		} else {
			ids.forEach(chart_id => {
				const ChartInstance = findItemBy(
					'chart_id',
					chart_id,
					this.chartsInstancesList
				);
				if (ChartInstance) {
					ChartInstance.fetchChartData();
				}
			});
		}
	}

	setDataToCharts({ propKey, data }) {
		this.chartsInstancesList.forEach(ChartInstance =>
			ChartInstance.setValue(propKey, data)
		);
	}

	callChartsMethod({ name, payload }) {
		this.chartsInstancesList.forEach(ChartInstance => {
			ChartInstance[name] ? ChartInstance[name](payload) : null
		});
	}

	setFiltersToCharts(filters, settings) {
		// this.filters = { ...this.filters, ...filters };
		this.chartsInstancesList.forEach(Chart => Chart.setFilters(filters, settings));
	}

	buildCharts(resource = {}) {
		try {
			this.resources = mergeObjects(this.resources, resource);
			// console.log('buildCharts', this.resources, resource)

			if (resource.settings && resource.settings.events) {
				this.events = { ...this.events, ...resource.settings.events };
			}

			const {
				chartFactoryName,
				setupChartsConfigsListSettings,
				returnChartConfigByIdx, /*chart_instance_name*/
			} = this.resources.settings;

			let {
				charts_configs_initial,
				filtered_charts_configs
			} = this.setupChartsConfigsList(setupChartsConfigsListSettings);
			this.chartsConfigsFullList = charts_configs_initial;

			/*if (this.localAdditionalChartsConfigsListSetup) {
				filtered_charts_configs = this.localAdditionalChartsConfigsListSetup(filtered_charts_configs);
			}*/

			if (returnChartConfigByIdx != null && filtered_charts_configs.length) {
				filtered_charts_configs = [filtered_charts_configs[returnChartConfigByIdx]]
			}

			if (!filtered_charts_configs.length && setupChartsConfigsListSettings.returnChartConfigByIdxIfEmptyAfterFiltration != null) {
				// debugger
				filtered_charts_configs.push(charts_configs_initial[0]);
			}
			// console.log('chartsConfigsList', charts_configs_initial[0], filtered_charts_configs, setupChartsConfigsListSettings.returnChartConfigByIdxIfEmptyAfterFiltration)

			this.chartsInstancesList = filtered_charts_configs.map(chartConfig => {
				return executeChartFactory(
					chartConfig.chartFactoryName || chartFactoryName,
					// chartConfig.chart_instance_name || chart_instance_name,
					{
						events: this.events,
						// 2 level payload
						chart_config: chartConfig,
						...this.resources,
						settings_payload: this.resources.settings.settings_payload || {}
						// payload_1: payload_1 || {}, // Last level payload,
						// filters: filters || {},
					}
				);
			});

			this.chartItemsReadyCount = this.chartsInstancesList.length;

			// console.log('chartsInstancesList', this.chartsInstancesList)
		} catch (e) {
			console.warn(e);
		}
	}
}
