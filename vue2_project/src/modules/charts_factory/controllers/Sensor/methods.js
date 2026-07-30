import { timeZonesList } from '@/constants/date_time';
import {
	findItemBy,
	isTodayRange,
	convertTZ,
	cleanDateString,
	getRoundedValue,
	// countDecimalOrder,
	getYmdDateString,
	getTimeDifference,
	convertMsToHours
} from '@/helpers';
import { chartsListsConfig } from './chartsListsConfig';

import { getPointX_ms, getPointY, isInZone, getSelectedPoints } from '../../helpers';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { Lang } from '@/localization';

import {
	ALERT_RULES,
	ALERT_TYPES,
	alertTypesList,
	fftTypesList,
	FFT_TYPES,
	sensorTypesList,
	fftLockStatusesList,
	FFT_LOCK_STATUSES,
	MULTIVIEW_ALARM_TYPES,
	SENSOR_THRESHOLD_TYPES
} from '@/constants/global';
import {
	lubeTypesObj,
	LUBE_METHODS,
	lubeProcessingStatusesList,
	ADJUSTMENT_STATUSES,
	adjustmentsStatusesList,
	LUBE_PROCESSING_STATUSES,
	lubeLockLogTypesList,
	LUBE_LOCK_LOG_TYPES
} from '@/constants/ultrasound';

import {
	unitTypesList,
	metricKeysTable,
	// METRIC_SYSTEM_TYPES,
	ncdAxisList,
	thresholdUpdateSourceTypesList,
} from './enums';
import { warningColor, alarmColor, blueColor } from '../../enums';


const getThresholdUpdateSource = source => {
	const sourceItem = findItemBy('id', +source, thresholdUpdateSourceTypesList());
	return sourceItem ? sourceItem.name : null;
};

const getEdgeStatisticsItems1 = (statistics, filters = {}, additionalData = {}) => {
	let firstItem = null;
	let lastItem = null;
	const { lube_statistics, controllerTimeZone } = additionalData;
	const timeZonesListArray = timeZonesList();
	let dateStart, dateFinish;

	if (filters.daterange) {
		dateStart = filters.daterange[0];
		dateFinish = filters.daterange[1];
	}

	function getItem(statItem, options = {}) {
		// console.log(statItem)

		const { t, signal_date_at, unit, register_value } = statItem;
		let x_key, y_key;
		if (t !== undefined) x_key = 't';
		else if (signal_date_at !== undefined) x_key = 'signal_date_at';

		if (unit !== undefined) y_key = 'unit';
		else if (register_value !== undefined) y_key = 'register_value';

		const prop = options.prop ? options.prop : x_key;
		const val_prop = options.val_prop ? options.val_prop : y_key;
		const value = options.val !== undefined ? options.val : statItem[val_prop];
		// console.log(prop, val_prop)
		if (options.ms) {
			return [statItem[prop], value];
		} else {
			return [Date.parse(statItem[prop]), value];
		}
	}

	if (statistics.length) {
		firstItem = getItem(statistics[0], additionalData);
		lastItem = getItem(statistics[statistics.length - 1], additionalData);
	} else if (lube_statistics && lube_statistics.length) {
		// console.log(lube_statistics)
		firstItem = getItem(lube_statistics[0], { prop: 'x', val: 0, ms: true });
		lastItem = getItem(lube_statistics[lube_statistics.length - 1], {
			prop: 'x',
			val: 0,
			ms: true
		});
	}

	// ---------------
	if (dateStart) {
		// let start_ms = Date.parse(convertTZ(dateStart, label));
		let start_ms = Date.parse(dateStart + '.000Z');
		// console.log('dateStart', dateStart, start_ms)
		if (!firstItem || firstItem[0] > start_ms) {
			firstItem = [start_ms, 0];
		}
	}
	if (dateFinish) {
		let start_ms = firstItem[0];
		let end_ms = Date.parse(dateFinish + '.000Z');
		// let end_ms = Date.parse(convertTZ(dateFinish, label));

		if (start_ms >= end_ms) {
			const timeZone = findItemBy('id', controllerTimeZone, timeZonesListArray);
			const label = timeZone ? timeZone.label : 'UTC';
			// console.log( start_ms, end_ms )
			if (isTodayRange([end_ms], { oneDate: true })) {
				// console.log('isToday')
				end_ms = Date.parse(convertTZ(new Date(), label));
			} else {
				// const new_end_date = new Date(dateFinish).setHours(23, 59, 59);
				// console.log(convertTZ(new Date(new_end_date), label))
				// end_ms = Date.parse( convertTZ(new Date(new_end_date), label) );
				end_ms = new Date(dateFinish).setHours(24, 0, 0);
			}
		}

		if (!lastItem || lastItem[0] < end_ms) {
			lastItem = [end_ms, 0];
		}
	}
	/* if (firstItem && lastItem) {
		console.log(statistics[0])
		console.log(new Date(firstItem[0]), firstItem[0])
		console.log(new Date(lastItem[0]), lastItem[0])		
	}
	console.log('==========') */

	return {
		first_statistics_item: firstItem,
		last_statistics_item: lastItem
	};
};

