import { Lang } from '@/localization';
import { cloneDeep, mergeObjects } from '@/helpers';

export const lubeColor = '#75c2db';

export const NCD_AXIS = { X: 1, Y: 2, Z: 3 };

/*export const ncdAxisList = [
	{ id: NCD_AXIS.X, name: 'X', key: 'x', type_key: 'Axial' },
	{ id: NCD_AXIS.Y, name: 'Y', key: 'y', type_key: 'Radial' },
	{ id: NCD_AXIS.Z, name: 'Z', key: 'z', type_key: 'Radial' }
];*/

export const ncdAxisList = [
	{
		id: NCD_AXIS.X,
		name: 'X',
		banner_m25_name: 'constants.Ultrasound',
		ultrasound_fft_name: 'US',
		ultrasound_fft_name_full: 'Ultrasound',
		key: 'x',
		type_key: 'Radial',
		banner_type_key: 'Axial'
	},
	{
		id: NCD_AXIS.Y,
		name: 'Y',
		banner_m25_name: 'Envelope',
		ultrasound_fft_name: 'HFE',
		ultrasound_fft_name_full: 'High Frequency Envelope',
		key: 'y',
		type_key: 'Radial',
		banner_type_key: 'Axial'
	},
	{
		id: NCD_AXIS.Z,
		name: 'Z',
		banner_m25_name: 'Standard',
		ultrasound_fft_name: 'RAW',
		ultrasound_fft_name_full: 'Raw',
		key: 'z',
		type_key: 'Axial',
		banner_type_key: 'Radial'
	}
];

export const SENSOR_PARAMETERS_TYPES = {
	Z_AXIS_VELOCITY: 1,
	Z_AXIS_ACCELERATION: 2,
	X_AXIS_VELOCITY: 3,
	X_AXIS_ACCELERATION: 4,
	TEMPERATURE: 5,
	AMPS: 17
};

export const SENSOR_SPECIFIC_PARAMETERS_TYPES = {
	DB: 16,
	LUBE_MATRIX_SDT_TEMP_C: 16,
	LUBE_MATRIX_SDT_TEMP_F: 16
};

export const SENSOR_HUMIDITY_PARAMETERS_TYPES = {
	HUMIDITY: 1,
	TEMPERATURE: 5
};

export const SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES = {
	PRESSURE: 1,
	RPM: 2,
	MOTOR_AMPERAGE: 3
};

export const NCD_SENSOR_PARAMETERS_TYPES = {
	C1_MA: 16,
	C2_MA: 16,
	HUMIDITY: 66,
	Y_AXIS_ACCELERATION: 67,
	Y_AXIS_VELOCITY: 68,
	X_AXIS_DISPLACEMENT: 69,
	Y_AXIS_DISPLACEMENT: 70,
	Z_AXIS_DISPLACEMENT: 71,
	EXT_TEMPERATURE: 72,
	PRESSURE: 73,
	IAQ: 74,
	X_WAVEFORM: 75,
	Y_WAVEFORM: 76,
	Z_WAVEFORM: 77,
	DISPLACEMENT_MM: 78,
	AXIAL_VELOCITY: 79,
	AXIAL_ACCELERATION: 80,
	RADIAL_V_VELOCITY: 81,
	RADIAL_V_ACCELERATION: 82,
	RADIAL_H_VELOCITY: 83,
	RADIAL_H_ACCELERATION: 84,
	Z_RAW_ACCELERATION: 2,
	X_RAW_ACCELERATION: 4,
	Y_RAW_ACCELERATION: 67,
	Z_TRANSFORM_ACCELERATION: 85,
	X_TRANSFORM_ACCELERATION: 86,
	Y_TRANSFORM_ACCELERATION: 87,
};

export const SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES = {
	X_RMS_VELOCITY: 3,
	Y_RMS_VELOCITY: 68,
	Z_RMS_VELOCITY: 1,
	X_HI_FREQ_RMS_ACCELERATION: 4,
	Y_HI_FREQ_RMS_ACCELERATION: 67,
	Z_HI_FREQ_RMS_ACCELERATION: 2,

	HI_FREQ_RMS_ACCEL_MAG: 88,
	Z_PEAK_ACCELERATION: 6,
	Z_CREST_FACTOR: 14,
	Z_KURTOSIS: 12,
	MAX_PEAK_FREQ: 89,
	MAX_PEAK_FREQ_2ND: 90,
};

export const BANNER_V2_1_VIBRATION_PARAMETERS_TYPES = {
	MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION: 97,
	MAGNITUDE_HIGH_FREQ_PK_ACCELERATION: 98,
	MAGNITUDE_HIGH_FREQ_CREST_FACTOR: 99,
	MAGNITUDE_HIGH_FREQ_KURTOSIS: 100,

	MAGNITUDE_FULL_BAND_RMS_ACCELERATION: 101,
	MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION: 102,

	X_RMS_VELOCITY: 3,
	Y_RMS_VELOCITY: 68,
	Z_RMS_VELOCITY: 1,

	MAX_PEAK_FREQUENCY_FROM_3_AXIS: 25,

	X_PEAK_VELOCITY_COMPONENT_FREQ: 88,
	Y_PEAK_VELOCITY_COMPONENT_FREQ: 89,
	Z_PEAK_VELOCITY_COMPONENT_FREQ: 90,

	X_HI_FREQ_RMS_ACCELERATION: 4,
	Y_HI_FREQ_RMS_ACCELERATION: 67,
	Z_HI_FREQ_RMS_ACCELERATION: 2,

	X_PK_ACCELERATION: 7,
	Y_PK_ACCELERATION: 18,
	Z_PK_ACCELERATION: 6,

	X_CREST_FACTOR: 15,
	Y_CREST_FACTOR: 20,
	Z_CREST_FACTOR: 14,

	X_KURTOSIS: 13,
	Y_KURTOSIS: 19,
	Z_KURTOSIS: 12,

	X_FULL_BAND_RMS_ACCEL: 94,
	Y_FULL_BAND_RMS_ACCEL: 95,
	Z_FULL_BAND_RMS_ACCEL: 96,

	X_FULL_BAND_PK_PK_ACCEL: 21,
	Y_FULL_BAND_PK_PK_ACCEL: 22,
	Z_FULL_BAND_PK_PK_ACCEL: 23,

	X_PEAK_ACCEL_FREQ_COMPONENT: 91,
	Y_PEAK_ACCEL_FREQ_COMPONENT: 92,
	Z_PEAK_ACCEL_FREQ_COMPONENT: 93,
};

