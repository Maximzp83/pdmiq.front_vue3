import ChartBase from '../../../classes/Chart';

import { warningColor, alarmColor, lubeColor } from '../../../enums';
import { Lang } from '@/localization';

import { fetch_statistics } from '../api/index.js';

import { findItemBy, getMaxValue, getValues } from '@/helpers';
import { requisitionStatusesList, NCD_RSSI_TYPES } from '@/constants/global';

import { prepareFilters } from '../../../helpers';
import { setupProblemsStatistics } from '../methods';
import { standard_datetime } from '../../Sensor/methods';
import { defaultSeriesConfig, RSSISeriesConfig } from '../chartsListsConfig';

class MaintenanceChartBase extends ChartBase {
	constructor() {
		super();
		this.resultData = {
			statistics_result: {
				main: {
					pointsData: {}
				}
			}
		};
		// -------------- 3 level payload ----------
		// console.log('constructor', oeeTooltipFormatter())
		let options = {
			// chart: { },
			boost: { enabled: false }
			/*plotOptions: {
				series:
				point: {}
			}*/
		};

		this.seriesConfig = this.getSeriesConfig();

		// console.log(this.seriesConfig)
		this.transformator_settings = {};

		// ------------------------------
		// console.log('1', options)
		this.injectProps('options', options);
	}

	handleChartInitiatedEvent({target}) {
		this.ChartAPI = target;
	}

	checkIsHasStatistics() {
		return this.resultData.statistics_result.main.pointsData.base.some(
			serie => serie.y
		);
	}

	localHandleStatisticsTransformUpdated(resultData) {
		if (this.assignDataToYAxis) this.assignDataToYAxis(resultData);
		this.assignDataToSeries(resultData);
		this.emitChartOptionsReady();
	}

	// --------- Series -------------
	getSeriesConfig(payload) {
		return defaultSeriesConfig(payload);
	}

	modifySeriesConfig({ seriesConfig }) {
		return seriesConfig;
	}

	// -----------------
	isUpdateSeries() {
		return false;
	}

	fetchChartDataAction(settings = {}) {
		try {
			if (settings.rootStatisticsData) {
				this.handleResponse(settings.rootStatisticsData);
			} else {
				this.requestsList.forEach(() => {
					const params = { ...prepareFilters(this.resources.filters, settings) };
					// console.log('1', this.chart_id, params)
					fetch_statistics({ params, ...this.statisticsRequestPayload })
						.then(({ value }) => {
							// console.log('2 response', value)
							this.handleResponse(value);
						})
						.catch(e => {
							this.checkStatisticsResponses(e);
						});
				});
			}
		} catch (e) {
			console.warn(e);
		}
	}

	handleResponse(value) {
		this.resultData = this.setupResultData(value);
		this.handleStatisticsTransformReady(this.resultData);
		this.checkStatisticsResponses();
	}

	resetChartWidth() {
		setTimeout(() => {
			if (this.ChartAPI) {
				const containerWidth = this.ChartAPI.container.clientWidth - 1;
				const containerHeight = this.ChartAPI.container.clientHeight;

				if (containerWidth > 0) {
					console.log(this.ChartAPI.container, containerWidth, containerHeight)
					this.ChartAPI.setSize(containerWidth, containerHeight);					
				}
			}
		}, 500);
	}
}

class BarChartBase extends MaintenanceChartBase {
	constructor() {
		super();

		// this.initialSetup(resources);
		let options = {
			chart: { type: 'bar' },
			tooltip: { enabled: false },

			yAxis: { visible: false },
			xAxis: {
				type: 'category',
				lineColor: '#ffffff',
				labels: {
					useHTML: true,
					align: 'left',
					style: { fontSize: '14px', color: '#424242', fontWeight: '600' }
				}
			},

			plotOptions: {
				bar: {
					dataLabels: {
						enabled: true,
						style: { fontSize: '12px', color: '#424242', fontWeight: '600' }
					}
				},
				series: {
					pointWidth: 10,
					groupPadding: 0,
					pointPadding: 0
				}
			}
		};

		this.injectProps('options', options);
	}
}

