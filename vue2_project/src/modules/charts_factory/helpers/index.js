import {
	prepareRangeParams,
	roundNearest,
	getRoundedValue,
	countDecimalOrder
} from '@/helpers';

const prepareFilters1 = (filters, settings = {}) => {
	const { excludeGetParams, predefinedFilters } = settings;

	let newFilters = {};

	if (excludeGetParams) {
		for (let key in filters) {
			if (!excludeGetParams.some(p => p == key)) {
				newFilters[key] = filters[key];
			}
		}
	} else {
		newFilters = { ...filters };
	}

	if (predefinedFilters) {
		newFilters = { ...newFilters, ...predefinedFilters };
	}

	if (filters.daterange && filters.daterange.length) {
		newFilters = {
			...newFilters,
			...prepareRangeParams(filters.daterange, settings)
		};
		// console.log('filters', filters.daterange, newFilters)

		delete newFilters.daterange;
		delete newFilters.daterange_setted_at;
		delete newFilters.items_active_grid_type;
	}

	return newFilters;
};

const selectPointsByChartSelection1 = (e, chartSeries) => {
	const { series } = e.target;
	let selectedPoints = [];
	// console.log('selectPointsByChartSelection1', series)
	series.forEach(si => {
		const { custom_id, className } = si.userOptions;
		let isValid = false;

		if (
			className != 'highcharts-navigator-series' &&
			className != 'thresholds-line history-line' &&
			className != 'thresholds-line' &&
			custom_id != 'transparent-serie'
		) {
			if (custom_id) {
				isValid =
					custom_id == 'base_series' ||
					custom_id == 'warning_series' ||
					custom_id == 'alarm_series';
			}
		}
		if (isValid) {
			const xAxisMin = e.xAxis ? e.xAxis[0].min : e.target.xAxis[0].min;
			const xAxisMax = e.xAxis ? e.xAxis[0].max : e.target.xAxis[0].max;
			// console.log(custom_id, className)
			// console.log('serie', si)
			if (si.boosted) {
				const { data } = chartSeries[si.index];
				// console.log(chartSeries, si.index, chartSeries[si.index])
				for (let i = 0; i < data.length; i++) {
					const point = data[i];

					if (point[0] >= xAxisMin && point[0] <= xAxisMax) {
						selectedPoints.push(point);
					}
				}
			} else {
				si.points.forEach(point => {
					// console.log(point.x, xAxisMin, xAxisMax)
					if (
						point.x >= xAxisMin &&
						point.x <= xAxisMax
						// point.y >= e.yAxis[0].min && point.y <= e.yAxis[0].max
					) {
							// console.log(point)
						if (point.series) {
							const { data } = point.series.options;
							selectedPoints.push(data[point.index]); //[1648792586000, 1.89, 103336626,]
							// point.setState('select', true);
						}
					}
				});
			}
		}
	});

	selectedPoints.sort(function(a, b) {
		return a[0] - b[0];
	});
	// console.log(sortedArray)
	return selectedPoints;
};

const getSelectedPoints1 = ({ event, chartSeries, date_start, date_finish }) => {
	const selectedPoints = selectPointsByChartSelection1(event, chartSeries);
	// console.log(event, selectedPoints, chartSeries/*(selectedPoints[0].y || selectedPoints[0][1])*/)
	if (selectedPoints.length) {
		const firstPointVal_x = date_start
			? Date.parse(date_start + '.000Z')
			: selectedPoints[0].x || selectedPoints[0][0];

		const lastPoint = selectedPoints[selectedPoints.length - 1];

		const lastPointVal_x = date_finish
			? Date.parse(date_finish + '.000Z')
			: lastPoint.x || lastPoint[0];

		const firstPointVal_y = selectedPoints[0].y || selectedPoints[0][1];
		const lastPointVal_y = lastPoint.y || lastPoint[1];

		return {
			x: (firstPointVal_x + lastPointVal_x) / 2,
			y: (firstPointVal_y + lastPointVal_y) / 2,
			firstPointVal_x: firstPointVal_x,
			lastPointVal_x: lastPointVal_x,
			yMax: event.target.yAxis[0].max
		};
	} else {
		return {};
	}
};

