import {
	findItemBy,
	getObjectVal,
	convertTimeToNumberValue,
	getTimeDifference,
	getDateRange,
	getItemValue,
	cleanDateString
} from '@/helpers';

import {
	voltage_icon_1,
	voltage_icon_2,
	voltage_icon_3,
	signal_icon_0,
	signal_icon_1,
	signal_icon_2,
	signal_icon_3,
	not_wifi_icon,
	// wifi_icon,
	controller_offline_icon,
	sensor_archive,
	NCD_RSSI_TYPES,
	NCD_BATTERY_VOLTAGE_TYPES,
	DOWNTIME_ORIGIN_TYPES,
	equipmentImgTypesList,
	alertRulesList,
	alertTypesList,
	DATASET,
	SENSOR_TYPES,
	bannerPowerTypesList,
	itemSpeedOptionsList
} from '@/constants/global';
import { ElMessage } from 'element-plus';
import 'element-plus/es/components/message/style/css';

import {
	METRIC_SYSTEM_TYPES,
	sensorParametersList,
} from '@/modules/charts_factory/controllers/Sensor/enums';

// import { storeGetter, dispatchGetter } from '@/store';
import { Lang } from '@/localization';

const setupSourceData = (propName, dataItem) => {
	let sourceData = {};

	for (let j = 0; j < dataItem[propName].length; j++) {
		const sourceItem = dataItem[propName][j];
		sourceData[`parameter_type_${sourceItem.parameter_type}`] = {
			alarm_zone: sourceItem.alarm_zone,
			warning_zone: sourceItem.warning_zone
		};
	}

	return sourceData;
};

const equipmentCardTitle1 = (titles, equipmentData) => {
	let result = '';
	if (titles && titles.length) {
		titles.forEach(ti => {
			// console.log(equipmentData, ti)
			const val = getObjectVal(equipmentData, ti.prop);
			// console.log(val)
			result += `<span class="${ti.className || ''}">${val || ''}</span>`;
		});
		return result;
	}
	return '';
};

const getBrandModelImgByType1 = ({ id, equipment_type_img, brandModelsList }) => {
	const brandModel = findItemBy('type_id', id, brandModelsList);

	if (brandModel && brandModel.full_file_name) {
		return brandModel.full_file_name;
	}

	return equipment_type_img;
};

const calcFabShopBudget1 = ({ cellValue, args }) => {
	// console.log(cellValue, args)
	args = args || {};
	let {
		actual_cost,
		actual_time,
		technicalExecutor,
		technical_executor_id
	} = cellValue;
	technicalExecutor =
		technicalExecutor || findItemBy('id', technical_executor_id, args.usersList);

	if (actual_cost && actual_time && technicalExecutor) {
		return (
			actual_cost +
			convertTimeToNumberValue(actual_time) * technicalExecutor.hourly_rate
		);
	}
	return args && args.emptyText ? args.emptyText : '-';
};

const getCellStyles1 = ({ min_width, max_width, width }) => {
	let styles = {};
	if (min_width) {
		styles.minWidth = typeof min_width == 'number' ? `${min_width}px` : min_width;
	}
	if (max_width) {
		styles.maxWidth = typeof max_width == 'number' ? `${max_width}px` : max_width;
		styles.minWidth = styles.maxWidth;
	}
	if (width) {
		styles.maxWidth = typeof width == 'number' ? `${width}px` : width;
		styles.minWidth = styles.maxWidth;
	}
	return styles;
};

const compareDatesForMaintenance1 = (created_at, now) => {
	if (created_at) {
		return new Date(created_at).getTime() > now;
	}
	return false;
};

const scrollToElement1 = query => {
	document.querySelector(query).scrollIntoView({
		top: 0,
		// left: 0,
		behavior: 'smooth'
	});
};

const checkUploadSettingsUtil = (formData, { fileProp, multiple }) => {
	let result = {
		hasFile: false,
		deleteProp: false
	};

	if (multiple) {
		if (formData[fileProp] && formData[fileProp].length) {
			result.hasFile = formData[fileProp].some(fi => {
				// console.log('fi', fi.file, typeof fi.file, fi.file && typeof fi.file == 'object' );
				return fi.file && typeof fi.file == 'object';
			});
		}
	} else {
		if (formData[fileProp]) {
			result.hasFile = formData[fileProp] && typeof formData[fileProp] == 'object';
			if (typeof formData[fileProp] != 'object') {
				// delete payload.formData[fileProp];
				result.deleteProp = true;
			}
		}
	}

	return result;
};