const setupPlotlinesData1 = historyPayload => {
	const {
		history,
		first_statistics_item,
		last_statistics_item,
		plotLinesSettings,
		is_lube_zone_included,
		based_on_average_metric_data_value
		// baseline_zone
	} = historyPayload;
	// console.log('setupPlotlinesData1', historyPayload)
	let historyData = {},
		plotlinesSeriesData = {},
		firstPoints = {},
		tempData = {};
	let historyMaxValues = [];
	let historyMinValues = [];
	let plotlinesMaxValues = [];
	let statsData = {};

	// console.log('2', plotLinesSettings)

	function getArrayItem({
		old_prop,
		new_prop,
		new_baseline_zone,
		pointName,
		ms,
		formattedDate,
		user_name,
		how,
	}) {
		let result = [];

		/*if (pointName == 'off_alarm_zone') {
			console.log(old_prop, new_prop)
		}*/
		if (old_prop !== undefined && new_prop !== undefined && old_prop != new_prop) {
			const is_different_from_baseline =
				pointName == 'baseline_zone' ||
				!new_baseline_zone ||
				new_prop != new_baseline_zone;
			const used_old_prop = is_different_from_baseline ? old_prop : 0;
			// console.log('1', pointName, old_prop, new_prop, new_baseline_zone, is_different_from_baseline)
			const last_point_ms =
				ms < last_statistics_item[0] ? ms : last_statistics_item[0];

			let start_point = {
				x: firstPoints[pointName][0],
				y: used_old_prop,
				name: `${Lang.tt('change_by')} ${how}${
					user_name ? ' (' + user_name + ')' : ''
				}`
			};
			let finish_point = {
				x: last_point_ms,
				y: used_old_prop,
				name: `${formattedDate} (${Lang.tt('change_by')} ${how || 'unknown'} ${
					user_name ? ' (' + user_name + ')' : ''
				})`
			};

			result.push(start_point, finish_point);
			// console.log('first_point_ms: ', new Date(firstPoints['warning'][0]))
			firstPoints[pointName][0] = last_point_ms;

			// console.log('last_point_ms: ', new Date(last_point_ms))
			// tempData[pointName].last_item = item;
			if (ms > tempData[pointName].last_item_ms) {
				tempData[pointName].last_item_ms = ms;
			}
		}
		return result;
	}

	let plotLinesSettingsFinal = plotLinesSettings;

	if (!is_lube_zone_included) {
		plotLinesSettingsFinal = plotLinesSettingsFinal.filter(
			item => item.data_path != 'lube_zone'
		);
	}

	plotLinesSettingsFinal.forEach(setting => {
		const { data_path } = setting;

		historyData[data_path] = [];
		firstPoints[data_path] = Object.assign([], first_statistics_item);
		// console.log(historyPayload)
		tempData[data_path] = {
			last_item_ms: 0,
			current_zone_value: historyPayload[data_path],
			zone_max_value: undefined,
			last_history_average_metric_data_value: undefined,
		};

		try {
			for (let i = 0; i < history.length; i++) {
				const { created_at, responsibleUser, source, 
					based_on_new_average_metric_data_value,
					// based_on_old_average_metric_data_value
				} = history[i];
				const ms = Date.parse(created_at);
				// console.log(first_statistics_item, ms, first_statistics_item[0])
				if (first_statistics_item && ms >= first_statistics_item[0]) {
					const how = getThresholdUpdateSource(source);
					// console.log(data_path, history[i][`new_${data_path}`])
					const formattedDate = cleanDateString(created_at);
					const user_name = responsibleUser ? responsibleUser.full_name : '';

					historyData[data_path].push(
						...getArrayItem({
							old_prop: history[i][`old_${data_path}`],
							new_prop: history[i][`new_${data_path}`],
							new_baseline_zone: history[i]['new_baseline_zone'],
							pointName: data_path,
							ms: ms,
							formattedDate: formattedDate,
							user_name: user_name,
							how: how,
						})
					);

					if (i == history.length - 1) {
						tempData[data_path].last_history_item_zone_value =
							history[i][`new_${data_path}`];

						tempData.last_history_average_metric_data_value = based_on_new_average_metric_data_value;

						if (historyData[data_path].length < 1) {
							historyData[data_path].push(
								...getArrayItem({
									old_prop: history[i][`old_${data_path}`],
									new_prop: tempData[data_path].last_history_item_zone_value,
									new_baseline_zone: history[i]['new_baseline_zone'],
									pointName: data_path,
									ms: ms,
									formattedDate: formattedDate,
									user_name: user_name,
									how: how
								})
							);
						}
					}
				}
			}
		} catch (e) {
			console.warn(e);
		}

		// console.log('historyData', historyData[data_path])
		// console.log(data_path)
		plotlinesSeriesData[data_path] = [];
		// plotlinesSeriesData[`${data_path}_current`] = [];

		if (last_statistics_item && last_statistics_item.length) {
			const zone_history = historyData[data_path];
			const { current_zone_value, last_history_item_zone_value } = tempData[
				data_path
			];
			if (current_zone_value) {
				let actual_zone_value_for_current_period;
				let actual_average_metric_data_value_for_current_period;
				// period after history zone
				if (tempData[data_path].last_item_ms <= last_statistics_item[0]) {
					const history_last_x = zone_history.length
						? zone_history[zone_history.length - 1].x
						: first_statistics_item[0];

					if (
						!last_history_item_zone_value ||
						last_history_item_zone_value == current_zone_value
					) {
						plotlinesSeriesData[data_path] = [
							{ x: history_last_x, y: current_zone_value },
							{ x: last_statistics_item[0], y: current_zone_value }
						];
					} else {
						historyData[data_path].push(
							{ x: history_last_x, y: last_history_item_zone_value },
							{ x: last_statistics_item[0], y: last_history_item_zone_value }
						);
					}
					
					// -----y for statistics line----
					actual_zone_value_for_current_period = current_zone_value;
					actual_average_metric_data_value_for_current_period = based_on_average_metric_data_value;
				} else {
					actual_zone_value_for_current_period = zone_history.length
						? zone_history[zone_history.length - 1].y
						: 0;
					actual_average_metric_data_value_for_current_period = tempData.last_history_average_metric_data_value;
				}
				// -----data for statistics line----
				// debugger
				actual_zone_value_for_current_period = getRoundedValue(
					actual_zone_value_for_current_period,
					0,
					1
					// countDecimalOrder(actual_zone_value_for_current_period)
				);

				if (actual_average_metric_data_value_for_current_period) {
					actual_average_metric_data_value_for_current_period = getRoundedValue(
						actual_average_metric_data_value_for_current_period,
						0,
						1
						// countDecimalOrder(actual_average_metric_data_value_for_current_period)
					);
				}

				statsData[`actual_${data_path}`] = actual_zone_value_for_current_period;
				statsData.actual_average_metric_data_value_for_current_period = actual_average_metric_data_value_for_current_period;

				// statsData[`actual_average_${data_path}`] = actual_zone_value_for_current_period;
				statsData[`${data_path}_current`] = [
					[first_statistics_item[0], actual_zone_value_for_current_period],
					[last_statistics_item[0], actual_zone_value_for_current_period]
				];

				/*plotlinesSeriesData[`${data_path}_current`] = [
					[first_statistics_item[0], actual_zone_value_for_current_period],
					[last_statistics_item[0], actual_zone_value_for_current_period]
				];*/

				// plotlinesSeriesData.actual_average_metric_data_value_for_current_period = [];
				statsData.actual_average_metric_stat_for_current_period = [];

				if (actual_average_metric_data_value_for_current_period) {
					statsData.actual_average_metric_stat_for_current_period.push(
						[first_statistics_item[0], actual_average_metric_data_value_for_current_period],
						[last_statistics_item[0], actual_average_metric_data_value_for_current_period]
					);
				}

				// console.log(data_path, plotlinesSeriesData);
			}
		}

		const plotlinesMinMax = getZoneMinMaxPoint(
			historyData[data_path],
			first_statistics_item
		);
		plotlinesMaxValues.push(tempData[data_path].current_zone_value);
		historyMaxValues.push(plotlinesMinMax.max);
		historyMinValues.push(plotlinesMinMax.min);
	});

	// all_data_max_value = getMaxValue(historyMaxValues);

	// console.log('3', history, historyData, historyMaxValues)
	return { 
		plotlinesSeriesData, historyData, historyMaxValues,
		historyMinValues, plotlinesMaxValues,
		statsData
	};
};

const buildPlotlinesSeriesDataByThresholds1 = ({thresholds, responseDataKey}) => {
	const seriesConfigsList = {
		0: []
	}

	try {
		const thresholdsFinal = thresholds.filter(
			item => item.type != MULTIVIEW_ALARM_TYPES.COMPARE
		);
		
		thresholdsFinal.forEach(ti => {
			const {	type, id } = ti;
			const warning_template = type === MULTIVIEW_ALARM_TYPES.STANDARD_LOW_HIGH ? 
				'sensor.humidity_warning_threshold' : 'sensor.warning_threshold';

			seriesConfigsList[0].push(
				{
					threshold_id: id,
					value_key: 'alarm_level',
					id: `alarm_threshold-serie-${id}`,
					data_path: `alarm_zone_threshold-${id}`,
					responseDataKey,
					template: 'sensor.alarm_threshold',
					inject: { customSettings: { threshold_level: SENSOR_THRESHOLD_TYPES.ALARM } }
				},
				{
					threshold_id: id,
					value_key: 'warning_level',
					id: `warning_threshold-serie-${id}`,
					data_path: `warning_zone_threshold-${id}`,
					responseDataKey,
					template: warning_template,
					inject: { customSettings: { threshold_level: SENSOR_THRESHOLD_TYPES.WARNING } }
				}
			)
		})
	} catch (e) {
		console.warn(e);
	}

	return {seriesConfigsList};
};