const yAxisTickPositioner1 = (min, max, settings = {}) => {
	// console.log('1', min, max)
	try {
		const { withoutRoundExtremes } = settings;

		if (min !== undefined && max !== undefined) {
			const diff = (max - min) / 4;

			if (withoutRoundExtremes) {
				const positions = [min];
				const roundTickValue = value => {
					if (diff > 3) {
						return roundNearest(5, value);
					} else if (diff > 1) {
						return Math.round(value);
					} else if (diff > 0.5) {
						return roundNearest(0.5, value) || 0.5;
					} else if (diff > 0.1) {
						return roundNearest(0.1, value) || 0.1;
					} else if (diff > 0.01) {
						return roundNearest(0.05, value) || 0.01;
					} else if (diff > 0.001) {
						return roundNearest(0.005, value) || 0.001;
					}

					return value;
				};

				for (let idx = 1; idx < 4; idx++) {
					positions.push(roundTickValue(min + diff * idx));
				}

				const lastStep = positions[positions.length - 1] - positions[positions.length - 2];
				let lastTick = positions[positions.length - 1] + lastStep;

				if (lastTick < max) {
					lastTick = roundTickValue(max);
				}

				if (lastTick < max) {
					lastTick = max;
				}

				positions.push(lastTick);
				return positions;
			}

			const firstPosition = getRoundedValue(min, 0, countDecimalOrder(min) + 1);
			// console.log('min', min, 'max', max)
			let positions = [firstPosition],
				tick = roundNearest(5, Math.floor(min));

			let incr_rounded;
			if (diff > 3) {
				incr_rounded = roundNearest(5, diff);
			} else if (diff > 1) {
				incr_rounded = Math.ceil(diff);
			} else if (diff > 0.5) {
				incr_rounded = roundNearest(0.5, diff) || 0.5;
			} else if (diff > 0.1) {
				incr_rounded = roundNearest(0.1, diff) || 0.1;
			} else if (diff > 0.01) {
				incr_rounded = roundNearest(0.05, diff) || 0.01;
			} else if (diff > 0.001) {
				incr_rounded = roundNearest(0.005, diff) || 0.001;
			} else incr_rounded = 0;

			let increment = incr_rounded ? incr_rounded : diff; // if !0
			// console.log('max', max)

			if (increment !== 0 && max !== null && min !== null) {
				for (tick; tick - increment <= max; tick += increment) {
					if (tick > min) {
						positions.push(getRoundedValue(tick, 0, countDecimalOrder(tick) + 1));
					}
				}
			}
			return positions;
		} else {
			return [];
		}
	} catch (e) {
		console.warn(e);
	}
};

const setupFlagsStatistics1 = ({ statisticsData, options, modifyByMethod }) => {
	let statistics = [];
	options = options || {};
	let { created_at_prop, title_prop, data_props } = options;
	data_props = data_props || [];

	for (let i = 0; i < statisticsData.length; i++) {
		const { [created_at_prop]: created_at, [title_prop]: title } = statisticsData[i];

		let payload = {};
		for (const prop of data_props) {
			payload[prop] = statisticsData[i][prop];
		}

		let item = {
			x: Date.parse(created_at),
			y: 0,
			title: title || ' ',
			// text: 'sdfsdfsdf ',
			payload: payload
			// text: '<div><div>text</div> flag</div>',
			// y: '<span class="testclass">10</span>'
		};

		if (modifyByMethod) {
			item = modifyByMethod(item);
		}

		statistics.push(item);
	}

	return statistics;
};

export const getPointX_ms = timestamp => {
	return Date.parse(timestamp);
};

export const getPointY = (value, settings = {}) => {
	const { toFixedNum, formula } = settings;

	if (formula) {
		value = formula(value);		
	}

	const isInt = Number(value) === value && value % 1 === 0;
	// console.log(value, isInt)
	return isInt ? value : +value.toFixed(toFixedNum || 4);
};

export const isInZone = ({ x, y, zone }) => {
	let { history, current_zone, inverse, additionalConditions } = zone;
	additionalConditions = additionalConditions || [];
	let inZone = false;
	let inHistoryZone = false;
	// debugger
	// console.log(history, zone)
	if (history && history.length) {
		if (x <= history[history.length - 1].x) {
			inHistoryZone = true;
			for (let i = 0; i < history.length; i++) {
				// if (x < history[i].x && history[i].y > 0) { // backup 20/12/22
				if (x < history[i].x) {
					if (history[i].y > 0) {
						inZone = inverse ? y < history[i].y : y >= history[i].y;
					}
					break;
				}
			}
		}
	}

	if (!inHistoryZone && current_zone) {
		inZone = inverse ? y < current_zone : y >= current_zone;

		if (inZone && additionalConditions.length) {
			for (const condition of additionalConditions) {
				const { first_val, method, second_val } = condition;
				if (method == '!=') {
					inZone = first_val != second_val;
				}
			}
		}
	}

	/*if (inZone) {
		console.log(x, y, history, current_zone)
	}*/

	return inZone;
};

export const statsLinesLabelFormatter = function() {
	if (this.point.index === 1) {
		return this.y;
	}
	return null;
};

export const prepareFilters = (filters, settings) =>
	prepareFilters1(filters, settings);
export const yAxisTickPositioner = (min, max, settings) =>
	yAxisTickPositioner1(min, max, settings);
export const selectPointsByChartSelection = (e, chartSeries) =>
	selectPointsByChartSelection1(e, chartSeries);
export const getSelectedPoints = payload => getSelectedPoints1(payload);
export const setupFlagsStatistics = (payload, options) =>
	setupFlagsStatistics1(payload, options);