export const BANNER_M25_PARAMETERS_TYPES = {
	ULTRASOUND_RMS: 103,
	ULTRASOUND_IMPACT_INDEX: 104,
	ULTRASOUND_PEAK: 105,
	ULTRASOUND_CREST_FACTOR: 106,
	ULTRASOUND_CURTOSIS: 107,

	HIGH_FREQ_RMS_ACCELERATION: 97,
	HFE_IMPACT_INDEX: 108,
	HIGH_FREQ_PK_ACCELERATION: 98,
	HIGH_FREQ_CREST_FACTOR: 99,
	HIGH_FREQ_KURTOSIS: 100,

	FULL_BAND_RMS_ACCELERATION: 101,
	FULL_BAND_PEAK_ACCELERATION_FREQ: 109,
	FULL_BAND_CREST_FACTOR: 110,
	FULL_BAND_KURTOSIS: 111,

	RMS_VELOCITY: 112,
	PEAK_VELOCITY_FREQ_COMPONENT: 113,
	TEMPERATURE: 5,
};

export const METRIC_SYSTEM_TYPES = {
	METRIC: 1,
	IMPERIAL: 2
};

const metricSystemsList1 = [
	{ id: METRIC_SYSTEM_TYPES.METRIC, name: 'constants.metric' },
	{ id: METRIC_SYSTEM_TYPES.IMPERIAL, name: 'constants.imperial' }
];

export const UNIT_TYPES = {
	MM_SEC: 1,
	INCHES_SEC: 2,
	CELSIUS: 3,
	FAHRENHEIT: 4,
	G: 5,
	HZ: 6,
	DB: 7,
	AMPS: 8,
	PERCENT: 99,
	PRESSURE: 10,
	RPM: 11,
	IAQ: 98,
	MM: 97,
	INCHES: 96,
	CPM: 95
};

const unitTypesList1 = [
	{ id: UNIT_TYPES.MM_SEC, name: 'constants.mm_per_second' },
	{ id: UNIT_TYPES.INCHES_SEC, name: 'constants.inches_per_second' },
	{ id: UNIT_TYPES.CELSIUS, name: 'constants.celsius' },
	{ id: UNIT_TYPES.FAHRENHEIT, name: 'constants.fahrenheit' },
	{ id: UNIT_TYPES.G, name: 'constants.g' },
	{ id: UNIT_TYPES.HZ, name: 'constants.hertz' },
	{ id: UNIT_TYPES.DB, name: 'constants.dBuV' },
	{ id: UNIT_TYPES.AMPS, name: 'constants.Amps' },
	{ id: UNIT_TYPES.PERCENT, name: 'constants.percent' },
	{ id: UNIT_TYPES.PRESSURE, name: 'constants.psi' },
	{ id: UNIT_TYPES.RPM, name: 'constants.RPM' },
	{ id: UNIT_TYPES.IAQ, name: 'constants.IAQ' },
	{ id: UNIT_TYPES.MM, name: 'constants.mm' },
	{ id: UNIT_TYPES.INCHES, name: 'constants.inches' },
	{ id: UNIT_TYPES.CPM, name: 'constants.cpm' }
];

