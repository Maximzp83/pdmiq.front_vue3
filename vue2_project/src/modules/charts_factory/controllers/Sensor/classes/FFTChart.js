import ChartBase from '../../../classes/Chart';

import { fetch_ncd_sensor_fft_statistics } from '../api/index.js';
import { mergeObjects, cloneDeep, findItemBy, buildFormula, getRoundedValue } from '@/helpers';
import { METRIC_SYSTEM_TYPES, NCD_SENSOR_PARAMETERS_TYPES, SENSOR_PARAMETERS_TYPES } from '../enums';

// import { ncdAxisList } from '@/constants/global';
import {
	getUnitType,
	setupParameterName,
	setupFFTCursorItem,
	setupFFTPeaksList
} from '../methods';
import { ncdAxisList } from '../enums';
import { colorsList } from '../../../enums';
import { FFTDefaultSeriesConfig } from '../FFTChartsListsConfig';

class FFTChartBase extends ChartBase {
	constructor() {
		// console.log('SensorChart resources', resources)
		super();
		this.generateSeriesByStatistics = false;
		// -------------- 3 level payload ----------
		let options = {
			xAxis: {
				type: 'linear',
				title: {}
			}
		};
		this.seriesConfig = this.getSeriesConfig();

		this.transformator_settings = {
			...this.transformator_settings,
			events: {
				...this.transformator_settings.events,
				handleUpdateSeries: e => this.handleUpdateSeries(e)
			},
			name: 'FFTStatistics',
			specification: {
				setupPointsData: true
			}
		};

		// ------------------------------
		// console.log('1', options)
		this.injectProps('options', options);
	}

	getFetchedStatistics() {
		return Object.values(this.fetched_statistics_data)[0];
	}

	/*initialSetup(resources) {
		console.log('initialSetup', resources)
		const { sensorItem, fftId, currentSensorType } = resources.payload_1;
		const { chart_id  } = resources.chart_config;
		const chart_id_splitted = chart_id.split('-');
		this.chart_parameter_id =
			chart_id_splitted.length > 1
				? +chart_id_splitted[chart_id_splitted.length - 1]
				: null;
		this.sensorItem = sensorItem;
		this.fftId = fftId;
		this.currentSensorType = currentSensorType;
		this.metric = resources.filters.metric;

		this.peaksList = [];
	}*/

	handleChartInitiatedEvent({ target }) {
		this.ChartAPI = target;
		// console.log('handleChartInitiatedEvent', this.ChartAPI);
	}

	setupUnitTypeName(payload) {
		// const { requestsList } = this;
		if (this.currentSensorType.isBannerM25) {
			if (
				// name == 'g' && (
					this.parameterItem.id === NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM ||
					this.parameterItem.id === NCD_SENSOR_PARAMETERS_TYPES.X_TRANSFORM_ACCELERATION ||
					this.parameterItem.id === SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION
				// )
			) {
				return 'USg';
			}
			// console.log(this.parameterItem, name);
		}

		return getUnitType(payload);
	}

	checkIsHasStatistics() {
		/*console.log('inner checkIsHasStatistics', this.fetched_statistics_data, Object.keys(this.fetched_statistics_data).some(key => {
			return this.fetched_statistics_data[key].points.length;
		}))*/

		return Object.keys(this.fetched_statistics_data).some(key => {
			return this.fetched_statistics_data[key].points.length;
		});
	}

	// --------- Y Axis -------------

	localSetupYAxis({ resources, requestsList }) {
		try {
			const YAxisList = resources.chart_config.YAxisList || [requestsList[0]];
			const yAxisOptions = resources.chart_config.yAxisOptions || {};
			const unit_type_name = this.setupUnitTypeName({
				parameterItem: this.parameterItem,
				measurement: this.measurement
			});

			// console.log('localSetupYAxis', resources)
			this.options.yAxis = [];
			YAxisList.forEach(() => {
				let axis = {
					max: 1,
					// min: 0,
					softMin: 0,
					softMax: 1,
					title: {
						text: unit_type_name || '-'
					},
					startOnTick: false,
					opposite: false,
					// tickPositioner: yAxisTickPositioner,
					...yAxisOptions
				};

				this.options.yAxis.push(axis);
			});
		} catch (e) {
			console.warn(e);
		}
	}

	localSetupXAxis() {
		if (this.parameterItem) {
			// console.log('localSetupXAxis')
			if (this.parameterItem.type == 'waveform') {
				this.setOption('xAxis.title.text', 'Seconds', {
					emitChartOptionsUpdate: true
				});
			} else {
				this.setOption(
					'xAxis.title.text',
					this.measurement === METRIC_SYSTEM_TYPES.IMPERIAL ? 'CPM' : 'Hz',
					{ emitChartOptionsUpdate: true }
				);
			}
		}
	}

	assignDataToYAxis(resultData, additionalProps = {}) {
		// console.log('assignDataToYAxis', resultData, this.options.yAxis[0])
		try {
			const { chart_all_data_max_value, chart_points_max_value } = resultData;
			const { withoutReserveForMax } = this.resources.chart_config;
			let yAxis = cloneDeep(this.options.yAxis[0]);
			// console.log('localSetupYAxis')
			yAxis.max = withoutReserveForMax
				? chart_all_data_max_value
				: chart_all_data_max_value + chart_all_data_max_value / 9;
			yAxis.softMax = withoutReserveForMax
				? chart_points_max_value
				: chart_points_max_value + chart_points_max_value / 9;
			// yAxis.title.text = this.unit_type_name || '-';
			// console.log('assignDataToYAxis', yAxis)

			this.options.yAxis[0] = { ...yAxis, ...additionalProps };
		} catch (e) {
			console.warn(e);
		}
	}

	// --------- Series -------------
	getSeriesConfig(payload) {
		return FFTDefaultSeriesConfig(payload);
	}

	isUpdateSeries(resources) {
		return this.measurement !== resources.filters.measurement;
	}

	isMetricXAxis() {
		return this.measurement === METRIC_SYSTEM_TYPES.METRIC;
	}

	convertRpmToXAxisValue(rpmValue) {
		const value = +rpmValue;
		if (isNaN(value)) return rpmValue;
		return this.isMetricXAxis() ? value / 60 : value;
	}

