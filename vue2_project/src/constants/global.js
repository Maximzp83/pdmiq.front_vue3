// console.log('global.js')
import { cloneDeep } from '@/helpers';
import { Lang } from '@/localization';
import { METRIC_SYSTEM_TYPES } from '@/modules/charts_factory/controllers/Sensor/enums.js';

export const USER_ROLES_TYPES = {
	DEVELOPER: 0,
	INDUSTRIAL_MATRIX: 1,
	CUSTOMER: 2
	// PLANT_USER: 3
};

const userRolesTypesList1 = [
	{ id: USER_ROLES_TYPES.INDUSTRIAL_MATRIX, name: 'industrial_matrix' },
	{ id: USER_ROLES_TYPES.CUSTOMER, name: 'customer' }
	// { id: USER_ROLES_TYPES.PLANT_ADMIN, name: 'constants.plant_admin' },
	// { id: USER_ROLES_TYPES.PLANT_USER, name: 'constants.plant_user' },
];

export const USER_TYPES = {
	SUPER_ADMIN: 1,
	PLANT_USER: 2,
	DISTRIBUTOR: 3,
	PLANT_ADMIN: 4,
	PLANT_SUPERINTENDENT: 5,
	OEE_PROCCESS: 6,
	CORPORATE: 7
	// INTERNAL: 1,
	// DISTRIBUTOR: 3,
	// CLIENT: 2,
	// PLANT_USER: 4,
	// PLANT_ADMIN: 5,
	// SUPERINTENDENT: 6,
	// PRODUCTION_SUPERVISOR: 7
};

const userTypesList1 = [
	{ id: USER_TYPES.SUPER_ADMIN, name: 'constants.super_admin' },
	{ id: USER_TYPES.PLANT_USER, name: 'constants.plant_user' },
	{ id: USER_TYPES.DISTRIBUTOR, name: 'constants.distributor' },
	{ id: USER_TYPES.PLANT_ADMIN, name: 'constants.plant_admin' },
	{ id: USER_TYPES.PLANT_SUPERINTENDENT, name: 'constants.plant_superintendent' },
	{ id: USER_TYPES.OEE_PROCCESS, name: 'constants.oee_proccess' },
	{ id: USER_TYPES.CORPORATE, name: 'constants.corporate' }
	// { id: USER_TYPES.SUPER_ADMIN, name: 'Internal' },
	// { id: USER_TYPES.DISTRIBUTOR, name: 'Distributor' },
	// { id: USER_TYPES.CLIENT, name: 'Client' },
	// { id: USER_TYPES.PLANT_USER, name: 'Plant User' },
	// { id: USER_TYPES.PLANT_ADMIN, name: 'Plant Admin' },
	// { id: USER_TYPES.SUPERINTENDENT, name: 'Superintendent' },
	// { id: USER_TYPES.PRODUCTION_SUPERVISOR, name: 'Production Supervisor' },
];

export const MFA_TYPES = {
	SMS: 1,
	GOOGLE_AUTHENTICATOR: 2,
};

const mfaTypesList1 = [
	{ id: MFA_TYPES.SMS, name: 'SMS', skipTranslate:1 },
	{ id: MFA_TYPES.GOOGLE_AUTHENTICATOR, name: 'Authenticator' },
];

export const NCD_ULTRASOUND_POSITIONS = {
	C1_MA: 1,
	C2_MA: 2
};
export const ncdUltrasoundPositionsList = [
	{ id: NCD_ULTRASOUND_POSITIONS.C1_MA, name: 'C1 MA' },
	{ id: NCD_ULTRASOUND_POSITIONS.C2_MA, name: 'C2 MA' }
];

export const FFT_REQUEST_STATUSES = {
	PENDING: 1,
	APPROVED: 2,
	COMPLETED: 3,
	UNDEFINED: 4
};
const fftRequestStatusesList1 = [
	{ id: FFT_REQUEST_STATUSES.PENDING, name: 'constants.pending' },
	{ id: FFT_REQUEST_STATUSES.APPROVED, name: 'constants.approved' },
	{ id: FFT_REQUEST_STATUSES.COMPLETED, name: 'constants.completed' },
	{ id: FFT_REQUEST_STATUSES.UNDEFINED, name: 'constants.undefined' }
];

export const NCD_REQUEST_STATUSES = {
	PENDING: 1,
	SUCCESS: 2,
	FAIL: 3
};

export const ncdRequestStatusesList = [
	{ id: FFT_REQUEST_STATUSES.PENDING, name: 'constants.pending' },
	{ id: FFT_REQUEST_STATUSES.SUCCESS, name: 'constants.success' },
	{ id: FFT_REQUEST_STATUSES.FAIL, name: 'constants.fail' }
];

export const DXM_COMMANDS_REQUEST_STATUSES = { ...NCD_REQUEST_STATUSES };
export const dxmCommandRequestStatusesList = [
	{ id: DXM_COMMANDS_REQUEST_STATUSES.PENDING, name: 'constants.pending' },
	{ id: DXM_COMMANDS_REQUEST_STATUSES.SUCCESS, name: 'constants.success' },
	{ id: DXM_COMMANDS_REQUEST_STATUSES.FAIL, name: 'constants.fail' }
];

export const LEVEL_ZONES = {
	BASELINE: 1,
	WARNING: 2,
	ALARM: 3,

	CRITICAL_ALARM: 4,
	CUSTOM: 5,
	NORMAL: 6,
	OFF_ALARM: 7,
	LUBELINE: 8
};

export const ALERT_RULES = {
	ACUTE: 1,
	CHRONIC: 2
};

const alertRulesList1 = [
	{ id: ALERT_RULES.ACUTE, name: 'constants.acute', icon: 'icon-acute' },
	{ id: ALERT_RULES.CHRONIC, name: 'constants.chronic', icon: 'icon-chronic' }
];

export const ALERT_TYPES = {
	WARNING: 1,
	ALARM: 2,
	MIXED: 3,
	LUBE: 8,
	LOW_ALARM: 9,
	HIGH_ALARM: 10,
	AMPLITUDE_ALARM: 11
};

const alertTypesList1 = [
	{
		id: ALERT_TYPES.WARNING,
		name: 'constants.warning',
		icon: 'icon-warning',
		key: 'warning'
	},
	{
		id: ALERT_TYPES.ALARM,
		name: 'constants.alarm',
		icon: 'icon-alarm',
		key: 'alarm'
	},
	{
		id: ALERT_TYPES.MIXED,
		name: 'constants.mixed',
		icon: 'icon-mixed',
		key: 'mixed'
	},
	{
		id: ALERT_TYPES.LUBE,
		name: 'constants.lube',
		icon: 'icon-oil-drum',
		key: 'lube'
	},
	{
		id: ALERT_TYPES.LOW_ALARM,
		name: 'phrases.low_alarm',
		icon: 'icon-alarm',
		key: 'low_alarm'
	},
	{
		id: ALERT_TYPES.HIGH_ALARM,
		name: 'phrases.high_alarm',
		icon: 'icon-alarm',
		key: 'high_alarm'
	},
	{
		id: ALERT_TYPES.AMPLITUDE_ALARM,
		name: 'phrases.amplitude_alarm',
		icon: 'icon-alarm',
		key: 'amplitude_alarm'
	}
];

/*export const EQUIPMENT_TYPES = {
	MOTOR: 1,
	PUMP: 2,
	GEARBOX: 3,
	GEARBOX_HELICAL_INLINE: 4,
	GEARBOX_HELICAL_BEVEL: 5,
	GEARBOX_WORM_GEAR: 6,
	PILLOW_BLOCK: 7,
	AIRSEAL: 8,
	BEARING: 9
};*/

/*const equipmentTypesList1 = [
	{ id: EQUIPMENT_TYPES.MOTOR, name: 'motor', img: 'motor' },
	{ id: EQUIPMENT_TYPES.PUMP, name: 'pump', img: 'pump' },
	{ id: EQUIPMENT_TYPES.GEARBOX, name: 'gearbox', img: 'gearbox_helical_inline' },
	{
		id: EQUIPMENT_TYPES.GEARBOX_HELICAL_INLINE,
		name: 'gearbox helical inline',
		img: 'gearbox_helical_inline'
	},
	{
		id: EQUIPMENT_TYPES.GEARBOX_HELICAL_BEVEL,
		name: 'gearbox helical bevel',
		img: 'gearbox_helical_bevel'
	},
	{
		id: EQUIPMENT_TYPES.GEARBOX_WORM_GEAR,
		name: 'gearbox worm gear',
		img: 'gearbox_worm_gear'
	},
	{ id: EQUIPMENT_TYPES.PILLOW_BLOCK, name: 'pillow block', img: 'pillow_block' },
	{ id: EQUIPMENT_TYPES.AIRSEAL, name: 'airseal', img: 'airseal' },
	{ id: EQUIPMENT_TYPES.BEARING, name: 'bearing', img: 'bearing' }
];*/

export const SOURCE_TYPES = {
	DXM: 1,
	PDMIQ: 2
};

export const sourceTypesList = [
	{ id: SOURCE_TYPES.DXM, name: 'DXM' },
	{ id: SOURCE_TYPES.PDMIQ, name: 'PDMIQ' }
];

export const NOTIFICATION_TYPES = {
	REAL_TIME: 1,
	DAILY: 2,
	LOSS_CONNECTION: 3,
	CONTROLLER_LOSS_CONNECTION: 4,
	SENSOR_ONE_STATE: 5,
	LOW_LUBRICATION_LEVEL: 6,
	ULTRA_SOUND_CRITICAL_CRASH: 7,
	ULTRA_SOUND_CUSTOM_CRASH: 8,
	OFF_ALARM_CRASH: 9,
	SENSOR_ANOMALY: 10,
	EXTRA_VIBRATION_NOTIFICATION: 11,
	LUBEMATRIX_DAILY_NOTIFICATION: 12,
	FAILURE_LUBE_SHOT: 13,
	OFFLINE_CONVEYOR_PROCESS: 14,
	ALARMS_NOTES: 15,
	NCD_NODE_BATTERY_ALARM: 16,
	NCD_FFT_REQUEST: 17
};