class WObarChart extends BarChartBase {
	constructor(resources) {
		super();
		this.statisticsRequestPayload = {
			url: '/maintenance/statistics'
		};

		// this.initialSetup(resources);
		let options = {
			chart: { height: 100, marginLeft: 120 },

			xAxis: {
				categories: ['Pending', 'In Work', 'Completed'],
				labels: {
					x: -120
				}
			},

			plotOptions: {
				series: {
					pointWidth: 10,
					groupPadding: 0,
					pointPadding: 0
				}
			}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	setupResultData(data) {
		// console.log(data)
		const { categories } = this.options.xAxis;
		const requisitionStatuses = requisitionStatusesList();
		return {
			statistics_result: {
				main: {
					pointsData: {
						base: categories.map(cat => {
							let item = findItemBy('label', cat, requisitionStatuses);
							return {
								name: item.label,
								y: data[item['altStatKey']],
								color: item.color
							};
						}),

						downtime_total_cost: data.downtime_total_cost,
						breakdown_total_time: data.breakdown_total_time
					}
				}
			}
		};
	}
}

class SuccessDashboardProblemsChart extends BarChartBase {
	constructor(resources) {
		super();
		this.statisticsRequestPayload = {
			url: resources.payload_1.fetch_action_url
		};
		// this.initialSetup(resources);
		let options = {
			chart: {
				height: 300,
				marginLeft: 240
			},

			xAxis: {
				categories: [],
				labels: {
					style: { fontSize: '12px', zIndex: 100 },
					x: -240,
				},
			},

			plotOptions: {
				bar: {
					dataLabels: {
						inside: true,
						align: 'right',
						style: { fontSize: '10px' }
					}
				},
				series: {
					pointWidth: 14,
					groupPadding: 0,
					pointPadding: 4
				}
			}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	assignLabelsEvent() {
		// ----Old Code-----
		/*if (enableLabelClickEvent) {
			chartOptions.chart.events = {
				load: function() {
					const ticks = this.xAxis[0].ticks;
					const points = this.series[0].points;

					points.forEach(function(point, i) {
						if (ticks[i]) {
							const label = ticks[i].label.element;

							label.onclick = e => contextData.labelClick(e, point);
						}
					});
				}
			};
		}*/
	}

	modifySeriesConfig({ seriesConfig }) {
		seriesConfig.pointsData.seriesConfigsList[0][0].event_key = 'serieClick';
		/*seriesConfig.pointsData.commonOptions = {
			dataLabels: {
				enabled: true,
				formatter: function() {
					if (this.y > 0) return this.point.label;
				}
			}
		};*/
		return seriesConfig;
	}

	setupResultData(data) {
		let chartData = [];

		const { setupProblemsStatisticsSettings } = this.resources.payload_1;
		const preparedData = setupProblemsStatistics({
			data,
			...setupProblemsStatisticsSettings
		});

		preparedData.forEach(di => {
			const { key, data_count, data_duration, name, instance_id } = di;
			this.options.xAxis.categories.push(name);
			let item = { name: name, y: data_count, label: data_count };
			if (key == 'alarms_count' || key == 'alarms_duration') {
				item.color = alarmColor;
				this.options.plotOptions.bar.dataLabels.style.color = '#ffffff';
			}
			if (key == 'warnings_count' || key == 'warnings_duration')
				item.color = warningColor;
			if (key == 'roi_cost') {
				item.color = '#2CCD89';
				item.label = `$${item.label}`;

				this.options.chart.backgroundColor = '#F0F2F5';
				// chartOptions.yAxis.gridLineWidth = 0;
			}

			if (data_duration) item.label = data_duration.time_total;
			if (instance_id) item.instance_id = instance_id;
			chartData.push(item);
		});

		this.options.chart.height = preparedData.length * 34;
		this.options.chart.height =
			this.options.chart.height < 40 ? 40 : this.options.chart.height;
		// console.log(data, chartData)

		return {
			statistics_result: {
				main: {
					pointsData: {
						base: chartData
					}
				}
			}
		};
	}

	handleChartInitiatedEvent({target}) {
		this.ChartAPI = target;

		const { selectedColumnsNumber } = this.resources.payload_1;
		if (selectedColumnsNumber) {
			this.handleColumnsNumberChange({val: selectedColumnsNumber });
		}
	}

	handleColumnsNumberChange({val, isPrintOpen}) {
		if (this.hasStatistics) {
			let left = 220;
			// let width = undefined;

			const { clientWidth } = this.ChartAPI.container;

			if (isPrintOpen) {
				// width = clientWidth * 0.7;
				if (val == null || val == 1) {	left = clientWidth - 320; }
				if (val == 2) {	left = clientWidth - 150; }
				else if (val == 3) { left = clientWidth - 110; }
				else if (val == 4) {	left = clientWidth - 90; }
				else if (val == 5) {	left = clientWidth - 50;	}
				else {
					// left = clientWidth - 220;
				}
				/*if (val === undefined || val < 3) {
					if (clientWidth < 379) {
						left = 180;
						width = clientWidth * 0.95;
					} else if (clientWidth < 479) {
						left = 200;
						width = clientWidth * 0.7;
					} else if (clientWidth < 599) {
						left = 170;
						width = clientWidth * 0.55;
					} else if (clientWidth < 719) {
						left = 155;
						width = clientWidth * 0.47;
					} else if (clientWidth < 1039) {
						left = 145;
						width = clientWidth * 0.32;
					} 
				} else {
					if (clientWidth < 182) {
						left = 120;
						width = clientWidth + 10;
					} else if (clientWidth < 262) {
						left = 90;
						width = clientWidth * 0.8;
					} else if (clientWidth < 342) {
						left = 95;
						width = clientWidth * 0.62;
					} else if (clientWidth < 422) {
						left = 95;
						width = clientWidth * 0.5;
					} else if (clientWidth < 635) {
						left = 110;
						width = clientWidth * 0.3;
					}
				}*/

				// console.log('clientWidth open', val, clientWidth)
			} else {
				if (val == 2) {	left = clientWidth - 140; }
				else if (val == 3) {	left = clientWidth - 120; }
				else if (val == 4) {	left = clientWidth - 100; }
				else if (val == 5) {	left = clientWidth - 50; }
			}

			// if (val == null) {	left = clientWidth - 200; }
			/*if (val == 2) {	left = clientWidth - 140; }
			else if (val == 3) {	left = clientWidth - 120; }
			else if (val == 4) {	left = clientWidth - 100; }
			else if (val == 5) {	left = clientWidth - 50; }*/

			// this.setOption('chart.width', width);
			this.setOption('xAxis.labels.x', -left);
			this.setOption('chart.marginLeft', left, {emitChartOptionsUpdate:1});
		}
	}
}

class RequisitionStatisticsChart extends MaintenanceChartBase {
	constructor(resources) {
		super();
		this.statisticsRequestPayload = {
			url: '/plants/work-orders/analytics'
		};
		// this.initialSetup(resources);
		let options = {
			chart: { type: 'column', height: 235 },

			yAxis: [
				{
					title: { text: '' },
					max: 0
				}
			],
			xAxis: {
				// type: 'category',
				categories: [
					'All',
					'Completed',
					'In work',
					'Approved',
					'Pending',
					'On Hold',
					'Denied'
				]
			}

			// plotOptions: {}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	assignDataToYAxis(resultData) {
		try {
			const { base } = resultData.statistics_result.main.pointsData;
			this.options.yAxis[0].max = getMaxValue(getValues('y', base));
		} catch (e) {
			console.warn(e);
		}
	}

	setupResultData(data) {
		const requisitionStatuses = requisitionStatusesList();
		return {
			statistics_result: {
				main: {
					pointsData: {
						base: [
							{ name: 'All', y: data.total_work_orders, color: '#6A00FF' }
						].concat(
							requisitionStatuses.map(item => {
								return {
									name: item.label,
									y: data[item['statKey']],
									color: item.color
								};
							})
						)
					}
				}
			}
		};
	}
}

class PieChartBase extends MaintenanceChartBase {
	constructor() {
		super();
		// -------------- 3 level payload ----------
		let options = {
			chart: { type: 'pie' },
			subtitle: {
				useHTML: true,
				verticalAlign: 'middle',
				x: -47,
				y: 10
			},
			yAxis: null,
			xAxis: null,
			accessibility: {
				point: { valueSuffix: '%' }
			}
		};

		// ------------------------------
		// console.log('1', options)
		this.injectProps('options', options);
	}
}

class PDMStatisticsPieChart extends PieChartBase {
	constructor(resources) {
		super();
		// -------------- 3 level payload ----------
		this.statisticsRequestPayload = {
			url: '/dashboard/pdm',
			alternateResponseProp: 'data'
		};

		let options = {
			chart: { height: 190 },
			legend: {
				enabled: true,
				align: 'right',
				verticalAlign: 'middle',
				layout: 'vertical',
				itemMarginBottom: 15,
				enableMouseTracking: false,
				navigation: { enabled: false },
				events: {}
			},
			plotOptions: {
				pie: {
					enableMouseTracking: false,
					allowPointSelect: false,
					point: {
						events: {}
					},
					// cursor: 'pointer',
					size: '100%',
					innerSize: '80%',
					showInLegend: true,
					dataLabels: { enabled: false }
				}
			}
		};

		// ------------------------------
		this.injectProps('options', options);
		// console.log('1', this.options)
		// -----------------------------------------
		this.finalSetup(resources);
	}

	handleChartInitiatedEvent({target}) {
		this.ChartAPI = target;

		const { selectedColumnsNumber } = this.resources.payload_1;
		if (selectedColumnsNumber) {
			this.handleColumnsNumberChange({val: selectedColumnsNumber });
		}
	}

	checkIsHasStatistics() {
		return true;
	}

	setupResultData(data) {
		const newData = {
			normal: data.totalNormal,
			warning: data.totalWarning,
			alarm: data.totalAlarm,
			lube: data.totalLubeAlarm,
			offline: data.offlineSensorsCount
		};

		const colorsMap = {
			alarm: alarmColor,
			normal: '#2CCD89',
			warning: warningColor,
			lube: lubeColor,
			offline: 'gray'
		};

		let base = [];
		let total = 0;

		for (let key in newData) {
			base.push({
				key,
				name: `constants.${key}`,
				y: newData[key] || 0,
				color: colorsMap[key]
			});
			total += newData[key] || 0;
		}

		this.options.subtitle.text = `<div class="pie-chart-subtitle">
																		<div class="label capitalize">${Lang.tt('total')}</div>
																		<div class="value">${total}</div>
																	</div>`;

		return {
			statistics_result: {
				main: {
					pointsData: {
						base: Lang.translate(base),
						total
					}
				}
			}
		};
	}

	handleColumnsNumberChange({val, /*isPrintOpen*/}) {
		let legendEnabled;
		// let	width = undefined;
		// let subtitleX = -47;
				// legendX = 0;
		// const { clientWidth } = this.ChartAPI.container;

		if (val > 1) {
			legendEnabled = false;
		} else {
			legendEnabled = true;
			if (val == 2) {
				// width = isPrintOpen ? clientWidth * 0.7 : undefined;				
				// subtitleX = isPrintOpen ? 0 : -47;				
			}
		}
		// console.log('clientWidth', val, clientWidth)

		// console.log(val)
		// width = legendEnabled ? undefined : clientWidth;

		/*if (isPrintOpen) {
			if (val > 2) {
				if (clientWidth < 212) {
					width = clientWidth;
				} else if (clientWidth < 292) {
					width = clientWidth * 0.7;
				} else if (clientWidth < 372) {
					width = clientWidth * 0.56;
				} else if (clientWidth < 452) {
					width = clientWidth * 0.46;
				} else if (clientWidth < 665) {
					width = clientWidth * 0.31;
				}
			} else {
				legendX = -50;
				subtitleX = -73;
			}

			// console.log('clientWidth open', clientWidth, width)
		} else {
			width = legendEnabled ? undefined : clientWidth;
		}*/

		
		// this.setOption('chart.width', width);			
		// this.setOption('subtitle.x', subtitleX);
		// this.setOption('legend.x', legendX);
		this.setOption('legend.enabled', legendEnabled, {emitChartOptionsUpdate:1});
		// console.log(this.options)
	}
}

class BreakdownMachinesChart extends PieChartBase {
	constructor(resources) {
		super();
		// this.initialSetup(resources);
		let options = {
			chart: { height: 500 },
			legend: {
				enabled: true,
				align: 'left',
				itemMarginBottom: 15,
				navigation: { enabled: false }
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						// format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
						format: '{point.percentage:.1f} %',
						distance: -30,
						filter: {
							property: 'percentage',
							operator: '>',
							value: 4
						}
					},
					showInLegend: true
				}
			}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	setupResultData(data) {
		return {
			statistics_result: {
				main: {
					pointsData: {
						base: data.map(di => ({
							key: di.key,
							name: di.name,
							y: di.value,
							color: di.color ? di.color : undefined
						}))
					}
				}
			}
		};
	}
}

class HealthCardChart extends PieChartBase {
	constructor(resources) {
		super();
		// this.initialSetup(resources);
		let options = {
			chart: {
				height: '100%',
				backgroundColor: '#fbfbfb',
				spacingBottom: 10,
				spacingLeft: 10,
				spacingRight: 10,
				spacingTop: 10
			},
			subtitle: { x: 0, y: 10 },
			legend: { enabled: false },
			plotOptions: {
				pie: {
					enableMouseTracking: false,
					allowPointSelect: false,
					size: '100%',
					innerSize: '60%',
					dataLabels: { enabled: false }
				}
			}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	setupResultData(data) {
		this.options.subtitle.text = `<div class="pie-chart-subtitle">
				<div class="value">${data[0].total}<sub>%</sub></div>
			</div>`;
		return {
			statistics_result: {
				main: {
					pointsData: {
						base: data.map(di => ({
							key: di.key,
							name: di.name,
							y: di.value,
							color: di.color ? di.color : undefined
						}))
					}
				}
			}
		};
	}
}

class WOStatisticsChart extends MaintenanceChartBase {
	constructor(resources) {
		super();
		this.statisticsRequestPayload = {
			url: '/maintenance/statistics'
		};
		// this.initialSetup(resources);
		let options = {
			chart: { type: 'column', height: 235 },

			yAxis: [
				{
					title: { text: '' },
					max: 0
				}
			],
			xAxis: {
				categories: [
					'All',
					'Due This Month',
					'Due This Week',
					'Due Today',
					'Overdue'
				]
			}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	assignDataToYAxis(resultData) {
		try {
			const { base } = resultData.statistics_result.main.pointsData;
			this.options.yAxis[0].max = getMaxValue(getValues('y', base));
		} catch (e) {
			console.warn(e);
		}
	}

	setupResultData(data) {
		const {
			due_today_count,
			overdue_count,
			this_month_count,
			this_week_count,
			completed_count,
			in_work_count,
			pending_count
		} = data;

		return {
			statistics_result: {
				main: {
					pointsData: {
						base: [
							{
								name: 'All',
								y: pending_count + completed_count + in_work_count,
								color: '#009C67'
							},
							{ name: 'Due This Month', y: this_month_count, color: '#2FB5F6' },
							{ name: 'Due This Week', y: this_week_count, color: '#0050EF' },
							{ name: 'Due Today', y: due_today_count, color: '#FFA500' },
							{ name: 'Overdue', y: overdue_count, color: '#BF1E2E' }
						]
					}
				}
			}
		};
	}
}

class SuccessGaugeChart extends MaintenanceChartBase {
	constructor(resources) {
		super();
		this.statisticsRequestPayload = {
			alternateResponseProp: 'data',
			url: resources.payload_1.fetch_action_url
		};

		this.billing_plan_cost = resources.payload_1.billing_plan_cost;
		this.joined_at = resources.payload_1.joined_at;
		this.prorateBillingCost = !!resources.payload_1.prorateBillingCost;
		// this.initialSetup(resources);
		let options = {
			chart: {
				type: 'gauge',
				height: 230
			},

			pane: {
				startAngle: -90,
				endAngle: 90,
				background: null,
				center: ['50%', '75%'],
				size: '160%'
			},

			yAxis: {
				min: 0,
				max: 200,
				tickPixelInterval: 52,
				tickPosition: 'inside',
				tickColor: '#FFFFFF',
				tickLength: 52,
				tickWidth: 8,
				minorTickInterval: null,
				lineWidth: 0,

				labels: {
					enabled: false
					// distance: 20,
					// style: { fontSize: '14px' }
				},
				plotBands: [
					{
						from: 0,
						to: 100,
						color: '#F30606',
						thickness: 50
						// outerRadius: 173,
					},
					/*{
						from: 120,
						to: 160,
						color: '#DDDF0D',
						thickness: 20
					},*/
					{
						from: 100,
						to: 200,
						color: '#009C67',
						thickness: 50
						// outerRadius: 173,
					}
				]
			},
			plotOptions: {
				gauge: {
					tooltip: {
						valuePrefix: '$'
					},
					dataLabels: {
						format: '${y}',
						borderWidth: 0,
						color: '#333333',
						style: {
							fontSize: '14px'
						},
						y: 25
					},
					dial: {
						radius: '82%',
						backgroundColor: '#666',
						baseWidth: 20,
						baseLength: '0%',
						rearLength: '0%'
					},
					pivot: {
						backgroundColor: '#fff',
						borderWidth: 10,
						borderColor: '#666',
						radius: 20
					}
				}
			}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	checkIsHasStatistics() {
		return this.resultData.statistics_result.main.pointsData.base.length;
	}

	modifySeriesConfig({ seriesConfig }) {
		seriesConfig.pointsData.seriesConfigsList[0][0].inject = {
			name: 'Cost'
		};
		return seriesConfig;
	}

	assignDataToYAxis(resultData) {
		try {
			const { yMax, redArea } = resultData.statistics_result.main.pointsData;
			this.options.yAxis.max = yMax;
			this.options.yAxis.plotBands[0].to = redArea;
			this.options.yAxis.plotBands[1].from = this.options.yAxis.plotBands[0].to;
			this.options.yAxis.plotBands[1].to = yMax;
		} catch (e) {
			console.warn(e);
		}
	}

	// How many monthly bills the selected range covers, day-weighted: each
	// calendar month contributes the share of its own days that the range
	// touches. A partial month is a fraction rather than being dropped, so
	// ranges shorter than a month still prorate to a real cost instead of 0.
	getBillingMonthsInRange() {
		const daterange = this.resources?.filters?.daterange;
		if (!daterange || !daterange.length) return 12;

		let rangeStart = new Date(daterange[0]);
		let rangeEnd = new Date(daterange[1]);

		if (this.joined_at) {
			const joinedDate = new Date(this.joined_at);
			if (joinedDate > rangeStart) rangeStart = joinedDate;
		}

		// Quarter shortcuts can end in the future (picking Q3 in August selects
		// Jul 1 - Sep 30). Only time that has actually elapsed has been billed.
		const today = new Date();
		if (rangeEnd > today) rangeEnd = today;

		if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime()) || rangeEnd < rangeStart) {
			return 0;
		}

		const endYear = rangeEnd.getUTCFullYear();
		const endMonth = rangeEnd.getUTCMonth();

		let months = 0;
		let year = rangeStart.getUTCFullYear();
		let month = rangeStart.getUTCMonth();
		let firstDay = rangeStart.getUTCDate();

		while (year < endYear || (year === endYear && month <= endMonth)) {
			const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
			const lastDay =
				year === endYear && month === endMonth ? rangeEnd.getUTCDate() : daysInMonth;

			months += (lastDay - firstDay + 1) / daysInMonth;

			firstDay = 1;
			month += 1;
			if (month > 11) {
				month = 0;
				year += 1;
			}
		}

		return months;
	}

	setupResultData(data) {
		try {
			const { roi_cost, billing_plan_cost } = data || {};
			// const { billing_plan_cost } = this;
			let billing_plan_cost_final = billing_plan_cost || this.billing_plan_cost;
			// const { yMax, currentValue, redArea } = data;
			let yMax = 500;
			let currentValue = 0;
			let redArea = 150;
			// roi_cost already covers only the selected range (the roi-cost
			// endpoint is called with dateStart/dateFinish), so it is never
			// prorated - only the annual billing plan cost is. Coerced to a
			// number because the endpoint can return a decimal string, null, or
			// omit the key for a range with no ROI - a non-numeric value here
			// turns yMax into NaN and collapses the green plot band.
			const roi_cost_final = Number(roi_cost) || 0;

			if (billing_plan_cost_final) {
				if (this.prorateBillingCost) {
					redArea = Math.round(
						(billing_plan_cost_final / 12) * this.getBillingMonthsInRange()
					);
				} else {
					redArea = billing_plan_cost_final;
				}
				yMax = Math.max(redArea * 4, roi_cost_final) || 500;
				currentValue = roi_cost_final; // || 300
			}
			// console.log(data, billing_plan_cost_final, currentValue)

			return {
				statistics_result: {
					main: {
						pointsData: {
							base: currentValue ? [currentValue] : [0],
							yMax,
							redArea
						}
					}
				}
			};
		} catch (e) {
			console.warn(e);
		}
	}

	handleChartInitiatedEvent({target}) {
		this.ChartAPI = target;

		const { selectedColumnsNumber } = this.resources.payload_1;
		if (selectedColumnsNumber) {
			this.handleColumnsNumberChange({val: selectedColumnsNumber });
		}
	}

	handleColumnsNumberChange({val, isPrintOpen}) {
		const { clientWidth } = this.ChartAPI.container;
		// let	align, layout;
		let height = 230;
		let pivotR = 20;
		let marginLeft = 0;

		if (isPrintOpen) {
			
			if (val === undefined || val < 3) {
				if (clientWidth < 212) {
					height = clientWidth - (clientWidth * 0.38);
					pivotR = clientWidth * 0.06;
				} else if (clientWidth < 389) {
					marginLeft = -clientWidth * 0.1;
					height = clientWidth - (clientWidth * 0.5);
				} else if (clientWidth < 509) {
					marginLeft = -clientWidth * 0.3;
					height = clientWidth - (clientWidth * 0.6);
				} else if (clientWidth < 629) {
					marginLeft = -clientWidth * 0.43;
					height = clientWidth - (clientWidth * 0.7);
				} else if (clientWidth < 749) {
					marginLeft = -clientWidth * 0.5;
					height = clientWidth - (clientWidth * 0.75);
				} else if (clientWidth < 1069) {
					marginLeft = -clientWidth * 0.65;
					height = clientWidth - (clientWidth * 0.82);
				}
			} else {
				if (clientWidth < 212) {
					height = clientWidth - (clientWidth * 0.38);
					pivotR = clientWidth * 0.06;
				} else if (clientWidth < 293) {
					marginLeft = -clientWidth * 0.26;
					height = clientWidth - (clientWidth * 0.57);
					pivotR = clientWidth * 0.05;
				} else if (clientWidth < 372) {
					marginLeft = -clientWidth * 0.39;
					height = clientWidth - (clientWidth * 0.65);
					pivotR = clientWidth * 0.035;
				} else if (clientWidth < 452) {
					marginLeft = -clientWidth * 0.5;
					height = clientWidth - (clientWidth * 0.7);
					pivotR = clientWidth * 0.03;
				} else if (clientWidth < 665) {
					marginLeft = -clientWidth * 0.66;
					height = clientWidth - (clientWidth * 0.8);
					pivotR = clientWidth * 0.02;
				}
			}

			// console.log('clientWidth open', val, clientWidth, height)
		} else {
			// console.log('clientWidth', val, clientWidth)

			if (val > 2 && clientWidth < 350 ) {
				height = clientWidth - (clientWidth * 0.3);
				pivotR = clientWidth * 0.08;
				marginLeft = 10;
			}
		}
		// console.log('set option', marginLeft, clientWidth, height)
		this.setOption('chart.marginLeft', marginLeft);
		this.setOption('plotOptions.gauge.pivot.radius', pivotR);
		this.setOption('chart.height', height, {emitChartOptionsUpdate:1});			
		// console.log('isPrintOpen', isPrintOpen)

	}
}

class RSSIChart extends MaintenanceChartBase {
	constructor(resources) {
		super();
		this.sensorId = resources.payload_1.sensorId;
		this.chartTitle = Lang.tt('phrases.connection_strength_trend');
		this.statisticsRequestPayload = {
			url: `/sensors/${this.sensorId}/rssi`
		};
		// this.initialSetup(resources);
		let options = {
			chart: { type: 'column', height: 210, spacingBottom: 21 },
			boost: {
				enabled: true,
				useGPUTranslations: false
			},
			navigator: { enabled: false },
			yAxis: [
				{
					title: {
						text: `<span style="white-space: nowrap">${Lang.tt(
							'phrases.Connection_Strength'
						)} (-dBm)</span>`,
						useHTML: true,
						style: { whiteSpace: 'nowrap' }
					},
					max: 100,
					min: 0
				}
			],
			xAxis: {
				type: 'datetime',
				ordinal: false,
				minRange: undefined
			}

			// plotOptions: {}
		};

		this.injectProps('options', options);

		this.finalSetup(resources);
	}

	getSeriesConfig() {
		return RSSISeriesConfig();
	}

	checkIsHasStatistics() {
		return true;
		// const { alarm, warning, base } = this.resultData.statistics_result.main.pointsData;
		// return !!alarm.length || !!warning.length || !!base.length;
	}

	/*assignDataToYAxis(resultData) {
		try {
			const { max_value } = resultData.statistics_result.main.pointsData;
			let max = max_value > NCD_RSSI_TYPES.HIGH ? max_value : NCD_RSSI_TYPES.HIGH;
			this.options.yAxis[0].max = max;
		} catch(e) {console.warn(e)}
	}*/

	setupResultData(data) {
		try {
			const pointsData = standard_datetime({
				statistics: data,
				xKey: 'created_at',
				yKey: 'rssi',
				filters: {},
				zonesList: [
					{ key: 'alarm', current_zone: NCD_RSSI_TYPES.HIGH },
					{ key: 'warning', current_zone: NCD_RSSI_TYPES.MODERATE }
				]
			});
			return {
				statistics_result: {
					main: {
						pointsData: pointsData
					}
				}
			};
		} catch (e) {
			console.warn(e);
		}
	}
}

export const executeChartFactory = (name, resources) => {
	switch (name) {
		case 'WObarChart':
			return new WObarChart(resources);
		case 'SuccessDashboardProblemsChart':
			return new SuccessDashboardProblemsChart(resources);
		case 'RequisitionStatisticsChart':
			return new RequisitionStatisticsChart(resources);
		case 'PDMStatisticsPieChart':
			return new PDMStatisticsPieChart(resources);
		case 'WOStatisticsChart':
			return new WOStatisticsChart(resources);
		case 'BreakdownMachinesChart':
			return new BreakdownMachinesChart(resources);
		case 'HealthCardChart':
			return new HealthCardChart(resources);
		case 'SuccessGaugeChart':
			return new SuccessGaugeChart(resources);
		case 'RSSIChart':
			return new RSSIChart(resources);
		
		default:
			return null;
	}
};

/*export const executeWObarChart = resources => new WObarChart(resources);
export const executeSuccessDashboardProblemsChart = resources =>
	new SuccessDashboardProblemsChart(resources);
export const executeRequisitionStatisticsChart = resources =>
	new RequisitionStatisticsChart(resources);
export const executePDMStatisticsPieChart = resources =>
	new PDMStatisticsPieChart(resources);
export const executeWOStatisticsChart = resources =>
	new WOStatisticsChart(resources);
export const executeBreakdownMachinesChart = resources =>
	new BreakdownMachinesChart(resources);
export const executeHealthCardChart = resources => new HealthCardChart(resources);
export const executeSuccessGaugeChart = resources =>
	new SuccessGaugeChart(resources);
export const executeRSSIChart = resources => new RSSIChart(resources);*/
