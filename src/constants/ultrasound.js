import { Lang } from '@/localization';

export const LUBE_TYPES = {
	AUTO: 1,
	MANUAL: 2
};
const lubeTypesList1 = [
	{ id: LUBE_TYPES.AUTO, label: 'constants.auto', key: 'A' },
	{ id: LUBE_TYPES.MANUAL, label: 'constants.manual', key: 'M' }
];
export const lubeTypesObj = {
	[LUBE_TYPES.AUTO]: { key: 'A' },
	[LUBE_TYPES.MANUAL]: { key: 'M' }
};

export const LUBE_METHODS = {
	ALARM: 1,
	FREQUENCY: 2
};
export const lubeMethodsList1 = [
	{ id: LUBE_METHODS.ALARM, label: 'constants.alarm', table_label: 'Level' },
	{ id: LUBE_METHODS.FREQUENCY, label: 'frequency', table_label: 'Frequency' }
];

export const LUBE_PERIODS = {
	MINUTE: 1,
	HOUR: 2,
	DAY: 3
};
export const lubePeriodsList1 = [
	{ id: LUBE_PERIODS.MINUTE, label: 'constants.minute' },
	{ id: LUBE_PERIODS.HOUR, label: 'constants.hour' },
	{ id: LUBE_PERIODS.DAY, label: 'constants.day' }
];

export const LUBE_PROCESSING_STATUSES = {
	/*INACTIVE: 1,
	LUBRICATES: 2,
	PENDING: 3,
	BLOCKED: 4*/
	LUBRICATED: 1,
	FAIL: 2,
	EMPTY: 3,
	BLOCK: 4,
	SUCCESS: 5,
	LOSS_CONNECTION: 6,
	NOT_ALARM_RESPONSE: 7
	// GLITCHED: 7,

};
const lubeProcessingStatusesList1 = [
	{
		id: LUBE_PROCESSING_STATUSES.LUBRICATED,
		label: 'constants.lubricated',
		color: 'green',
		text: 'constants.Lube_OK'
	},
	{
		id: LUBE_PROCESSING_STATUSES.FAIL,
		label: 'constants.fail',
		color: 'red',
		text: 'constants.Lubricator_Error',
		labelTitle: '!'
	},
	{
		id: LUBE_PROCESSING_STATUSES.EMPTY,
		label: 'constants.empty',
		color: 'orange',
		text: 'constants.Lubricator_Cartridge_Empty',
		labelTitle: '!'
	},
	{
		id: LUBE_PROCESSING_STATUSES.BLOCK,
		label: 'constants.block',
		color: 'red',
		text: 'constants.Lubricator_Blocked',
		labelTitle: '!'
	},
	{
		id: LUBE_PROCESSING_STATUSES.SUCCESS,
		label: 'constants.success',
		color: '#1af03a',
		text: 'constants.Lube_OK'
	},
	{
		id: LUBE_PROCESSING_STATUSES.LOSS_CONNECTION,
		label: 'constants.loss_connection',
		color: 'gray',
		text: 'constants.Loss_Connection'
	},
	{
		id: LUBE_PROCESSING_STATUSES.NOT_ALARM_RESPONSE,
		label: 'constants.rsp_timeout',
		color: 'orange',
		text: 'constants.rsp_timeout',
		labelTitle: '!'
	},
	{
		id: LUBE_PROCESSING_STATUSES.GLITCHED,
		label: 'constants.glitched',
		color: 'gray',
		text: 'constants.Unknown_Status'
	}

	/*{ id: LUBE_PROCESSING_STATUSES.INACTIVE, label: 'inactive' },
	{ id: LUBE_PROCESSING_STATUSES.LUBRICATES, label: 'lubricates' },
	{ id: LUBE_PROCESSING_STATUSES.PENDING, label: 'pending' },
	{ id: LUBE_PROCESSING_STATUSES.BLOCKED, label: 'blocked' }*/
];

/*export const GREASE_PACKS = {
	INACTIVE: 1,
	LUBRICATES: 2,
	PENDING: 3,
	BLOCKED: 4,
};*/