const notificationTypesList1 = [
	{ id: NOTIFICATION_TYPES.REAL_TIME, name: 'real time' },
	{ id: NOTIFICATION_TYPES.DAILY, name: 'daily' },
	{ id: NOTIFICATION_TYPES.LOSS_CONNECTION, name: 'loss connection' },
	{
		id: NOTIFICATION_TYPES.CONTROLLER_LOSS_CONNECTION,
		name: 'controller loss connection'
	},
	{ id: NOTIFICATION_TYPES.SENSOR_ONE_STATE, name: 'sensor one state' },
	{ id: NOTIFICATION_TYPES.LOW_LUBRICATION_LEVEL, name: 'low lubrication level' },
	{ id: NOTIFICATION_TYPES.ULTRA_SOUND_CRITICAL_CRASH, name: 'lube critical crash' },
	{ id: NOTIFICATION_TYPES.ULTRA_SOUND_CUSTOM_CRASH, name: 'lube custom crash' },
	{ id: NOTIFICATION_TYPES.OFF_ALARM_CRASH, name: 'off alarm crash' },
	{ id: NOTIFICATION_TYPES.SENSOR_ANOMALY, name: 'sensor anomaly' },
	{ id: NOTIFICATION_TYPES.EXTRA_VIBRATION_NOTIFICATION, name: 'extra vibration' },
	{
		id: NOTIFICATION_TYPES.LUBEMATRIX_DAILY_NOTIFICATION,
		name: 'LubeMatrix Daily Notification'
	},
	// { id: NOTIFICATION_TYPES.FAILURE_LUBE_SHOT, name: 'failure lube shot' },
	// { id: NOTIFICATION_TYPES.OFFLINE_CONVEYOR_PROCESS, name: 'offline conveyor process' },
	{ id: NOTIFICATION_TYPES.ALARMS_NOTES, name: 'sensor alarms' },
	{ id: NOTIFICATION_TYPES.NCD_NODE_BATTERY_ALARM, name: 'Battery Charge' },
	{ id: NOTIFICATION_TYPES.NCD_FFT_REQUEST, name: 'FFT Request' }
];

export const COMPLETE_ACTIONS_TYPES = {
	RE_BASELINE: 1,
	CORRECTIVE_ACTION: 2,
	CHANGE_ITEM: 3
};

const completeActionsTypesList1 = [
	{ id: COMPLETE_ACTIONS_TYPES.RE_BASELINE, name: 'constants.rebaseline' },
	{
		id: COMPLETE_ACTIONS_TYPES.CORRECTIVE_ACTION,
		name: 'constants.corrective_action'
	},
	{ id: COMPLETE_ACTIONS_TYPES.CHANGE_ITEM, name: 'constants.change_item' }
];

export const SNOOZE_RANGE_TYPES = {
	DAY: 1,
	WEEK: 2,
	MONTH: 3,
	CUSTOM_RANGE: 4
};

const snoozeRangeTypesList1 = [
	{ id: SNOOZE_RANGE_TYPES.DAY, name: 'constants.1_day' },
	{ id: SNOOZE_RANGE_TYPES.WEEK, name: 'constants.7_days' },
	{ id: SNOOZE_RANGE_TYPES.MONTH, name: 'constants.month' },
	{ id: SNOOZE_RANGE_TYPES.CUSTOM_RANGE, name: 'constants.custom_range' }
];

export const CONTROLLER_TYPES = {
	BANNER: 1,
	ULTRA_SOUND: 2,
	ULTRA_SOUND_WHITE_RIVER: 3,
	COUNTER: 4,
	NCD: 5
};

export const SENSOR_TYPES = { ...CONTROLLER_TYPES };

const controllerTypesList1 = [
	{ id: CONTROLLER_TYPES.BANNER, name: 'constants.banner', alt_name: 'PDM' },
	{ id: CONTROLLER_TYPES.ULTRA_SOUND, name: 'constants.ultrasound', alt_name: 'LubeMatrix' },
	{
		id: CONTROLLER_TYPES.ULTRA_SOUND_WHITE_RIVER,
		name: 'constants.ultrasound_white_river'
	},
	{ id: CONTROLLER_TYPES.COUNTER, name: 'constants.banner_counter' },
	{ id: CONTROLLER_TYPES.NCD, name: 'constants.ncd' }
];

export const CONTROLLER_VERSIONS = {
	V0: 0,
	V1: 1
};

export const controllerVersionsList = [
	{ id: CONTROLLER_VERSIONS.V0, name: 'V0' },
	{ id: CONTROLLER_VERSIONS.V1, name: 'V1' }
];

export const DATASET = {
	TEMP_VIBE: 1,
	CM1L: 2,
	ULTRA_SOUND_DECIBELS: 3,
	// WHITE_RIVER_DECIBELS: 4,
	// WHITE_RIVER_EXTRA_VIBRATION: 5,
	ULTRA_SOUND_SDT_DECIBELS: 6,
	HUMIDITY: 7,
	EXTRA_VIBRATION: 8,
	ULTRA_SOUND_SDT_DECIBELS_4_20: 9,
	SDT_SENSOR_FULL_SPECTRUM: 10,
	CUSTOM_PDM_SETUP: 11,

	NCD_ALL_IN_ONE_TEMP_VIBE: 12,
	NCD_WIRED_TEMP_VIBE: 13,
	NCD_TEMP_VIBE_CURRENT: 14,
	NCD_ENVIRONMENTAL: 15,
	NCD_ULTRASOUND_SDT_FULL_SPECTRUM: 16,
	NCD_PRESSURE: 17,
	BANNER_PRESSURE: 18,
	BANNER_TEMP_VIBE_V2: 19,
	LUBE_MATRIX_SDT_TEMP_C: 20,
	LUBE_MATRIX_SDT_TEMP_F: 21,
	NCD_4_20MA: 22,
	BANNER_V2_GENERIC: 23,
	BANNER_TEMP_VIBE_V2_1: 24,
	LUBE_MATRIX_SDT_FULL_SPECTRUM: 25,
	BANNER_M25: 26,

	// LUBEMATRIX_V3: 999 // для работы в форме banner сенсора
};