const metricKeysTable1 = {
	default: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY]: UNIT_TYPES.MM_SEC,
			[SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY]: UNIT_TYPES.MM_SEC,
			[SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION]: UNIT_TYPES.G,
			[SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION]: UNIT_TYPES.G,
			[SENSOR_PARAMETERS_TYPES.TEMPERATURE]: UNIT_TYPES.CELSIUS,
			[NCD_SENSOR_PARAMETERS_TYPES.EXT_TEMPERATURE]: UNIT_TYPES.CELSIUS,

			[SENSOR_PARAMETERS_TYPES.AMPS]: UNIT_TYPES.AMPS
		},

		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY]: UNIT_TYPES.INCHES_SEC,
			[SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY]: UNIT_TYPES.INCHES_SEC,
			[SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION]: UNIT_TYPES.G,
			[SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION]: UNIT_TYPES.G,
			[SENSOR_PARAMETERS_TYPES.TEMPERATURE]: UNIT_TYPES.FAHRENHEIT,
			[NCD_SENSOR_PARAMETERS_TYPES.EXT_TEMPERATURE]: UNIT_TYPES.FAHRENHEIT,

			[SENSOR_PARAMETERS_TYPES.AMPS]: UNIT_TYPES.AMPS
		}
	},

	ultrasoundDB: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[SENSOR_SPECIFIC_PARAMETERS_TYPES.DB]: UNIT_TYPES.DB,
			[NCD_SENSOR_PARAMETERS_TYPES.C1_MA]: UNIT_TYPES.DB
		},
		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[SENSOR_SPECIFIC_PARAMETERS_TYPES.DB]: UNIT_TYPES.DB,
			[NCD_SENSOR_PARAMETERS_TYPES.C1_MA]: UNIT_TYPES.DB
		}
	},

	lubematrixSDTtempC: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_C]: UNIT_TYPES.CELSIUS
		},
		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_C]: UNIT_TYPES.CELSIUS
		}
	},

	lubematrixSDTtempF: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_F]:
				UNIT_TYPES.FAHRENHEIT
		},
		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_F]:
				UNIT_TYPES.FAHRENHEIT
		}
	},

	bannerSDTDB: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION]: UNIT_TYPES.DB
		},
		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION]: UNIT_TYPES.DB
		}
	},

	humidity: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[SENSOR_HUMIDITY_PARAMETERS_TYPES.HUMIDITY]: UNIT_TYPES.PERCENT,
			[SENSOR_HUMIDITY_PARAMETERS_TYPES.TEMPERATURE]: UNIT_TYPES.CELSIUS,
			[NCD_SENSOR_PARAMETERS_TYPES.HUMIDITY]: UNIT_TYPES.PERCENT
		},
		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[SENSOR_HUMIDITY_PARAMETERS_TYPES.HUMIDITY]: UNIT_TYPES.PERCENT,
			[SENSOR_HUMIDITY_PARAMETERS_TYPES.TEMPERATURE]: UNIT_TYPES.FAHRENHEIT,
			[NCD_SENSOR_PARAMETERS_TYPES.HUMIDITY]: UNIT_TYPES.PERCENT
		}
	},

	customPDM: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.PRESSURE]:
				UNIT_TYPES.PRESSURE,
			[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.RPM]: UNIT_TYPES.RPM,
			[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.MOTOR_AMPERAGE]:
				UNIT_TYPES.AMPS,

			[NCD_SENSOR_PARAMETERS_TYPES.PRESSURE]: UNIT_TYPES.PRESSURE
		},
		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.PRESSURE]:
				UNIT_TYPES.PRESSURE,
			[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.RPM]: UNIT_TYPES.RPM,
			[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.MOTOR_AMPERAGE]:
				UNIT_TYPES.AMPS,

			[NCD_SENSOR_PARAMETERS_TYPES.PRESSURE]: UNIT_TYPES.PRESSURE
		}
	},

	ncd: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[NCD_SENSOR_PARAMETERS_TYPES.IAQ]: UNIT_TYPES.IAQ,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_VELOCITY]: UNIT_TYPES.MM_SEC,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.X_AXIS_DISPLACEMENT]: UNIT_TYPES.MM,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_DISPLACEMENT]: UNIT_TYPES.MM,
			[NCD_SENSOR_PARAMETERS_TYPES.Z_AXIS_DISPLACEMENT]: UNIT_TYPES.MM,
			[NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_WAVEFORM]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.Z_WAVEFORM]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.X_TRANSFORM_ACCELERATION]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_TRANSFORM_ACCELERATION]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.Z_TRANSFORM_ACCELERATION]: UNIT_TYPES.G
		},
		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[NCD_SENSOR_PARAMETERS_TYPES.IAQ]: UNIT_TYPES.IAQ,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_VELOCITY]: UNIT_TYPES.INCHES_SEC,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.X_AXIS_DISPLACEMENT]: UNIT_TYPES.INCHES,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_DISPLACEMENT]: UNIT_TYPES.INCHES,
			[NCD_SENSOR_PARAMETERS_TYPES.Z_AXIS_DISPLACEMENT]: UNIT_TYPES.INCHES,
			[NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_WAVEFORM]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.Z_WAVEFORM]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.X_TRANSFORM_ACCELERATION]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.Y_TRANSFORM_ACCELERATION]: UNIT_TYPES.G,
			[NCD_SENSOR_PARAMETERS_TYPES.Z_TRANSFORM_ACCELERATION]: UNIT_TYPES.G
		}
	},

	extra_vibration: {
		[METRIC_SYSTEM_TYPES.METRIC]: {
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.HI_FREQ_RMS_ACCEL_MAG]: UNIT_TYPES.G,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY]: UNIT_TYPES.MM_SEC,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.Y_HI_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.Z_PEAK_ACCELERATION]: UNIT_TYPES.G,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQ]: UNIT_TYPES.HZ,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQ_2ND]: UNIT_TYPES.HZ,

			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY]: UNIT_TYPES.MM_SEC,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY]: UNIT_TYPES.MM_SEC,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY]: UNIT_TYPES.MM_SEC,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS]: UNIT_TYPES.HZ,

			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_PK_ACCELERATION]: UNIT_TYPES.HZ,
			// [BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_CREST_FACTOR]: UNIT_TYPES.HZ,
			// [BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_KURTOSIS]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_VELOCITY_COMPONENT_FREQ]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_VELOCITY_COMPONENT_FREQ]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_VELOCITY_COMPONENT_FREQ]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_HI_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_HI_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_HI_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PK_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PK_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PK_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_CREST_FACTOR]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_CREST_FACTOR]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_CREST_FACTOR]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_KURTOSIS]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_KURTOSIS]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_KURTOSIS]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_RMS_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_RMS_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_RMS_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_PK_PK_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_PK_PK_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_PK_PK_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_ACCEL_FREQ_COMPONENT]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_ACCEL_FREQ_COMPONENT]: UNIT_TYPES.HZ,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_ACCEL_FREQ_COMPONENT]: UNIT_TYPES.HZ,
			
			[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_PEAK]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.FULL_BAND_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.FULL_BAND_PEAK_ACCELERATION_FREQ]: UNIT_TYPES.HZ,
			[BANNER_M25_PARAMETERS_TYPES.RMS_VELOCITY]: UNIT_TYPES.MM_SEC,
			[BANNER_M25_PARAMETERS_TYPES.PEAK_VELOCITY_FREQ_COMPONENT]: UNIT_TYPES.HZ,
			[BANNER_M25_PARAMETERS_TYPES.TEMPERATURE]: UNIT_TYPES.CELSIUS,
		},
		[METRIC_SYSTEM_TYPES.IMPERIAL]: {
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.HI_FREQ_RMS_ACCEL_MAG]: UNIT_TYPES.G,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY]: UNIT_TYPES.INCHES_SEC,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.Y_HI_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.Z_PEAK_ACCELERATION]: UNIT_TYPES.G,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQ]: UNIT_TYPES.CPM,
			[SENSOR_EXTRA_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQ_2ND]: UNIT_TYPES.CPM,

			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY]: UNIT_TYPES.INCHES_SEC,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY]: UNIT_TYPES.INCHES_SEC,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY]: UNIT_TYPES.INCHES_SEC,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS]: UNIT_TYPES.CPM,

			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_PK_ACCELERATION]: UNIT_TYPES.CPM,
			// [BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_CREST_FACTOR]: UNIT_TYPES.CPM,
			// [BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_KURTOSIS]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_VELOCITY_COMPONENT_FREQ]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_VELOCITY_COMPONENT_FREQ]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_VELOCITY_COMPONENT_FREQ]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_HI_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_HI_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_HI_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PK_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PK_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PK_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_CREST_FACTOR]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_CREST_FACTOR]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_CREST_FACTOR]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_KURTOSIS]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_KURTOSIS]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_KURTOSIS]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_RMS_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_RMS_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_RMS_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_PK_PK_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_PK_PK_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_PK_PK_ACCEL]: UNIT_TYPES.G,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_ACCEL_FREQ_COMPONENT]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_ACCEL_FREQ_COMPONENT]: UNIT_TYPES.CPM,
			[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_ACCEL_FREQ_COMPONENT]: UNIT_TYPES.CPM,

			[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_PEAK]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.FULL_BAND_RMS_ACCELERATION]: UNIT_TYPES.G,
			[BANNER_M25_PARAMETERS_TYPES.FULL_BAND_PEAK_ACCELERATION_FREQ]: UNIT_TYPES.CPM,
			[BANNER_M25_PARAMETERS_TYPES.RMS_VELOCITY]: UNIT_TYPES.INCHES_SEC,
			[BANNER_M25_PARAMETERS_TYPES.PEAK_VELOCITY_FREQ_COMPONENT]: UNIT_TYPES.CPM,
			[BANNER_M25_PARAMETERS_TYPES.TEMPERATURE]: UNIT_TYPES.FAHRENHEIT
		}
	}
};