const greasePacksList1 = [
	{
		val: 60,
		label: '60ml Grease Pack',
		cyclesList: [
			{ val: 176, label: '1 - 176', pos: 1 },
			{ val: 88, label: '2 - 288', pos: 2 },
			{ val: 59, label: '3 - 59', pos: 3 },
			{ val: 44, label: '4 - 44', pos: 4 },
			{ val: 35, label: '5 - 35', pos: 5 },
			{ val: 29, label: '6 - 29', pos: 6 }
		]
	},
	{
		val: 120,
		label: '120ml Grease Pack',
		cyclesList: [
			{ val: 353, label: '1 - 353', pos: 1 },
			{ val: 176, label: '2 - 176', pos: 2 },
			{ val: 118, label: '3 - 118', pos: 3 },
			{ val: 88, label: '4 - 88', pos: 4 },
			{ val: 70, label: '5 - 70', pos: 5 },
			{ val: 59, label: '6 - 59', pos: 6 }
		]
	},
	{
		val: 240,
		label: '240ml Grease Pack',
		cyclesList: [
			{ val: 705, label: '1 - 705', pos: 1 },
			{ val: 353, label: '2 - 353', pos: 2 },
			{ val: 235, label: '3 - 235', pos: 3 },
			{ val: 176, label: '4 - 176', pos: 4 },
			{ val: 141, label: '5 - 141', pos: 5 },
			{ val: 118, label: '6 - 118', pos: 6 }
		]
	},
	{
		val: 480,
		label: '480ml Grease Pack',
		cyclesList: [
			{ val: 1412, label: '1 - 1412', pos: 1 },
			{ val: 705, label: '2 - 705', pos: 2 },
			{ val: 470, label: '3 - 470', pos: 3 },
			{ val: 353, label: '4 - 353', pos: 4 },
			{ val: 282, label: '5 - 282', pos: 5 },
			{ val: 235, label: '6 - 235', pos: 6 }
		]
	}
];
export const greasePacksList = () => greasePacksList1;