const dataSetsList1 = [
	{
		id: DATASET.TEMP_VIBE, // DATASET.ALL_IN_ONE,
		label: 'constants.temp_vibe',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.CM1L,
		label: 'constants.cm1l',
		alt_label: 'constants.cm1l_sensor_custom_a',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.ULTRA_SOUND_DECIBELS,
		label: 'constants.decibells',
		alt_label: 'constants.ue_sensor',
		controller_type: CONTROLLER_TYPES.ULTRA_SOUND
	},
	{
		id: DATASET.HUMIDITY,
		label: 'constants.humidity',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.EXTRA_VIBRATION,
		label: 'constants.extra_vibration',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.ULTRA_SOUND_SDT_DECIBELS,
		label: 'constants.decibells',
		alt_label: 'constants.sdt_sensor_0_10v',
		controller_type: CONTROLLER_TYPES.ULTRA_SOUND
	},
	{
		id: DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20,
		label: 'constants.decibells',
		alt_label: 'constants.sdt_sensor_4_20ma',
		controller_type: CONTROLLER_TYPES.ULTRA_SOUND
	},
	{
		id: DATASET.SDT_SENSOR_FULL_SPECTRUM,
		label: 'constants.decibells',
		alt_label: 'constants.sdt_sensor_full_spectrum',
		controller_type: CONTROLLER_TYPES.ULTRA_SOUND
	},
	{
		id: DATASET.CUSTOM_PDM_SETUP,
		label: 'constants.custom_pdm_setup',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.NCD_ALL_IN_ONE_TEMP_VIBE,
		label: 'constants.all_in_one_temp_vibe',
		controller_type: CONTROLLER_TYPES.NCD
	},
	{
		id: DATASET.NCD_WIRED_TEMP_VIBE,
		label: 'constants.wired_temp_vibe',
		alt_label: 'constants.temperature_vibration',
		controller_type: CONTROLLER_TYPES.NCD
	},
	{
		id: DATASET.NCD_TEMP_VIBE_CURRENT,
		label: 'constants.temp_vibe_current',
		controller_type: CONTROLLER_TYPES.NCD
	},
	{
		id: DATASET.NCD_ENVIRONMENTAL,
		label: 'constants.environmental',
		controller_type: CONTROLLER_TYPES.NCD
	},
	{
		id: DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM,
		label: 'constants.ultrasound',
		alt_label: 'constants.ncd_sdt_full_spectrum_ultrasound',
		controller_type: CONTROLLER_TYPES.NCD
	},
	{
		id: DATASET.NCD_PRESSURE,
		label: 'constants.pressure',
		controller_type: CONTROLLER_TYPES.NCD
	},
	{
		id: DATASET.BANNER_PRESSURE,
		label: 'constants.pressure',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.BANNER_TEMP_VIBE_V2,
		label: 'constants.Banner_Temp_Vibe_V2',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.LUBE_MATRIX_SDT_TEMP_C,
		label: 'constants.LUBE_MATRIX_SDT_TEMP_C',
		alt_label: 'constants.LUBE_MATRIX_SDT_TEMP_C',
		controller_type: CONTROLLER_TYPES.ULTRA_SOUND
	},
	{
		id: DATASET.LUBE_MATRIX_SDT_TEMP_F,
		label: 'constants.LUBE_MATRIX_SDT_TEMP_F',
		alt_label: 'constants.LUBE_MATRIX_SDT_TEMP_F',
		controller_type: CONTROLLER_TYPES.ULTRA_SOUND
	},
	{
		id: DATASET.NCD_4_20MA,
		label: 'constants.NCD_Custom_4_20',
		// alt_label: 'constants.NCD_Custom_4_20',
		controller_type: CONTROLLER_TYPES.NCD
	},
	{
		id: DATASET.BANNER_V2_GENERIC,
		label: 'constants.BANNER_V2_GENERIC',
		// alt_label: 'constants.NCD_Custom_4_20',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.BANNER_TEMP_VIBE_V2_1,
		label: 'constants.banner_temp_vibe_v2_1',
		// alt_label: 'constants.NCD_Custom_4_20',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	// --------Lube V3-------
	{
		id: DATASET.BANNER_M25,
		label: 'constants.banner_m25',
		// alt_label: 'constants.NCD_Custom_4_20',
		controller_type: CONTROLLER_TYPES.BANNER
	},
	{
		id: DATASET.LUBEMATRIX_V3, // для работы в форме banner сенсора
		label: 'constants.lube_v3',
		// alt_label: 'constants.NCD_Custom_4_20',
		// controller_type: CONTROLLER_TYPES.ULTRA_SOUND
	},
	{
		id: DATASET.LUBE_MATRIX_SDT_FULL_SPECTRUM,
		label: 'constants.sdt_sensor_full_spectrum',
		// alt_label: 'constants.NCD_Custom_4_20',
		isLubeV3: true,
	},
];

export const NCD_ALARM_TYPES = {
	WARNING_ALARM: 1,
	LOW_HIGH_ALARM: 2
};
const ncdAlarmTypesList1 = [
	{ id: NCD_ALARM_TYPES.WARNING_ALARM, name: 'constants.WARNING_ALARM' },
	{ id: NCD_ALARM_TYPES.LOW_HIGH_ALARM, name: 'constants.LOW_HIGH_ALARMs' }
];

export const SENSOR_THRESHOLD_TYPES = {
	BASELINE: 1,
	WARNING: 2,
	ALARM: 3,
};
const sensorThresholdsTypesList1 = [
	{ id: SENSOR_THRESHOLD_TYPES.BASELINE, name: 'constants.good' },
	{ id: SENSOR_THRESHOLD_TYPES.WARNING, name: 'constants.warning' },
	{ id: SENSOR_THRESHOLD_TYPES.ALARM, name: 'constants.alarm' }
];

export const CHART_TYPES = {
	COLUMN: 1,
	LINE: 2,
	AREASPLINE: 3
};
const chartTypesList1 = [
	{ id: CHART_TYPES.COLUMN, name: 'COLUMN', chart_type: 'column' },
	{ id: CHART_TYPES.LINE, name: 'LINE', chart_type: 'spline' },
	{ id: CHART_TYPES.AREASPLINE, name: 'AREASPLINE', chart_type: 'areaspline' }
];

export const SENSOR_SETUP_TYPES = {
	COLORTECH_VFD_PRESSURE_RPM_AMPS: 1
};

export const sensorCustomSetupTypesList = [
	{
		id: SENSOR_SETUP_TYPES.COLORTECH_VFD_PRESSURE_RPM_AMPS,
		name: 'constants.colortech_vfd_pressure_rpm_amps'
	}
];

const translateSensorType = dataSetValue => {
	// console.log('dataSetValue', dataSetValue)
	const { technology, technology_abbr, group_technology } = dataSetValue;
	dataSetValue.technology = Lang.tt(technology);
	dataSetValue.technology_abbr = Lang.tt(technology_abbr);
	dataSetValue.group_technology = Lang.tt(group_technology);
	return dataSetValue;
};

const getSensorTypesList = (sensorTypesList, type_arg, dataset_arg) => {
	let sensorTypes = cloneDeep(sensorTypesList);
	if (type_arg && dataset_arg) {
		// console.log('method 1', type_arg, dataset_arg, sensorTypes, sensorTypes[type_arg][dataset_arg])
		return translateSensorType(sensorTypes[type_arg][dataset_arg]);
	} else {
		for (const sensorType in sensorTypes) {
			for (const dataset in sensorTypes[sensorType]) {
				// console.log('method 2', sensorTypes, sensorType, dataset)
				sensorTypes[sensorType][dataset] = translateSensorType(
					sensorTypes[sensorType][dataset]
				);
				/*const { 
					technology, technology_abbr, group_technology
				} = dataSetValue;
				// console.log(technology, Lang.tt(technology))
				dataSetValue.technology = Lang.tt(technology);
				dataSetValue.technology_abbr = Lang.tt(technology_abbr);
				dataSetValue.group_technology = Lang.tt(group_technology);*/
			}
		}
	}
	return sensorTypes;
};

const sensorTypesList1 = {
	[SENSOR_TYPES.BANNER]: {
		[DATASET.ULTRA_SOUND_SDT_DECIBELS]: {
			technology: 'constants.ultrasound_sdt',
			technology_abbr: 'constants.usound',
			icons: ['ultrasound'],
			isSDTsensor: true,
			isSDTsensorDB: true,
			chartSettingsKey: 'banner_sdt_decibell',
			filters_group: 'ultrasound',
			group_technology: 'constants.ultrasound'
		},
		[DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20]: {
			technology: 'constants.ultrasound_sdt_4_20',
			technology_abbr: 'constants.usound',
			icons: ['ultrasound'],
			isSDTsensor: true,
			isSDTsensorDB420: true,
			chartSettingsKey: 'banner_sdt_decibell',
			filters_group: 'ultrasound',
			group_technology: 'constants.Ultrasound'
		},
		[DATASET.SDT_SENSOR_FULL_SPECTRUM]: {
			technology: 'constants.ultrasound_sdt_full_spectrum',
			technology_abbr: 'constants.usound',
			icons: ['ultrasound'],
			isSDTsensor: true,
			isSDTsensorDBFullSpectrun: true,
			chartSettingsKey: 'banner_sdt_decibell',
			filters_group: 'ultrasound',
			group_technology: 'constants.Ultrasound'
		},
		[DATASET.HUMIDITY]: {
			technology: 'constants.humidity_temperature',
			technology_abbr: 'constants.hum_temp',
			icons: ['humidity', 'temperature'],
			isHumiditySensor: true,
			chartSettingsKey: 'banner_humidity',
			filters_group: 'humidity_temperature',
			group_technology: 'constants.humidity_temperature'
		},
		[DATASET.CM1L]: {
			technology: 'constants.vibration_temperature_current',
			technology_abbr: 'constants.vibe_temp_curr',
			icons: ['vibration', 'temperature', 'current'],
			isBannerCM1L: true,
			chartSettingsKey: 'banner_CM1L',
			filters_group: 'vibration_temperature_current',
			group_technology: 'constants.vibration_temperature_current'
		},
		[DATASET.TEMP_VIBE]: {
			technology: 'constants.vibration_temperature',
			technology_abbr: 'constants.vibe_temp',
			icons: ['vibration', 'temperature'],
			isBanner: true,
			chartSettingsKey: 'banner',
			filters_group: 'vibration_temperature',
			group_technology: 'constants.vibration_temperature'
		},
		[DATASET.CUSTOM_PDM_SETUP]: {
			technology: 'constants.custom_pdm',
			technology_abbr: 'constants.custom_pdm',
			icons: ['vibration', 'temperature'],
			isCustomPDM: true,
			chartSettingsKey: {
				[SENSOR_SETUP_TYPES.COLORTECH_VFD_PRESSURE_RPM_AMPS]:
					'colortech_vfd_pressure_rpm/amps'
			},
			filters_group: 'custom',
			group_technology: 'constants.Custom'
		},
		[DATASET.EXTRA_VIBRATION]: {
			technology: 'constants.extra_vibration',
			technology_abbr: 'constants.extra_vibration',
			icons: ['vibration', 'temperature'],
			isExtravibration: true,
			chartSettingsKey: 'extra_vibration'
			// filters_group: 'vibration_temperature',
			// group_technology: 'constants.vibration_temperature'
		},
		[DATASET.BANNER_PRESSURE]: {
			technology: 'constants.pressure',
			technology_abbr: 'constants.PSI',
			icons: ['temperature'],
			isBannerPressure: true,
			chartSettingsKey: 'banner_pressure',
			filters_group: 'ncd_pressure',
			group_technology: 'constants.pressure'
		},
		[DATASET.BANNER_TEMP_VIBE_V2]: {
			technology: 'constants.vibration_temperature',
			technology_abbr: 'constants.vibe_temp',
			icons: ['vibration', 'temperature'],
			isBannerTempVibe2: true,
			chartSettingsKey: 'banner_temp_vibe_v2',
			filters_group: 'vibration_temperature',
			group_technology: 'constants.vibration_temperature'
		},
		[DATASET.BANNER_V2_GENERIC]: {
			technology: 'constants.vibration_temperature',
			technology_abbr: 'constants.vibe_temp',
			icons: ['vibration', 'temperature'],
			isBannerV2Generic: true,
			chartSettingsKey: 'banner_v2_generic',
			filters_group: 'vibration_temperature',
			group_technology: 'constants.vibration_temperature'
		},
		[DATASET.BANNER_TEMP_VIBE_V2_1]: {
			technology: 'constants.vibration_temperature',
			technology_abbr: 'constants.vibe_temp',
			icons: ['vibration', 'temperature'],
			isBannerV2_1: true,
			chartSettingsKey: 'banner_temp_vibe_v2_1',
			filters_group: 'vibration_temperature',
			group_technology: 'constants.vibration_temperature'
		},
		[DATASET.BANNER_M25]: {
			technology: 'technology.ultrasound_vibration_temperature',
			technology_abbr: 'technology.uvt',
			icons: ['ultrasound', 'vibration', 'temperature'],
			isBannerM25: true,
			chartSettingsKey: 'banner_m25',
			filters_group: 'vibration_temperature',
			group_technology: 'constants.vibration_temperature'
		},
		[DATASET.LUBEMATRIX_V3]: { // для работы в форме banner сенсора
			technology: 'constants.ultrasound_sdt',
			technology_abbr: 'constants.usound',
			// icons: ['ultrasound'],
			// isUltrasound: true,
			// chartSettingsKey: 'banner_sdt_decibell',
			filters_group: 'ultrasound',
			group_technology: 'constants.ultrasound'
		},
		[DATASET.LUBE_MATRIX_SDT_FULL_SPECTRUM]: { // для работы в форме banner сенсора
			technology: 'constants.ultrasound_sdt',
			technology_abbr: 'constants.usound',
			// icons: ['ultrasound'],
			// isUltrasound: true,
			// chartSettingsKey: 'banner_sdt_decibell',
			filters_group: 'ultrasound',
			group_technology: 'constants.ultrasound'
		},
	},
	[SENSOR_TYPES.ULTRA_SOUND]: {
		0: { technology: 'constants.LubeMatrix', technology_abbr: 'constants.USound' },

		[DATASET.ULTRA_SOUND_DECIBELS]: {
			technology: 'constants.LubeMatrix',
			technology_abbr: 'constants.usound',
			icons: ['humidity'],
			isUltrasound: true,
			isUltrasoundDB: true,
			chartSettingsKey: 'ultrasound',
			filters_group: 'lubematrix',
			group_technology: 'constants.LubeMatrix'
		},
		[DATASET.ULTRA_SOUND_SDT_DECIBELS]: {
			technology: 'constants.lubematrix_sdt',
			technology_abbr: 'constants.usound',
			icons: ['humidity'],
			isUltrasound: true,
			isUltrasoundSDTDB: true,
			chartSettingsKey: 'ultrasound',
			filters_group: 'lubematrix',
			group_technology: 'constants.LubeMatrix'
		},
		[DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20]: {
			technology: 'constants.lubematrix_sdt_4_20',
			technology_abbr: 'constants.usound',
			icons: ['humidity'],
			isUltrasound: true,
			isUltrasoundSDTDB_420: true,
			chartSettingsKey: 'ultrasound',
			filters_group: 'lubematrix',
			group_technology: 'constants.LubeMatrix'
		},
		[DATASET.SDT_SENSOR_FULL_SPECTRUM]: {
			technology: 'constants.lubematrix_sdt_full_spectrum',
			technology_abbr: 'constants.usound',
			icons: ['humidity'],
			isUltrasound: true,
			isUltrasoundFullSpectrum: true,
			chartSettingsKey: 'ultrasound',
			filters_group: 'lubematrix',
			group_technology: 'constants.LubeMatrix'
		},
		[DATASET.LUBE_MATRIX_SDT_TEMP_C]: {
			technology: 'constants.lube_matrix_sdt_temp_c',
			technology_abbr: 'constants.usound',
			icons: ['humidity'],
			isUltrasound: true,
			chartSettingsKey: 'ultrasound_lube_sdt_c',
			filters_group: 'lubematrix',
			group_technology: 'constants.LubeMatrix'
		},
		[DATASET.LUBE_MATRIX_SDT_TEMP_F]: {
			technology: 'constants.lube_matrix_sdt_temp_F',
			technology_abbr: 'constants.usound',
			icons: ['humidity'],
			isUltrasound: true,
			chartSettingsKey: 'ultrasound_lube_sdt_f',
			filters_group: 'lubematrix',
			group_technology: 'constants.LubeMatrix'
		},
		[DATASET.LUBEMATRIX_V3]: { // для работы в форме banner сенсора
			technology: 'constants.ultrasound_sdt',
			technology_abbr: 'constants.usound',
			// icons: ['ultrasound'],
			// isUltrasound: true,
			// chartSettingsKey: 'banner_sdt_decibell',
			filters_group: 'ultrasound',
			group_technology: 'constants.ultrasound'
		},
		[DATASET.LUBE_MATRIX_SDT_FULL_SPECTRUM]: { // для работы в форме banner сенсора
			technology: 'constants.ultrasound_sdt',
			technology_abbr: 'constants.usound',
			// icons: ['ultrasound'],
			// isUltrasound: true,
			// chartSettingsKey: 'banner_sdt_decibell',
			filters_group: 'ultrasound',
			group_technology: 'constants.ultrasound'
		},
	},
	[SENSOR_TYPES.ULTRA_SOUND_WHITE_RIVER]: {
		0: { technology: 'White_River', technology_abbr: 'USound' }
	},
	[SENSOR_TYPES.NCD]: {
		[DATASET.NCD_ALL_IN_ONE_TEMP_VIBE]: {
			technology: 'constants.vibration_temperature',
			technology_abbr: 'constants.temp_vibe',
			icons: ['vibration', 'temperature'],
			isNCDTempVibe: true,
			chartSettingsKey: 'ncd_temp_vibe',
			filters_group: 'vibration_temperature',
			group_technology: 'constants.vibration_temperature'
		},
		[DATASET.NCD_WIRED_TEMP_VIBE]: {
			technology: 'constants.wired_vibration_temperature',
			technology_abbr: 'constants.temp_vibe',
			icons: ['vibration', 'temperature'],
			isNCDWiredTempVibe: true,
			chartSettingsKey: 'ncd_wired_temp_vibe',
			filters_group: 'vibration_temperature',
			group_technology: 'constants.vibration_temperature'
		},
		[DATASET.NCD_TEMP_VIBE_CURRENT]: {
			technology: 'constants.vibration_temperature_current',
			technology_abbr: 'constants.vibe_temp_curr',
			icons: ['vibration', 'temperature', 'current'],
			isNCDTempVibeCurr: true,
			chartSettingsKey: 'ncd_temp_vibe_current',
			filters_group: 'vibration_temperature_current',
			group_technology: 'constants.vibration_temperature_current'
		},
		[DATASET.NCD_ENVIRONMENTAL]: {
			technology: 'constants.Pressure',
			technology_abbr: 'constants.PSI',
			icons: ['temperature'],
			isNCDEnv: true,
			chartSettingsKey: 'ncd_environmental',
			filters_group: 'humidity_temperature_airq',
			group_technology: 'constants.humidity_temperature_air_quality'
		},
		[DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM]: {
			technology: 'constants.ultrasound_sdt_full_spectrum',
			technology_abbr: 'constants.usound',
			icons: ['ultrasound'],
			isNCDSDT: true,
			chartSettingsKey: 'ncd_ultrasound',
			filters_group: 'ultrasound',
			group_technology: 'constants.Ultrasound'
		},
		[DATASET.NCD_PRESSURE]: {
			technology: 'constants.pressure',
			technology_abbr: 'constants.PSI',
			icons: ['temperature'],
			isNCDPressure: true,
			chartSettingsKey: 'ncd_pressure',
			filters_group: 'ncd_pressure',
			group_technology: 'constants.pressure'
		},
		[DATASET.NCD_4_20MA]: {
			technology: 'constants.custom',
			technology_abbr: 'constants.custom',
			icons: ['vibration', 'temperature', 'ultrasound'],
			isNCDCustom_4_20: true,
			chartSettingsKey: {
				[NCD_ALARM_TYPES.WARNING_ALARM]: 'ncd_custom_4_20',
				[NCD_ALARM_TYPES.LOW_HIGH_ALARM]: 'ncd_custom_4_20_line'
			},
			filters_group: 'custom',
			group_technology: 'constants.custom'
		}
	}
};

export const PUMP_TYPES = {
	GRACO: 1,
	PULSAR: 2,
	PERMA: 3
};

const pumpTypesList1 = [
	// { id: PUMP_TYPES.GRACO, name: 'Graco' },
	{ id: PUMP_TYPES.PULSAR, name: 'constants.pulsar' },
	{ id: PUMP_TYPES.PERMA, name: 'constants.perma' }
];

export const BANNER_POWER_TYPES = {
	LINE_POWERED: 2,
	ALL_IN_ONE_AA_BATTERY: 3,
	ALL_IN_ONE_C_BATTERY: 4,
	WIRED_AA_BATTERY: 5,
	WIRED_D_BATTERY: 6,
	WIRED_STAINLESS_STEEL_AA_BATTERY: 7,
	WIRED_STAINLESS_STEEL_D_BATTERY: 8
};

const bannerPowerTypesList1 = [
	{
		id: BANNER_POWER_TYPES.ALL_IN_ONE_AA_BATTERY,
		name: 'constants.all_in_one_aa_battery'
	},
	{
		id: BANNER_POWER_TYPES.ALL_IN_ONE_C_BATTERY,
		name: 'constants.all_in_one_c_battery'
	},
	{ id: BANNER_POWER_TYPES.WIRED_AA_BATTERY, name: 'constants.wired_aa_battery' },
	{ id: BANNER_POWER_TYPES.WIRED_D_BATTERY, name: 'constants.wired_d_battery' },
	{
		id: BANNER_POWER_TYPES.WIRED_STAINLESS_STEEL_AA_BATTERY,
		name: 'constants.wired_stainless_steel_aa_battery'
	},
	{
		id: BANNER_POWER_TYPES.WIRED_STAINLESS_STEEL_D_BATTERY,
		name: 'constants.wired_stainless_steel_d_battery'
	},
	{ id: BANNER_POWER_TYPES.LINE_POWERED, name: 'constants.line_powered' }
];

export const POWER_TYPES = {
	BATTERY: 1,
	LINE_POWERED: 2
};

const powerTypesList1 = [
	{ id: POWER_TYPES.BATTERY, name: 'constants.battery' },
	{ id: POWER_TYPES.LINE_POWERED, name: 'constants.line_powered' }
];

export const NCD_PRESSURE_RANGES = {
	PSI_0_100: 1
};

const ncdPressureRangesList1 = [
	{ id: NCD_PRESSURE_RANGES.PSI_0_100, name: '0-100 PSI' }
];

export const FFT_TYPES = {
	MANUAL: 1,
	AUTOMATIC: 2,
	SCHEDULED: 3,
	UNDEFINED: 4,
};
const fftTypesList1 = [
	{ id: FFT_TYPES.MANUAL, label: 'constants.Manual' },
	{ id: FFT_TYPES.AUTOMATIC, label: 'constants.Automatic' },
	{ id: FFT_TYPES.SCHEDULED, label: 'all' },
	{ id: FFT_TYPES.UNDEFINED, label: 'constants.undefined' }
];

export const COUNTRY_CODES = {
	CANADA: 1,
	USA: 2,
	MEXICO: 3,
	OTHER: 'other'
};

export const countryCodeList = [
	{ id: COUNTRY_CODES.CANADA, code: '+1', name: 'canada', flag: 'CA.png' },
	{ id: COUNTRY_CODES.USA, code: '+1', name: 'usa', flag: 'US.png' },
	{ id: COUNTRY_CODES.MEXICO, code: '+52', name: 'mexico', flag: 'MX.png' },
	{ id: COUNTRY_CODES.OTHER, code: 'other' }
];

export const SCOPES = {
	PDM_MATRIX: 1,
	LUBE_MATRIX: 2,
	ASSET_MATRIX: 3,
	DRIVE_MATRIX: 4
};
export const scopesList = [
	{ id: SCOPES.PDM_MATRIX, label: 'PDMMatrix', value: '' },
	{ id: SCOPES.LUBE_MATRIX, label: 'LubeMatrix', value: '' },
	{ id: SCOPES.ASSET_MATRIX, label: 'AssetMatrix', value: '' },
	{ id: SCOPES.DRIVE_MATRIX, label: 'DriveMatrix', value: '' }
];

export const DATASET_CONVERTERS = {
	AMPS_20: 2,
	AMPS_150: 3,
	AMPS_CUSTOM_20: 4,
	AMPS_CUSTOM_150: 5
};
export const dataSetConvertersList = [
	{ id: DATASET_CONVERTERS.AMPS_20, label: '20A' },
	{ id: DATASET_CONVERTERS.AMPS_150, label: '150A' },
	{ id: DATASET_CONVERTERS.AMPS_CUSTOM_20, label: 'Custom' },
	{ id: DATASET_CONVERTERS.AMPS_CUSTOM_150, label: 'Custom 150A' }
];

export const EQUIPMENT_IMG_TYPES = {
	EQUIPMENT: 1,
	NAMEPLATE: 2
};
const equipmentImgTypesList1 = [
	{ id: EQUIPMENT_IMG_TYPES.EQUIPMENT, label: 'constants.item' },
	{ id: EQUIPMENT_IMG_TYPES.NAMEPLATE, label: 'constants.nameplate' }
];

export const RFQS_TYPES = {
	FOR_BUY: 1,
	FOR_SERVICE: 2
};
const rfqsTypesList1 = [
	{ id: RFQS_TYPES.FOR_BUY, name: 'constants.purchase_request' },
	{ id: RFQS_TYPES.FOR_SERVICE, name: 'constants.service_request' }
];

export const CROSSOVER_RULES_TYPES = {
	SAME_VALUE: 1,
	RANGE: 2
};
const crossoverRulesTypesList1 = [
	{ id: CROSSOVER_RULES_TYPES.SAME_VALUE, name: 'constants.same_value' },
	{ id: CROSSOVER_RULES_TYPES.RANGE, name: 'constants.range' }
];

export const CROSSOVER_RULE_RANGE_TYPES = {
	NUMERIC: 1,
	PERCENT: 2
};
const crossoverRuleRangeTypesList1 = [
	{ id: CROSSOVER_RULE_RANGE_TYPES.NUMERIC, name: 'constants.numeric' },
	{ id: CROSSOVER_RULE_RANGE_TYPES.PERCENT, name: 'constants.percent_str' }
];

export const LOG_TYPES = {
	PLANT: 1,
	MASTER: 2
};
const logTypesList1 = [
	{ id: LOG_TYPES.PLANT, label: 'constants.plant' },
	{ id: LOG_TYPES.MASTER, label: 'constants.master' }
];

export const DOWNTIME_ORIGIN_TYPES = {
	AUTO: 1,
	WORK_BREAK: 2,
	DEVIATION: 3,
	EXTREMAL_DEVIATION: 4
};
const downtimeOriginTypesList1 = [
	{ id: DOWNTIME_ORIGIN_TYPES.AUTO, label: 'constants.auto' },
	{ id: DOWNTIME_ORIGIN_TYPES.WORK_BREAK, label: 'constants.work_break' },
	{ id: DOWNTIME_ORIGIN_TYPES.DEVIATION, label: 'constants.deviation' },
	{
		id: DOWNTIME_ORIGIN_TYPES.EXTREMAL_DEVIATION,
		label: 'constants.further_below_run_rate'
	}
];

export const COMMUNICATE_METHODS = {
	HTTP: 1,
	MQTT: 2
};
export const communicateMethodsList = [
	{ id: COMMUNICATE_METHODS.HTTP, label: 'HTTP' },
	{ id: COMMUNICATE_METHODS.MQTT, label: 'MQTT' }
];
export const CONTROLLER_CONNECTION_TYPES = {
	PERFORMANCE: 1,
	MULTIHOP: 2
};
export const connectionTypesList = [
	{ id: CONTROLLER_CONNECTION_TYPES.PERFORMANCE, label: 'PERFORMANCE' },
	{ id: CONTROLLER_CONNECTION_TYPES.MULTIHOP, label: 'MULTIHOP' }
];

export const CLOUD_CONNECTION_TYPES = {
	CELL_MODEM: 1,
	CUSTOMER_CONNECTION: 2
};
const cloudConnectionTypesList1 = [
	{ id: CLOUD_CONNECTION_TYPES.CELL_MODEM, label: 'constants.cell_modem' },
	{
		id: CLOUD_CONNECTION_TYPES.CUSTOMER_CONNECTION,
		label: 'constants.customer_connection'
	}
];

export const FAULTS_TYPES = {
	BASE: 1,
	ADVANCED: 2,
	NCD: 3
};
const faultsTypesList1 = [
	{ id: FAULTS_TYPES.BASE, label: 'constants.base' },
	{ id: FAULTS_TYPES.ADVANCED, label: 'constants.advanced' },
	{ id: FAULTS_TYPES.NCD, label: 'constants.ncd' }
];

export const CONDITIONS_TYPES = {
	EQUAL: 1,
	NOT_EQUAL: 2,
	LESS_THAN: 3,
	LESS_THAN_OR_EQUAL: 4,
	GREATER_THAN: 5,
	GREATER_THAN_OR_EQUAL: 6,
	IN_LIST: 7,
	NOT_IN_LIST: 8
};
export const conditionsTypesList = [
	{ id: CONDITIONS_TYPES.EQUAL, label: '=' },
	{ id: CONDITIONS_TYPES.NOT_EQUAL, label: '!=' },
	{ id: CONDITIONS_TYPES.LESS_THAN, label: '<' },
	{ id: CONDITIONS_TYPES.LESS_THAN_OR_EQUAL, label: '<=' },
	{ id: CONDITIONS_TYPES.GREATER_THAN, label: '>' },
	{ id: CONDITIONS_TYPES.GREATER_THAN_OR_EQUAL, label: '>=' },
	{ id: CONDITIONS_TYPES.IN_LIST, label: 'IN values' },
	{ id: CONDITIONS_TYPES.NOT_IN_LIST, label: 'NOT IN values' }
];

export const MAINTENANCE_TYPES = {
	WORK_ORDER: 1,
	LOG: 2,
	REQUEST: 3
	// RECOMMENDED: 3
};
const maintenanceTypesList1 = [
	{ id: MAINTENANCE_TYPES.WORK_ORDER, label: 'Work_Order' },
	{ id: MAINTENANCE_TYPES.LOG, label: 'Maintenance_Log' },
	{ id: MAINTENANCE_TYPES.REQUEST, label: 'Work_Order_Request' }
	// { id: MAINTENANCE_TYPES.RECOMMENDED, label: 'Recommended Work Order' }
];

export const SETTINGS_LOG_TYPES = {
	MAIL: 1,
	SMS: 2
};
const settingsLogTypesList1 = [
	{ id: SETTINGS_LOG_TYPES.MAIL, label: 'constants.mail' },
	{ id: SETTINGS_LOG_TYPES.SMS, label: 'constants.sms' }
];

export const PLANT_WORK_ORDER_TYPES = {
	WITHOUT: 0,
	FABRICATION: 1,
	REQUISITION: 2
};
const plantWorkOrderTypesList1 = [
	{ id: PLANT_WORK_ORDER_TYPES.WITHOUT, label: 'Without', value: 0 },
	{ id: PLANT_WORK_ORDER_TYPES.FABRICATION, label: 'Fab_Plant', value: 1 },
	{ id: PLANT_WORK_ORDER_TYPES.REQUISITION, label: 'Requisition_Plant', value: 2 }
];

export const WORK_ORDER_ROLES = {
	WITHOUT: 0,
	FAB_SHOP_MANAGER: 1,
	REQUISITIONER: 2
};
const workOrderRolesList1 = [
	{ id: WORK_ORDER_ROLES.WITHOUT, label: 'Without', value: 0 },
	{ id: WORK_ORDER_ROLES.FAB_SHOP_MANAGER, label: 'Fab_Shop_Manager', value: 1 },
	{ id: WORK_ORDER_ROLES.REQUISITIONER, label: 'Requisitioner', value: 2 }
];

export const WORK_ORDER_STATUSES_TYPES = {
	PENDING: 1,
	IN_WORK: 2,
	COMPLETED: 3,
	CLOSED: 4
};
const workOrdersStatusesList1 = [
	{
		id: WORK_ORDER_STATUSES_TYPES.COMPLETED,
		name: 'constants.completed',
		color: '#009C67'
	},
	{
		id: WORK_ORDER_STATUSES_TYPES.IN_WORK,
		name: 'constants.in_work',
		color: '#0050EF'
	},
	{
		id: WORK_ORDER_STATUSES_TYPES.PENDING,
		name: 'constants.pending',
		color: '#FFA500'
	},
	{
		id: WORK_ORDER_STATUSES_TYPES.CLOSED,
		name: 'constants.closed',
		color: '#ADB5BD',
		permissions: ['view_maintenance']
		// userTypes: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX, USER_ROLES_TYPES.PLANT_ADMIN]
	}
];

export const REQUISITION_STATUSES_TYPES = {
	PENDING: 0,
	APPROVED: 1,
	DENIED: 2,
	COMPLETED: 3,
	IN_WORK: 4,
	ON_HOLD: 5
};

const requisitionStatusesList1 = [
	{
		id: REQUISITION_STATUSES_TYPES.COMPLETED,
		label: 'constants.completed',
		color: '#009C67',
		statKey: 'total_completed_work_orders',
		altStatKey: 'completed_count'
	},
	{
		id: REQUISITION_STATUSES_TYPES.IN_WORK,
		label: 'constants.in_work',
		color: '#0050EF',
		statKey: 'total_take_work_orders',
		altStatKey: 'in_work_count'
	},
	{
		id: REQUISITION_STATUSES_TYPES.APPROVED,
		label: 'constants.approved',
		color: '#2FB5F6',
		statKey: 'total_approved_work_orders',
		altStatKey: 'approved_count'
	},
	{
		id: REQUISITION_STATUSES_TYPES.PENDING,
		label: 'constants.pending',
		color: '#FFA500',
		statKey: 'total_pending_work_orders',
		altStatKey: 'pending_count'
	},
	{
		id: REQUISITION_STATUSES_TYPES.ON_HOLD,
		label: 'constants.on_hold',
		color: '#F30606',
		statKey: 'total_on_hold_work_orders',
		altStatKey: 'on_hold_count'
	},
	{
		id: REQUISITION_STATUSES_TYPES.DENIED,
		label: 'constants.denied',
		color: '#BF1E2E',
		statKey: 'total_denied_work_orders',
		altStatKey: 'denied_count'
	}
];

export const REQUISITION_CATEGORIES = {
	HEALTH_SAFETY: 1,
	PRODUCTION_LOSS: 2,
	COST_REDUCTION: 3,
	FUTURE_OPPORTUNITY: 4
};
const requisitionCategoriesList1 = [
	{ id: REQUISITION_CATEGORIES.HEALTH_SAFETY, name: 'constants.health_safety' },
	{ id: REQUISITION_CATEGORIES.PRODUCTION_LOSS, name: 'constants.production_loss' },
	{ id: REQUISITION_CATEGORIES.COST_REDUCTION, name: 'constants.cost_reduction' },
	{
		id: REQUISITION_CATEGORIES.FUTURE_OPPORTUNITY,
		name: 'constants.future_opportunity'
	}
];

export const REQUISITION_WORK_TYPES = {
	REFURBISHMENT: 1,
	FABRICATION: 2,
	REPAIR: 3
};
const requisitionWorkTypesList1 = [
	{ id: REQUISITION_WORK_TYPES.REFURBISHMENT, name: 'constants.refurbishment' },
	{ id: REQUISITION_WORK_TYPES.FABRICATION, name: 'constants.fabrication' },
	{ id: REQUISITION_WORK_TYPES.REPAIR, name: 'constants.repair' }
];

export const BREAKDOWN_TYPES = {
	PRODUCTION_LINE: 1,
	MACHINE: 2,
	ASSET: 3
};
const breakdownTypesList1 = [
	{ id: BREAKDOWN_TYPES.PRODUCTION_LINE, name: 'production_line' },
	{ id: BREAKDOWN_TYPES.MACHINE, name: 'machine' },
	{ id: BREAKDOWN_TYPES.ASSET, name: 'asset' }
];

export const MAINTENANCE_REASON_TYPES = {
	BREAKDOWN: 1,
	SETUP: 2,
	PM: 3
};
const maintenanceReasonTypesList1 = [
	{ id: MAINTENANCE_REASON_TYPES.BREAKDOWN, name: 'breakdown' },
	{ id: MAINTENANCE_REASON_TYPES.SETUP, name: 'setup' },
	{ id: MAINTENANCE_REASON_TYPES.PM, name: 'pm' }
];

export const SITE_VISIT_OPTIONS = { NO: 0, YES: 1, TBD: 2 };
export const siteVisitOptionsList = [
	{ id: SITE_VISIT_OPTIONS.NO, name: 'no' },
	{ id: SITE_VISIT_OPTIONS.YES, name: 'yes' }
	// { id: SITE_VISIT_OPTIONS.TBD, name: 'phrases.to_be_discussed' }
];

export const PRODUCTION_LINES_TYPES = {
	PRODUCTION_LINE: 1,
	UTILITY: 2
};
export const productionLineTypesList = [
	{ id: PRODUCTION_LINES_TYPES.PRODUCTION_LINE, name: 'Production_Line' },
	{ id: PRODUCTION_LINES_TYPES.UTILITY, name: 'Utility' }
];

export const PERIOD_TYPES = {
	WEEKLY: 1,
	MONTHLY: 2,
	YEARLY: 3
};
export const periodsTypesList = [
	{ id: PERIOD_TYPES.WEEKLY, name: 'constants.weekly' },
	{ id: PERIOD_TYPES.MONTHLY, name: 'constants.monthly' },
	{ id: PERIOD_TYPES.YEARLY, name: 'constants.yearly' }
];

export const PERIOD_METHODS = {
	PERIOD_TYPE: 1,
	PERIOD_DATES: 2
};
export const periodMethodsList = [
	{ id: PERIOD_METHODS.PERIOD_TYPE, name: 'constants.period_type' },
	{ id: PERIOD_METHODS.PERIOD_DATES, name: 'constants.period_dates' }
];

export const WO_STAGE_TYPES = {
	OVERDUE: 1,
	TODAY: 2,
	THIS_WEEK: 3,
	THIS_MONTH: 4
};
const woStageTypesList1 = [
	{ id: WO_STAGE_TYPES.OVERDUE, name: 'constants.overdue' },
	{ id: WO_STAGE_TYPES.TODAY, name: 'constants.today' },
	{ id: WO_STAGE_TYPES.THIS_WEEK, name: 'constants.this_week' },
	{ id: WO_STAGE_TYPES.THIS_MONTH, name: 'constants.this_month' }
];

export const WO_FREQUENCY_TYPES = {
	WORK_ORDER: 1,
	RECURRING_WORK_ORDERS: 2
};
const woFrequencyTypesList1 = [
	{ id: WO_FREQUENCY_TYPES.WORK_ORDER, name: 'Work_Orders' },
	{ id: WO_FREQUENCY_TYPES.RECURRING_WORK_ORDERS, name: 'Recurring_Work_Orders' }
];

export const LIBRARY_RESOURCE_TYPES = {
	PRODUCTION_LINE: 1,
	MACHINE: 2,
	ASSET: 3,
	EQUIPMENT: 4
};
const libraryResourceTypesList1 = [
	{ id: LIBRARY_RESOURCE_TYPES.PRODUCTION_LINE, name: 'Production_Line' },
	{ id: LIBRARY_RESOURCE_TYPES.MACHINE, name: 'Machine' },
	{ id: LIBRARY_RESOURCE_TYPES.ASSET, name: 'Asset' },
	{ id: LIBRARY_RESOURCE_TYPES.EQUIPMENT, name: 'Item' }
];

export const NCD_RSSI_TYPES = {
	HIGH: 80,
	MODERATE: 66,
	LOW: 40
};

export const NCD_BATTERY_VOLTAGE_TYPES = {
	LOW: 0,
	MODERATE: 2.75,
	HIGH: 3
};

/*export const BANNER_REQUEST_TYPES = {
	TIME_DOMAIN_HIGH_PASS_BUFFER: 1,
	TIME_DOMAIN_HIGH_FREQUENCY_ENVELOPED: 2,
	TIME_DOMAIN_LOW_PASS_BUFFER: 3,
	TIME_DOMAIN_FULL_BAND_BUFFER: 4,
};

const bannerRequestTypesList1 = [
	{ id: BANNER_REQUEST_TYPES.TIME_DOMAIN_HIGH_PASS_BUFFER, name: 'constants.time_domain_high_pass_buffer' },
	{ id: BANNER_REQUEST_TYPES.TIME_DOMAIN_HIGH_FREQUENCY_ENVELOPED, name: 'constants.time_domain_high_frequency_enveloped' },
	{ id: BANNER_REQUEST_TYPES.TIME_DOMAIN_LOW_PASS_BUFFER, name: 'constants.time_domain_low_pass_buffer' },
	{ id: BANNER_REQUEST_TYPES.TIME_DOMAIN_FULL_BAND_BUFFER, name: 'constants.time_domain_full_band_buffer' }
];
*/
export const BANNER_REQUEST_TYPES = {
	STANDARD: 1,
	ENVELOPE: 2
	// TIME_DOMAIN_LOW_PASS_BUFFER: 3,
	// TIME_DOMAIN_FULL_BAND_BUFFER: 4,
};

const bannerRequestTypesList1 = [
	{
		id: BANNER_REQUEST_TYPES.STANDARD,
		name: 'standard',
		tooltip: 'phrases.Time_Waveform_Full_Bandwidth'
	},
	{
		id: BANNER_REQUEST_TYPES.ENVELOPE,
		name: 'envelope',
		tooltip: 'phrases.Time_Waveform_High_Frequency_Enveloping_HFE_Peak_Filtering'
	}
	// { id: BANNER_REQUEST_TYPES.TIME_DOMAIN_LOW_PASS_BUFFER, name: 'constants.time_domain_low_pass_buffer' },
	// { id: BANNER_REQUEST_TYPES.TIME_DOMAIN_FULL_BAND_BUFFER, name: 'constants.time_domain_full_band_buffer' }
];

export const BANNER_REQUEST_FMAX_TYPES = {
	HZ_10600: 0,
	HZ_5300: 1,
	HZ_2600: 2,
	HZ_1300: 3,
	HZ_650: 4,
	HZ_325: 5
};

const bannerRequestFmaxTypesList1 = [
	{ id: BANNER_REQUEST_FMAX_TYPES.HZ_10600, name: '10600 Hz', value: 10600 },
	{ id: BANNER_REQUEST_FMAX_TYPES.HZ_5300, name: '5300 Hz', value: 5300 },
	{ id: BANNER_REQUEST_FMAX_TYPES.HZ_2600, name: '2600 Hz', value: 2600 },
	{ id: BANNER_REQUEST_FMAX_TYPES.HZ_1300, name: '1300 Hz', value: 1300 },
	{ id: BANNER_REQUEST_FMAX_TYPES.HZ_650, name: '650 Hz', value: 650 },
	{ id: BANNER_REQUEST_FMAX_TYPES.HZ_325, name: '325 Hz', value: 325 }
];

export const BANNER_FFT_STATUSES_TYPES = {
	PENDING: 1,
	APPROVED: 2,
	COMPLETED: 3,
	FAILED: 4
};

const bannerFFTStatusesList1 = [
	{
		id: BANNER_FFT_STATUSES_TYPES.PENDING,
		name: 'constants.pending'
	},
	{
		id: BANNER_FFT_STATUSES_TYPES.APPROVED,
		name: 'constants.approved'
	},
	{
		id: BANNER_FFT_STATUSES_TYPES.COMPLETED,
		name: 'constants.completed'
	},
	{
		id: BANNER_FFT_STATUSES_TYPES.FAILED,
		name: 'constants.failed'
	}
];

export const BANNER_PRESSURE_RANGES = {
	PSIG_0_50: 2,
	PSIG_0_150: 3,
	PSIS_0_500: 4,
	PSIS_0_3000: 5
};
const bannerPressureRangesList1 = [
	{ id: BANNER_PRESSURE_RANGES.PSIG_0_50, name: 'constants.PSIG_0_50' },
	{ id: BANNER_PRESSURE_RANGES.PSIG_0_150, name: 'constants.PSIG_0_150' },
	{ id: BANNER_PRESSURE_RANGES.PSIS_0_500, name: 'constants.PSIS_0_500' },
	{ id: BANNER_PRESSURE_RANGES.PSIS_0_3000, name: 'constants.PSIS_0_3000' }
];

export const NCD_NODE_TYPES = {
	POSITION_1: 1,
	POSITION_2: 2
};
const ncdNodeTypesList1 = [
	{ id: NCD_NODE_TYPES.POSITION_1, name: 'constants.POSITION_1' },
	{ id: NCD_NODE_TYPES.POSITION_2, name: 'constants.POSITION_2' }
];

export const FFT_SOURCE_TYPES = {
	RAW: 1,
	FFT: 2
};
const fftSourceTypesList1 = [
	{ id: FFT_SOURCE_TYPES.RAW, name: 'Raw' },
	{ id: FFT_SOURCE_TYPES.FFT, name: 'FFT' }
];

export const USER_NOTIFICATION_TYPES = {
	AMPLITUDE_ALARM: 8,
	CONTROLLER_OFFLINE: 12,
	SENSOR_ANOMALY: 13,
	GRAPH_NOTE: 14
};

export const USER_REAL_TIME_NOTIFICATION_TYPES = {
	ACUTE_WARNING: 1,
	ACUTE_ALARM: 2,
	CHRONIC_WARNING: 3,
	CHRONIC_ALARM: 4,
	TEMPERATURE_WARNING: 5,
	TEMPERATURE_ALARM: 6,
	LUBE_ALARM: 7,
	LOW_ALARM: 9,
	HIGH_ALARM: 10,
	SENSOR_OFFLINE: 11,
	BATTERY_STATUS: 15,
	FFT_ALERTS: 16,
	SENSOR_SUSPECT_DATA: 17,
	LUBE_MATRIX_ALERTS: 18,
	OEE_ALERTS: 19
};
export const USER_REQUISITION_NOTIFICATION_TYPES = {
	REQUISITION_ADDED: 20,
	REQUISITION_UPDATED: 21,
	REQUISITION_APPROVED: 22,
	REQUISITION_UNAPPROVED: 23,
	REQUISITION_COMPLETED: 24,
	REQUISITION_DENIED: 25,
	REQUISITION_DELETED: 26,
};

const userNotificationTypesList1 = [
	{ id: USER_NOTIFICATION_TYPES.AMPLITUDE_ALARM, name: 'constants.amplitude_alarm' },
	{
		id: USER_NOTIFICATION_TYPES.CONTROLLER_OFFLINE,
		name: 'constants.controller_offline'
	},
	{ id: USER_NOTIFICATION_TYPES.SENSOR_ANOMALY, name: 'constants.sensor_anomaly' },
	{ id: USER_NOTIFICATION_TYPES.GRAPH_NOTE, name: 'constants.graph_note' }
];

const userRealTimeNotificationTypesList1 = [
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.ACUTE_WARNING,
		name: 'constants.acute_warning'
	},
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.ACUTE_ALARM,
		name: 'constants.acute_alarm'
	},
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.CHRONIC_WARNING,
		name: 'constants.chronic_warning'
	},
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.CHRONIC_ALARM,
		name: 'constants.chronic_alarm'
	},
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.TEMPERATURE_WARNING,
		name: 'constants.temperature_warning'
	},
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.TEMPERATURE_ALARM,
		name: 'constants.temperature_alarm'
	},
	{ id: USER_REAL_TIME_NOTIFICATION_TYPES.LUBE_ALARM, name: 'constants.lube_alarm' },
	{ id: USER_REAL_TIME_NOTIFICATION_TYPES.LOW_ALARM, name: 'constants.low_alarm' },
	{ id: USER_REAL_TIME_NOTIFICATION_TYPES.HIGH_ALARM, name: 'constants.high_alarm' },
	// { id: USER_REAL_TIME_NOTIFICATION_TYPES.OTHER_WARNING, name: 'constants.other_warning' },
	// { id: USER_REAL_TIME_NOTIFICATION_TYPES.OTHER_ALARM, name: 'constants.other_alarm' },
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.SENSOR_OFFLINE,
		name: 'constants.sensor_offline'
	},
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.BATTERY_STATUS,
		name: 'constants.battery_status'
	},
	{ id: USER_REAL_TIME_NOTIFICATION_TYPES.FFT_ALERTS, name: 'constants.fft_alerts' },
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.SENSOR_SUSPECT_DATA,
		name: 'constants.sensor_suspect_data'
	},
	{
		id: USER_REAL_TIME_NOTIFICATION_TYPES.LUBE_MATRIX_ALERTS,
		name: 'constants.lube_matrix_alerts'
	},
	{ id: USER_REAL_TIME_NOTIFICATION_TYPES.OEE_ALERTS, name: 'constants.oee_alerts' }
];
const userRequisitionNotificationTypesList1 = [
	{ id: USER_REQUISITION_NOTIFICATION_TYPES.REQUISITION_ADDED, name: 'constants.new_requisition_added' },
	{ id: USER_REQUISITION_NOTIFICATION_TYPES.REQUISITION_UPDATED, name: 'constants.requisition_updated' },
	{ id: USER_REQUISITION_NOTIFICATION_TYPES.REQUISITION_APPROVED, name: 'constants.requisition_approved' },
	{ id: USER_REQUISITION_NOTIFICATION_TYPES.REQUISITION_UNAPPROVED, name: 'constants.requisition_unapproved' },
	{ id: USER_REQUISITION_NOTIFICATION_TYPES.REQUISITION_COMPLETED, name: 'constants.requisition_completed' },
	{ id: USER_REQUISITION_NOTIFICATION_TYPES.REQUISITION_DENIED, name: 'constants.requisition_denied' },
	{ id: USER_REQUISITION_NOTIFICATION_TYPES.REQUISITION_DELETED, name: 'constants.requisition_deleted' },
];