const sensorParametersList1 = {
	[SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY]: {
		id: SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.z_velocity',
		short_name: 'Vz',
		pair_name: 'radial (Z) velocity',
		axis: 'z-axis',
		axis_id: NCD_AXIS.Z,
		type: 'velocity',
		color: '#059966'
	},
	[SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION]: {
		id: SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.z_acceleration',
		pair_name: 'radial (Z) acceleration',
		axis: 'z-axis',
		axis_id: NCD_AXIS.Z,
		type: 'acceleration',
		color: '#ffde32'
	},
	[SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY]: {
		id: SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.x_velocity',
		short_name: 'Vx',
		pair_name: 'axial (X) velocity',
		axis: 'x-axis',
		axis_id: NCD_AXIS.X,
		type: 'velocity',
		color: '#059966'
	},
	[SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION]: {
		id: SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.x_acceleration',
		pair_name: 'axial (X) acceleration',
		axis: 'x-axis',
		axis_id: NCD_AXIS.X,
		type: 'acceleration',
		color: '#ffde32'
	},
	[SENSOR_PARAMETERS_TYPES.TEMPERATURE]: {
		id: SENSOR_PARAMETERS_TYPES.TEMPERATURE,
		icon: 'icon-temperature',
		name: 'constants.temperature',
		axis: 'temperature',
		type: 'temperature'
	},
	[SENSOR_PARAMETERS_TYPES.AMPS]: {
		id: SENSOR_PARAMETERS_TYPES.AMPS,
		icon: 'icon-temperature',
		name: 'constants.current',
		axis: 'current',
		type: 'current'
	}
};

const sensorParametersListHumidity1 = {
	[SENSOR_HUMIDITY_PARAMETERS_TYPES.HUMIDITY]: {
		id: SENSOR_HUMIDITY_PARAMETERS_TYPES.HUMIDITY,
		icon: 'icon-velocity',
		custom_id: 'humidity',
		name: 'constants.humidity',
		axis: '-',
		color: '#059966',
		metricKeysTableName: 'humidity'
	},
	[SENSOR_HUMIDITY_PARAMETERS_TYPES.TEMPERATURE]: {
		id: SENSOR_HUMIDITY_PARAMETERS_TYPES.TEMPERATURE,
		custom_id: 'humidity_temperature',
		name: 'constants.temperature',
		axis: 'temperature',
		icon: 'icon-temperature',
		color: '#ffde32',
		metricKeysTableName: 'humidity'
	}
};