const setupMultiviewPlotlinesData1 = payload => {
	const {
		plotLinesSettings,
		first_statistics_item,
		last_statistics_item,
		thresholds
	} = payload;

	let max = 0;
	let min = 99999999;

	let	plotlinesSeriesData = {};
	let plotlinesMaxValues = [];
	let plotlinesMinValues = [];

	if (last_statistics_item && last_statistics_item.length) {
		plotLinesSettings.forEach(setting => {
			// console.log(setting)
			const { data_path, threshold_id, value_key } = setting;
			const thresholdItem = findItemBy('id', threshold_id, thresholds);

			if (thresholdItem) {
				plotlinesSeriesData[data_path] = [
					{ x: first_statistics_item[0], y: thresholdItem[value_key] },
					{ x: last_statistics_item[0], y: thresholdItem[value_key] }
				];

				if (thresholdItem[value_key] > max) {
					max = thresholdItem[value_key];
				}

				if (thresholdItem[value_key] < min) {
					min = thresholdItem[value_key];	
				}
			}
		});
	}

	plotlinesMinValues.push(min);
	plotlinesMaxValues.push(max);

	return {
		plotlinesSeriesData,
		plotlinesMaxValues,
		plotlinesMinValues
	};
};

const setupLubeStatistics1 = ({ lubeData, pumpData }) => {
	const { history } = lubeData;

	let amount_lube_injected = pumpData ? pumpData.amount_lube_injected : '';
	let lube_statistics = [];
	const lubeProcessingStatusesListArray = lubeProcessingStatusesList();

	for (let i = 0; i < history.length; i++) {
		let { status, lube_start_mode, created_at, lube_method, acknowledged_at, stopped_at } = history[i];

		if (
			(acknowledged_at == null && stopped_at == null) &&
			(status === 0 || status === 1))
		{
			status = LUBE_PROCESSING_STATUSES.IN_PROGRESS;
		}

		const date = acknowledged_at || created_at;

		const statusItem = findItemBy('id', status, lubeProcessingStatusesListArray);
		let title,
			tooltip_text = statusItem ? statusItem.text : 'Unable to Verify Lube Cycle';

		if (statusItem && statusItem.labelTitle) {
			title = statusItem.labelTitle;
		} else {
			if (lube_method && lube_method === LUBE_METHODS.FREQUENCY) {
				title = 'T';
			} else {
				title = lubeTypesObj[lube_start_mode].key;
			}

			if (statusItem && statusItem.text == 'Lube OK') {
				tooltip_text += `<br>${getRoundedValue(amount_lube_injected, 0, 2)} g`;
			}
		}
		// console.log(title, date, status, tooltip_text );
		lube_statistics.push({
			x: Date.parse(date),
			title: title,
			status: status,
			text: tooltip_text,
			color: statusItem ? statusItem.color : 'gray',
			isSuccess: statusItem ? statusItem.isSuccess : false
		});
	}

	return lube_statistics;
};

const setupLubeLockLogStatistics1 = ({ lubeData }) => {
	const { lock_log } = lubeData;

	let lube_lock_logs_statistics = [];

	for (let i = 0; i < lock_log.length; i++) {
		let { lock_log_type, created_at, unlock_author } = lock_log[i];

		const typeItem = findItemBy('id', lock_log_type, lubeLockLogTypesList());
		let title,
				tooltip_text = typeItem ? typeItem.label : 'Unable to Verify Log Type';

		let shape = 'url(/static/img/icons/warning_flag.svg)';

		if (lock_log_type === LUBE_LOCK_LOG_TYPES.LUBRICATION_UNLOCKED && unlock_author) {
			tooltip_text = `${Lang.tt('constants.LUBRICATION_UNLOCKED')} by
												${ unlock_author.full_name }`;
			shape = 'url(/static/img/icons/success_flag.svg)';
		}

		if (typeItem && typeItem.labelTitle) {
			title = typeItem.labelTitle;
		}


		lube_lock_logs_statistics.push({
			x: Date.parse(created_at),
			title: title,
			status: status,
			text: tooltip_text,
			color: typeItem ? typeItem.color : 'gray',
			shape,
		});
	}

	return lube_lock_logs_statistics;
};

const setupFFTLockStatistics1 = (fft_locks = []) => {
	let fft_lock_statistics = [];

	for (let i = 0; i < fft_locks.length; i++) {
		let { status, unlock_author, fft } = fft_locks[i];
		const created_at = fft_locks[i].created_at || (fft && fft.created_at);

		const statusItem = findItemBy('id', status, fftLockStatusesList());
		let title = 'L';
		let tooltip_text = statusItem ? statusItem.name : 'Wrong fft status';

		let shape = 'url(/static/img/icons/warning_flag.svg)';

		if (status === FFT_LOCK_STATUSES.UNLOCKED && unlock_author) {
			title = 'U';
			tooltip_text = `${Lang.tt('constants.UNLOCKED')} by
												${unlock_author.full_name}`;
			shape = 'url(/static/img/icons/success_flag.svg)';
		}

		fft_lock_statistics.push({
			x: Date.parse(created_at),
			// title: statusItem ? statusItem.name : '',
			title,
			status: status,
			text: tooltip_text,
			color: statusItem ? statusItem.color : 'gray',
			shape,
		});
	}

	return fft_lock_statistics;
};

const setupCrashesStatistics1 = (crashesData, crashText) => {
	let crashes_statistics = [];
	let acute_statistics = [];
	let chronic_statistics = [];
	const alertTypesListArray = alertTypesList();

	for (let i = 0; i < crashesData.length; i++) {
		const { created_at, alert_type, id, note, alert_rule } = crashesData[i];
		const alert_type_item = findItemBy('id', alert_type, alertTypesListArray) || {};
		// const alert_rule_item = findItemBy('id', alert_rule, alertRulesList) || {};

		let stat_item = {
			x: Date.parse(created_at),
			title: ' ',
			text: crashText || alert_type_item.name,
			note: note || '',
			pointId: id
			// icon: alert_rule_item.icon
		};

		if (alert_rule === ALERT_RULES.ACUTE) {
			acute_statistics.push(stat_item);
		} else if (alert_rule === ALERT_RULES.CHRONIC) {
			chronic_statistics.push(stat_item);
		} else {
			crashes_statistics.push(stat_item);
		}
	}

	return {
		crashes_statistics: crashes_statistics,
		acute_statistics: acute_statistics,
		chronic_statistics: chronic_statistics
	};
};

const setupMultiviewCrashesStatistics1 = (crashesData, crashText) => {
	let crashes_statistics = [];
	let acute_statistics = [];
	let chronic_statistics = [];
	const alertTypesListArray = alertTypesList();
	// console.log(warningColor, alarmColor, blueColor);

	for (let i = 0; i < crashesData.length; i++) {
		const { created_at, alert_type, id, threshold_type } = crashesData[i];
		const alert_type_item = findItemBy('id', alert_type, alertTypesListArray) || {};
		// const alert_rule_item = findItemBy('id', alert_rule, alertRulesList) || {};
		let title = alert_type_item.name[0].toUpperCase();
		let tooltip_text = '';
		let shape = '';
		let color;

		if (threshold_type === MULTIVIEW_ALARM_TYPES.COMPARE) {
			title = 'D';
			tooltip_text = Lang.tt('Difference') + ' ';
		}
		
		tooltip_text += crashText || alert_type_item.short_name || alert_type_item.name;

		if (alert_type === ALERT_TYPES.WARNING) {
			shape = 'url(/static/img/icons/warning_flag.svg)';
			color = warningColor;
		} else if (alert_type === ALERT_TYPES.ALARM || alert_type === ALERT_TYPES.HIGH_ALARM) {
			shape = 'url(/static/img/icons/alarm_flag.svg)';
			color = alarmColor;
		} else if (alert_type === ALERT_TYPES.LOW_ALARM) {
			shape = 'url(/static/img/icons/low_alarm_flag.svg)';
			color = blueColor;
		}

		let stat_item = {
			x: Date.parse(created_at),
			title,
			text: tooltip_text,
			pointId: id,
			shape,
			style: { color }
			// icon: alert_rule_item.icon
		};

		/*if (alert_rule === ALERT_RULES.ACUTE) {
			acute_statistics.push(stat_item);
		} else if (alert_rule === ALERT_RULES.CHRONIC) {
			chronic_statistics.push(stat_item);
		} else {
		}*/
		crashes_statistics.push(stat_item);
	}

	return {
		crashes_statistics: crashes_statistics,
		acute_statistics: acute_statistics,
		chronic_statistics: chronic_statistics
	};
};