export const RPM_SOURCES_TYPES = {
	MANUAL: 1,
	EXTERNAL_INPUT: 2
};

const rpmSourcesTypesList1 = [
	{ id: RPM_SOURCES_TYPES.MANUAL, name: 'constants.manual' },
	{ id: RPM_SOURCES_TYPES.EXTERNAL_INPUT, name: 'constants.External_input_RPM' },	
];

export const ITEM_SPEED_OPTIONS = {
	LINESPEED_RPM: 1,
	SPECIFICATION_RPM: 2,
	MANUAL_RPM: 3,
	MAX_PEAK_FREQUENCY: 4,
	EXTERNAL: 5,
};

const itemSpeedOptionsList1 = [
	{ id: ITEM_SPEED_OPTIONS.LINESPEED_RPM, name: 'constants.linespeed_rpm', source_key: 'line_speed_rpm_evaluated', draggable: true },
	{ id: ITEM_SPEED_OPTIONS.SPECIFICATION_RPM, name: 'constants.specification_rpm', source_key: 'specification_rpm_evaluated', draggable: true },
	{ id: ITEM_SPEED_OPTIONS.MANUAL_RPM, name: 'constants.manual_rpm', source_key: 'manual_rpm_evaluated', hasInput: true, draggable: true },
	{ id: ITEM_SPEED_OPTIONS.MAX_PEAK_FREQUENCY, name: 'constants.max_peak_frequency', [`source_key_${METRIC_SYSTEM_TYPES.IMPERIAL}`]: 'max_peak_frequency_at_imperial_evaluated', [`source_key_${METRIC_SYSTEM_TYPES.METRIC}`]: 'max_peak_frequency_at_metric_evaluated', draggable: true },
	{ id: ITEM_SPEED_OPTIONS.EXTERNAL, name: 'constants.external_input', source_key: 'external_rpm_evaluated', draggable: true },
];