const checkUploadSettings1 = (payload, settings, additionalSettings = {}) => {
	let settingsList = settings instanceof Array ? settings : [settings];

	let results = [];
	const dataKey = additionalSettings.dataKey || 'data';

	settingsList.forEach(si => {
		const { hasFile, deleteProp } = checkUploadSettingsUtil(payload[dataKey], si);
		results.push(hasFile);
		// console.log('si', dataKey, si, payload[dataKey],hasFile);

		if (deleteProp) {
			delete payload[dataKey][si.fileProp];
		}
	});

	payload.withFile = results.some(ri => ri);

	return payload;
};

const setupTypeOptionsValuesList1 = (
	currentDataList,
	equipmentTypeData,
	settings = {}
) => {
	let result = [];
	const { excludeCategory, inEquipmentCardOnly } = settings;

	if (equipmentTypeData && currentDataList.length) {
		equipmentTypeData.type_options.forEach(to => {
			let valid = [];
			if (excludeCategory) valid.push(to.name != 'Category');
			if (inEquipmentCardOnly) valid.push(to.is_in_equipment_card);

			if (valid.every(v => v)) {
				const currentItem = findItemBy(
					'equipment_type_option_id',
					to.id,
					currentDataList
				);
				if (currentItem) {
					result.push({
						label: to.name,
						value: currentItem.value,
						predefinedValue: 1
					});
				}
			}
		});
	}

	return Object.freeze(result);
};

const setupBatteryChargeCell1 = battery_voltage => {
	let src;

	if (battery_voltage) {
		switch (true) {
			case battery_voltage < NCD_BATTERY_VOLTAGE_TYPES.MODERATE:
				src = voltage_icon_1;
				break;
			case battery_voltage < NCD_BATTERY_VOLTAGE_TYPES.HIGH:
				src = voltage_icon_2;
				break;
			case battery_voltage >= NCD_BATTERY_VOLTAGE_TYPES.HIGH:
				src = voltage_icon_3;
				break;
			default:
				null;
		}
	}
	return src
		? `<span class="table-cell-icon battery-icon"><img src=${src} /></span>`
		: '-';
};

const setupConnectionStrengthCell1 = (row, args = {}) => {
	// console.log(row)
	const { rssi, is_inactive, controller, is_archived } = row;
	const { onSignalForActive } = args;
	let src = signal_icon_0;
	let icon;
	let showStrength = true;
	let background = false;

	if (args.noSignalForInactive) {
		showStrength = !is_inactive;
		if (is_inactive) {
			src = not_wifi_icon
		} else if (onSignalForActive) {
			icon = 'icomoon icon-wifi green-color';
		}
	}
	if (args.controllerOfflineIcon) {
		showStrength = showStrength ? !controller.is_inactive : showStrength;
		controller.is_inactive ? (src = controller_offline_icon) : null;
	}
	if (args.isArchivedIcon) {
		showStrength = showStrength ? !is_archived : showStrength;
		is_archived ? (src = sensor_archive) : null;
	}

	if (rssi && showStrength) {
		background = true;

		switch (true) {
			case rssi > NCD_RSSI_TYPES.HIGH:
				src = signal_icon_1;
				break;
			case rssi >= NCD_RSSI_TYPES.MODERATE:
				src = signal_icon_2;
				break;
			case rssi >= NCD_RSSI_TYPES.LOW:
				src = signal_icon_3;
				break;
			default:
				null;
		}
	}
	let result = `<span 
		class="table-cell-icon signal-icon ${background ? 'background' : ''}"
	>`;

	if (icon) {
		result += `<i class="${icon}"></i>`;
	} else {
		result += `<img src=${src} />`;
	}

	result += `</span>`;
	return result;
};

const macAddressMask1 = input => {
	let filteredValue = input.replace(/[^0-9A-Fa-f]/g, '');
	let matched = filteredValue.match(/.{1,2}/g);
	filteredValue = matched ? matched.join(':').slice(0, 23) : '';
	return filteredValue;
};

const getImgTypeName1 = img => {
	const type = findItemBy('id', img.type, equipmentImgTypesList());

	if (type) {
		return type.label;
	}

	return 'Machine';
};

const waitForElement1 = (selector, callback, interval = 100) => {
  const checkExist = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(checkExist);
      callback(element);
    }
  }, interval);
};

// --------------------toggleHeightBlock1()
const toggleHeightBlock1 = (open, targetBlock) => {
	open
		? (targetBlock.style.height = targetBlock.firstElementChild.offsetHeight + 'px')
		: (targetBlock.style.height = '0px');
};