const setupGainAdjustmentsStatistics1 = adjustmentsData => {
	// let adjustments_statistics = [];
	let result_statistics = {
		success_adjustments_statistics: [],
		warning_adjustments_statistics: [],
		fail_adjustments_statistics: []
	};
	// let fail_statistics = [];
	const adjustmentsStatusesListArray = adjustmentsStatusesList();

	if (adjustmentsData) {
		for (let i = 0; i < adjustmentsData.length; i++) {
			const { action, status, created_at, responsibleUser } = adjustmentsData[i];
			const statusItem = findItemBy('id', status, adjustmentsStatusesListArray);
			let tooltip_text = Lang.tt(statusItem.text[action]);

			if (responsibleUser) {
				tooltip_text += `<br> (By ${responsibleUser.name ||
					responsibleUser.full_name})`;
			}

			// title: isSuccess ? '✔️' : '❗',
			let item = {
				x: Date.parse(created_at),
				title: ' ',
				text: tooltip_text,
				color: statusItem ? statusItem.color : 'gray'
			};

			switch (statusItem.id) {
				case ADJUSTMENT_STATUSES.SUCCESS: {
					result_statistics.success_adjustments_statistics.push(item);
					break;
				}
				case ADJUSTMENT_STATUSES.FAIL: {
					result_statistics.fail_adjustments_statistics.push(item);
					break;
				}
				case ADJUSTMENT_STATUSES.CONTROLLER_TIMEOUT: {
					result_statistics.warning_adjustments_statistics.push(item);
					break;
				}
				case ADJUSTMENT_STATUSES.PROCESS: {
					result_statistics.warning_adjustments_statistics.push(item);
					break;
				}

				default:
					console.error('no correct ADJUSTMENT_STATUSES');
			}
		}
	}
	return result_statistics;
};

const setupNotesStatistics1 = (notesData = []) => {
	let statistics = [];

	for (let i = 0; i < notesData.length; i++) {
		const { 
			attachment_file_name,
			attachment_file_url,
			author_id,
			graph_timestamp,
			id,
			message,
			metric_issue_alert_id,
			metric_type,
		} = notesData[i];
		// const alert_type_item = findItemBy('id', alert_type, alertTypesList) || {};
		// console.log(notesData[i])
		statistics.push({
			id,
			graph_timestamp,
			attachment_file_name,
			attachment_file_url,
			author_id,
			metric_issue_alert_id,
			metric_type,
			message,
			// pointId: sensor_job_id,
			x: Date.parse(graph_timestamp),
			title: ' ',
			text: message,
		});
	}

	return statistics;
};

const setupFlagsFFTStatistics1 = (fftData = [], filterBy = []) => {
	let statistics = [];

	let filteredData = fftData;

	if (filterBy.length) {
		filteredData = fftData.filter(item => {
			return filterBy.some(filterItem => item.status === filterItem);
		});
	}

	for (let i = 0; i < filteredData.length; i++) {
		const {
			created_at,
			sensor_id,
			id,
			/*status,*/
			sender,
			type,
			metric_type,
			meta_data,
			rpm_value
		} = filteredData[i];
		const type_item = findItemBy('id', type, fftTypesList()) || {};
		let text = `${type_item.label ? `${type_item.label} ` : ''}FFT`;

		if (
			(type_item.id == FFT_TYPES.MANUAL || type_item.id == FFT_TYPES.SCHEDULED)
			&& sender
		) {
			text += `</br>${Lang.tt('Sender')}: ${sender.full_name}`;
		}
		// console.log(fftData[i])
		statistics.push({
			x: Date.parse(created_at),
			y: 0,
			title: ' ',
			text: text,
			payload: { id, sensor_id, metric_type, meta_data, rpm_value }
		});
	}

	return statistics;
};



const setupRuntimeTrackersStatistics1 = (runtimeTrackersStatistics = []) => {
	let statistics = [];

	for (let i = 0; i < runtimeTrackersStatistics.length; i++) {
		const {
			created_at,
			resetAuthor,
			total_runtime_seconds
		} = runtimeTrackersStatistics[i];
		const { total_hours, total_mins } = convertMsToHours(
			total_runtime_seconds * 1000
		);
		const text = `${Lang.tt('phrases.Run_Hour_Counter_Reset')} </br>
									${Lang.tt('runtime')}: ${total_hours}:${total_mins} </br>
								${resetAuthor.full_name}`;

		statistics.push({
			// pointId: sensor_id,
			x: Date.parse(created_at),
			title: ' ',
			text
		});
	}

	return statistics;
};

const setupZonesList1 = ({ zonesKeysList, levelZone, historyData }) => {
	let zonesList = [];
	levelZone = levelZone || {};
	historyData = historyData || {};

	zonesKeysList.forEach(zk => {
		// const keyValue = levelZone[`${zk}_zone`]; //zk.zone_value || levelZone[`${zk.key}_zone`]
		// console.log(zk, keyValue, levelZone)
		// if (keyValue) {
		let include = false;
		let isInverse;
		let additionalConditions = [];

		if (zk == 'lube') {
			include = levelZone.is_lube_zone_included;
			/*additionalConditions.push({
					first_val: levelZone[`baseline_zone`], method: '!=', second_val: levelZone[`${zk}_zone`]
				})*/
		} else {
			include = true;
		}

		if (zk == 'off_alarm') isInverse = true;

		if (include) {
			zonesList.push({
				key: zk,
				history: historyData[`${zk}_zone`],
				current_zone: levelZone[`${zk}_zone`],
				inverse: isInverse,
				additionalConditions
			});
		}
		// }
	});

	return zonesList;
};

const setupZonesListForLineSeries1 = ({
	history,
	plotLinesSettings,
	edgeStatisticsItems = {}
}) => {
	let zonesList = [];
	// debugger
	if (history && plotLinesSettings) {
		const { first_statistics_item } = edgeStatisticsItems;

		history.forEach((hi, idx) => {
			const ms = Date.parse(hi.created_at);

			if (first_statistics_item && ms >= first_statistics_item[0]) {
				let item = {
					key: `base-${idx}`,
					levelZoneData: {},
					x: ms
				};

				plotLinesSettings.forEach(pi => {
					const { data_path } = pi;
					item.levelZoneData[data_path] = hi[`new_${data_path}`];
				});

				zonesList.push(item);
			}
		});
	}

	// console.log(zonesList)

	// original history forEach или переделать zonesKeysList на массив объектов со
	// своими settings

	return zonesList;
};

const getZoneMinMaxPoint = (
	history_data = [],
	current_zone,
	first_statistics_item
) => {
	let max = 0;
	let min = 99999999;
	const chartFirstDate = first_statistics_item ? first_statistics_item[0] : 0;

	// console.log(first_statistics_item)
	for (let i = 0; i < history_data.length; i++) {
		const date = history_data[i].x;
		const val = history_data[i].y;

		if (date >= chartFirstDate) {
			if (val > max) max = val;
			if (val < min) min = val;
		}
	}

	if (current_zone > max) {
		max = current_zone;
	}
	if (current_zone < min) {
		min = current_zone;
	}

	return { min, max };
};