export const METRIC_UNIT_TYPES = {
	SECONDS: 1,
	MINUTES: 2,
	HOURS: 3
};

const metricUnitTypesList1 = [
	{ id: METRIC_UNIT_TYPES.SECONDS, name: 'Seconds' },
	{ id: METRIC_UNIT_TYPES.MINUTES, name: 'Minutes' },
	{ id: METRIC_UNIT_TYPES.HOURS, name: 'Hours' },
];

export const USER_REPORT_TYPES = {
	COMPARE: 1,
	BASELINING: 2,
};

const userReportTypesList1 = [
	{	id: USER_REPORT_TYPES.COMPARE, name: 'compare' },
	{	id: USER_REPORT_TYPES.BASELINING, name: 'Baselining' },
];

export const CONTROLLER_TOPIC_TYPES = {
	PDM: 1,
	PDM_V2: 2,
};

const controllerTopicTypesList1 = [
	{ id: CONTROLLER_TOPIC_TYPES.PDM, name: 'PDM'},
	{ id: CONTROLLER_TOPIC_TYPES.PDM_V2, name: 'PDM V2'},
];

const SENSOR_CLASSES = {
	VIBRATION_TEMPERATURE: 1,
	VIBRATION_TEMPERATURE_CURRENT: 2,
	ULTRASOUND: 3,
	HUMIDITY_TEMPERATURE: 4,
	CUSTOM: 5,
	LUBE_MATRIX: 6,
	HUMIDITY_TEMPERATURE_AIR_QUALITY: 7,
	PRESSURE: 8,
};