const sensorParametersListNCD1 = {
	[SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION]: {
		id: SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION,
		// responseDataKey: `parameter_${SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION}`,
		icon: 'icon-acceleration',
		name: 'constants.x_acceleration',
		name_fft: 'constants.raw_acceleration_x',
		pair_name: 'radial (X) acceleration',
		axis_id: NCD_AXIS.X,
		axis: 'x-axis',
		type: 'acceleration',
		color: '#ffde32'
		/*chart_series: {
			['base-serie']: { id: 'base-serie', data_path: 'pointsData.base', template: 'pdmSerieTemplates.base' }
		}*/
	},
	[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.y_acceleration',
		name_fft: 'constants.raw_acceleration_y',
		pair_name: 'radial (Y) acceleration',
		axis: 'y-axis',
		axis_id: NCD_AXIS.Y,
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'ncd'
	},
	[SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION]: {
		id: SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.z_acceleration',
		name_fft: 'constants.raw_acceleration_z',
		pair_name: 'axial (Z) acceleration',
		axis: 'z-axis',
		axis_id: NCD_AXIS.Z,
		type: 'acceleration',
		color: '#ffde32'
	},
	[SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY]: {
		id: SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.x_velocity',
		name_fft: 'constants.velocity_x',
		pair_name: 'radial (X) velocity',
		axis: 'x-axis',
		axis_id: NCD_AXIS.X,
		type: 'velocity',
		color: '#059966'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_VELOCITY]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.y_velocity',
		name_fft: 'constants.velocity_y',
		pair_name: 'radial (Y) velocity',
		axis: 'y-axis',
		axis_id: NCD_AXIS.Y,
		type: 'velocity',
		color: '#059966',
		metricKeysTableName: 'ncd'
	},
	[SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY]: {
		id: SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.z_velocity',
		name_fft: 'constants.velocity_z',
		pair_name: 'axial (Z) velocity',
		axis: 'z-axis',
		axis_id: NCD_AXIS.Z,
		type: 'velocity',
		color: '#059966'
	},
	[SENSOR_PARAMETERS_TYPES.TEMPERATURE]: {
		id: SENSOR_PARAMETERS_TYPES.TEMPERATURE,
		icon: 'icon-temperature',
		name: 'constants.temperature',
		type: 'temperature',
		axis: 'temperature'
	},
	[SENSOR_PARAMETERS_TYPES.AMPS]: {
		id: SENSOR_PARAMETERS_TYPES.AMPS,
		icon: 'icon-temperature',
		name: 'constants.current',
		type: 'current',
		axis: 'current'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.X_AXIS_DISPLACEMENT]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.X_AXIS_DISPLACEMENT,
		icon: 'icon-velocity',
		name: 'constants.x_displacement',
		// pair_name: '(X) displacement',
		suffix_name: 'X',
		axis: 'x-axis',
		axis_id: NCD_AXIS.X,
		type: 'displacement',
		color: '#059966',
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_DISPLACEMENT]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_DISPLACEMENT,
		icon: 'icon-velocity',
		name: 'constants.y_displacement',
		// pair_name: '(Y) displacement',
		suffix_name: 'Y',
		axis: 'y-axis',
		axis_id: NCD_AXIS.Y,
		type: 'displacement',
		color: '#059966',
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.Z_AXIS_DISPLACEMENT]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.Z_AXIS_DISPLACEMENT,
		icon: 'icon-velocity',
		name: 'constants.z_displacement',
		// pair_name: '(Z) displacement',
		suffix_name: 'Z',
		axis: 'z-axis',
		axis_id: NCD_AXIS.Z,
		type: 'displacement',
		color: '#059966',
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.HUMIDITY]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.HUMIDITY,
		icon: 'icon-velocity',
		custom_id: 'humidity',
		name: 'constants.humidity',
		type: 'humidity',
		axis: '-',
		color: '#059966',
		metricKeysTableName: 'humidity'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.EXT_TEMPERATURE]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.EXT_TEMPERATURE,
		icon: 'icon-temperature',
		name: 'constants.external_temperature',
		short_name: 'short_name.ext_temp',
		type: 'ext_temperature',
		axis: 'temperature'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.PRESSURE]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.PRESSURE,
		icon: 'icon-velocity',
		custom_id: 'pressure',
		name: 'constants.pressure',
		type: 'pressure',
		axis: '-',
		metricKeysTableName: 'customPDM'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.IAQ]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.IAQ,
		icon: 'icon-velocity',
		custom_id: 'iaq',
		name: 'constants.indoor_air_quality',
		short_name: 'short_name.iaq',
		type: 'iaq',
		axis: '-',
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.C1_MA]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.C1_MA,
		icon: 'icon-sensor',
		// custom_id: 'pressure',
		name: 'constants.db_level',
		axis: '-',
		metricKeysTableName: 'ultrasoundDB'
	},

	[NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM,
		icon: 'icon-velocity',
		name: 'constants.time_waveform_x',
		type: 'waveform',
		axis_id: NCD_AXIS.X,
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.Y_WAVEFORM]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.Y_WAVEFORM,
		icon: 'icon-velocity',
		name: 'constants.time_waveform_y',
		type: 'waveform',
		axis_id: NCD_AXIS.Y,
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.Z_WAVEFORM]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.Z_WAVEFORM,
		icon: 'icon-velocity',
		name: 'constants.time_waveform_z',
		type: 'waveform',
		axis_id: NCD_AXIS.Z,
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.X_TRANSFORM_ACCELERATION]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.X_TRANSFORM_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.transformed_acceleration_x',
		type: 'transformed_acceleration',
		axis_id: NCD_AXIS.X,
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.Y_TRANSFORM_ACCELERATION]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.Y_TRANSFORM_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.transformed_acceleration_y',
		type: 'transformed_acceleration',
		axis_id: NCD_AXIS.Y,
		metricKeysTableName: 'ncd'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.Z_TRANSFORM_ACCELERATION]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.Z_TRANSFORM_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.transformed_acceleration_z',
		type: 'transformed_acceleration',
		axis_id: NCD_AXIS.Z,
		metricKeysTableName: 'ncd'
	}
};