	convertXAxisValueToRpm(xValue) {
		const value = +xValue;
		if (isNaN(value)) return xValue;
		return this.isMetricXAxis() ? value * 60 : value;
	}

	convertFormulaResultToXAxisValue(value) {
		const preparedValue = +value;
		if (isNaN(preparedValue)) return value;
		return this.isMetricXAxis() ? preparedValue / 60 : preparedValue;
	}
}

class FFTChart extends FFTChartBase {
	constructor(resources) {
		super();

		this.initialSetup(resources);
		// -------------- 3 level payload ----------
		let options = {
			chart: {
				type: 'line',
				zoomType: 'x'
			},
			boost: { enabled: false },
			tooltip: {
				enabled: false
			},
			plotOptions: {
				stickyTracking: true
			},
			xAxis: {min: 0},
			annotations: [],
		};
		// this.seriesConfig = this.getSeriesConfig();

		this.transformator_settings.specification.setupFlagsData = {
			setupCursorsData: true
		};

		// ------------------------------
		// console.log('1', options)
		this.injectProps('options', options);
		// ----------------------------------
		this.finalSetup(resources);
	}

	initialSetup(resources) {
		const { sensorItem, fftId, currentSensorType } = resources.payload_1;
		const { chart_id /*config_settings*/ } = resources.chart_config;
		const chart_id_splitted = chart_id.split('-');
		this.measurement = resources.filters.measurement;

		this.fft_annotation_template = {
			events: {},
			draggable: '',
			labelOptions: {
				// backgroundColor: 'gray',
				// verticalAlign: 'top',
				// y: 3,
				// x: 3,
				borderWidth: 1,
				allowOverlap: true,
				className: 'fft-analysis-annotation'
			},
			zIndex: 50,
			labels: []
		};

		this.chart_parameter_id =
			chart_id_splitted.length > 1
				? +chart_id_splitted[chart_id_splitted.length - 1]
				: null;
		this.sensorItem = sensorItem;
		this.fftId = fftId;
		this.currentSensorType = currentSensorType;

		this.peaksList = [];
		this.cursorInitialData = {
			isOdd: false
		};
		this.periodicCursorsInitialData = {};
		this.redrawScheduled = false;

		this.localSeriesEvents = {
			cursorClickEvent: {
				name: 'click',
				event: ({ point }) => this.removeCursor(point)
			},
			cursorDragEvent: { name: 'drag', event: e => this.handleCursorDrag(e) },
			periodicCursorDragEvent: {
				name: 'drag',
				event: e => this.handlePeriodicCursorDrag(e)
			},
			rpmCursorDragEvent: {
				name: 'drag',
				event: e => this.handleRpmCursorDrag(e)
			},
			rpmCursorDropEvent: {
				name: 'drop',
				event: e => this.handleRpmCursorDrag(e, {isDrop:1})
			}
		};
	}

	allSettingsParsedCallback() {
		this.resources.payload_1.parameterItem = findItemBy(
			'id',
			this.chart_parameter_id,
			this.requestsList
		);
		this.parameterItem = this.resources.payload_1.parameterItem;
	}

	setupChartTitle() {
		// const { settings_payload } = resources.settings_payload;
		try {
			const { requestsList, sensorItem } = this;
			// console.log(resources, this)
			let result = '';

			if (requestsList && requestsList.length) {
				const { parameterItem, currentSensorType } = this;
				const { isBannerM25 } = currentSensorType;
				const axisItem = findItemBy('id', parameterItem.axis_id, ncdAxisList);
				// result = `${parameterItem.name} ${axisItem.type_key}`;

				if (axisItem && axisItem.type_key) {
					let axisType = isBannerM25 ? axisItem.ultrasound_fft_name_full : axisItem.type_key;
					let vertical = '';

					if (!isBannerM25 && sensorItem.ncd_active_axial_axis) {
						axisType = 
							parameterItem.axis_id == sensorItem.ncd_active_axial_axis
								? 'axial'
								: 'radial';
					}

					if (sensorItem.ncd_active_vertical_axis === axisItem.id) {
						vertical = ' (V)';
					}
					result = parameterItem.name_fft || parameterItem.name;
					result = result.slice(0, -1);
					result += ` - ${axisType}${vertical})`;
				} else {
					result += ` ${parameterItem.name}`;
				}
			}
			return result;
		} catch (e) {
			console.warn(e);
		}
	}

	chartDataReadyCallback() {
		this.generatePeaks();

		if (this.rpmSourceValue != null) {
			this.addRpmCursor();
		}
	}

	hasCursorFlagConfig() {
		const seriesConfigIncludes = this.resources?.chart_config?.seriesConfigIncludes;
		return seriesConfigIncludes && seriesConfigIncludes.includes('cursor_flag');
	}

	toggleChart(chartIsHidden) {
		this.chartIsHidden = chartIsHidden !== undefined ? chartIsHidden : !this.chartIsHidden;
		// this.setValue('chartIsHidden', this.chartIsHidden);
	}

	// --------- Y Axis -------------
	getXAxisTitle() {
		const units = this.options.xAxis.title.text;
		return units == 'Seconds' ? 'sec' : units;
	}
	getYAxisTitle() {
		return this.options.yAxis[0].title.text;
	}

	localUpdateYAxisTitle(isUpdateOptions) {
		const unit_type_name = this.setupUnitTypeName({
			parameterItem: this.parameterItem,
			measurement: this.measurement
		});

		this.setOption('yAxis.0.title.text', unit_type_name || '-', {
			emitChartOptionsUpdate: isUpdateOptions
		});
	}