const lubricantCartridgeList1 = [
	{
		val: 60,
		label: 'LC60',
		amountsList: [
			{ pos: '600', label: '0.1', val: 1 },
			{ pos: '300', label: '0.2', val: 2 },
			{ pos: '200', label: '0.3', val: 3 },
			{ pos: '150', label: '0.4', val: 4 },
			{ pos: '120', label: '0.5', val: 5 },
			{ pos: '100', label: '0.6', val: 6 },
			{ pos: '86', label: '0.7', val: 7 },
			{ pos: '75', label: '0.8', val: 8 },
			{ pos: '67', label: '0.9', val: 9 },
			{ pos: '60', label: '1.0', val: 10 },
			{ pos: '50', label: '1.2', val: 12 },
			{ pos: '43', label: '1.4', val: 14 },
			{ pos: '37', label: '1.6', val: 16 },
			{ pos: '33', label: '1.8', val: 18 },
			{ pos: '30', label: '2.0', val: 20 },
			{ pos: '27', label: '2.2', val: 22 },
			{ pos: '25', label: '2.4', val: 24 },
			{ pos: '23', label: '2.6', val: 26 },
			{ pos: '21', label: '2.8', val: 28 },
			{ pos: '20', label: '3.0', val: 30 },
			{ pos: '17', label: '3.5', val: 35 },
			{ pos: '15', label: '4.0', val: 40 },
			{ pos: '13', label: '4.5', val: 45 },
			{ pos: '12', label: '5.0', val: 50 },
			{ pos: '11', label: '5.5', val: 55 },
			{ pos: '10', label: '6.0', val: 60 },
			{ pos: '9', label: '6.5', val: 65 },
			{ pos: '9', label: '7.0', val: 70 },
			{ pos: '8', label: '7.5', val: 75 },
			{ pos: '7', label: '8.0', val: 80 },
			{ pos: '7', label: '8.5', val: 85 },
			{ pos: '7', label: '9.0', val: 90 },
			{ pos: '6', label: '9.5', val: 95 }
		]
	},
	{
		val: 120,
		label: 'LC120',
		amountsList: [
			{ pos: '1200', val: 1, label: '0.1' },
			{ pos: '600', val: 2, label: '0.2' },
			{ pos: '400', val: 3, label: '0.3' },
			{ pos: '300', val: 4, label: '0.4' },
			{ pos: '240', val: 5, label: '0.5' },
			{ pos: '200', val: 6, label: '0.6' },
			{ pos: '171', val: 7, label: '0.7' },
			{ pos: '150', val: 8, label: '0.8' },
			{ pos: '133', val: 9, label: '0.9' },
			{ pos: '120', val: 10, label: '1.0' },
			{ pos: '100', val: 12, label: '1.2' },
			{ pos: '86', val: 14, label: '1.4' },
			{ pos: '75', val: 16, label: '1.6' },
			{ pos: '67', val: 18, label: '1.8' },
			{ pos: '60', val: 20, label: '2.0' },
			{ pos: '55', val: 22, label: '2.2' },
			{ pos: '50', val: 24, label: '2.4' },
			{ pos: '46', val: 26, label: '2.6' },
			{ pos: '43', val: 28, label: '2.8' },
			{ pos: '40', val: 30, label: '3.0' },
			{ pos: '34', val: 35, label: '3.5' },
			{ pos: '30', val: 40, label: '4.0' },
			{ pos: '27', val: 45, label: '4.5' },
			{ pos: '24', val: 50, label: '5.0' },
			{ pos: '22', val: 55, label: '5.5' },
			{ pos: '20', val: 60, label: '6.0' },
			{ pos: '18', val: 65, label: '6.5' },
			{ pos: '17', val: 70, label: '7.0' },
			{ pos: '16', val: 75, label: '7.5' },
			{ pos: '15', val: 80, label: '8.0' },
			{ pos: '14', val: 85, label: '8.5' },
			{ pos: '13', val: 90, label: '9.0' },
			{ pos: '13', val: 95, label: '9.5' }
		]
	},
	{
		val: 250,
		label: 'LC250',
		amountsList: [
			{ pos: '2500', val: 1, label: '0.1' },
			{ pos: '1250', val: 2, label: '0.2' },
			{ pos: '833', val: 3, label: '0.3' },
			{ pos: '625', val: 4, label: '0.4' },
			{ pos: '500', val: 5, label: '0.5' },
			{ pos: '417', val: 6, label: '0.6' },
			{ pos: '357', val: 7, label: '0.7' },
			{ pos: '313', val: 8, label: '0.8' },
			{ pos: '278', val: 9, label: '0.9' },
			{ pos: '250', val: 10, label: '1.0' },
			{ pos: '208', val: 12, label: '1.2' },
			{ pos: '179', val: 14, label: '1.4' },
			{ pos: '156', val: 16, label: '1.6' },
			{ pos: '139', val: 18, label: '1.8' },
			{ pos: '125', val: 20, label: '2.0' },
			{ pos: '114', val: 22, label: '2.2' },
			{ pos: '104', val: 24, label: '2.4' },
			{ pos: '96', val: 26, label: '2.6' },
			{ pos: '89', val: 28, label: '2.8' },
			{ pos: '83', val: 30, label: '3.0' },
			{ pos: '71', val: 35, label: '3.5' },
			{ pos: '62', val: 40, label: '4.0' },
			{ pos: '56', val: 45, label: '4.5' },
			{ pos: '50', val: 50, label: '5.0' },
			{ pos: '45', val: 55, label: '5.5' },
			{ pos: '42', val: 60, label: '6.0' },
			{ pos: '38', val: 65, label: '6.5' },
			{ pos: '36', val: 70, label: '7.0' },
			{ pos: '33', val: 75, label: '7.5' },
			{ pos: '31', val: 80, label: '8.0' },
			{ pos: '29', val: 85, label: '8.5' },
			{ pos: '28', val: 90, label: '9.0' },
			{ pos: '26', val: 95, label: '9.5' }
		]
	},
	{
		val: 500,
		label: 'LC500',
		amountsList: [
			{ pos: '5000', val: 1, label: '0.1' },
			{ pos: '2500', val: 2, label: '0.2' },
			{ pos: '1667', val: 3, label: '0.3' },
			{ pos: '1250', val: 4, label: '0.4' },
			{ pos: '1000', val: 5, label: '0.5' },
			{ pos: '833', val: 6, label: '0.6' },
			{ pos: '714', val: 7, label: '0.7' },
			{ pos: '625', val: 8, label: '0.8' },
			{ pos: '556', val: 9, label: '0.9' },
			{ pos: '500', val: 10, label: '1.0' },
			{ pos: '417', val: 12, label: '1.2' },
			{ pos: '357', val: 14, label: '1.4' },
			{ pos: '313', val: 16, label: '1.6' },
			{ pos: '287', val: 18, label: '1.8' },
			{ pos: '250', val: 20, label: '2.0' },
			{ pos: '227', val: 22, label: '2.2' },
			{ pos: '208', val: 24, label: '2.4' },
			{ pos: '192', val: 26, label: '2.6' },
			{ pos: '179', val: 28, label: '2.8' },
			{ pos: '167', val: 30, label: '3.0' },
			{ pos: '143', val: 35, label: '3.5' },
			{ pos: '125', val: 40, label: '4.0' },
			{ pos: '111', val: 45, label: '4.5' },
			{ pos: '100', val: 50, label: '5.0' },
			{ pos: '91', val: 55, label: '5.5' },
			{ pos: '83', val: 60, label: '6.0' },
			{ pos: '77', val: 65, label: '6.5' },
			{ pos: '71', val: 70, label: '7.0' },
			{ pos: '67', val: 75, label: '7.5' },
			{ pos: '62', val: 80, label: '8.0' },
			{ pos: '59', val: 85, label: '8.5' },
			{ pos: '56', val: 90, label: '9.0' },
			{ pos: '53', val: 95, label: '9.5' }
		]
	}
];
export const lubricantCartridgeList = () => lubricantCartridgeList1;