export const sensorClassesList1 = [
	{ id: SENSOR_CLASSES.VIBRATION_TEMPERATURE, name: 'technology.vibration_temperature' },
	{ id: SENSOR_CLASSES.VIBRATION_TEMPERATURE_CURRENT, name: 'technology.vibration_temperature_current' },
	{ id: SENSOR_CLASSES.ULTRASOUND, name: 'technology.ultrasound' },
	{ id: SENSOR_CLASSES.HUMIDITY_TEMPERATURE, name: 'technology.humidity_temperature' },
	{ id: SENSOR_CLASSES.CUSTOM, name: 'technology.custom' },
	{ id: SENSOR_CLASSES.LUBE_MATRIX, name: 'technology.lube_matrix' },
	{ id: SENSOR_CLASSES.HUMIDITY_TEMPERATURE_AIR_QUALITY, name: 'technology.humidity_temperature_air_quality' },
	{ id: SENSOR_CLASSES.PRESSURE, name: 'technology.pressure' },
];

export const SENSOR_ALARM_TYPES = {
	WARNING: 1,
	ALARM: 2,
	OFF_ALARM: 7,
	LUBE_ALARM: 8,
	LOW_ALARM: 9,
	HIGH_ALARM: 10,
	AMPLITUDE_ALARM: 11,
};