	// --------- Series -------------
	modifySeriesConfig({ requestsList, resources, seriesConfig }) {
		const { filters /*chart_config*/ } = resources;
		this.measurement = filters.measurement;

		const { ncd_active_axial_axis } = this.sensorItem;
		requestsList.forEach((parameterItem, idx) => {
			const unit_type_name = this.setupUnitTypeName({
				parameterItem,
				measurement: this.measurement
			});
			// console.log(seriesConfig)
			seriesConfig.pointsData.seriesConfigsList[
				idx
			] = seriesConfig.pointsData.seriesConfigsList[idx].map(item => {
				if (item.id == 'transparent-serie') return item;
				return mergeObjects(item, {
					inject: {
						name: setupParameterName({parameterItem, ncd_active_axial_axis}),
						tooltip: { valueSuffix: ` ${unit_type_name}` }
					}
				});
			});
		});

		return seriesConfig;
	}
	// -----------------
	fetchChartDataAction(/*settings = {}*/) {
		try {
			const sensorId = this.sensorItem.id;

			this.requestsList.forEach(ri => {
				const params = {
					parameter: ri.id,
					sensorId,
					fftId: this.fftId
					// ...prepareFilters(this.resources.filters, settings)
				};

				fetch_ncd_sensor_fft_statistics({ params })
					.then(({ value }) => {
						// console.log('2 response', value)
						try {
							this.fetched_statistics_data[`parameter_${ri.id}`] = {
								parameter_item: ri,
								cursors_list: [],
								...value
							};

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

	updateChartByMetric(filters) {
		this.setFilters(filters);
		this.setValue('measurement', filters.measurement);
		this.localSetupXAxis();
		this.localUpdateYAxisTitle(true);
		this.StatisticsTransformator.transform(this.fetched_statistics_data);
	}

	// ------------Cursors---------------
	addCursor(point) {
		const serieId = this.cursorInitialData.isOdd ? 'cursor-flag-serie-odd' : 'cursor-flag-serie-even';
		// this.fetched_statistics_data.cursors_list.push(cursor_item);
		const { index } = findItemBy('id', serieId, this.options.series, {
			returnIndex: true
		});
		// const { index: mainDataSerieIdx } = findItemBy('id', 'base-serie', this.options.series, { returnIndex: true });
		this.options.series[index].data = this.options.series[index].data || [];

		if (index !== undefined) {
			const cursor_item = setupFFTCursorItem({
				x: point.options.x,
				// y: point.options.y,
				id: point.id,
				serie_idx: index,
				point_idx: this.options.series[index].data.length,
				units_x: this.options.xAxis.title.text
				// units_y: this.options.yAxis[0].title.text
			});
			this.options.series[index].data.push(cursor_item);
			this.cursorInitialData.isOdd = !this.cursorInitialData.isOdd;
			this.emitChartOptionsUpdate();
			// const newSeriesData = this.options.series[index].data || [];
			// newSeriesData.push(cursor_item);
			// this.ChartAPI.series[index].setData(newSeriesData, true);
		}
	}

	removeCursor(point) {
		const { index: idxOdd } = findItemBy('id', 'cursor-flag-serie-odd', this.options.series, {
			returnIndex: true
		});

		const { index: idxEven } = findItemBy('id', 'cursor-flag-serie-even', this.options.series, {
			returnIndex: true
		});
		// console.log(point)

		const { index: periodicIdxOdd } = findItemBy(
			'id',
			'periodic-cursor-flag-serie-odd',
			this.options.series,
			{ returnIndex: true }
		);
		const { index: periodicIdxEven } = findItemBy(
			'id',
			'periodic-cursor-flag-serie-even',
			this.options.series,
			{ returnIndex: true }
		);

		if (
			(idxOdd !== undefined || idxEven !== undefined) ||
			(periodicIdxOdd !== undefined || periodicIdxEven !== undefined)
		) {
			if (point) {
				if (idxOdd !== undefined) {
					if (this.options.series[idxOdd].data) {
						this.options.series[idxOdd].data = this.options.series[idxOdd].data.filter(
							pi => pi.id !== point.id
						);
					}
				}
				if (idxEven !== undefined) {
					if (this.options.series[idxEven].data) {
						this.options.series[idxEven].data = this.options.series[idxEven].data.filter(
							pi => pi.id !== point.id
						);
					}
				}
			} else {
				if (idxOdd !== undefined) {
					this.options.series[idxOdd].data = [];
				}
				if (idxEven !== undefined) {
					this.options.series[idxEven].data = [];
				}

				// this.options.series[index].data = [];
				if (periodicIdxOdd !== undefined) {
					this.options.series[periodicIdxOdd].data = [];
				}
				if (periodicIdxEven !== undefined) {
					this.options.series[periodicIdxEven].data = [];
				}
			}

			this.emitChartOptionsUpdate();
		}
	}

	togglePeaks(show) {
		const { index: peakSerieIndex } = findItemBy(
			'id',
			'peak-flag-serie',
			this.options.series,
			{ returnIndex: true }
		);

		if (peakSerieIndex !== undefined) {
			this.options.series[peakSerieIndex].data = show ? this.peaksList : [];
			this.emitChartOptionsReady();
		}
	}

	checkIsPeriodicCursorsGenerated() {
		const { index: oddIdx } = findItemBy(
			'id',
			'periodic-cursor-flag-serie-odd',
			this.options.series,
			{ returnIndex: true }
		);
		const { index: evenIdx } = findItemBy(
			'id',
			'periodic-cursor-flag-serie-even',
			this.options.series,
			{ returnIndex: true }
		);
		let result = [];

		if (oddIdx !== undefined) {
			const { data } = this.options.series[oddIdx];
			result.push(data && data.length);
		}
		if (evenIdx !== undefined) {
			const { data } = this.options.series[evenIdx];
			result.push(data && data.length);
		}

		return result.some(ri => ri);
	}

	generatePeriodicCursors(formData) {
		// console.log('generatePeriodicCursors')
		const start = +formData.start;
		const step = +formData.step;
		const isValidData = !isNaN(start) && !isNaN(step) && /*start > 0 &&*/ step > 0;

		this.periodicCursorsInitialData.step = step;
		this.periodicCursorsInitialData.seriesIndexes = {
			oddIdx: findItemBy(
				'id',
				'periodic-cursor-flag-serie-odd',
				this.options.series,
				{ returnIndex: true }
			).index,
			evenIdx: findItemBy(
				'id',
				'periodic-cursor-flag-serie-even',
				this.options.series,
				{ returnIndex: true }
			).index
		};

		const { oddIdx, evenIdx } = this.periodicCursorsInitialData.seriesIndexes;

		if (oddIdx !== undefined && isValidData) {
			const baseStatistics = this.getTransformedStatistics({
				data_key: 'pointsData'
			}).base;
			const lastPointXvalue = baseStatistics[baseStatistics.length - 1][0];
			this.options.series[oddIdx].data = [];
			this.options.series[evenIdx].data = [];

			let x_value = start;
			const { max_steps } = formData;
			let step_pos = 1;

			if (lastPointXvalue) {
				const units_x = this.options.xAxis.title.text;
				const units_y = this.options.yAxis[0].title.text;

				while (x_value < lastPointXvalue && step_pos <= max_steps) {
					const cursor_item = setupFFTCursorItem({
						id: `periodic-cursor-${step_pos}`,
						step_pos,
						step_idx: step_pos - 1,
						x: x_value,
						y: 0,
						units_x,
						units_y
					});
					const index = step_pos % 2 == 0 ? evenIdx : oddIdx;
					cursor_item.point_idx = this.options.series[index].data.length;

					// this.periodicCursorsInitialData[step_pos] = cursor_item;

					this.options.series[index].data.push(cursor_item);
					x_value += step;
					step_pos++;
				}

				// console.log(this.options.series[index].data)
				this.emitChartOptionsUpdate();
			}
		}
	}

	generatePeaks() {
		const baseSerie = findItemBy('id', 'base-serie', this.options.series);
		if (baseSerie) {
			this.peaksList = setupFFTPeaksList({ statistics: baseSerie.data });
		}
	}

	handleCursorDrag({ target }) {
		const { x, point_idx, serie_idx } = target;
		let newData = this.options.series[serie_idx].data;

		newData[point_idx] = setupFFTCursorItem({ ...newData[point_idx], x });

		this.ChartAPI.series[serie_idx].setData(newData, false);
		// this.options.series[serieIndex].data[point_idx] = newData[point_idx];
		// this.emitChartOptionsUpdate();
	}

	// ------------ RPM Cursor ---------------
	/*handleFFTRpmUpdated(fftItem) {
		if (!this.hasCursorFlagConfig()) {
			return;
		}

		console.log('handleFFTRpmUpdated', fftItem)
	}*/

	addRpmCursor(settings={}) {
		const { rpmSourceValue } = this;
		/*if(this.chart_id == 'chart-3') {
			debugger
		}*/
		if (!rpmSourceValue || !this.hasCursorFlagConfig()) {
			return;
		}
		const {value, draggable} = rpmSourceValue;
		const cursorX = this.convertRpmToXAxisValue(value);
		// console.log('addRpmCursor', value, draggable, this.hasCursorFlagConfig())
		const serieId = 'rpm-cursor-flag-serie';
		const { index } = findItemBy('id', serieId, this.options.series, {
			returnIndex: true
		});

		if (index !== undefined) {
			// console.log('addRpmCursor', this.ChartAPI)
			
			if (!value) {
				this.options.series[index].data = [];
				// this.ChartAPI.series[index].setData([], false);
				this.emitChartOptionsUpdate();
				return;
			}

			this.options.series[index].data = this.options.series[index].data || [];

			const cursor_item = setupFFTCursorItem({
				x: cursorX,
				id: 'rpm-cursor',
				serie_idx: index,
				point_idx: 0,
				units_x: this.options.xAxis.title.text,
				isRpmCursor: true,
			});
			this.options.series[index].data = [cursor_item];
			this.options.series[index].dragDrop.draggableX = draggable;
			// console.log('cursor_item', this.chart_id, cursor_item, this.options.series[index].data)
			// this.ChartAPI.series[index].setData([cursor_item], false);
			if (!settings.skipOptionsUpdate) {
				this.emitChartOptionsUpdate();
			}
		}
	}

	handleRpmCursorDrag({ target }, settings = {}) {
		try {
			if (!this.ChartAPI || !this.rpmSourceValue || !this.hasCursorFlagConfig()) {
				return;
			}

			const { x, serieId, pointId, point_idx, serie_idx } = target;
			// console.log(this.chart_id, this.ChartAPI.series)
			const serieIdx = settings.isUpdateOnly ?
				this.ChartAPI.series.find(serie => serie.userOptions.id === serieId)?.index :
				serie_idx;
			const pointIdx = settings.isUpdateOnly ?
				this.ChartAPI.series[serieIdx].points.find(point => point.id === pointId)?.index :
				point_idx;

			const point = this.ChartAPI.series[serieIdx]?.points[pointIdx];
				// console.log(serieIdx, this.ChartAPI.series[serieIdx])
			if (!point) return;

			this.updateAnnotationsFromFFTAnalysisRules({xValue: x});

			if (settings.isUpdateOnly) {
				const	title = `<div class="fft-cursor"><b>${getRoundedValue(x, 0, 3)} ${point.units_x}</b></div>`;

				point.update({ x, title	}, true, false);

				if (settings.isDrop) {
					this.options.series[serieIdx].data[pointIdx].x = x;
					this.options.series[serieIdx].data[pointIdx].title = title;
				}
				
				return;
			}
			
			if (this.events.rpmCursorDrag) {
				this.events.rpmCursorDrag({ x });
			}

			if (this.events.rpmCursorDragFactoryHandler) {
				this.events.rpmCursorDragFactoryHandler({ point, isDrop: settings.isDrop });
			}

			if (settings.isDrop) {
				this.options.series[serieIdx].data[pointIdx].x = x; 
				// console.log(this.options.series[serieIdx].data[pointIdx]);
				if (this.events.rpmCursorDrop) {
					this.events.rpmCursorDrop({ x });
				}
			}
		} catch (error) {
			console.warn(error);
		}
	}

	handlePeriodicCursorDrag({ target }) {
		//odd - не четные
		const { step_idx, point_idx, x, isOdd } = target;

		const { oddIdx, evenIdx } = this.periodicCursorsInitialData.seriesIndexes;
		const newOddData = this.options.series[oddIdx].data;
		const newEvenData = this.options.series[evenIdx].data;

		if (step_idx === 0) {
			const deltaX = x - newOddData[0].x;

			for (let i = 0; i < newOddData.length; i++) {
				let val = newOddData[i];
				newOddData[i] = setupFFTCursorItem({ ...val, x: val.x + deltaX });
			}
			for (let i = 0; i < newEvenData.length; i++) {
				let val = newEvenData[i];
				newEvenData[i] = setupFFTCursorItem({ ...val, x: val.x + deltaX });
			}
			// newOddData.forEach(point => point.x += deltaX);
			// newEvenData.forEach(point => point.x += deltaX);
			// newOddData[0] = setupFFTCursorItem({ ...newOddData[0] });
		} else {
			const currentPoint = isOdd ? newOddData[point_idx] : newEvenData[point_idx];

			if (currentPoint) {
				const firstPointX = newOddData[0].x;
				const newStep = (x - firstPointX) / step_idx;

				for (let i = 0; i < newOddData.length; i++) {
					let val = newOddData[i];
					if (val.step_idx !== 0) {
						newOddData[i] = setupFFTCursorItem({
							...val,
							x: firstPointX + newStep * val.step_idx
						});
					}
				}
				for (let i = 0; i < newEvenData.length; i++) {
					let val = newEvenData[i];
					if (val.step_idx !== 0) {
						newEvenData[i] = setupFFTCursorItem({
							...val,
							x: firstPointX + newStep * val.step_idx
						});
					}
				}

				/*newOddData.forEach(point => {
					if (point.step_idx !== 0) {
						point.x = firstPointX + newStep*point.step_idx;
					}
				});

				newEvenData.forEach(point => {
					point.x = firstPointX + newStep*point.step_idx;
				});*/
			}
		}
		this.ChartAPI.series[oddIdx].setData(newOddData, false);
		this.ChartAPI.series[evenIdx].setData(newEvenData, false);

		// console.log(newEvenData)
		/*if (!this.redrawScheduled) {
			this.redrawScheduled = true;
			setTimeout(() => {
				this.ChartAPI.redraw();
				this.redrawScheduled = false;
			}, 0);
		}*/
	}

	generateAnnotationsFromFFTAnalysisRules(selectedAnalysisRules) {
		this.options.annotations = [];
		const {value: rpmValue} = this.rpmSourceValue;

		// console.log('generateAnnotationsFromFFTAnalysisRules', rpmValue)
		// this.options.xAxis.minRange = 0.1;
		// this.options.xAxis.startOnTick = false;
		selectedAnalysisRules.forEach((rule_item, idx) => {
			this.options.annotations[idx] = cloneDeep(this.fft_annotation_template);
			const calcFormula = buildFormula(rule_item.original_rule.formula);
			this.options.annotations[idx].customSettings = { calcFormula };
			// console.log('generateAnnotationsFromFFTAnalysisRules', rule_item)
			const { name } = rule_item.original_rule;
			const harmonics = rule_item.active_harmonics != null
				? rule_item.active_harmonics
				: rule_item.original_rule.harmonics;
			let activeValue = /*rule_item.vibration_analysis_custom_value || rule_item.vibration_analysis_value ||*/ (rule_item.option_value_id && rule_item.option_value.value) || rule_item.custom_value;
			// console.log(activeValue, rule_item)
			this.options.annotations[idx].customSettings.harmonics = harmonics;
			this.options.annotations[idx].customSettings.value = +activeValue;
			let start = calcFormula({ rpm: rpmValue, value: +activeValue });
			start = +start;
			const step = +start;
			const startX = this.convertFormulaResultToXAxisValue(start);
			const stepX = this.convertFormulaResultToXAxisValue(step);

			const isValidData = !isNaN(startX) && !isNaN(stepX) && /*start > 0 &&*/ stepX > 0;	
			// console.log(rule_item, start, step, isValidData)

			if (isValidData) {
				const baseStatistics = this.getTransformedStatistics({
					data_key: 'pointsData'
				}).base;

				const lastPointXvalue = baseStatistics[baseStatistics.length - 1][0];
				
				// this.options.series[evenIdx].data = [];

				let x_value = startX;
				const max_steps = +harmonics;
				let step_pos = 1;
				// const y = -(250 - ruleIdx * 20);
				// console.log(x_value, lastPointXvalue)
				if (lastPointXvalue) {

					while (/*x_value < lastPointXvalue &&*/ step_pos <= max_steps) {
						this.options.annotations[idx].labels.push({
							shape: 'connector',
							borderColor: rule_item.color || '#000',
							point: {
								// step_pos,
								// step_idx: step_pos - 1,
								x: x_value,
								y: 0,
								xAxis: 0,
								yAxis: 0,
								// yAxis: 'pixel',
							},
							y: rule_item.y_position,
							useHTML: true,
							text: `
			          <div class="fft-analysis-annotation-label" style="borderColor:${rule_item.color||'#000'}">
			              <div class="title">${name}</div>
			          </div>
								`
						});

						x_value += stepX;
						step_pos++;
					}
				}
			}
		})
		// console.log(this.options.annotations[0].labels)
		this.emitChartOptionsUpdate();
	}

	updateAnnotationsFromFFTAnalysisRules({ xValue }) {
		const rpmValue = this.convertXAxisValueToRpm(xValue);
		this.ChartAPI.annotations.forEach((annotation) => {
		// console.log('updateAnnotationsFromFFTAnalysisRules', annotation, rpmValue)
			const start = annotation.userOptions.customSettings.calcFormula({ rpm: rpmValue, value: annotation.userOptions.customSettings.value });
			const step = +start;
			const startX = this.convertFormulaResultToXAxisValue(start);
			const stepX = this.convertFormulaResultToXAxisValue(step);
			let x_value = startX;
			const newLabels = [];
			annotation.labels.forEach(() => {
				newLabels.push({
					point: { x: x_value	}
				})
				x_value += stepX;
			})
			// console.log(newLabels)
			annotation.update({ labels: newLabels });
		})

		// this.emitChartOptionsUpdate();
		this.ChartAPI.redraw(false);
	}
}

class FFTWaterfall3DChart extends FFTChartBase {
	constructor(resources) {
		super();
		this.initialSetup(resources);

		// -------------- 3 level payload ----------
		let options = {
			chart: {
				type: 'scatter',
				/*panning: {
					enabled: true,
					type: 'xy'
				},*/
				// panKey: 'shift',

				height: 600,
				// margin: 100,
				// zoomType: 'x',
				/*zooming:{
					// key:undefined
					mouseWheel:{
						enabled:true,
						// sensitivity:1.1,
						type:'xy'
					},
				},*/
				options3d: {
					enabled: true,
					alpha: 25,
					beta: 15,
					depth: 350,
					viewDistance: 50,
					// fitToPlot: false,
					frame: {
						bottom: { size: 1, color: 'rgba(0,0,0,0.02)' },
						back: { size: 1, color: 'rgba(0,0,0,0.04)' },
						side: { size: 1, color: 'rgba(0,0,0,0.06)' }
					}
				}
			},
			legend: { enabled: true },
			tooltip: { className: 'tooltip-item' /*enabled: false*/ },
			xAxis: {
				min: 0,
				max: 160000
			},
			zAxis: {
				min: 0,
				max: this.chartsDisplayQuantity,
				showFirstLabel: false
			},
			plotOptions: {
				/*scatter: {
					width: 10,
					height: 10,
					depth: 10
				},*/
				series: {
					marker: { enabled: false },
					lineWidth: 2
					/*point: {
						events: {
							click: e => this.handlePointClick(e)
						}
					},*/
					// stickyTracking: true
				}
				/*scatter: {
					events: {
						click: e => this.handlePointClick(e)
					}
				}*/
			}
		};

		this.transformator_settings.specification.is3D = true;
		this.transformator_settings.specification.sortKeys = true;

		// ------------------------------
		// console.log('1', options)
		this.injectProps('options', options);
		// ----------------------------------
		this.finalSetup(resources);

		/*this.assignSeriesEvents({
			pointClickEvent: { name: 'click', event: (e) => this.handlePointClick(e)},
		});*/
	}

	initialSetup(resources) {
		const {
			sensorItem,
			prevFFTItems,
			currentSensorType,
			parameterItem,
			chartsDisplayQuantity
		} = resources.payload_1;

		this.sensorItem = sensorItem;
		this.parameterItem = parameterItem;
		this.prevFFTItems = prevFFTItems;
		this.currentSensorType = currentSensorType;
		this.chartTitle = '';
		this.eRotationStart;
		this.chartsDisplayQuantity = chartsDisplayQuantity;
		this.zoom_timer = null;
		this.measurement = resources.filters.measurement;
		this.initialZoomData = {};

		/*this.localChartEvents = {
			click: e => this.handleChartClick(e)
		}*/
		/*this.assignChartEvents({
			click: e => this.handleChartClick(e)
		});*/

		/*this.localSeriesEvents = {
			pointClickEvent: { name: 'click', event: (e) => this.handlePointClick(e)},
		}*/
		// console.log(resources, this.prevFFTItems)
		resources.payload_1.requestsList = this.prevFFTItems.map(fftItem => ({
			...parameterItem,
			isCurrent: fftItem.isCurrent,
			fftId: fftItem.id,
			fftCreatedAt: fftItem.created_at
		}));

		if (resources.payload_1.requestsList.length < chartsDisplayQuantity) {
			this.chartsDisplayQuantity = resources.payload_1.requestsList.length;
		}
	}

	handleChartInitiatedEvent({ target }) {
		this.ChartAPI = target;
		if (this.resources.settings.enable3Drotation) {
			this.setupChartRotation(true);
		}
		/*if (this.resources.settings.enable3DrotationBySliders) {
			this.setupChartRotationBySliders(true);
		}*/

		/*if (this.resources.settings.enableWheelZoom) {
			this.setupChartWheelZoom(true);
		}*/

		if (this.resources.settings.enableSlidersZoom) {
			this.setupChartSlidersZoom(true);
		}
	}

	sortStatisticKeys(statistics_data) {
		const sortedKeys = Object.keys(statistics_data).sort((a, b) => {
			const numA = parseInt(a.split('_')[1], 10);
			const numB = parseInt(b.split('_')[1], 10);
			return numB - numA; // По убыванию
		});
		// console.log('1', statistics_data)
		return sortedKeys.reduce((acc, key) => {
			acc[key] = statistics_data[key];
			return acc;
		}, {});
	}

	handleChartsDisplayQuantityChange(n) {
		this.chartsDisplayQuantity = n;

		let currentQuantity = 0;
		this.allSeries.forEach(si => {
			if (si.data && si.data.length) {
				currentQuantity++;
			}
		});

		if (n <= currentQuantity) {
			this.options.series = this.allSeries.map((serie, idx) => {
				return idx < n ? serie : { ...serie, data: [] };
			});
			this.StatisticsTransformator.reCalculateDataMaxValues(
				this.fetched_statistics_data,
				{
					resultsQuantity: n,
					triggerStatisticsTransformUpdated: true
				}
			);
		} else {
			// const delta = n - currentQuantity;
			this.responseCounter = 0;

			for (let i = currentQuantity; i < n; i++) {
				const ri = this.requestsList[i];

				const params = {
					sensorId: this.sensorItem.id,
					parameter: ri.id,
					fftId: ri.fftId
				};

				this.setValue('isLoading', true);
				this.fetchFFTStatistics({
					requestItem: ri,
					params,
					requestsQuantity: n - currentQuantity,
					sortStatisticKeys: true
				});
			}
		}

		this.setOption('zAxis.max', n);
	}

	// --------- X Axis -------------
	localHandleStatisticsTransformUpdated(resultData) {
		this.setOption('xAxis.max', resultData.chart_x_max_value);
		// this.setOption('xAxis.min', 10000);
		// this.setOption('xAxis.max', 20000);
		// this.setOption('xAxis.softMax', 20000);
		// console.log('localHandleStatisticsTransformUpdated', resultData)
		this.assignDataToYAxis(resultData);
		// this.options.yAxis[0].max = 20;
		// this.options.yAxis[0].softMax = 20;

		this.assignDataToSeries(resultData);

		// if (!this.allSeries) {
		this.allSeries = cloneDeep(this.options.series);
		// }
		this.options.series = this.allSeries.map((serie, idx) => {
			return idx < this.chartsDisplayQuantity ? serie : { ...serie, data: [] };
		});

		// this.initialZoomData = {};
		this.emitChartOptionsReady();
	}
	// --------- Series -------------
	modifySeriesConfig({ requestsList, resources, seriesConfig }) {
		const { filters } = resources;
		this.measurement = filters.measurement;

		// const { ncd_active_axial_axis } = this.sensorItem;

		requestsList.forEach((parameterItem, idx) => {
			const unit_type_name = this.setupUnitTypeName({
				parameterItem,
				measurement: this.measurement
			});
			const { fftId, fftCreatedAt } = parameterItem;

			seriesConfig.pointsData.seriesConfigsList[idx] = [
				{
					id: `base-serie-${idx}`,
					data_path: '',
					template: 'fft.base',
					responseDataKey: `fft_${fftId}`,
					event_keys: ['pointClickEvent'],
					inject: {
						// name: `FFT-${fftId} ${setupParameterName(parameterItem, ncd_active_axial_axis)}`,
						name: fftCreatedAt,
						tooltip: { valueSuffix: ` ${unit_type_name}` },
						color: colorsList[idx]
					}
				}
			];
		});

		seriesConfig.flagsData = [];
		// console.log('seriesConfig', seriesConfig)
		return seriesConfig;
	}
	// -----------------
	fetchChartDataAction(settings = {}) {
		try {
			const sensorId = this.sensorItem.id;
			const { rootStatisticsData } = settings;
			const { chartsDisplayQuantity } = this;

			this.requestsList.forEach((ri, idx) => {
				if (idx < chartsDisplayQuantity) {
					const params = {
						sensorId,
						parameter: ri.id,
						fftId: ri.fftId
						// ...prepareFilters(this.resources.filters, settings)
					};

					if (ri.isCurrent) {
						this.fetched_statistics_data[`fft_${ri.fftId}`] = rootStatisticsData;
						this.checkStatisticsResponses({
							requestsQuantity: chartsDisplayQuantity
						});
					} else {
						this.fetchFFTStatistics({
							requestItem: ri,
							params,
							requestsQuantity: chartsDisplayQuantity,
							sortStatisticKeys: true
						});
					}
				}
			});
		} catch (e) {
			console.warn(e);
		}
	}

	fetchFFTStatistics({ requestItem, params, requestsQuantity, sortStatisticKeys }) {
		fetch_ncd_sensor_fft_statistics({ params })
			.then(({ value }) => {
				// console.log('2 response', value)
				try {
					this.fetched_statistics_data[`fft_${requestItem.fftId}`] = value;
					this.checkStatisticsResponses({ requestsQuantity, sortStatisticKeys });
				} catch (e) {
					console.warn(e);
				}
			})
			.catch(() => {
				// console.log('catch')
				this.checkStatisticsResponses({ requestsQuantity, sortStatisticKeys });
			});
	}

	// ----------Sliders Handler----------
	setValueFromSlider({key, val, redraw}) {		
		if (key == 'alpha' || key == 'beta') {
			this.ChartAPI.options.chart.options3d[key] = val;
			this.ChartAPI.redraw(false);
		} else {
			// console.log(key)
			const splited_key = key.split('_');
			const action = splited_key[0];
			const axis_key = splited_key[1];
			let payload = { axis_key, redraw };

			if (action == 'drag') payload.drag_pos = val;
			else if (action == 'zoom') payload.zoom_val = val;

			this.setZoomValue(payload);
		}
	}

	handleSliderChange(payload) {
		if (payload.isReset) {
			this.setValueFromSlider(payload);
		} else {
			if (this.zoom_timer) clearTimeout(this.zoom_timer);

			this.zoom_timer = setTimeout(() => {
				this.zoom_timer = null;
				this.setValueFromSlider(payload);
			}, 10);
		}
	}

	// -------- Rotation----------
	getChartRotationValues() {
		if (this.ChartAPI) {
			return {
				alpha: this.ChartAPI.options.chart.options3d.alpha,
				beta: this.ChartAPI.options.chart.options3d.beta
			};
		}
		return { alpha: 0, beta: 0 };
	}

	// ----------setup chart rotation by mouse drag ----------
	/*setupChartRotation(enable) {
		if (this.ChartAPI) {
			var timer = null;

			const handleMouseMove = e => {
				if (timer) {
					clearTimeout(timer);
				}
				let posX = this.eRotationStart.pageX,
					posY = this.eRotationStart.pageY,
					alpha = this.ChartAPI.options.chart.options3d.alpha,
					beta = this.ChartAPI.options.chart.options3d.beta,
					newAlpha,
					newBeta,
					sensitivity = 60;
				// sensitivity = 1000;

				newBeta = beta + (posX - e.pageX) / sensitivity;
				newAlpha = alpha + (e.pageY - posY) / sensitivity;

				timer = setTimeout(() => {
					timer = null;
					this.ChartAPI.options.chart.options3d.beta = newBeta;
					this.ChartAPI.options.chart.options3d.alpha = newAlpha;
					// console.log('newAlpha')

					this.ChartAPI.redraw(false);
				}, 8);
				// const chart = this.ChartAPI;
			};

			const handleMouseUp = () => {
				// const chartHtmlWrapper = document.querySelector('.waterfall-chart-dialog');

				// if (chartHtmlWrapper) {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('touchdrag', handleMouseMove);
				// }
			};

			if (enable) {
				const startRotation = e => {
					this.eRotationStart = this.ChartAPI.pointer.normalize(e);

					const chartHtmlWrapper = document.querySelector('.waterfall-chart-dialog');

					if (chartHtmlWrapper) {
						document.addEventListener('mousemove', handleMouseMove);
						document.addEventListener('touchdrag', handleMouseMove);
						document.addEventListener('mouseup', handleMouseUp);
						document.addEventListener('touchend', handleMouseUp);
					}
				};

				this.ChartAPI.container.onmousedown = startRotation;
				this.ChartAPI.container.touchstart = startRotation;
			} else {
				this.ChartAPI.container.onmousedown = null;
				this.ChartAPI.container.touchstart = null;

				// const chartHtmlWrapper = document.querySelector('.waterfall-chart-dialog');

				// if (chartHtmlWrapper) {
				document.removeEventListener('mouseup', handleMouseUp);
				document.removeEventListener('touchend', handleMouseUp);
				// }
			}
		}
	}*/

	// ---------Zoom-------
	setupChartSlidersZoom(enable) {
		if (this.ChartAPI) {
			if (enable) {
				const min_y = this.ChartAPI.yAxis[0].min;
				const max_y = this.ChartAPI.yAxis[0].max;
				const min_x = this.options.xAxis.min;
				const max_x = this.options.xAxis.max;
				
				this.initialZoomData = {
					min_x,
					max_x,
					min_y,
					max_y,
					// center_y: (max_y + min_y) / 2,
					// center_y: min_y,
					actual_range_start_y: min_y,
					actual_range_start_x: min_x,
					actual_range_x: max_x - min_x,
					actual_range_y: max_y - min_y,
					// center_x: (max_x + min_x) / 2,
					actualZoomFactor_x: 0.1,
					actualZoomFactor_y: 0.1
				};

				// this.initialZoomData.actual_range_start_x = this.initialZoomData.center_x;
				// this.initialZoomData.actual_range_start_y = this.initialZoomData.center_y;
				// this.initialZoomData.actualZoomFactor_x = this.initialZoomData.zoomFactor_x;
				// this.initialZoomData.actualZoomFactor_y = this.initialZoomData.zoomFactor_y;

				this.ChartAPI.yAxis[0].setExtremes(min_y, max_y, false);
			}
		}
	}

	setZoomValue({axis_key, zoom_val, drag_pos, redraw}) {
		try {
			let {
				[`actualZoomFactor_${axis_key}`]: actualZoomFactor,
				[`actual_range_start_${axis_key}`]: actual_range_start,
				[`min_${axis_key}`]: initial_min,
				[`max_${axis_key}`]: initial_max,
			} = this.initialZoomData;
			if (drag_pos !== undefined) {
				actual_range_start = drag_pos / 100 * initial_max;
				this.initialZoomData[`actual_range_start_${axis_key}`] = actual_range_start;
			}

			if (zoom_val !== undefined) {
				actualZoomFactor = zoom_val / 10;
				this.initialZoomData[`actualZoomFactor_${axis_key}`] = actualZoomFactor;
			}

			const range = (initial_max - initial_min) / actualZoomFactor;
			let min = actual_range_start;
			let max = actual_range_start + range;		

			if (zoom_val !== undefined) {
				const new_drag_pos_max = Math.floor((initial_max - range) / initial_max*100);
				// console.log(axis_key, new_drag_pos_max)

				if (this.events.dragLimitsChange) {
					this.events.dragLimitsChange({ axis_key, new_drag_pos_max });
				}
			}
			
			// console.log(`ZF: ${actualZoomFactor}, Range: ${range}, Min: ${min}, Max: ${max}`);
			if (min < max) {
				if (actualZoomFactor == 1) {
					min = initial_min;
					max = initial_max;
				}
				// console.log('setZoomValue', min, max, redraw)

				this.ChartAPI[`${axis_key}Axis`][0].setExtremes(min, max, redraw);
			}
		} catch (e) {
			console.warn(e);
		}
	}

	// ----------setup chart Zoom by mouse wheel ----------
	/*setupChartWheelZoom(enable) {
		if (this.ChartAPI) {
			const chart = this.ChartAPI;
			const maxYZoom = 1; // Верхний предел
			const threshold = 0.8; // Пороговое значение

			const getFinalYZoomFactor = yZoomFactor => {
				if (yZoomFactor > threshold) {
					return (
						threshold +
						(maxYZoom - threshold) * (1 - Math.exp(-2 * (yZoomFactor - threshold)))
					);
				}
				return yZoomFactor < 0 ? 0 : yZoomFactor;
			};

			const handleMouseWheel = e => {
				e.preventDefault();
				const pointer = chart.pointer.normalize(e);
				const point = chart.series[0].searchPoint(pointer, true);

				if (point) {
					try {
						let {
							yZoomFactor,
							zoomFactor,
							x_min,
							x_max,
							y_max
						} = this.initialZoomData;
						const delta = e.deltaY > 0 ? 0.9 : 1.1; // Определяем направление зума
						zoomFactor *= delta;

						const yMin = chart.yAxis[0].min;
						const yMax = chart.yAxis[0].max;
						yZoomFactor = e.deltaY < 0 ? yZoomFactor + 0.08 : yZoomFactor - 0.08;
						yZoomFactor = Math.round(yZoomFactor * 10) / 10;
						const finalYZoomFactor = getFinalYZoomFactor(yZoomFactor);
						// yZoomFactor = yZoomFactor > 0.9 ? x : yZoomFactor;
						let newYmax = y_max - finalYZoomFactor * y_max;
						// console.log(`ZF: ${yZoomFactor}, FZF: ${finalYZoomFactor} Min: ${yMin}, Max: ${newYmax}`);
						newYmax = newYmax <= yMin ? yMax : newYmax;

						// Ограничиваем zoomFactor, чтобы ось не становилась некорректной
						zoomFactor = Math.max(0.1, Math.min(zoomFactor, 10)); // Минимум 0.1, максимум 10
						zoomFactor = Math.round(zoomFactor * 10) / 10;

						// Вычисляем новое окно экстремумов по X относительно точки
						const pointX = point.x;
						const range = (x_max - x_min) / zoomFactor;

						let min = pointX - range / 2;
						let max = pointX + range / 2;
						min = min >= max ? max : min;
						min = min < x_min ? x_min : min;
						max = min >= max ? min : max;
						max = max > x_max ? x_max : max;

						if (max >= x_max && min <= x_min) {
							zoomFactor = 1;
							yZoomFactor = 0;
						}

						// console.log(`ZF: ${zoomFactor}, P=${pointX} Range: ${range}, Min: ${min}, Max: ${max}`);
						this.initialZoomData.zoomFactor = zoomFactor;
						this.initialZoomData.yZoomFactor = yZoomFactor;

						if (min < max) {
							chart.yAxis[0].setExtremes(yMin, newYmax, false);
							chart.xAxis[0].setExtremes(min, max);

							// console.log(newYmax)
						}
					} catch (e) {
						console.warn(e);
					}
				}
			};

			if (enable) {
				chart.container.addEventListener('wheel', handleMouseWheel);
			} else {
				chart.container.removeEventListener('wheel', handleMouseWheel);
			}
		}
	}*/

	// --------------------------

	handleChartClick(e) {
		console.log(e);
	}

	handlePointClick(e) {
		console.log(e);
	}
}

// export const executeFFTChartFactory = resources => new FFTChart(resources);
export const executeChartFactory = (name, resources) => {
	// console.log(name, resources)
	switch (name) {
		case 'FFTChart':
			return new FFTChart(resources);
		case 'FFTWaterfall3DChart':
			return new FFTWaterfall3DChart(resources);
		default:
			return null;
	}
};