const bannerV21vibrationParametersList1 = {
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.magnitude_xyz_hi_frequency_RMS_acceleration',
		short_name: 'Ahf',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_PK_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_PK_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.magnitude_xyz_hi_frequency_pk_acceleration',
		short_name: 'short_name.hi_freq_pk_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_CREST_FACTOR]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_CREST_FACTOR,
		icon: 'icon-acceleration',
		name: 'constants.magnitude_xyz_hi_frequency_crest_factor',
		short_name: 'short_name.hi_freq_crest_factor',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_KURTOSIS]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_KURTOSIS,
		icon: 'icon-acceleration',
		name: 'constants.magnitude_xyz_hi_frequency_kurtosis',
		short_name: 'short_name.hi_freq_kurtosis',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.magnitude_xyz_full_band_rms_acceleration',
		short_name: 'Alf',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.magnitude_xyz_full_band_pk_pk_acceleration',
		short_name: 'short_name.full_band_pk_pk_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.x_rms_velocity_mm',
		short_name: 'Vx',
		type: 'velocity',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.y_rms_velocity_mm',
		short_name: 'Vy',
		type: 'velocity',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.z_rms_velocity_mm',
		short_name: 'Vz',
		type: 'velocity',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS,
		icon: 'icon-acceleration',
		name: 'constants.max_peak_frequency_from_3_axis',
		short_name: 'short_name.peak_freq_3_axis',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_VELOCITY_COMPONENT_FREQ]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_VELOCITY_COMPONENT_FREQ,
		icon: 'icon-velocity',
		name: 'constants.x_axis_peak_velocity_component_frequency',
		short_name: 'short_name.x_peak_vel_comp_freq',
		type: 'velocity',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_VELOCITY_COMPONENT_FREQ]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_VELOCITY_COMPONENT_FREQ,
		icon: 'icon-velocity',
		name: 'constants.y_axis_peak_velocity_component_frequency',
		short_name: 'short_name.y_peak_vel_comp_freq',
		type: 'velocity',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_VELOCITY_COMPONENT_FREQ]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_VELOCITY_COMPONENT_FREQ,
		icon: 'icon-velocity',
		name: 'constants.z_axis_peak_velocity_component_frequency',
		short_name: 'short_name.z_peak_vel_comp_freq',
		type: 'velocity',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_HI_FREQ_RMS_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_HI_FREQ_RMS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.x_axis_high_Frequency_RMS_Acceleration',
		short_name: 'short_name.x_hi_freq_rms_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_HI_FREQ_RMS_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_HI_FREQ_RMS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.y_axis_high_Frequency_RMS_Acceleration',
		short_name: 'short_name.y_hi_freq_rms_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_HI_FREQ_RMS_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_HI_FREQ_RMS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.z_axis_high_Frequency_RMS_Acceleration',
		short_name: 'short_name.z_hi_freq_rms_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PK_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PK_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.x_axis_pk_Acceleration',
		short_name: 'short_name.x_pk_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PK_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PK_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.y_axis_pk_Acceleration',
		short_name: 'short_name.y_pk_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PK_ACCELERATION]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PK_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.z_axis_pk_Acceleration',
		short_name: 'short_name.z_pk_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_CREST_FACTOR]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_CREST_FACTOR,
		icon: 'icon-acceleration',
		name: 'constants.x_axis_Crest_factor',
		short_name: 'short_name.x_crest_factor',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_CREST_FACTOR]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_CREST_FACTOR,
		icon: 'icon-acceleration',
		name: 'constants.y_axis_Crest_factor',
		short_name: 'short_name.y_crest_factor',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_CREST_FACTOR]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_CREST_FACTOR,
		icon: 'icon-acceleration',
		name: 'constants.z_axis_Crest_factor',
		short_name: 'short_name.z_crest_factor',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_KURTOSIS]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_KURTOSIS,
		icon: 'icon-acceleration',
		name: 'constants.x_axis_kurtosis',
		short_name: 'short_name.x_kurtosis',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_KURTOSIS]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_KURTOSIS,
		icon: 'icon-acceleration',
		name: 'constants.y_axis_kurtosis',
		short_name: 'short_name.y_kurtosis',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_KURTOSIS]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_KURTOSIS,
		icon: 'icon-acceleration',
		name: 'constants.z_axis_kurtosis',
		short_name: 'short_name.z_kurtosis',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_RMS_ACCEL]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_RMS_ACCEL,
		icon: 'icon-acceleration',
		name: 'constants.x_axis_full_Band_RMS_Acceleration_G',
		short_name: 'short_name.x_full_band_rms_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_RMS_ACCEL]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_RMS_ACCEL,
		icon: 'icon-acceleration',
		name: 'constants.y_axis_full_Band_RMS_Acceleration_G',
		short_name: 'short_name.y_full_band_rms_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_RMS_ACCEL]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_RMS_ACCEL,
		icon: 'icon-acceleration',
		name: 'constants.z_axis_full_Band_RMS_Acceleration_G',
		short_name: 'short_name.z_full_band_rms_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_PK_PK_ACCEL]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_PK_PK_ACCEL,
		icon: 'icon-acceleration',
		name: 'constants.x_axis_Full_band_PK_PK_Acceleration_G',
		short_name: 'short_name.x_full_band_pk_pk_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_PK_PK_ACCEL]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_PK_PK_ACCEL,
		icon: 'icon-acceleration',
		name: 'constants.y_axis_Full_band_PK_PK_Acceleration_G',
		short_name: 'short_name.y_full_band_pk_pk_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_PK_PK_ACCEL]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_PK_PK_ACCEL,
		icon: 'icon-acceleration',
		name: 'constants.z_axis_Full_band_PK_PK_Acceleration_G',
		short_name: 'short_name.z_full_band_pk_pk_accel',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_ACCEL_FREQ_COMPONENT]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_ACCEL_FREQ_COMPONENT,
		icon: 'icon-acceleration',
		name: 'constants.x_axis_Peak_Acceleration_Frequency_Component',
		short_name: 'short_name.x_peak_accel_comp_freq',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_ACCEL_FREQ_COMPONENT]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_ACCEL_FREQ_COMPONENT,
		icon: 'icon-acceleration',
		name: 'constants.y_axis_Peak_Acceleration_Frequency_Component',
		short_name: 'short_name.y_peak_accel_comp_freq',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_ACCEL_FREQ_COMPONENT]: {
		id: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_ACCEL_FREQ_COMPONENT,
		icon: 'icon-acceleration',
		name: 'constants.z_axis_Peak_Acceleration_Frequency_Component',
		short_name: 'short_name.z_peak_accel_comp_freq',
		type: 'acceleration',
		color: '#ffde32',
		metricKeysTableName: 'extra_vibration'
	},
};