const sensorAlarmTypesList1 = [
	{ id: SENSOR_ALARM_TYPES.WARNING, name: 'constants.warning' },
	{ id: SENSOR_ALARM_TYPES.ALARM, name: 'constants.alarm' },
	{ id: SENSOR_ALARM_TYPES.OFF_ALARM, name: 'constants.sensor_offline' },
	{ id: SENSOR_ALARM_TYPES.LUBE_ALARM, name: 'constants.lube_alarm' },
	{ id: SENSOR_ALARM_TYPES.LOW_ALARM, name: 'constants.low_alarm' },
	{ id: SENSOR_ALARM_TYPES.HIGH_ALARM, name: 'constants.high_alarm' },
	{ id: SENSOR_ALARM_TYPES.AMPLITUDE_ALARM, name: 'constants.amplitude_alarm' }
];

export const MULTIVIEW_ALARM_TYPES = {
	COMPARE: 1,
	STANDARD_WARNING_ALARM: 2,
	STANDARD_LOW_HIGH: 3,
};

const multiviewAlarmTypesList1 = [
	{ id: MULTIVIEW_ALARM_TYPES.COMPARE, name: 'constants.compare' },
	{ id: MULTIVIEW_ALARM_TYPES.STANDARD_WARNING_ALARM, name: 'constants.standard_warning_alarm' },
	{ id: MULTIVIEW_ALARM_TYPES.STANDARD_LOW_HIGH, name: 'constants.standard_low_high' },
];