const setupLogTypeIcon1 = log => {
	const { origin_type, is_processed } = log;
	let icon;

	/*if (origin_type === DOWNTIME_ORIGIN_TYPES.AUTO || origin_type === DOWNTIME_ORIGIN_TYPES.DEVIATION) {
		icon = 'icon-attention';
	} else*/
	if (origin_type === DOWNTIME_ORIGIN_TYPES.WORK_BREAK) {
		icon = 'icon-kitchen';
	} else {
		icon = 'icon-attention';
	}
	// console.log(origin_type)
	return `<span class="log-type-icon icomoon ${icon} ${
		is_processed ? 'processed' : ''
	}"></span>`;
};

const resetDaterangeIfExpired1 = (filters, resetTo, withTime) => {
	const { daterange, daterange_setted_at } = filters;
	if (daterange && daterange_setted_at) {
		const { days, hours } = getTimeDifference({
			from: new Date(daterange_setted_at),
			to: new Date()
		});
		// console.log(days, hours)
		if (days > 1 || hours >= 6) {
			filters.daterange = getDateRange(resetTo, {
				getDateString: true,
				withTime: withTime
			});
			// console.log(new Date(daterange_setted_at), filters.daterange, resetTo)
		}
	}
	// console.log('filters', filters)
	return filters;
};

const getSensorTitle1 = (sensor, options = {}) => {
	if (sensor && sensor.equipment) {
		let { port_number, type, data_set, power_type } = sensor;
		port_number = type === SENSOR_TYPES.ULTRA_SOUND ? port_number : null;
		let powerTypeItem;

		if (data_set === DATASET.TEMP_VIBE) {
			powerTypeItem = findItemBy('id', power_type, bannerPowerTypesList());
		}

		let settings = [
			{ label: 'Line', key: 'equipment.asset.machine.productionLine.name' },
			{ label: 'Machine', key: 'equipment.asset.machine.name' },
			{ label: 'Asset', key: 'equipment.asset.name', alt_key: 'asset_numbers' },
			{ label: 'Location', key: 'location_in_equipment', alt_key: 'loc_on_machine' },
			{ label: 'Type', key: 'equipment.equipmentType.name' },
			{ label: 'Port', value: port_number },
			{ label: 'Node', key: 'pump.radio.position' },
			{ value: powerTypeItem ? powerTypeItem.name : null }
		];

		if (options.settings) {
			settings = options.settings;
		}

		if (options.additional_settings) {
			settings = settings.concat(options.additional_settings);
		}

		// console.log(sensor, options)
		let results = [];

		for (const setting of settings) {
			const value = setting.value || getObjectVal(sensor, setting.key);
			if (value) {
				const label = setting.label ? `${Lang.tt(setting.label)}:` : '';
				if (options.linkSettings && setting.key == options.linkSettings.key) {
					results.push(`
						<span class="${options.boldLabels ? 'bold' : ''}">${label}</span>
						<a class="link underline info-color" href="${options.linkSettings.to}">${value}</a>`
					);
				} else if (options.boldLabels) {
					results.push(`<b>${label}</b> ${value}`);
				} else {
					results.push(`${label} ${value}`);
				}
			}
		}

		return results.join(', ');
	}

	return Lang.tt('Sensor');
};

// ----------From charts.js----------
const setupWarningsData1 = data => {
	const alarms_count = data.alarmsCount;
	const warnings_count = data.warningsCount;
	const meta = {
		current_page: data.meta.current_page,
		last_page: data.meta.last_page
	};
	let newData = [];

	const dataArray = data.data;
	const alertRulesListArray = alertRulesList();
	const alertTypesListArray = alertTypesList();

	for (let i = 0; i < dataArray.length; i++) {
		const dataItem = dataArray[i];

		newData.push({
			id: dataItem.id,
			sensor_name:
				dataItem.sensor && dataItem.sensor.equipment
					? dataItem.sensor.equipment.machine_name ||
						dataItem.sensor.equipment.location_name
					: '',
			sensor_parameter_name: getItemValue(
				dataItem.sensor_parameter_type,
				'name',
				sensorParametersList()
			),
			alert_rule_name: getItemValue(
				dataItem.alert_rule,
				'name',
				alertRulesListArray
			),
			alert_type_name: getItemValue(
				dataItem.alert_type,
				'name',
				alertTypesListArray
			),
			// created_at: '2020-07-07T13:15:51.000000Z'
			created_at: cleanDateString(dataItem.created_at)
		});
	}

	return {
		newData: newData,
		alarms_count: alarms_count,
		warnings_count: warnings_count,
		meta: meta
	};
};