const getUnitType1 = ({ parameterItem, measurement, returnItem }) => {
	if (parameterItem && !parameterItem.skipUnit) {
		const metricKeysTableName = parameterItem.metricKeysTableName || 'default';
		// console.log( metricKeysTable, metricKeysTableName, [measurement])
		const unitTypeId = metricKeysTable(metricKeysTableName, measurement)[parameterItem.id];
		const unitTypeItem = findItemBy('id', unitTypeId, unitTypesList());
		// console.log(system_type, parameter, metricKeysTableName, unitTypeId)
		if (returnItem) {
			return unitTypeItem;
		}
		return unitTypeItem ? unitTypeItem.name : '';
	}
	return '';
};

const setupParameterName1 = ({
	parameterItem,
	ncd_active_axial_axis,
	key = 'type_key',
	measurement
}) => {
	const axisItem = findItemBy('id', parameterItem.axis_id, ncdAxisList);
	let result = '';

	let { name, postfix, postfix_by_metric } = parameterItem;
	postfix = postfix || '';

	if (postfix_by_metric) {
		postfix = postfix_by_metric[measurement]
		// console.log('setupParameterName1', measurement, postfix)
	}

	if (axisItem && axisItem[key]) {
		let axisType = axisItem[key];

		if (ncd_active_axial_axis) {
			axisType = parameterItem.axis_id == ncd_active_axial_axis ? 'axial' : 'radial';
		}

		const axisAtTheEnd = Lang.currentLangId == LANGUAGE_TYPES.SPANISH;
		if (axisAtTheEnd) {
			result = `${name} ${axisType} ${postfix}`;
		} else {
			result = `${axisType} ${name} ${postfix}`;
		}
	} else {
		result = `${name} ${postfix}`;
	}

	return result;
};

const getZoneValue1 = (
	key,
	{ value, zonesData, currentSensorType, isOffAlarm /*, isSDTsensor*/ }
) => {
	let result;
	const baseValue = value || zonesData[key];
	const secondZone = key == 'baseline_zone' ? null : zonesData['baseline_zone'];
	if (baseValue) {
		const { isUltrasound, isSDTsensor, isNCDSDT } = currentSensorType;
		// console.log(key, baseValue, secondZone, currentSensorType)

		if ((isUltrasound || isSDTsensor || isNCDSDT) && !isOffAlarm && secondZone) {
			result = baseValue - secondZone;
		} else {
			result = baseValue;
		}
	} else {
		result = 0;
	}

	if (result && result < 0) {
		result = baseValue;
	}
	// console.log('2', result)
	return +parseFloat(result).toFixed(3);
};

const preparePayloadForCalculateThresholdsBySelectedPoints1 = settings => {
	const { selectedPoints, measurement, parameterItem, sensorItem } = settings;
	// console.log(settings)

	try {
		// const timeZone = findItemBy('id', this.controllerTimeZone, timeZonesList);
		const lastPoint = selectedPoints[selectedPoints.length - 1];
		const payload = {
			sensorId: sensorItem.id,
			params: {
				parameterType: parameterItem.id,
				measurement: measurement,
				dateStart: getYmdDateString({
					ms: selectedPoints[0][0],
					withTime: true,
					timeZone: 'UTC'
				}),
				dateFinish: getYmdDateString({
					ms: lastPoint.x || lastPoint[0],
					withTime: true,
					timeZone: 'UTC'
				})
				// firstJobId: selectedPoints[0][2],
				// lastJobId: selectedPoints[selectedPoints.length - 1][2]
			}
		};

		if (payload) {
			// console.log(this.controllerTimeZone)
			/*console.log(payload, 
				getYmdDateString({
					ms: selectedPoints[0][0],
					withTime: true,
					// timeOnly: true,
					timeZone: 'UTC'
				}),
				new Date(selectedPoints[0][0]), '-----',
				new Date(selectedPoints[selectedPoints.length-1][0]), '===',
				selectedPoints
			)*/
			return payload;
		}
	} catch (e) {
		console.warn(e);
	}
};

// ------------Live Update--------------
const isValidPointsData1 = ({ data, /*time_zone,*/ daterange }) => {
	if (data && data.parameter_type) {
		/*let timeZone =
			findItemBy('id', time_zone, timeZonesList()) || timeZonesList()[0];*/

		// if (timeZone) {
		/*const daysDiff = getTimeDifference({
				from: convertTZ(new Date(daterange[1]), timeZone.label),
				to: convertTZ(new Date(data.signal_date_at), 'UTC')
			}).days;*/
		const daysDiff = getTimeDifference({
			from: new Date(daterange[1]),
			to: new Date(data.signal_date_at)
		}).days;

		if (daysDiff > 0) {
			console.warn(
				`Signal date out of range: ${data.signal_date_at}. Datapoint skipped`
			);
			return;
		}
		return true;
		// }
	}
	return false;
};

/*const setupSensorTooltip1 = ({resources}) => {
	const { requestsList } = resources.chart_config;
	const { metric } = resources.payload_1;

	return {
		valueSuffix: ` ${getUnitType1({ parameterItem: requestsList[0], metric })}`
	};
};*/

// --------------Annotations-----------------------
const setupAnnotationSelectionData1 = payload => {
	const { e, chartSeries } = payload;
	const { yMax, firstPointVal_x, lastPointVal_x } = getSelectedPoints({
		event: e,
		chartSeries
	});
	// console.log(yMax, firstPointVal_x, lastPointVal_x)
	if (firstPointVal_x) {
		return {
			plotBandsStart: firstPointVal_x,
			plotBandsEnd: lastPointVal_x,
			annotation_position_x: firstPointVal_x,
			annotation_position_y: yMax,
			date_start: getYmdDateString({
				ms: firstPointVal_x,
				withTime: true,
				timeZone: 'UTC'
			}),
			date_finish: getYmdDateString({
				ms: lastPointVal_x,
				withTime: true,
				timeZone: 'UTC'
			})
		};
	}
	return null;
};

const setupAnnotations1 = payload => {
	const { e, annotations } = payload;

	const plotBandsItems = [];
	const annotationsLabelsItems = [];
	// console.log('setupAnnotations1', payload)
	// const isEdit = isEditIdx !== undefined;
	// const isDelete = isDeleteIdx !== undefined;

	try {
		if (annotations && annotations.length) {
			const annotationsItems = annotations.map(ci => {
				/*if (ci.x && ci.y) {
					return {
						x: ci.x,
						y: ci.y,
						text: ci.description,
						plotBandsStart: ci.plotBandsStart,
						plotBandsEnd: ci.plotBandsEnd
					};
				} else {*/
				const { yMax, firstPointVal_x, lastPointVal_x } = getSelectedPoints({
					event: e,
					chartSeries: payload.series,
					date_start: ci.date_start,
					date_finish: ci.date_finish
				});

				return {
					x: firstPointVal_x,
					y: yMax,
					text: ci.description,
					plotBandsStart: firstPointVal_x,
					plotBandsEnd: lastPointVal_x
				};
				// }
			});

			annotationsItems.forEach(ai => {
				plotBandsItems.push({
					from: ai.plotBandsStart,
					to: ai.plotBandsEnd,
					zIndex: 10,
					color: 'rgba(0, 0, 0, 0.2)',
					className: 'custom-plotband'
				});
				// console.log(ai)
				annotationsLabelsItems.push({
					// id: ai.x,
					point: {
						xAxis: 0,
						yAxis: 0,
						x: ai.x,
						y: ai.y
					},
					// text: `<div id="annotation_idx-${idx}">${ai.text}</div>`,
					text: ai.text,
					align: 'left'
					// useHTML: true
				});
			});
		}
	} catch (e) {
		console.warn(e);
	}
	return { plotBandsItems, annotationsLabelsItems };
};