export const pulsarLubeLevelStep = { val: 0.34, unit: 'mL' };

export const ADJUSTMENT_ACTIONS_TYPES = {
	INCREASE: 1,
	DECREASE: 2,
	RESET: 3
};
const gainAdjustmentActionsList1 = [
	{ id: ADJUSTMENT_ACTIONS_TYPES.INCREASE, label: 'constants.gain_increase' },
	{ id: ADJUSTMENT_ACTIONS_TYPES.DECREASE, label: 'constants.gain_decrease' },
	{ id: ADJUSTMENT_ACTIONS_TYPES.RESET, label: 'constants.reset' }
];

export const ADJUSTMENT_STATUSES = {
	FAIL: 0,
	SUCCESS: 1,
	PROCESS: 2,
	CONTROLLER_TIMEOUT: 3
};
const adjustmentsStatusesList1 = [
	{
		id: ADJUSTMENT_STATUSES.FAIL,
		label: 'constants.Fail',
		color: 'red',
		text: {
			[ADJUSTMENT_ACTIONS_TYPES.INCREASE]: 'phrases.Gain_adjustment_failure',
			[ADJUSTMENT_ACTIONS_TYPES.DECREASE]: 'phrases.Gain_adjustment_failure',
			[ADJUSTMENT_ACTIONS_TYPES.RESET]: 'phrases.Gain_adjustment_failure'
		}
	},
	{
		id: ADJUSTMENT_STATUSES.SUCCESS,
		label: 'constants.Success',
		color: '#1af03a',
		text: {
			[ADJUSTMENT_ACTIONS_TYPES.INCREASE]: 'phrases.Sensor_gain_Increased',
			[ADJUSTMENT_ACTIONS_TYPES.DECREASE]: 'phrases.Sensor_gain_Decreased',
			[ADJUSTMENT_ACTIONS_TYPES.RESET]: 'phrases.Sensor_gain_Reset'
		}
	},
	{
		id: ADJUSTMENT_STATUSES.PROCESS,
		label: 'constants.Proccess',
		color: '#1af03a',
		text: {}
	},
	{
		id: ADJUSTMENT_STATUSES.CONTROLLER_TIMEOUT,
		label: 'phrases.Controller_Timeout',
		color: '#1af03a',
		text: {
			[ADJUSTMENT_ACTIONS_TYPES.INCREASE]:
				'phrases.Gain_adjustment_controller_timeout',
			[ADJUSTMENT_ACTIONS_TYPES.DECREASE]:
				'phrases.Gain_adjustment_controller_timeout',
			[ADJUSTMENT_ACTIONS_TYPES.RESET]: 'phrases.Gain_adjustment_controller_timeout'
		}
		// text: 'Controller Timeout'
	}
];

export const REPLENISMENT_TYPES = {
	SIDE: 1,
	DIRECT: 2
};
const replenismentTypesList1 = [
	{ id: REPLENISMENT_TYPES.SIDE, label: 'Side' },
	{ id: REPLENISMENT_TYPES.DIRECT, label: 'Ring_Direct' }
];

export const ULTRASOUND_SENSOR_TYPES = {
	PURPOSE: 1,
	SENSOR_ONLY: 2,
};

const ultrasoundSensorTypesList1 = [
	{ id: ULTRASOUND_SENSOR_TYPES.PURPOSE, name: 'constants.Lubematrix' },
	{ id: ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY, name: 'constants.SENSOR_ONLY' },
];

export const LUBE_VERSIONS = {
	V1: 1,
	V2: 2,
	V3: 3,
};

const lubeVersionsList1 = [
	{ id: LUBE_VERSIONS.V1, name: 'V1' },
	{ id: LUBE_VERSIONS.V2, name: 'V2' },
	{ id: LUBE_VERSIONS.V3, name: 'V3' },
];

export const lubeTypesList = () => Lang.translate(lubeTypesList1);
export const lubeMethodsList = () =>
	Lang.translate(Lang.translate(lubeMethodsList1), { key: 'table_label' });
export const lubePeriodsList = () => Lang.translate(lubePeriodsList1);
export const lubeProcessingStatusesList = () =>
	Lang.translate(Lang.translate(lubeProcessingStatusesList1), { key: 'text' });
export const gainAdjustmentActionsList = () =>
	Lang.translate(gainAdjustmentActionsList1);
export const replenismentTypesList = () => Lang.translate(replenismentTypesList1);
export const adjustmentsStatusesList = () =>
	Lang.translate(adjustmentsStatusesList1);

export const ultrasoundSensorTypesList = () => Lang.translate(ultrasoundSensorTypesList1);
export const lubeVersionsList = () => lubeVersionsList1;