export const FFT_LOCK_STATUSES = {
	UNLOCKED: 0,
	NO_FFT_RESPONSE: 1,
	NODE_OFFLINE: 2,
	UNCONFIRMED_FFT_REQUEST: 3
};

const fftLockStatusesList1 = [
	{ id: FFT_LOCK_STATUSES.UNLOCKED, name: 'constants.unlocked', color: '#059966', },
	{ id: FFT_LOCK_STATUSES.NO_FFT_RESPONSE, name: 'constants.no_fft_response', color: '#ffde32', },
	{ id: FFT_LOCK_STATUSES.NODE_OFFLINE, name: 'constants.node_offline', color: '#c21405', },
	{ id: FFT_LOCK_STATUSES.UNCONFIRMED_FFT_REQUEST, name: 'constants.unconfirmed_fft_request', color: '#ffde32', },
];

export const SUBJECT_TYPES = {
	USER: 1,
	COMPANY: 2,
};

const subjectTypesList1 = [
	{ id: SUBJECT_TYPES.USER, name: 'user', alt_label: 'phrases.personal_favorite', color: '#BF1E2E' },
	{ id: SUBJECT_TYPES.COMPANY, name: 'company', alt_label: 'phrases.company_favorite', color: '#f7ba2a' },
];

export const userTypesList = () => Lang.translate(userTypesList1);
export const mfaTypesList = () => Lang.translate(mfaTypesList1);

export const fftRequestStatusesList = () => Lang.translate(fftRequestStatusesList1);

export const alertRulesList = () => Lang.translate(alertRulesList1);
export const alertTypesList = () => Lang.translate(alertTypesList1);
// export const equipmentTypesList = () => equipmentTypesList1;
export const notificationTypesList = () => notificationTypesList1;
export const completeActionsTypesList = () =>
	Lang.translate(completeActionsTypesList1);

export const snoozeRangeTypesList = () => Lang.translate(snoozeRangeTypesList1);
export const controllerTypesList = () => Lang.translate(controllerTypesList1);
export const dataSetsList = () =>
	Lang.translate(Lang.translate(dataSetsList1), { key: 'alt_label' });
export const sensorTypesList = (type, dataset) =>
	getSensorTypesList(sensorTypesList1, type, dataset);
export const pumpTypesList = () => Lang.translate(pumpTypesList1);
export const powerTypesList = () => Lang.translate(powerTypesList1);
export const bannerPowerTypesList = () => Lang.translate(bannerPowerTypesList1);
export const fftTypesList = () => Lang.translate(fftTypesList1);
export const rfqsTypesList = () => Lang.translate(rfqsTypesList1);
export const crossoverRulesTypesList = () =>
	Lang.translate(crossoverRulesTypesList1);
export const crossoverRuleRangeTypesList = () =>
	Lang.translate(crossoverRuleRangeTypesList1);

export const workOrdersStatusesList = () => Lang.translate(workOrdersStatusesList1);
export const requisitionStatusesList = () =>
	Lang.translate(requisitionStatusesList1);
export const requisitionCategoriesList = () =>
	Lang.translate(requisitionCategoriesList1);
export const requisitionWorkTypesList = () =>
	Lang.translate(requisitionWorkTypesList1);
export const breakdownTypesList = () => Lang.translate(breakdownTypesList1);
export const maintenanceReasonTypesList = () =>
	Lang.translate(maintenanceReasonTypesList1);

export const maintenanceTypesList = () => Lang.translate(maintenanceTypesList1);
export const equipmentImgTypesList = () => Lang.translate(equipmentImgTypesList1);
export const logTypesList = () => Lang.translate(logTypesList1);
export const downtimeOriginTypesList = () =>
	Lang.translate(downtimeOriginTypesList1);
export const cloudConnectionTypesList = () =>
	Lang.translate(cloudConnectionTypesList1);
export const faultsTypesList = () => Lang.translate(faultsTypesList1);
export const settingsLogTypesList = () => Lang.translate(settingsLogTypesList1);
export const plantWorkOrderTypesList = () =>
	Lang.translate(plantWorkOrderTypesList1);
export const workOrderRolesList = () => Lang.translate(workOrderRolesList1);
export const ncdPressureRangesList = () => ncdPressureRangesList1;
export const woStageTypesList = () => Lang.translate(woStageTypesList1);
export const woFrequencyTypesList = () => Lang.translate(woFrequencyTypesList1);
export const libraryResourceTypesList = () =>
	Lang.translate(libraryResourceTypesList1);
export const userRolesTypesList = () => Lang.translate(userRolesTypesList1);
export const bannerPressureRangesList = () =>
	Lang.translate(bannerPressureRangesList1);
export const bannerRequestTypesList = () =>
	Lang.translate(Lang.translate(bannerRequestTypesList1), { key: 'tooltip' });
export const bannerRequestFmaxTypesList = () => bannerRequestFmaxTypesList1;
export const bannerFFTStatusesList = () => bannerFFTStatusesList1;
export const ncdNodeTypesList = () => Lang.translate(ncdNodeTypesList1);
export const fftSourceTypesList = () => Lang.translate(fftSourceTypesList1);
export const ncdAlarmTypesList = () => Lang.translate(ncdAlarmTypesList1);
export const chartTypesList = () => Lang.translate(chartTypesList1);

export const userNotificationTypesList = () =>
	Lang.translate(userNotificationTypesList1);
export const userRealTimeNotificationTypesList = () =>
	Lang.translate(userRealTimeNotificationTypesList1);
export const userRequisitionNotificationTypesList = () =>
	Lang.translate(userRequisitionNotificationTypesList1);
export const rpmSourcesTypesList = () => Lang.translate(rpmSourcesTypesList1);
export const itemSpeedOptionsList = () => Lang.translate(itemSpeedOptionsList1);
export const metricUnitTypesList = () => Lang.translate(metricUnitTypesList1);
export const userReportTypesList = () => Lang.translate(userReportTypesList1);
export const controllerTopicTypesList = () => controllerTopicTypesList1;
export const sensorClassesList = () => Lang.translate(sensorClassesList1);
export const sensorAlarmTypesList = () => Lang.translate(sensorAlarmTypesList1);
export const multiviewAlarmTypesList = () => Lang.translate(multiviewAlarmTypesList1);
export const sensorThresholdsTypesList = () => Lang.translate(sensorThresholdsTypesList1);
export const fftLockStatusesList = () => Lang.translate(fftLockStatusesList1);
export const subjectTypesList = () => Lang.translate(Lang.translate(subjectTypesList1), { key: 'alt_label' });
// -----------------

export const not_wifi_icon = require('@/assets/img/icons/not-wifi.svg');
export const wifi_icon = require('@/assets/img/icons/wifi.svg');
export const controller_offline_icon = require('@/assets/img/icons/controller_offline_icon.svg');
export const rebase_wheel = require('@/assets/img/icons/rebase1.svg');
export const rebase_wheel_white = require('@/assets/img/icons/rebase1_white.svg');
export const rebase_lines = require('@/assets/img/icons/rebase2.svg');
export const one_layout_icon = require('@/assets/img/icons/one.svg');
export const sensor_broken_icon = require('@/assets/img/icons/sensor-broken.svg');
export const lube_level_empty = require('@/assets/img/icons/lube_level_empty.svg');
export const lube_level_low = require('@/assets/img/icons/lube_level_low.svg');
export const lube_level_normal = require('@/assets/img/icons/lube_level_normal.svg');
export const block_icon = require('@/assets/img/icons/block.svg');
export const logoSrc = '/static/img/top-logo.png';
export const dashboardPresentation = require('@/assets/img/dashboard_presentation.png');
export const factoryWallpaper = require('@/assets/img/factory_wallpaper.png');
export const background_img = require('@/assets/img/equipment_background.png');
export const main_logo = require('@/assets/img/main_logo.png');
export const pdf_icon = require('@/assets/img/icons/pdf.svg');
export const images_icon = require('@/assets/img/icons/images.svg');
export const signal_icon_0 = require('@/assets/img/icons/signal_0.svg');
export const signal_icon_1 = require('@/assets/img/icons/signal_1.svg');
export const signal_icon_2 = require('@/assets/img/icons/signal_2.svg');
export const signal_icon_3 = require('@/assets/img/icons/signal_3.svg');
export const voltage_icon_1 = require('@/assets/img/icons/voltage_1.svg');
export const voltage_icon_2 = require('@/assets/img/icons/voltage_2.svg');
export const voltage_icon_3 = require('@/assets/img/icons/voltage_3.svg');
export const sensor_archive = require('@/assets/img/icons/sensor_archive.svg');
export const icon_drag = require('@/assets/img/icons/icon_drag.svg');
export const attention_icon_2 = require('@/assets/img/icons/attention2.svg');
export const fft_wave = require('@/assets/img/icons/fft-wave.svg');
export const anomaly1_icon = require('@/assets/img/icons/anomaly1.svg');