// --------------FFT-----------------------
const setupFFTCursorsList1 = cursorsData => {
	let result_statistics = [];

	if (cursorsData) {
		for (let i = 0; i < cursorsData.length; i++) {
			result_statistics.push(setupFFTCursorItem1(cursorsData[i]));
		}
	}
	return result_statistics;
};

const setupFFTCursorItem1 = cursorData => {
	const { x, y, id, step_pos, step_idx, point_idx, units_x, units_y, serie_idx } = cursorData;
	let item = {
		id,
		x,
		y_value: y,
		step_pos,
		step_idx,
		point_idx,
		serie_idx,
		units_x,
		units_y,
		isOdd: step_pos ? step_pos % 2 : undefined,
		isCursor: true
	};

	item.title = `<div class="fft-cursor">`;
	if (step_pos) item.title += `P${step_pos} `;
	item.title += `<b>${getRoundedValue(x, 0, 3)} ${units_x}</b>`;
	if (y) item.title += `</br><span>${getRoundedValue(y, 0, 4)} ${units_y}</span>`;
	item.title += `</div>`;

	return item;
};

const setupFFTPeaksList1 = ({ statistics }) => {
	let peaksList = [];

	if (statistics.length) {
		let peaks = [];
		// let current_peak_y = 9999999999;
		// let alreadyAdded = [];
		// console.time('setupFFTPeaksList1')
		// let peaks = [];
		const neighborhood = 10; // окрестность
		const maxPeaks = 10;

		for (let i = 0; i < statistics.length; i++) {
			const x = statistics[i][0];
			const y = statistics[i][1];

			// Пропускаем точки ниже минимальной амплитуды
			// if (y < minAmplitude) continue;

			let isPeak = true;

			// Проверяем соседние точки в пределах окрестности
			for (let j = 1; j <= neighborhood; j++) {
				const prevIndex = i - j;
				const nextIndex = i + j;
				let prevYSmallerEnough = true,
					nextYSmallerEnough = true;
				let prevYSmallerTripple = false,
					nextYSmallerTripple = false;
				let is2prevSmallerThanPrev = true,
					is2nextSmallerThanNext = true;

				if (prevIndex >= 0) {
					const prev_y = statistics[prevIndex][1];

					if (y <= prev_y) {
						isPeak = false;
						break;
					}

					if (j == 1) {
						prevYSmallerTripple = prev_y / y <= 0.3;
						prevYSmallerEnough = prev_y / y <= 0.7;
						if (prevIndex - 1 >= 0) {
							is2prevSmallerThanPrev = statistics[prevIndex - 1][1] < prev_y;
						}
					}
				}

				if (nextIndex < statistics.length) {
					const next_y = statistics[nextIndex][1];

					if (y <= next_y) {
						isPeak = false;
						break;
					}

					if (j == 1) {
						nextYSmallerEnough = next_y / y <= 0.7;
						nextYSmallerTripple = next_y / y <= 0.3;
						if (nextIndex + 1 < statistics.length) {
							is2nextSmallerThanNext = statistics[nextIndex + 1][1] < next_y;
						}
					}
				}

				if (!prevYSmallerEnough && !nextYSmallerEnough) {
					isPeak = false;
					break;
				}

				if (!is2prevSmallerThanPrev && !is2nextSmallerThanNext) {
					if (!prevYSmallerTripple || !nextYSmallerTripple) {
						isPeak = false;
						break;
					}
				}
			}

			if (isPeak) {
				peaks.push([x, y]);
			}
		}

		peaks.sort((a, b) => b[1] - a[1]);
		peaks = peaks.slice(0, maxPeaks);
		// console.log('peaks', peaks)

		peaksList = peaks.map((pi, idx) => ({
			title: `#${idx + 1}`,
			x: pi[0],
			[`x_value`]: getRoundedValue(pi[0], 0, 6),
			// [`x_value_${METRIC_SYSTEM_TYPES.IMPERIAL}`]: getRoundedValue(pi[0]*60, 0, 6),
			// x_value: getRoundedValue(x, 0, 0),
			[`y_value`]: getRoundedValue(pi[1], 1, 6)
			// [`y_value_${METRIC_SYSTEM_TYPES.IMPERIAL}`]: getRoundedValue(pi[1], 1, 6),
			// y_value: getRoundedValue(max, 0, 4),
		}));
		// console.log('peaks list', peaksList)

		// console.timeEnd('setupFFTPeaksList1')

		/*for (let i = 1; i <= 10; i++) {
			let max = -9999999;
			let max_y_x_coordinat = 0;

			for (let j = 0; j < statistics.length; j++) {
				const x = statistics[j][0];
				const y = statistics[j][1];
				// const prevStatItem = statistics[j-1] || [];
				// const nextStatItem = statistics[j+1] || [];

				// const prev_x = j > 0 ? statistics[j-1][0] : 0;
				// const next_x = j < statistics.length-1 ? statistics[j+1][0] : 0;

				const prev_y = j > 0 ? statistics[j-1][1] : 0;
				// const prev_y2 = j > 1 ? statistics[j-2][1] : 0;
				const next_y = j < statistics.length-1 ? statistics[j+1][1] : 0;
				// const next_y2 = j < statistics.length-2 ? statistics[j+2][1] : 0;
				
				if (y > max && y <= current_peak_y &&
					(
						// alreadyAdded.indexOf(prev_x) == -1 &&
						// alreadyAdded.indexOf(next_x) == -1 &&
						// prevStatItem[1] < y &&
						// nextStatItem[1] < y &&
						prev_y < y &&
						next_y < y &&
						(prev_y/y < 0.4 || next_y/y < 0.4) &&
						alreadyAdded.indexOf(x) == -1
					)
				) {
					max = y;
					max_y_x_coordinat = x;
				};
			}
			current_peak_y = max;
			alreadyAdded.push(max_y_x_coordinat);
			
			peaksList.push({
				x: max_y_x_coordinat,
				[`x_value_${METRIC_SYSTEM_TYPES.METRIC}`]: getRoundedValue(max_y_x_coordinat, 0, 0),
				[`x_value_${METRIC_SYSTEM_TYPES.IMPERIAL}`]: getRoundedValue(max_y_x_coordinat*60, 0, 0),
				// x_value: getRoundedValue(max_y_x_coordinat, 0, 0),
				[`y_value_${METRIC_SYSTEM_TYPES.METRIC}`]: getRoundedValue(max, 0, 4),
				[`y_value_${METRIC_SYSTEM_TYPES.IMPERIAL}`]: getRoundedValue(max, 0, 4),
				// y_value: getRoundedValue(max, 0, 4),
				title: `#${i}`,
			})
		}*/
	}

	return peaksList;
};
// ----------------------
/*const isMaxValue = (value, {max_value, maxValues, maxValueCondition}) => {
	if (maxValueCondition == '>') {
		return value > max_value;
	}
	if (maxValueCondition == '!==') {
		return maxValues ? maxValues.every(val => value !== val) : value !== max_value;
	}
	return value > max_value
};*/
const getStatisticsItemParams = item => {
	const { register_value, unit, t, signal_date_at } = item;
	let xKey, yKey;

	if (signal_date_at) xKey = 'signal_date_at';
	else if (t) xKey = 't';
	if (unit !== undefined) yKey = 'unit';
	else if (register_value !== undefined) yKey = 'register_value';

	return {
		xKey,
		yKey,
		x: item[xKey],
		y: item[yKey]
	};
};