const bannerM25ParametersList1 = {
	[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS]: {
		id: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS,
		icon: 'icon-sensor',
		name: 'constants.ultrasound_rms',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_IMPACT_INDEX]: {
		id: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_IMPACT_INDEX,
		icon: 'icon-sensor',
		name: 'constants.ultrasound_impact_index',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_PEAK]: {
		id: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_PEAK,
		icon: 'icon-sensor',
		name: 'constants.ultrasound_peak',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CREST_FACTOR]: {
		id: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CREST_FACTOR,
		icon: 'icon-sensor',
		name: 'constants.ultrasound_crest_factor',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CURTOSIS]: {
		id: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CURTOSIS,
		icon: 'icon-sensor',
		name: 'constants.ultrasound_curtosis',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION]: {
		id: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.high_frequency_rms_acceleration',
		short_name: 'short_name.hi_freq_rms_accel',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.HFE_IMPACT_INDEX]: {
		id: BANNER_M25_PARAMETERS_TYPES.HFE_IMPACT_INDEX,
		icon: 'icon-acceleration',
		name: 'constants.hfe_impact_index',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION]: {
		id: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.high_frequency_pk_acceleration',
		short_name: 'short_name.hi_freq_pk_accel',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_CREST_FACTOR]: {
		id: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_CREST_FACTOR,
		icon: 'icon-acceleration',
		name: 'constants.high_frequency_crest_factor',
		short_name: 'short_name.hi_freq_crest_factor',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_KURTOSIS]: {
		id: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_KURTOSIS,
		icon: 'icon-acceleration',
		name: 'constants.high_frequency_kurtosis',
		short_name: 'short_name.hi_freq_kurtosis',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_M25_PARAMETERS_TYPES.FULL_BAND_RMS_ACCELERATION]: {
		id: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_RMS_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.full_band_rms_acceleration',
		short_name: 'short_name.full_band_accel',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.FULL_BAND_PEAK_ACCELERATION_FREQ]: {
		id: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_PEAK_ACCELERATION_FREQ,
		icon: 'icon-acceleration',
		name: 'constants.full_band_peak_acceleration_frequency',
		short_name: 'short_name.full_band_pk_accel_freq',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.FULL_BAND_CREST_FACTOR]: {
		id: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_CREST_FACTOR,
		icon: 'icon-acceleration',
		name: 'constants.full_band_crest_factor',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.FULL_BAND_KURTOSIS]: {
		id: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_KURTOSIS,
		icon: 'icon-acceleration',
		name: 'constants.full_band_kurtosis',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_M25_PARAMETERS_TYPES.RMS_VELOCITY]: {
		id: BANNER_M25_PARAMETERS_TYPES.RMS_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.rms_velocity',
		metricKeysTableName: 'extra_vibration'
	},
	[BANNER_M25_PARAMETERS_TYPES.PEAK_VELOCITY_FREQ_COMPONENT]: {
		id: BANNER_M25_PARAMETERS_TYPES.PEAK_VELOCITY_FREQ_COMPONENT,
		icon: 'icon-velocity',
		name: 'constants.peak_velocity_frequency_component',
		short_name: 'short_name.peak_vel_comp_freq',
		metricKeysTableName: 'extra_vibration'
	},

	[BANNER_M25_PARAMETERS_TYPES.TEMPERATURE]: {
		id: BANNER_M25_PARAMETERS_TYPES.TEMPERATURE,
		icon: 'icon-temperature',
		name: 'constants.temperature',
		metricKeysTableName: 'extra_vibration'
	},
};

const sensorUltraSoundParametersList1 = {
	[SENSOR_SPECIFIC_PARAMETERS_TYPES.DB]: {
		id: SENSOR_SPECIFIC_PARAMETERS_TYPES.DB,
		icon: 'icon-sensor',
		name: 'constants.db_level',
		axis: '-',
		metricKeysTableName: 'ultrasoundDB'
	}
};

const sensorLubematrixSDTtempC_ParametersList1 = {
	[SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_C]: {
		id: SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_C,
		icon: 'icon-sensor',
		name: 'constants.temperature',
		axis: '-',
		metricKeysTableName: 'lubematrixSDTtempC'
	}
};

const sensorLubematrixSDTtempF_ParametersList1 = {
	[SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_F]: {
		id: SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_F,
		icon: 'icon-sensor',
		name: 'constants.temperature',
		axis: '-',
		metricKeysTableName: 'lubematrixSDTtempF'
	}
};

const sensorBannerUltraSoundParametersList1 = {
	[SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION]: {
		id: SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION,
		icon: 'icon-sensor',
		name: 'constants.db_level',
		axis: '-',
		metricKeysTableName: 'bannerSDTDB'
	}
};

const sensorParametersListUltrasoundNCD1 = {
	[NCD_SENSOR_PARAMETERS_TYPES.C1_MA]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.C1_MA,
		icon: 'icon-sensor',
		name: 'constants.db_level',
		axis: '-',
		metricKeysTableName: 'ultrasoundDB'
	}
};

const sensorParametersListNCDOnly1 = {
	[NCD_SENSOR_PARAMETERS_TYPES.AXIAL_VELOCITY]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.AXIAL_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.axial_velocity',
		pair_name: 'axial velocity',
		axis_id: NCD_AXIS.X,
		axis: 'x-axis',
		type: 'velocity',
		color: '#ffde32'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.AXIAL_ACCELERATION]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.AXIAL_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.axial_acceleration',
		pair_name: 'axial acceleration',
		axis_id: NCD_AXIS.X,
		axis: 'x-axis',
		type: 'acceleration',
		color: '#ffde32'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.RADIAL_V_VELOCITY]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.RADIAL_V_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.radial_v_velocity',
		pair_name: 'radial (V) velocity',
		type: 'velocity',
		color: '#ffde32'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.RADIAL_V_ACCELERATION]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.RADIAL_V_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.radial_v_acceleration',
		pair_name: 'radial (V) acceleration',
		type: 'acceleration',
		color: '#ffde32'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.RADIAL_H_VELOCITY]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.RADIAL_H_VELOCITY,
		icon: 'icon-velocity',
		name: 'constants.radial_h_velocity',
		pair_name: 'radial (H) velocity',
		type: 'velocity',
		color: '#ffde32'
	},
	[NCD_SENSOR_PARAMETERS_TYPES.RADIAL_H_ACCELERATION]: {
		id: NCD_SENSOR_PARAMETERS_TYPES.RADIAL_H_ACCELERATION,
		icon: 'icon-acceleration',
		name: 'constants.radial_h_acceleration',
		pair_name: 'radial (H) acceleration',
		type: 'acceleration',
		color: '#ffde32'
	},
	[SENSOR_PARAMETERS_TYPES.TEMPERATURE]: {
		id: SENSOR_PARAMETERS_TYPES.TEMPERATURE,
		icon: 'icon-temperature',
		name: 'constants.temperature',
		type: 'temperature',
		color: '#ffde32'
	},
	[SENSOR_PARAMETERS_TYPES.AMPS]: {
		id: SENSOR_PARAMETERS_TYPES.AMPS,
		icon: 'icon-temprature',
		name: 'constants.current',
		type: 'current',
		color: '#ffde32'
	}
};