const setupTresholdsOurList1 = dataArray => {
	let newList = [];

	for (let i = 0; i < dataArray.length; i++) {
		let item = {
			sensor_name: `${dataArray[i].equipment.machine_name} (${dataArray[i].equipment.asset_number})`,
			dxm: setupSourceData('levelZones', dataArray[i]),
			pdmiq: setupSourceData('ourLevelZones', dataArray[i])
		};

		const { controller } = dataArray[i];

		if (controller && controller.temperatureLevelZone) {
			const { temperatureLevelZone } = controller;
			item.dxm[`parameter_type_${temperatureLevelZone.parameter_type}`] = {
				alarm_zone: temperatureLevelZone.alarm_zone,
				warning_zone: temperatureLevelZone.warning_zone
			};
		}
		if (controller && controller.temperatureOurLevelZone) {
			const { temperatureOurLevelZone } = controller;
			item.pdmiq[`parameter_type_${temperatureOurLevelZone.parameter_type}`] = {
				alarm_zone: temperatureOurLevelZone.alarm_zone,
				warning_zone: temperatureOurLevelZone.warning_zone
			};
		}

		// console.log(item)

		newList.push(item);
	}

	return newList;
};

const isPasswordStrong1 = password => {
  const minLength = 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isLength = password.length >= minLength;
  const isStrong = (isLength &&	hasLowercase &&	hasUppercase &&	hasDigit &&	hasSpecialChar);

  return { isStrong, isLength, hasLowercase, hasUppercase,	hasDigit,	hasSpecialChar };
};

const setupTrueFalseCellIcon1 = (cellValue) => {
	const trueVal = 'success-color icomoon icon-check';
	const falseVal = 'alarm-color icomoon icon-cross';
	const icon = cellValue ? trueVal : falseVal;
	return `<span class="${icon}"></span>`;
};

const copyToClipboard1 = (string, settings = {}) => {
	if (!string) return;

	const input = document.createElement('textarea');
	input.id = 'toBuffer';
	input.value = string;
	input.setAttribute('readonly', '');
	input.style.position = 'absolute';
	input.style.left = '-9999px';
	input.style.opacity = '0';
	input.style.zIndex = -1000;
	document.body.appendChild(input);
	input.focus();
	input.select();
	document.execCommand('copy');
	document.body.removeChild(input);

	const { messageText, messageType } = settings;

	ElMessage({
		type: messageType || 'info',
		message: messageText || 'copied to clipboard',
	});
};

const setupItemSpeedOptionsList1 = ({rootFilters = {}, sensorData, itemSpeedOptionsList, fftItem}) => {
	const rpmSources = sensorData?.rpmSources || {};
	let list = [];
	const setupRpmOptionValues = value => {
		const rpmValue = value != null ? +value : value;
		return {
			value: rpmValue,
			rpmValue,
			hzValue: rpmValue != null && !isNaN(rpmValue) ? rpmValue / 60 : null
		};
	};

	Object.keys(rpmSources).forEach(source_key => {
		let key = 'source_key';

		if (source_key == 'max_peak_frequency_at_imperial_evaluated') {
			if (rootFilters.measurement === METRIC_SYSTEM_TYPES.IMPERIAL) {
				key = `source_key_${METRIC_SYSTEM_TYPES.IMPERIAL}`;
			}
		} else if (source_key == 'max_peak_frequency_at_metric_evaluated') {
			if (rootFilters.measurement === METRIC_SYSTEM_TYPES.METRIC) {
				key = `source_key_${METRIC_SYSTEM_TYPES.METRIC}`;
			}
		}

		const option = findItemBy(key, source_key, itemSpeedOptionsList);
  	// console.log('dialog', rpmSources, source_key, rpmSources[source_key])
		if (option && (rpmSources[source_key] || rpmSources[source_key] == 0)) {
			list.push({
				id: option.id,
				name: option.name,
				...setupRpmOptionValues(rpmSources[source_key]),
				hasInput: option.hasInput,
				draggable: option.draggable
			});
		}
	});

	if (fftItem) {
		list.push({
			id: 'fft-rpm',
			name: 'FFT',
			...setupRpmOptionValues(fftItem.rpm_value),
			hasInput: true
		});
	}

	return Object.freeze(list);
};

