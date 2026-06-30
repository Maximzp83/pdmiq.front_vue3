import { mergeObjects, cloneDeep /*compareValues, findItemBy*/ } from '@/helpers';
import { getChartsListsConfig } from '../dispatchers/chartsListConfigDispatcher';
import { executeChartFactory } from '../dispatchers/chartFactoryDispatcher';
// import { Lang } from '@/localization';

export default class ChartFactoryContainerBase {
	constructor() {
		this.chartInstance = null;
		this.isChartDataReady = false;
		this.hasStatistics = false;

		this.events = {
			handleChartDataReady: e => this.handleChartDataReady(e)
			// changeChartsReadyCounter: (e, payload) => this.handleChangeChartsReadyCounter(e, payload)
		};
	}

	useResources(resources = {}) {
		// console.log('useResources', resources)
		const events = (resources.settings && resources.settings.events) || {};
		this.resources = cloneDeep(resources);
		this.events = { ...this.events, ...events };
	}

	callMethod(name, payload) {
		if (this[name]) this[name](payload);
	}

	handleChartDataReady({ isReady, hasStatistics }) {
		// console.log('1', isReady, hasStatistics)

		/*if (this.events.changeChartsListWrappersReadyCounter) {
			let chartsStatisticsList = {};
			this.chartsInstancesList.forEach(Chart => {
				chartsStatisticsList = {
					...chartsStatisticsList,
					...Chart.getTransformedStatistics({accessor: 'statistics_result'})
				};
			})

			this.events.changeChartsListWrappersReadyCounter(1, chartsStatisticsList);
			// this.events.allChartsDataReady(chartsStatisticsList);
		};*/

		this.hasStatistics = hasStatistics;
		this.isChartDataReady = isReady;

		if (this.events.chartContainerReady) {
			this.events.chartContainerReady({
				hasStatistics: this.hasStatistics,
				isChartDataReady: this.isChartDataReady
			});
		}
	}

	setupChartConfig(settings = {}) {
		try {
			const { chartKey, configsKey /*modifyParamsMethod*/ } = settings;
			// console.log(chartKey, configsKey)
			let chart_config = getChartsListsConfig(configsKey, chartKey);

			if (chart_config) {
				/*if (modifyParamsMethod) {
					charts_configs = modifyParamsMethod(charts_configs);
				}*/
				// console.log('charts_configs', charts_configs, charts_configs.filter(chart => chart.requestsList.length))
				return chart_config;
			} else {
				console.warn(`charts_configs for "${chartKey}" not found`);
			}
		} catch (e) {
			console.warn(e);
		}
	}

	getChart() {
		return this.chartInstance;
	}
	getChartsStatistics(settings = {}) {
		if (settings.transformed) {
			return this.chartInstance.getTransformedStatistics(settings);
		} else {
			return this.chartInstance.fetched_statistics_data;
		}
	}

	reloadChart() {
		if (this.ChartInstance) {
			this.ChartInstance.fetchChartData();
		}
	}

	setDataToChart({ propKey, data }) {
		this.ChartInstance.setValue(propKey, data);
	}

	setFiltersToChart(filters, settings) {
		// console.log(filters, this.chartInstance)
		this.chartInstance.setFilters(filters, settings);
	}

	buildChart(resource) {
		try {
			this.resources = mergeObjects(this.resources, resource);
			if (resource.settings.events) {
				this.events = { ...this.events, ...resource.settings.events };
			}

			const {
				chartFactoryName,
				setupChartsConfigsListSettings /*chart_instance_name*/
			} = this.resources.settings;
			// console.log(this.resources.settings, setupChartsConfigsListSettings)

			const chart_config = this.setupChartConfig(setupChartsConfigsListSettings);
			// console.log('chart_config', chart_config, chartFactoryName)

			this.chartInstance = executeChartFactory(
				chart_config.chartFactoryName || chartFactoryName,
				{
					events: this.events,
					// 2 level payload
					chart_config,
					...this.resources,
					settings_payload: this.resources.settings.settings_payload || {}
					// payload_1: payload_1 || {}, // Last level payload,
				}
			);
		} catch (e) {
			console.warn(e);
		}
	}
}