const sensorParametersListVFDPressureRPMAmps1 = {
	[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.PRESSURE]: {
		id: SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.PRESSURE,
		icon: 'icon-velocity',
		custom_id: 'constants.pressure',
		name: 'constants.pressure',
		axis: '-',
		metricKeysTableName: 'customPDM'
	},
	[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.RPM]: {
		id: SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.RPM,
		custom_id: 'constants.rpm',
		name: 'constants.rpm',
		axis: '-',
		icon: 'icon-velocity',
		metricKeysTableName: 'customPDM'
	},
	[SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.MOTOR_AMPERAGE]: {
		id: SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.MOTOR_AMPERAGE,
		custom_id: 'constants.motor_amperage',
		name: 'constants.motor_amperage',
		axis: '-',
		icon: 'icon-velocity',
		metricKeysTableName: 'customPDM'
	}
};

export const THRESHOLD_UPDATE_SOURCE_TYPES = {
	GRAPH: 1,
	RD_MANUAL: 2,
	RD_RE_BASELINE: 3,
	RD_DXM: 4,
	ACKNOWLEDGE_RE_BASELINE: 5,
	CONTROLLER_REGISTERS: 6,
	SENSOR_UPDATE_RE_BASELINE: 7
};

const thresholdUpdateSourceTypesList1 = [
	{ id: THRESHOLD_UPDATE_SOURCE_TYPES.GRAPH, name: 'constants.graph' },
	{ id: THRESHOLD_UPDATE_SOURCE_TYPES.RD_MANUAL, name: 'constants.manual' },
	{ id: THRESHOLD_UPDATE_SOURCE_TYPES.RD_RE_BASELINE, name: 'constants.rebaseline' },
	{ id: THRESHOLD_UPDATE_SOURCE_TYPES.RD_DXM, name: 'constants.dxm' },
	{
		id: THRESHOLD_UPDATE_SOURCE_TYPES.ACKNOWLEDGE_RE_BASELINE,
		name: 'constants.acknowledge_rebaseline'
	},
	{
		id: THRESHOLD_UPDATE_SOURCE_TYPES.CONTROLLER_REGISTERS,
		name: 'constants.controller'
	},
	{
		id: THRESHOLD_UPDATE_SOURCE_TYPES.SENSOR_UPDATE_RE_BASELINE,
		name: 'constants.rebaseline'
	}
];

const setupList = (obj, key, settings = {}) => {
	// console.log( obj Object.values(obj)  )
	let item = cloneDeep(key ? obj[key] : Object.values(obj));

	if (settings.inject) {
		item = mergeObjects(item, settings.inject);
	}

	if (settings.translate) {
		return Lang.translate(Lang.translate(item), settings.translate);
	} else {
		return Lang.translate(item);
	}
};

// console.log(Lang.translate)
export const unitTypesList = () => Lang.translate(unitTypesList1);
export const metricKeysTable = (metricKeysTableName, metric) =>
	metricKeysTable1[metricKeysTableName][metric];
export const metricSystemsList = () => Lang.translate(metricSystemsList1);

export const sensorParametersList = key => setupList(sensorParametersList1, key);
export const sensorParametersListNCD = key =>
	setupList(sensorParametersListNCD1, key, { translate: { key: 'name_fft' } });
export const sensorUltraSoundParametersList = key =>
	setupList(sensorUltraSoundParametersList1, key);
export const sensorLubematrixSDTtempC_ParametersList = key =>
	setupList(sensorLubematrixSDTtempC_ParametersList1, key);
export const sensorLubematrixSDTtempF_ParametersList = key =>
	setupList(sensorLubematrixSDTtempF_ParametersList1, key);
export const sensorBannerUltraSoundParametersList = key =>
	setupList(sensorBannerUltraSoundParametersList1, key);
export const sensorParametersListUltrasoundNCD = key =>
	setupList(sensorParametersListUltrasoundNCD1, key);
export const sensorParametersListVFDPressureRPMAmps = key =>
	setupList(sensorParametersListVFDPressureRPMAmps1, key);
export const sensorParametersListHumidity = key =>
	setupList(sensorParametersListHumidity1, key);

export const sensorParametersListNCDOnly = key =>
	setupList(sensorParametersListNCDOnly1, key);
// export const sensorExtraVibrationParametersList = (key, settings = {}) =>
	// setupList(sensorExtraVibrationParametersList1, key, settings);
export const bannerV21vibrationParametersList = (key, settings = {}) =>
	setupList(bannerV21vibrationParametersList1, key, {...settings, translate: { key: 'short_name' } });

export const bannerM25ParametersList = (key, settings = {}) =>
	setupList(bannerM25ParametersList1, key, {...settings, translate: { key: 'short_name' } });

export const thresholdUpdateSourceTypesList = () =>
	Lang.translate(thresholdUpdateSourceTypesList1);
