import {
	sensorParametersListNCD,
	manualRouteSensorParametersList,
	NCD_SENSOR_PARAMETERS_TYPES,
	SENSOR_PARAMETERS_TYPES,
	MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES
} from './enums';
import { cloneDeep } from '@/helpers';

// import { Lang } from '@/localization';
// console.log('1', sensorParametersList())
// console.log('2', sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION))

const chartsListsConfig1 = {
	fft: [
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM}`,
			requestsList: [sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.X_WAVEFORM)]
		},
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.Y_WAVEFORM}`,
			requestsList: [sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Y_WAVEFORM)]
		},
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.Z_WAVEFORM}`,
			requestsList: [sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Z_WAVEFORM)]
		},

		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.X_TRANSFORM_ACCELERATION}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.X_TRANSFORM_ACCELERATION)
			]
		},
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.Y_TRANSFORM_ACCELERATION}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Y_TRANSFORM_ACCELERATION)
			]
		},
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.Z_TRANSFORM_ACCELERATION}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Z_TRANSFORM_ACCELERATION)
			]
		},

		{
			chart_id: `chart-${SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION)
			]
		},
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION)
			]
		},
		{
			chart_id: `chart-${SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION)
			]
		},

		{
			chart_id: `chart-${SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY)
			]
		},
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_VELOCITY}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_VELOCITY)
			]
		},
		{
			chart_id: `chart-${SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY)
			]
		},
		{
			chart_id: `chart-${MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES.VELOCITY}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				manualRouteSensorParametersList(
					MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES.VELOCITY
				)
			]
		},
		{
			chart_id: `chart-${MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES.HIGH_FREQUENCY_ACCELERATION}`,
			seriesConfigIncludes: ['cursor_flag'],
			requestsList: [
				manualRouteSensorParametersList(
					MANUAL_ROUTE_SENSOR_PARAMETERS_TYPES.HIGH_FREQUENCY_ACCELERATION
				)
			]
		}
	],

	waterfall3d: {
		chart_id: 'waterfall3d',
		requestsList: []
	}
};

const defaultSeriesConfig1 = {
	pointsData: {
		seriesConfigsList: {
			0: [
				{
					id: 'base-serie',
					data_path: '',
					template: 'fft.base',
					event_key: 'pointClickEvent'
				}
			]
		}
	},

	flagsData: {
		seriesConfigsList: {
			0: [
				{
					id: 'cursor-flag-serie-odd',
					data_path: 'cursors_list',
					template: 'sensor.cursor_flag_odd',
					event_keys: ['cursorClickEvent', 'cursorDragEvent']
					// inject: { onSeries: 'base-serie' }
				},
				{
					id: 'cursor-flag-serie-even',
					data_path: 'cursors_list',
					template: 'sensor.cursor_flag_even',
					event_keys: ['cursorClickEvent', 'cursorDragEvent']
					// inject: { onSeries: 'base-serie' }
				},
				{
					id: 'periodic-cursor-flag-serie-odd',
					data_path: 'cursors_list',
					template: 'sensor.periodic_cursor_flag_odd',
					event_key: 'periodicCursorDragEvent'
					// event_key: 'cursorClickEvent',
				},
				{
					id: 'periodic-cursor-flag-serie-even',
					data_path: 'cursors_list',
					template: 'sensor.periodic_cursor_flag_even',
					// inject: { width: 40 },
					// event_key: 'cursorClickEvent',
					event_key: 'periodicCursorDragEvent'
				},
				{
					id: 'peak-flag-serie',
					data_path: 'peaks_list',
					template: 'sensor.peak_flag'
				},
				{
					id: 'rpm-cursor-flag-serie',
					data_path: 'rpm_cursors_list',
					template: 'sensor.rpm_cursor_flag',
					event_keys: ['rpmCursorDragEvent', 'rpmCursorDropEvent']
				},
			]
		}
	}
};

export const chartsListsConfig = key => cloneDeep(chartsListsConfig1[key]);
export const FFTDefaultSeriesConfig = () => cloneDeep(defaultSeriesConfig1);
