// import { timeZonesList } from '@/constants/date_time';
import { convertTZ, cleanDateString, getYmdDateString } from '@/helpers';
import { setupLogTypeIcon } from '@/helpers/specialHelpers';

// import { getPointX_ms, getPointY, isInZone, getSelectedPoints } from '../../helpers';
// import { LANGUAGE_TYPES } from '@/localization/utils';
// import { Lang } from '@/localization';

const setupWorkBreaks = (workBreaks, signal_date_at, offsetWorkBreaks) => {
	const currentDayDate = cleanDateString(signal_date_at, { withoutTime: 1 });
	let breaks = [];

	workBreaks.forEach(wb => {
		const { start_time, finish_time } = wb;
		let breakItem;

		if (offsetWorkBreaks && offsetWorkBreaks.length) {
			for (const offsetItem of offsetWorkBreaks) {
				const { new_start_time, new_finish_time } = offsetItem;
				const offsetDate = cleanDateString(new_start_time, { withoutTime: 1 });
				// console.log(offsetDate, currentDayDate)
				if (offsetDate == currentDayDate) {
					breakItem = {
						from: Date.parse(new_start_time),
						to: Date.parse(new_finish_time)
					};
				} else {
					breakItem = {
						from: Date.parse(`${currentDayDate}T${start_time}:00.000000Z`),
						to: Date.parse(`${currentDayDate}T${finish_time}:00.000000Z`)
					};
				}
			}
		} else {
			breakItem = {
				payload: { work_break: wb },
				from: Date.parse(`${currentDayDate}T${start_time}:00.000000Z`),
				to: Date.parse(`${currentDayDate}T${finish_time}:00.000000Z`)
			};
		}

		breaks.push(breakItem);
	});
	// console.log('setupWorkBreaks', currentDayDate, breaks)
	return breaks;
};

const standard_counters1 = payload => {
	const { statistics, /*filters,*/ edgeStatisticsItems } = payload;

	let newData = {
		base: [],
		transparent: [],
		max_value: 0
		// min_value: 10000000
	};

	if (edgeStatisticsItems) {
		if (
			edgeStatisticsItems.first_statistics_item &&
			edgeStatisticsItems.last_statistics_item
		) {
			newData.transparent.push(edgeStatisticsItems.first_statistics_item);
			newData.transparent.push(edgeStatisticsItems.last_statistics_item);
			// newData.transparent = [first_statistics_item].concat(newData.transparent);
		}
	}
	// console.time('standard_datetime1')

	for (let i = 0; i < statistics.length; i++) {
		const { processed_count, signal_date_at } = statistics[i];

		if (processed_count > newData.max_value) {
			newData.max_value = processed_count;
		}

		newData.base.push([Date.parse(signal_date_at), processed_count]);
		// statistics_summ += processed_count;
	}

	return newData;
};

const counters_breakSerieByDay1 = payload => {
	const {
		statistics,
		/*filters,*/ edgeStatisticsItems,
		work_breaks,
		offsetWorkBreaks
	} = payload;

	let newData = {
		base: [],
		total: [],
		transparent: [],
		max_value: 0,
		work_breaks_statistics: []
		// min_value: 10000000
	};

	if (edgeStatisticsItems) {
		if (
			edgeStatisticsItems.first_statistics_item &&
			edgeStatisticsItems.last_statistics_item
		) {
			newData.transparent.push(edgeStatisticsItems.first_statistics_item);
			newData.transparent.push(edgeStatisticsItems.last_statistics_item);
			// newData.transparent = [first_statistics_item].concat(newData.transparent);
		}
	}

	if (statistics.length) {
		let controlDay = -1;
		let data_item = [];
		let total_data_item = [];
		let summ = 0;
		let work_break_assigned = false;

		for (let i = 0; i < statistics.length; i++) {
			const { processed_count, signal_date_at } = statistics[i];
			const signal_date_at_str = signal_date_at.split('.')[0];
			const currentDay = new Date(signal_date_at_str).getDate();
			const x = Date.parse(signal_date_at);
			const y = processed_count;

			if (currentDay !== controlDay) {
				if (data_item.length) {
					newData.base.push(data_item);
					newData.total.push(total_data_item);
				}

				data_item = [];
				total_data_item = [];
				summ = 0;
				work_break_assigned = false;
				controlDay = currentDay;
			}

			data_item.push([x, y]);

			summ += y;
			total_data_item.push([x, summ]);

			if (!work_break_assigned) {
				newData.work_breaks_statistics.push(
					...setupWorkBreaks(work_breaks, signal_date_at, offsetWorkBreaks)
				);
				work_break_assigned = true;
			}

			if (processed_count > newData.max_value) {
				newData.max_value = processed_count;
			}

			// statistics_summ += processed_count;
		}

		if (data_item.length) {
			newData.base.push(data_item);
			newData.total.push(total_data_item);
		}
	}
	// console.log(newData)
	return newData;
};