const getCurrentRpmSource1 = ({ rootFilters = {}, sensorData = {}, fftItem = null, rpm_source_item = null }) => {
	if (fftItem && fftItem.rpm_value != null) {
		return {
			id: 'fft-rpm',
			value: fftItem.rpm_value,
			name: 'FFT',
			draggable: true,
		};
	}

	const preparedList = setupItemSpeedOptionsList1({
		sensorData,
		rootFilters,
		itemSpeedOptionsList: itemSpeedOptionsList(),
	});
	if (rpm_source_item) {
		return findItemBy('id', rpm_source_item, preparedList);
	}
	return null;
};

const getSensorPlant1 = (sensor = {}, equipment = {}) => {
	const sensorData = sensor || {};
	const equipmentData = equipment || {};
	const plant =
		getObjectVal(sensorData, 'controller.plant') ||
		getObjectVal(sensorData, 'equipment.plant') ||
		getObjectVal(equipmentData, 'plant') ||
		getObjectVal(sensorData, 'equipment.asset.machine.productionLine.plant') ||
		getObjectVal(equipmentData, 'asset.machine.productionLine.plant');

	if (plant) return plant;

	const name =
		getObjectVal(sensorData, 'equipment.plant_name') ||
		getObjectVal(equipmentData, 'plant_name');
	const id =
		getObjectVal(sensorData, 'equipment.plant_id') ||
		getObjectVal(equipmentData, 'plant_id');

	return name || id ? { id, name } : null;
};

const getSensorMetricSystemType1 = (sensor = {}, equipment = {}) => {
	const sensorData = sensor || {};
	const equipmentData = equipment || {};
	const plant = getSensorPlant1(sensorData, equipmentData);

	return (
		(plant && getObjectVal(plant, 'metric_system_type')) ||
		getObjectVal(sensorData, 'controller.metric_system_type') ||
		getObjectVal(sensorData, 'equipment.metric_system_type') ||
		getObjectVal(equipmentData, 'metric_system_type') ||
		METRIC_SYSTEM_TYPES.METRIC
	);
};

export const equipmentCardTitle = (titles, equipmentData) =>
	equipmentCardTitle1(titles, equipmentData);
export const getBrandModelImgByType = payload => getBrandModelImgByType1(payload);
export const calcFabShopBudget = payload => calcFabShopBudget1(payload);
export const getCellStyles = payload => getCellStyles1(payload);
export const compareDatesForMaintenance = (created_at, now) =>
	compareDatesForMaintenance1(created_at, now);
export const scrollToElement = query => scrollToElement1(query);
export const checkUploadSettings = (payload, settings, additionalSettings) =>
	checkUploadSettings1(payload, settings, additionalSettings);
export const setupTypeOptionsValuesList = (
	currentDataList,
	equipmentTypeData,
	settings
) => setupTypeOptionsValuesList1(currentDataList, equipmentTypeData, settings);
export const setupBatteryChargeCell = battery_voltage =>
	setupBatteryChargeCell1(battery_voltage);
export const setupConnectionStrengthCell = (row, args) =>
	setupConnectionStrengthCell1(row, args);
export const macAddressMask = input => macAddressMask1(input);
export const getImgTypeName = img => getImgTypeName1(img);
export const waitForElement = (selector, callback, interval) => waitForElement1(selector, callback, interval);
export const toggleHeightBlock = (open, targetBlock) =>
	toggleHeightBlock1(open, targetBlock);
export const setupLogTypeIcon = log => setupLogTypeIcon1(log);
export const resetDaterangeIfExpired = (filters, resetTo, withTime) =>
	resetDaterangeIfExpired1(filters, resetTo, withTime);

export const setupWarningsData = data => setupWarningsData1(data);
export const setupTresholdsOurList = dataArray => setupTresholdsOurList1(dataArray);
export const getSensorTitle = (payload, options) =>
	getSensorTitle1(payload, options);

export const isPasswordStrong = str => isPasswordStrong1(str);
export const setupTrueFalseCellIcon = val => setupTrueFalseCellIcon1(val);
export const copyToClipboard = (str, settings) => copyToClipboard1(str, settings);
export const setupItemSpeedOptionsList = payload => setupItemSpeedOptionsList1(payload);
export const getCurrentRpmSource = payload => getCurrentRpmSource1(payload);
export const getSensorPlant = (sensor, equipment) =>
	getSensorPlant1(sensor, equipment);
export const getSensorMetricSystemType = (sensor, equipment) =>
	getSensorMetricSystemType1(sensor, equipment);