const standard_datetime1 = payload => {
	let {
		statistics,
		zonesList,
		filters,
		edgeStatisticsItems,
		skipMaxValues,
		skipMaxValuesAbove,
		xKey,
		yKey,
		skipDataPointsList,
		parameter_item,
		flat_metric_data_anomalies
		/*resources*/
		/*transformatorData,*/
	} = payload;

	let newData = {
		base: [],
		transparent: [],
		max_value: -99999,
		min_value: 10000000,
		// data_average_line: []
	};

	if (edgeStatisticsItems) {
		if (edgeStatisticsItems.first_statistics_item) {
			newData.transparent.push(edgeStatisticsItems.first_statistics_item);
			// newData.transparent = [first_statistics_item].concat(newData.transparent);
		}

		if (edgeStatisticsItems.last_statistics_item) {
			newData.transparent.push(edgeStatisticsItems.last_statistics_item);
		}
	}

	if (zonesList) {
		zonesList.forEach(zi => {
			newData[zi.key] = [];
		});
	}

	
	// ------------------------
	// console.log(parameter_item.name, skipMaxValues)

	// console.time('standard_datetime1')

	if (statistics.length) {
		const { y_min, measurement } = filters;

		// let formula_x = x => x;
		let formula_y, toFixedNum;

		if (parameter_item) {
			toFixedNum = parameter_item.toFixedNum;

			/*if (parameter_item.calc_imperial_cpm && measurement === METRIC_SYSTEM_TYPES.IMPERIAL) {
				formula_y = y => y * 60;
			}*/
		}

		const initialParams = getStatisticsItemParams(statistics[0]);
		xKey = xKey || initialParams.xKey;
		yKey = yKey || initialParams.yKey;
		// let pointsSum = 0;

		let filteredStatistics = statistics;

		const skipSet = skipDataPointsList ? new Set(skipDataPointsList) : null;

		// ---------Anomaly find--------
		// --- anomaly ranges ---
		let anomalyRanges = null;
		if (flat_metric_data_anomalies && flat_metric_data_anomalies.length) {
			newData.anomaly = [];
			const activeAnomalies = flat_metric_data_anomalies.filter(a => a.is_active);
			if (activeAnomalies.length) {
				anomalyRanges = activeAnomalies.map(a => ({
					created_at: Date.parse(a.created_at),
					// start: Date.parse(a.metric_data_start_time),
					end: Date.parse(a.metric_data_end_time)
				}));
			}
		}
		// let activeAnomalyDataPointsSpawn = [];
		if (anomalyRanges) {
			anomalyRanges = anomalyRanges.map(anomaly => {
				for (let i = 0; i < filteredStatistics.length; i++) {
					const x = getPointX_ms(
						filteredStatistics[i][xKey] || getStatisticsItemParams(filteredStatistics[i]).x
					);

					let y = getPointY(
						filteredStatistics[i][yKey] || getStatisticsItemParams(filteredStatistics[i]).y,
						{ formula: formula_y, toFixedNum }
					);

					if (x >= anomaly.created_at) {
						anomaly.y = y;
						break;
					}
				}
				return anomaly;
			})
		}

		// console.log(anomalyRanges)
		for (let i = 0; i < filteredStatistics.length; i++) {
			// if (i % 2 === 0) {
				const { t } = filteredStatistics[i];
				const x = getPointX_ms(
					filteredStatistics[i][xKey] || getStatisticsItemParams(filteredStatistics[i]).x
				);

				if (skipSet && skipSet.has(x)) continue;

				/*if (skipDataPointsList) {
					if (skipDataPointsList.includes(x)) continue;
				}*/

				let y = getPointY(
					filteredStatistics[i][yKey] || getStatisticsItemParams(filteredStatistics[i]).y,
					{ formula: formula_y, toFixedNum }
				);

				// console.log(y, !skipMaxValuesAbove, y < skipMaxValuesAbove[metric-1], skipMaxValuesAbove[metric-1])
				if (y > newData.max_value &&
					(!skipMaxValuesAbove || y < skipMaxValuesAbove[measurement-1]) &&
					(!skipMaxValues || !skipMaxValues.includes(y))
				)	{
					newData.max_value = y;
				}

				if (y < newData.min_value) {
					newData.min_value = y;
				}

				if (y_min && y <= y_min) {
					newData.transparent.push([x, y]);
					continue;
				}

				// --- check anomaly range before zone classification ---
				if (anomalyRanges) {
					let isAnomaly = false;
					for (let ai = 0; ai < anomalyRanges.length; ai++) {
						if (x < anomalyRanges[ai].created_at && y == anomalyRanges[ai].y) {
							isAnomaly = true;
							break;
						}	if (x >= anomalyRanges[ai].created_at && x <= anomalyRanges[ai].end) {
							isAnomaly = true;
							break;
						}
					}
					if (isAnomaly) {
						newData.anomaly.push([x, y]);
						continue;
					}
				}

				let presentInSomeZone = false;

				if (zonesList) {
					for (let zi = 0; zi < zonesList.length; zi++) {
						const zone = zonesList[zi];

						if (isInZone({ x, y, zone })) {
							newData[zone.key].push([x, y, t]);
							presentInSomeZone = true;
							/*if (zone.key == 'alarm') {
								console.log(newData[zone.key][newData[zone.key].length-1])
							}*/
							break;
						}
					}
				}

				if (!presentInSomeZone) {
					newData.base.push([x, y, t]);
				}

				// pointsSum += y;
			// }
		}
		/*let average = pointsSum / statistics.length;
		average = getRoundedValue(average, 0, countDecimalOrder(average));


		newData.data_average_line.push(
			{
				x: newData.transparent.length ? newData.transparent[0][0] : 0,
				y: average
			},
			{
				x: newData.transparent.length ? newData.transparent[1][0] : 0,
				y: average
			}
		);
		newData.statsData = {data_average_line: average};*/
	}


	// console.timeEnd('standard_datetime1')
	// console.log(newData)
	return newData;
};

const collect_specific_points1 = payload => {
	let { statistics, xKey,	yKey, belowValue } = payload;
	let resultArray = [];
	// console.log(payload)

	if (statistics.length) {
		const initialParams = getStatisticsItemParams(statistics[0]);
		xKey = xKey || initialParams.xKey;
		yKey = yKey || initialParams.yKey;

		for (let i = 0; i < statistics.length; i++) {
			// const { id } = statistics[i];
			const x = getPointX_ms(
				statistics[i][xKey] || getStatisticsItemParams(statistics[i]).x
			);

			const y = getPointY(
				statistics[i][yKey] || getStatisticsItemParams(statistics[i]).y
			);
			// console.log(y , belowValue, y < belowValue)
			if (belowValue != null) {
				if (y < belowValue) {
					resultArray.push(x);
				}
			}
		}
	}

	return resultArray;
};