const setupDownTimesData1 = dataItem => {
	dataItem.dataLabels = {
		useHTML: true,
		enabled: true,
		className: 'custom-data-label down-time',
		format: setupLogTypeIcon(dataItem.payload)
	};
	// console.log(result)
	return dataItem;
};

const setupTotalCount1 = ({ payload }) => {
	let result = [];
	let summ = 0;

	for (const item of payload) {
		summ += item[1];
		result.push([item[0], summ]);
	}

	// console.log(result)
	return result;
};

const calcGroupTimeEdge = (date, minutes) => {
	let dateObj = new Date(date);

	let stat_minutes = dateObj.getMinutes();
	const rest = (60 - stat_minutes) % minutes;
	const nextMinutes = rest ? rest + stat_minutes : stat_minutes + minutes;

	return dateObj.setHours(dateObj.getHours(), nextMinutes, 0, 0);
};

const groupDataByTime1 = ({ statistics, groupByTimeValue }) => {
	const groupByTimeValue_minutes = groupByTimeValue / 60000;

	let groupTimeEdge = calcGroupTimeEdge(statistics[0][0], groupByTimeValue_minutes);
	let groupedStatistics = [statistics[0]];
	// let groupValueSumm = 0;
	let groupValueSumm = statistics[0][1];

	for (let i = 1; i < statistics.length; i++) {
		let statItem = statistics[i];
		groupValueSumm += statItem[1];
		if (i == statistics.length - 1) {
			groupedStatistics.push([statItem[0], groupValueSumm]);
		} else if (statItem[0] >= groupTimeEdge) {
			groupedStatistics.push([groupTimeEdge, groupValueSumm]);
			groupTimeEdge = calcGroupTimeEdge(statItem[0], groupByTimeValue_minutes);
			groupValueSumm = 0;
		}
	}

	let max_value = -99999;

	groupedStatistics.forEach(si => {
		if (si[1] > max_value) max_value = si[1];
	});
	// console.log('groupDataByTime', statistics)
	// console.log('groupDataByTime grouped', groupedStatistics)

	return {
		groupedStatistics,
		max_value
	};
};

const oeeTooltipFormatter1 = function() {
	const { color, x, y, series, index } = this.point;
	const { custom_id } = series.userOptions;
	let tooltip;

	const currentDate = convertTZ(new Date(x), 'UTC');
	const currentDatePrepared = getYmdDateString({
		dateObj: currentDate,
		format: 'localeStrWithoutYear'
	});
	const currentTime = getYmdDateString({
		dateObj: currentDate,
		timeOnly: true,
		withTime: true
	});

	if (custom_id == 'count' || custom_id == 'totalWorkdayCount') {
		const prevPoint = series.data[index - 1];
		let prevTime = '';
		if (custom_id == 'count' && prevPoint) {
			prevTime =
				getYmdDateString({
					dateObj: convertTZ(new Date(prevPoint.x), 'UTC'),
					timeOnly: true,
					withTime: true
				}) + ' - ';
		}

		tooltip = `<div class="process-tooltip">
				<div>${currentDatePrepared}, ${prevTime} ${currentTime}</div></br>
				<div>
					<span class="serie-label" fill="${color}">●</span>
					<span>Count: <b>${y}</b></span>
				</div>
			</div> <br>`;
	} else {
		tooltip = `<div class="process-tooltip">
				<div>Downtime: ${currentDatePrepared}, ${currentTime}</div></br>
			</div><br>`;
	}

	return tooltip;
};

export const standard_counters = payload => standard_counters1(payload);
export const counters_breakSerieByDay = payload =>
	counters_breakSerieByDay1(payload);
export const setupDownTimesData = payload => setupDownTimesData1(payload);
export const setupTotalCount = payload => setupTotalCount1(payload);
export const groupDataByTime = payload => groupDataByTime1(payload);
export const oeeTooltipFormatter = () => oeeTooltipFormatter1;