const line_charts_datetime1 = payload => {
	let {
		statistics,
		history,
		plotLinesSettings,
		filters,
		edgeStatisticsItems,
		skipMaxValues,
		xKey,
		yKey,
		generateSeriesByStatistics,
		y_formula
	} = payload;

	let newData = {
		base: [],
		history: [],
		transparent: [],
		max_value: -99999,
		min_value: 10000000
	};
	// console.log('line_charts_datetime1', payload)
	generateSeriesByStatistics = generateSeriesByStatistics || {};
	const { seriesConfigMethod, joinIntersections } = generateSeriesByStatistics;

	if (edgeStatisticsItems) {
		if (edgeStatisticsItems.first_statistics_item) {
			newData.transparent.push(edgeStatisticsItems.first_statistics_item);
			// newData.transparent = [first_statistics_item].concat(newData.transparent);
		}
		if (edgeStatisticsItems.last_statistics_item) {
			newData.transparent.push(edgeStatisticsItems.last_statistics_item);
		}
	}

	const { y_min } = filters;
	// console.time('standard_datetime1')

	if (statistics.length) {
		if (seriesConfigMethod == 'modifySeriesConfigByHistory' && plotLinesSettings) {
			const { first_statistics_item, last_statistics_item } = edgeStatisticsItems;

			for (let i = 0; i < history.length; i++) {
				const ms = Date.parse(history[i].created_at);
				const isFirst = i === 0;
				const isLast = i === history.length - 1;

				if (isFirst && first_statistics_item[0] < ms) {
					let item = {
						levelZoneData: {},
						base: [],
						from: first_statistics_item[0],
						to: ms
					};
					plotLinesSettings.forEach(pi => {
						const { data_path } = pi;
						item.levelZoneData[data_path] = history[i][`new_${data_path}`];
					});

					newData.history.push(item);
				}

				let item = {
					levelZoneData: {},
					base: [],
					from: ms,
					to: isLast
						? last_statistics_item[0]
						: Date.parse(history[i + 1].created_at)
				};
				// console.log('plotLinesSettings', plotLinesSettings)
				plotLinesSettings.forEach(pi => {
					const { data_path } = pi;
					item.levelZoneData[data_path] = history[i][`new_${data_path}`];
				});

				newData.history.push(item);
			}
		}
		// console.log('newData.history', newData.history, edgeStatisticsItems.first_statistics_item)
		const initialParams = getStatisticsItemParams(statistics[0]);
		xKey = xKey || initialParams.xKey;
		yKey = yKey || initialParams.yKey;

		for (let i = 0; i < statistics.length; i++) {
			const { id } = statistics[i];
			const x = getPointX_ms(
				statistics[i][xKey] || getStatisticsItemParams(statistics[i]).x
			);
			const y = getPointY(
				statistics[i][yKey] || getStatisticsItemParams(statistics[i]).y,
				{ formula: y_formula }
			);

			if (y > newData.max_value && (!skipMaxValues || !skipMaxValues.includes(y))) {
				newData.max_value = y;
			}

			if (y < newData.min_value) {
				newData.min_value = y;
			}

			if ((y_min || y_min === 0) && y <= y_min) {
				// console.log('y_min', y_min)
				newData.transparent.push([x, y]);
				continue;
			}

			// is in zone
			if (newData.history.length) {
				// if (x <= newData.history[newData.history.length-1].from) {
				for (let j = newData.history.length - 1; j >= 0; j--) {
					if (x >= newData.history[j].from && x < newData.history[j].to) {
						newData.history[j].base.push([x, y, id]);
						break;
					}
				}
			} else {
				newData.base.push([x, y, id]);
			}
		}

		if (joinIntersections && newData.history.length) {
			newData.history = newData.history.map((hi, idx) => {
				const isLast = idx === newData.history.length - 1;
				const nextHi = newData.history[idx + 1];

				if (!isLast && hi.base.length && nextHi.base.length) {
					// const currentHiLastPoint = hi.base[hi.base.length-1];
					const nextHiFirstPoint = nextHi.base[0];
					const intersectionPoint = [nextHi.from, nextHiFirstPoint[1]];
					hi.base.push(intersectionPoint);
					nextHi.base = [intersectionPoint].concat(nextHi.base);
				}
				return hi;
			});
		}
	}
	// console.log('newData', newData)
	// console.timeEnd('standard_datetime1')

	return newData;
};

const setupFlatMetricDataAnomalyFlags1 = (anomaliesData) => {
	let anomaly_statistics = [];

	for (let i = 0; i < anomaliesData.length; i++) {
		const { created_at } = anomaliesData[i];

		anomaly_statistics.push({
			x: Date.parse(created_at),
			title: '!',
			text: 'Flat data anomaly'
		});
	}

	return anomaly_statistics;
};

const get_sensor_parameter_item1 = ({sensor, parameter_id, graph_item}) => {
	const { type, data_set } = sensor;
	if (type && data_set) {
		const sensorType = sensorTypesList(type, data_set); /*[type][data_set]*/

		if (sensorType) {
			if (sensorType.isBannerV2Generic) {
				const {metric_type} = graph_item;
				const { units, name } = graph_item.banner_v2_subtype_parameter;
				
				return {
					id: metric_type,
					icon: 'icon-acceleration',
					name,
					units
				}
			} else {
				const configsList = chartsListsConfig(sensorType.chartSettingsKey, {
					resources: {
						payload_1: { sensorItem: sensor }
					}
				});
				let allParameters = [];
				configsList.forEach(ci => {
					allParameters = allParameters.concat(ci.requestsList);
				});
				// console.log(allParameters)
				return findItemBy('id', parameter_id, allParameters);
			}
		}
	}

	return null;
};

export const getEdgeStatisticsItems = (statistics, filters, additionalData) =>
	getEdgeStatisticsItems1(statistics, filters, additionalData);
export const setupPlotlinesData = historyPayload =>
	setupPlotlinesData1(historyPayload);
export const setupLubeStatistics = payload => setupLubeStatistics1(payload);
export const setupLubeLockLogStatistics = payload => setupLubeLockLogStatistics1(payload);

export const setupCrashesStatistics = (crashesData, crashText) =>
	setupCrashesStatistics1(crashesData, crashText);
export const setupMultiviewCrashesStatistics = (crashesData, crashText) =>
	setupMultiviewCrashesStatistics1(crashesData, crashText);
export const setupMultiviewPlotlinesData = payload => setupMultiviewPlotlinesData1(payload);
export const buildPlotlinesSeriesDataByThresholds = thresholds =>
	buildPlotlinesSeriesDataByThresholds1(thresholds);

export const setupGainAdjustmentsStatistics = adjustmentsData =>
	setupGainAdjustmentsStatistics1(adjustmentsData);
export const setupNotesStatistics = notesData => setupNotesStatistics1(notesData);
export const setupFlagsFFTStatistics = (fftData, filterBy) =>
	setupFlagsFFTStatistics1(fftData, filterBy);
export const setupRuntimeTrackersStatistics = payload =>
	setupRuntimeTrackersStatistics1(payload);
export const setupFFTLockStatistics = payload => setupFFTLockStatistics1(payload);
export const setupFlatMetricDataAnomalyFlags = payload => setupFlatMetricDataAnomalyFlags1(payload);

export const setupZonesList = payload => setupZonesList1(payload);
export const setupZonesListForLineSeries = payload =>
	setupZonesListForLineSeries1(payload);

export const getUnitType = payload => getUnitType1(payload);
export const setupParameterName = payload => setupParameterName1(payload);
export const preparePayloadForCalculateThresholdsBySelectedPoints = payload =>
	preparePayloadForCalculateThresholdsBySelectedPoints1(payload);
export const isValidPointsData = payload => isValidPointsData1(payload);
export const getZoneValue = (key, settings) => getZoneValue1(key, settings);

export const setupAnnotations = payload => setupAnnotations1(payload);
export const setupAnnotationSelectionData = payload =>
	setupAnnotationSelectionData1(payload);

export const setupFFTCursorsList = payload => setupFFTCursorsList1(payload);
export const setupFFTCursorItem = payload => setupFFTCursorItem1(payload);
export const setupFFTPeaksList = payload => setupFFTPeaksList1(payload);

// export const setupSensorTooltip = (payload) => setupSensorTooltip1(payload);

export const standard_datetime = payload => standard_datetime1(payload);
export const line_charts_datetime = payload => line_charts_datetime1(payload);
export const collect_specific_points = payload => collect_specific_points1(payload);
export const get_sensor_parameter_item = payload => get_sensor_parameter_item1(payload);
