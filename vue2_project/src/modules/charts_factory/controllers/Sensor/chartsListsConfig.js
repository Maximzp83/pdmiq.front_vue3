import {
	SENSOR_PARAMETERS_TYPES,
	NCD_SENSOR_PARAMETERS_TYPES,
	SENSOR_SPECIFIC_PARAMETERS_TYPES,
	SENSOR_HUMIDITY_PARAMETERS_TYPES,
	SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES,
	BANNER_V2_1_VIBRATION_PARAMETERS_TYPES,
	BANNER_M25_PARAMETERS_TYPES,
	sensorParametersList,
	sensorParametersListNCD,
	sensorUltraSoundParametersList,
	sensorBannerUltraSoundParametersList,
	sensorParametersListUltrasoundNCD,
	sensorParametersListHumidity,
	sensorParametersListVFDPressureRPMAmps,
	sensorLubematrixSDTtempC_ParametersList,
	sensorLubematrixSDTtempF_ParametersList,
	// sensorExtraVibrationParametersList,
	bannerV21vibrationParametersList,
	bannerM25ParametersList
} from './enums';
import { cloneDeep, validateBySettings, findItemBy, mergeObjects } from '@/helpers';
import { CHART_TYPES, chartTypesList, SENSOR_THRESHOLD_TYPES, NCD_ALARM_TYPES } from '@/constants/global';
import { METRIC_SYSTEM_TYPES } from './enums';
import { storeGetter } from '@/store';
import {
	buildMeasurementUnitFormula,
	getMeasurementUnitDefaultMeasurement,
	getMeasurementUnitFormulaForMeasurement,
	getMeasurementUnitIdByMeasurement,
	resolveMeasurementUnitObject,
	shouldConvertMeasurementUnit
} from '@/helpers/measurementUnits';
const { METRIC, IMPERIAL } = METRIC_SYSTEM_TYPES;

import { Lang } from '@/localization';
// console.log('1', sensorParametersList())
// console.log('2', sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION))
const banner_configs = [
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_runtime_tracker: 1 },
				setupPointsData: { skipMaxValuesAbove: [65, 2.56],  }
			}
		},
		preTransformSettings: {
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		requestsList: [sensorParametersList(SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY)],
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'runtime_flag', 'statistic_lines']
	},
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_runtime_tracker: 1 },
				setupPointsData: { skipMaxValuesAbove: [65, 65] }
			}
		},
		preTransformSettings: {
			callMethod: { name:'setupSkipDataPointsListForAllCharts', payload: { belowValue:0.01 } },
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		requestsList: [
			sensorParametersList(SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION)
		],
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'runtime_flag', 'statistic_lines']
	},
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY}`, // filters: { metric: 2 },
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_runtime_tracker: 1 },
				setupPointsData: { skipMaxValuesAbove: [65, 2.56] }
			}
		},
		preTransformSettings: {
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		requestsList: [sensorParametersList(SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY)],
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'runtime_flag', 'statistic_lines']
	},
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_runtime_tracker: 1 },
				setupPointsData: { skipMaxValuesAbove: [65, 65] }
			}
		},
		preTransformSettings: {
			callMethod: { name:'setupSkipDataPointsListForAllCharts', payload: { belowValue:0.01 } },
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		requestsList: [
			sensorParametersList(SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION)
		],
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'runtime_flag', 'statistic_lines']
	},
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.TEMPERATURE}`,
		seriesConfigIncludes: ['runtime_flag', 'statistic_lines'],
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_runtime_tracker: 1 },
				setupPointsData: { skipMaxValues: [2981.03, 1638.35] }
			}
		},
		preTransformSettings: {
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true,
			callMethod: { name:'setupSkipDataPointsList', payload: { 
				belowValueByMetric: { [METRIC]:-50, [IMPERIAL]:-58 }
			} },
			filterStatisticsBySkipDataPointsList: true
		},
		requestsList: [sensorParametersList(SENSOR_PARAMETERS_TYPES.TEMPERATURE)]
	}
];

const ncd_temp_vibe_configs = [
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				// setupPlotlinesData: false,
				setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
			}
		},
		preTransformSettings: {
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		// filters: { metric: 2 },
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'fft_flag', 'runtime_flag', 'statistic_lines'],
		requestsList: [sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.X_AXIS_VELOCITY)]
	},
	{
		chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_VELOCITY}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
			}
		},
		preTransformSettings: {
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'fft_flag', 'runtime_flag', 'statistic_lines'],
		requestsList: [
			sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_VELOCITY)
		]
	},
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
			}
		},
		preTransformSettings: {
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'fft_flag', 'runtime_flag', 'statistic_lines'],
		requestsList: [sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY)]
	},
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
			}
		},
		preTransformSettings: {
			callMethod: { name:'setupSkipDataPointsListForAllCharts', payload: { belowValue:0.01 } },
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'fft_flag', 'runtime_flag', 'statistic_lines'],
		requestsList: [
			sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION)
		]
	},
	{
		chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
			}
		},
		preTransformSettings: {
			callMethod: { name:'setupSkipDataPointsListForAllCharts', payload: { belowValue:0.01 } },
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'fft_flag', 'runtime_flag', 'statistic_lines'],
		requestsList: [
			sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_ACCELERATION)
		]
	},
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION}`,
		config_settings: { showCalculateThresholdsButton: true },
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
			}
		},
		preTransformSettings: {
			callMethod: { name:'setupSkipDataPointsListForAllCharts', payload: { belowValue:0.01 } },
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		zonesKeysList: ['alarm', 'warning', 'off_alarm'],
		seriesConfigIncludes: ['off_alarm', 'fft_flag', 'runtime_flag', 'statistic_lines'],
		requestsList: [
			sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION)
		]
	},
	{
		chart_id: `chart-${SENSOR_PARAMETERS_TYPES.TEMPERATURE}`,
		seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
		transformator_settings: {
			specification: {
				setupFlagsData: { enable_runtime_tracker: 1 }
			}
		},
		preTransformSettings: {
			skipStandardTransform: true,
			filterStatisticsBySkipDataPointsList_AllCharts: true
		},
		requestsList: [sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.TEMPERATURE)]
	}
];

const settingsForSplineChartsWithSplittedSeries = {
	transformator_settings: {
		specification: {
			setupPointsData: { enableZones: true, method: 'line_charts_datetime' }
		}
	},
	config_settings: {
		generateSeriesByStatistics: { seriesConfigMethod: 'modifySeriesConfigByHistory' }
	}
};

const getSplineSeriesConfigSettings = (alarm_type) => {
	let settings = {
		remove: [{ path: 'pointsData.seriesConfigsList.0', idx: [2, 3] }],
		inject: [
			{
				path: 'pointsData.seriesConfigsList.0.1',
				value: {
					customSettings: {
						threshold_level: null,
						thresholdLevelsInZones: true,
						setupSeriePropValue: [
							{ key: 'zones', methodName: 'setupLineSerieZones' }
						]
					}
				}
			},
		]
	}

	if (!alarm_type || alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM) {
		settings.inject.push(
			{
				path: 'plotlinesSeriesData.seriesConfigsList.0.1',
				value: {
					id: 'low_threshold-serie',
					template: 'sensor.humidity_warning_threshold'
				}
			},
			{
				path: 'plotlinesData.plotlinesConfigsList.0.1',
				value: {
					id: 'low-alarm-plotline',
					template: 'sensor.low_alarm_plotline'
				}
			},
			{
				path: 'historyData.seriesConfigsList.0.0',
				value: {
					id: 'high_alarm_history-serie',
					template: 'sensor.high_alarm_history'
				}
			},
			{
				path: 'historyData.seriesConfigsList.0.1',
				value: {
					id: 'low_alarm_history-serie',
					template: 'sensor.low_alarm_history'
				}
			}
		)
	}
	
	return settings;
}

/*var splineSeriesConfigSettings1 = {
	remove: [{ path: 'pointsData.seriesConfigsList.0', idx: [2, 3] }],
	inject: [
		{
			path: 'pointsData.seriesConfigsList.0.1',
			value: {
				customSettings: {
					setupSeriePropValue: [
						{ key: 'zones', methodName: 'setupLineSerieZones' }
					]
				}
			}
		},
		{
			path: 'plotlinesSeriesData.seriesConfigsList.0.1',
			value: {
				id: 'low_threshold-serie',
				template: 'sensor.humidity_warning_threshold'
			}
		},
		{
			path: 'plotlinesData.plotlinesConfigsList.0.1',
			value: {
				id: 'low-alarm-plotline',
				template: 'sensor.low_alarm_plotline'
			}
		},
		{
			path: 'historyData.seriesConfigsList.0.0',
			value: {
				id: 'high_alarm_history-serie',
				template: 'sensor.high_alarm_history'
			}
		},
		{
			path: 'historyData.seriesConfigsList.0.1',
			value: {
				id: 'low_alarm_history-serie',
				template: 'sensor.low_alarm_history'
			}
		}
	]
};*/

const displacement = {
	chart_id: 'displacement',
	chart_title_prefix: `${Lang.tt('displacement')} (`,
	chart_title_postfix: ')',
	inject_options: {
		chart: { type: 'line' },
		navigator: { series: { type: 'spline' } },
		tooltip: { split: false }
	},
	transformator_settings: {
		specification: {
			setupPlotlinesData: false,
			setupPointsData: { enableZones: false }
		}
	},
	preTransformSettings: {
		skipStandardTransform: true,
		filterStatisticsBySkipDataPointsList_AllCharts: true
	},
	seriesConfig: {
		pointsData: {
			seriesConfigsList: {
				0: [
					{
						id: 'transparent-serie',
						data_path: 'transparent',
						template: 'edgeTransparent',
						inject: { customSettings: { event_key: null } }
					},
					{
						id: 'x_displacement-serie',
						responseDataKey: `parameter_${NCD_SENSOR_PARAMETERS_TYPES.X_AXIS_DISPLACEMENT}`,
						template: 'sensor.base',
						inject: { color: '#0ff', /*gapSize: 1000 * 60 * 20*/ }
					}
						// gapUnit: 'value',
				],
				1: [
					{
						id: 'y_displacement-serie',
						responseDataKey: `parameter_${NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_DISPLACEMENT}`,
						template: 'sensor.base',
						inject: { color: 'rgba(170, 0, 255, 0.5)', /*gapSize: 1000 * 60 * 20*/  }
					}
				],
				2: [
					{
						id: 'z_displacement-serie',
						responseDataKey: `parameter_${NCD_SENSOR_PARAMETERS_TYPES.Z_AXIS_DISPLACEMENT}`,
						template: 'sensor.base',
						inject: { color: '#A4C400', /*gapSize: 1000 * 60 * 20*/  }
					}
				]
			}
		}
	},
	requestsList: [
		sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.X_AXIS_DISPLACEMENT),
		sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Y_AXIS_DISPLACEMENT),
		sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.Z_AXIS_DISPLACEMENT)
	]
};

// -----------------
const getConfigSet = (setName, param) => {
	const standardBaseSerie = {
		id: `base-serie_for-param-${param}`,
		responseDataKey: `parameter_${param}`,
		template: 'sensor.base',
	}

	const standartColumnSeries = [
		{
			id: 'transparent-serie',
			data_path: 'transparent',
			responseDataKey: `parameter_${param}`,
			template: 'edgeTransparent',
			inject: { customSettings: { event_key: null } }
		},
		{
			id: `base-serie_for-param-${param}`,
			data_path: 'base',								
			responseDataKey: `parameter_${param}`,
			template: 'sensor.base',
			event_key: 'pointClickEvent'				
		},
		{
			id: `warning-serie_for-param-${param}`,
			data_path: 'warning',
			template: 'sensor.warning',
			responseDataKey: `parameter_${param}`,
			event_key: 'pointClickEvent'
		},
		{
			id: `alarm-serie_for-param-${param}`,
			data_path: 'alarm',
			template: 'sensor.alarm',
			responseDataKey: `parameter_${param}`,
			event_key: 'pointClickEvent'
		},
	];

	const setsList = {
		'standardColumn': standartColumnSeries,
		'standardColumnLube': standartColumnSeries.concat([
			{
				id: `off_alarm-serie_for-param-${param}`,
				data_path: 'off_alarm',
				template: 'sensor.off_alarm',
				event_key: 'pointClickEvent',
			},
			{
				id: `lube-serie_for-param-${param}`,
				data_path: 'lube',
				template: 'sensor.lube',
				event_key: 'pointClickEvent',
			},
		]),
		'invisibleLine': [{
			id: `invisible-serie_for-param-${param}`,
			responseDataKey: `parameter_${param}`,
			template: 'sensor.invisible',
			inject: { type: 'line' },
			transformator_settings: {
				specification: {
					getEdgeStatisticsItems: false,
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false, skipMaxMinValues: true }
				}
			},
		}],
		'standardLine1': [
			{
				id: 'transparent-serie',
				data_path: 'transparent',
				template: 'edgeTransparent',
				inject: { customSettings: { event_key: null } }
			},
			{	...standardBaseSerie,	inject: {color: '#0ff'} }
		],
		'standardLine2': [{	...standardBaseSerie,	inject: {color: 'rgba(170, 0, 255, 0.5)'}	}],
		'standardLine3': [{	...standardBaseSerie,	inject: {color: '#A4C400'} }],
	}

	return setsList[setName];
};

const buildCustomSeriesConfig = settings => {
	const result = {};

	Object.keys(settings).forEach(key => {
		result[key] = result[key] || {};

		Object.keys(settings[key]).forEach(configsListKey => {
			result[key][configsListKey] = result[key][configsListKey] || {};
			settings[key][configsListKey].forEach((si, idx) => {
				result[key][configsListKey][idx] = getConfigSet(si.setName, si.param);
			})
		})

	})
	return result;
}

const getSeriesConfigSettingsForBannerV2_1For = (parameter, settings={}) => {
	let result = {}

	if (settings.includeStatsLines) {
		result.add = [
			{
				path: 'pointsData.seriesConfigsList.0',
				value: {
					id: 'average_current-threshold-serie',
					custom_data_path: 'plotlinesSeriesData.actual_average_metric_data_value_for_current_period',
					template: 'sensor.actual_average_threshold',
				},
			},
			{
				path: 'pointsData.seriesConfigsList.0',
				value: {
					id: 'alarm_current-threshold-serie',
					custom_data_path: 'plotlinesSeriesData.alarm_zone_current',
					template: 'sensor.alarm_actual_threshold',
				},
			},
			{
				path: 'pointsData.seriesConfigsList.0',
				value: {
					id: 'warning_current-threshold-serie',
					custom_data_path: 'plotlinesSeriesData.warning_zone_current',
					template: 'sensor.warning_actual_threshold',
				},
			},
			{
				path: 'pointsData.seriesConfigsList.0',
				value: {
					id: 'period_average_threshold-serie',
					custom_data_path: 'statsData.average_metric_value',
					template: 'sensor.period_average_threshold',
				},
			},
			{
				path: 'pointsData.seriesConfigsList.0',
				value: {
					id: 'period_warning_threshold-serie',
					custom_data_path: 'statsData.warning_level',
					template: 'sensor.period_warning_threshold',
				},
			},
			{
				path: 'pointsData.seriesConfigsList.0',
				value: {
					id: 'period_alarm_threshold-serie',
					custom_data_path: 'statsData.alarm_level',
					template: 'sensor.period_alarm_threshold',
				},
			},
		]
	}

	return result;
};
// ---------------------

const chartsListsConfig1 = {
	'banner': banner_configs,
	'banner_CM1L': banner_configs.concat([
		{
			chart_id: `chart-${SENSOR_PARAMETERS_TYPES.AMPS}`,
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_runtime_tracker: 1 },
					setupPointsData: { skipMaxValuesAbove: [65, 2.56] }
				}
			},
			zonesKeysList: ['alarm', 'warning', 'off_alarm'],
			seriesConfigIncludes: ['off_alarm', 'runtime_flag', 'statistic_lines'],
			requestsList: [sensorParametersList(SENSOR_PARAMETERS_TYPES.AMPS)]
		}
	]),
	'banner_sdt_decibell': [
		{
			chart_id: `chart-sdt-${SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION}`,
			requestsList: [
				sensorBannerUltraSoundParametersList(
					SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION
				)
			],
			zonesKeysList: ['alarm', 'warning', 'lube'],
			transformator_settings: {
				specification: { setupFlagsData: { enable_lube: 1 } }
			},
			seriesConfigIncludes: ['lube', 'baseline'],
			seriesConfigSettings: {
				add: [
					// { path: 'flagsData.seriesConfigsList.0', value: { id: 'lube-flag-serie', data_path: 'lube_statistics', template: 'sensor.lube_flag' }},
					{
						path: 'flagsData.seriesConfigsList.0',
						value: {
							id: 'success_adjustments-flag-serie',
							data_path: 'success_adjustments_statistics',
							template: 'sensor.success_adjustments_flag'
						}
					},
					{
						path: 'flagsData.seriesConfigsList.0',
						value: {
							id: 'warning_adjustments-flag-serie',
							data_path: 'warning_adjustments_statistics',
							template: 'sensor.warning_flag'
						}
					},
					{
						path: 'flagsData.seriesConfigsList.0',
						value: {
							id: 'fail_adjustments-flag-serie',
							data_path: 'fail_adjustments_statistics',
							template: 'sensor.crashes_flag'
						}
					}
				]
				/*remove: [
					{ path: 'pointsData.seriesConfigsList.0', idx: [2,3,4] }
				]*/
			}
		}
	],
	'banner_humidity': [
		{
			chart_id: `chart-${SENSOR_HUMIDITY_PARAMETERS_TYPES.HUMIDITY}`,
			requestsList: [
				sensorParametersListHumidity(SENSOR_HUMIDITY_PARAMETERS_TYPES.HUMIDITY)
			],
			inject_options: {
				chart: { type: 'spline' },
				navigator: { series: { type: 'spline' } }
			},
			...settingsForSplineChartsWithSplittedSeries,
			seriesConfigSettings: getSplineSeriesConfigSettings()
		},
		{
			chart_id: `chart-${SENSOR_HUMIDITY_PARAMETERS_TYPES.TEMPERATURE}`,
			requestsList: [
				sensorParametersList(SENSOR_HUMIDITY_PARAMETERS_TYPES.TEMPERATURE)
			],
			inject_options: {
				chart: { type: 'spline' },
				navigator: { series: { type: 'spline' } }
			},
			...settingsForSplineChartsWithSplittedSeries,
			seriesConfigSettings: getSplineSeriesConfigSettings()
		}
	],
	'colortech_vfd_pressure_rpm/amps': [
		{
			chart_id: `chart-${SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.PRESSURE}`,
			requestsList: [
				sensorParametersListVFDPressureRPMAmps(
					SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.PRESSURE
				)
			]
		},
		{
			chart_id: `chart-${SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.RPM}`,
			requestsList: [
				sensorParametersListVFDPressureRPMAmps(
					SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.RPM
				)
			]
		},
		{
			chart_id: `chart-${SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.MOTOR_AMPERAGE}`,
			requestsList: [
				sensorParametersListVFDPressureRPMAmps(
					SENSOR_COLORTECH_VFD_PRESSURE_RPM_AMPS_PARAMETERS_TYPES.MOTOR_AMPERAGE
				)
			]
		}
	],
	'ultrasound': [
		{
			chart_id: `chart-${SENSOR_SPECIFIC_PARAMETERS_TYPES.DB}`,
			// yAxisOptions: { min: },
			requestsList: [
				sensorUltraSoundParametersList(SENSOR_SPECIFIC_PARAMETERS_TYPES.DB)
			],
			zonesKeysList: ['alarm', 'warning', /*'off_alarm',*/ 'lube'],
			transformator_settings: {
				specification: { setupFlagsData: { enable_lube: 1 } }
			},
			seriesConfigIncludes: ['lube', 'baseline']
			/*seriesConfigSettings: {
				add: [
					{ path: 'plotlinesData.plotlinesConfigsList.0', value: { 
							id: 'lube-plotline', data_path: 'lube_zone', template: 'sensor.lubeline_plotline',
							customSettings: { data_path: 'lube_zone', draggable: true }
						}
					},
					// { path: 'flagsData.seriesConfigsList.0', value: { id: 'lube-flag-serie', data_path: 'lube_statistics', template: 'sensor.lube_flag' }},
				],
			}*/
		}
	],
	'ultrasound_lube_sdt_c': [
		{
			chart_id: `chart-${SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_C}`,
			// yAxisOptions: { min: },
			requestsList: [
				sensorLubematrixSDTtempC_ParametersList(
					SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_C
				)
			],
			zonesKeysList: ['alarm', 'warning', /*'off_alarm',*/ 'lube'],
			transformator_settings: {
				specification: { setupFlagsData: { enable_lube: 1 } }
			},
			seriesConfigIncludes: ['lube', 'baseline']
		}
	],
	'ultrasound_lube_sdt_f': [
		{
			chart_id: `chart-${SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_F}`,
			// yAxisOptions: { min: },
			requestsList: [
				sensorLubematrixSDTtempF_ParametersList(
					SENSOR_SPECIFIC_PARAMETERS_TYPES.LUBE_MATRIX_SDT_TEMP_F
				)
			],
			zonesKeysList: ['alarm', 'warning', /*'off_alarm',*/ 'lube'],
			transformator_settings: {
				specification: { setupFlagsData: { enable_lube: 1 } }
			},
			seriesConfigIncludes: ['lube', 'baseline']
		}
	],
	'ncd_temp_vibe': ncd_temp_vibe_configs.concat([displacement]),
	'ncd_wired_temp_vibe': ncd_temp_vibe_configs.concat([displacement]),
	'ncd_temp_vibe_current': ncd_temp_vibe_configs.concat([
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.EXT_TEMPERATURE}`,
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			preTransformSettings: {
				skipStandardTransform: true,
				filterStatisticsBySkipDataPointsList_AllCharts: true
			},
			seriesConfigIncludes: ['runtime_flag'],
			requestsList: [
				sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.EXT_TEMPERATURE)
			]
		},
		{
			chart_id: `chart-${SENSOR_PARAMETERS_TYPES.AMPS}`,
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			preTransformSettings: {
				skipStandardTransform: true,
				filterStatisticsBySkipDataPointsList_AllCharts: true
			},
			zonesKeysList: ['alarm', 'warning', 'off_alarm'],
			seriesConfigIncludes: ['off_alarm', 'runtime_flag'],
			requestsList: [sensorParametersListNCD(SENSOR_PARAMETERS_TYPES.AMPS)]
		},
		displacement
	]),
	'ncd_environmental': [
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.HUMIDITY}`,
			requestsList: [sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.HUMIDITY)],
			inject_options: {
				chart: { type: 'spline' },
				navigator: { series: { type: 'spline' } }
			},
			...settingsForSplineChartsWithSplittedSeries,
			seriesConfigSettings: getSplineSeriesConfigSettings()
		},
		{
			chart_id: `chart-${SENSOR_PARAMETERS_TYPES.TEMPERATURE}`,
			requestsList: [sensorParametersList(SENSOR_PARAMETERS_TYPES.TEMPERATURE)],
			inject_options: {
				chart: { type: 'spline' },
				navigator: { series: { type: 'spline' } }
			},
			...settingsForSplineChartsWithSplittedSeries,
			seriesConfigSettings: getSplineSeriesConfigSettings()
		},
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.PRESSURE}`,
			requestsList: [sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.PRESSURE)],
			inject_options: {
				chart: { type: 'spline' },
				navigator: { series: { type: 'spline' } }
			},
			...settingsForSplineChartsWithSplittedSeries,
			seriesConfigSettings: getSplineSeriesConfigSettings()
		},
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.IAQ}`,
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupPointsData: { enableZones: false }
				}
			},
			// seriesConfig: { plotlinesData: { seriesConfigsList: null } },
			requestsList: [sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.IAQ)],
			/*seriesConfigSettings: {
				remove: [
					{ path: 'historyData.seriesConfigsList.0', idx: [0, 1] },
					{ path: 'plotlinesSeriesData.seriesConfigsList.0', idx: [0, 1] },
					{ path: 'plotlinesData.plotlinesConfigsList.0', idx: [0, 1] }
				]
			}*/
		}
	],
	'ncd_pressure': [
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.PRESSURE}`,
			requestsList: [sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.PRESSURE)],
			inject_options: {
				chart: { type: 'spline' },
				navigator: { series: { type: 'spline' } }
			},
			...settingsForSplineChartsWithSplittedSeries,
			seriesConfigSettings: getSplineSeriesConfigSettings()
		}
	],
	'banner_pressure': [
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.PRESSURE}`,
			requestsList: [sensorParametersListNCD(NCD_SENSOR_PARAMETERS_TYPES.PRESSURE)],
			inject_options: {
				chart: { type: 'spline' },
				navigator: { series: { type: 'spline' } }
			},
			...settingsForSplineChartsWithSplittedSeries,
			seriesConfigSettings: getSplineSeriesConfigSettings()
		}
	],
	'ncd_ultrasound': [
		{
			chart_id: `chart-${NCD_SENSOR_PARAMETERS_TYPES.C1_MA}`,
			requestsList: [
				sensorParametersListUltrasoundNCD(NCD_SENSOR_PARAMETERS_TYPES.C1_MA)
			],
			zonesKeysList: ['alarm', 'warning', 'lube'],
			transformator_settings: {
				specification: { setupFlagsData: { enable_lube: 1 } }
			},
			seriesConfigIncludes: ['lube', 'baseline'],
			seriesConfigSettings: {
				add: [
					// { path: 'flagsData.seriesConfigsList.0', value: { id: 'lube-flag-serie', data_path: 'lube_statistics', template: 'sensor.lube_flag' }},
					{
						path: 'flagsData.seriesConfigsList.0',
						value: {
							id: 'success_adjustments-flag-serie',
							data_path: 'success_adjustments_statistics',
							template: 'sensor.success_adjustments_flag'
						}
					},
					{
						path: 'flagsData.seriesConfigsList.0',
						value: {
							id: 'warning_adjustments-flag-serie',
							data_path: 'warning_adjustments_statistics',
							template: 'sensor.warning_flag'
						}
					},
					{
						path: 'flagsData.seriesConfigsList.0',
						value: {
							id: 'fail_adjustments-flag-serie',
							data_path: 'fail_adjustments_statistics',
							template: 'sensor.crashes_flag'
						}
					}
				]
			}
		}
	],
	'banner_temp_vibe_v2': ncd_temp_vibe_configs,

	'ncd_custom_4_20': [
		{
			chart_id: `chart-${SENSOR_SPECIFIC_PARAMETERS_TYPES.DB}`,
			// config_settings: { showCalculateThresholdsButton: true },
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			// filters: { metric: 2 },
			zonesKeysList: ['alarm', 'warning'],
			seriesConfigIncludes: ['fft_flag', 'runtime_flag'],
			requestsList: [
				sensorUltraSoundParametersList(SENSOR_SPECIFIC_PARAMETERS_TYPES.DB)
			]
		}
	],
	'ncd_custom_4_20_line': [
		{
			chart_id: `chart-${SENSOR_SPECIFIC_PARAMETERS_TYPES.DB}`,
			// config_settings: { showCalculateThresholdsButton: true },
			transformator_settings: {
				specification: {
					setupPointsData: { enableZones: true, method: 'line_charts_datetime' },
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			inject_options: {
				chart: { type: 'spline' },
				navigator: { series: { type: 'spline' } }
			},
			config_settings: {
				generateSeriesByStatistics: {
					seriesConfigMethod: 'modifySeriesConfigByHistory'
				}
			},
			seriesConfigSettings: getSplineSeriesConfigSettings(),
			seriesConfigIncludes: ['fft_flag', 'runtime_flag'],
			requestsList: [
				sensorUltraSoundParametersList(SENSOR_SPECIFIC_PARAMETERS_TYPES.DB)
			]
		}
	],
	'banner_v2_generic': [],
	'banner_temp_vibe_v2_1': [
		{
			chart_id: `chart-${BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION}`,
			// chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (1000-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' }, 
			updateChartTitleByMetric: true,
			canBeHidden: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning'],
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			levelZoneDataParameterId: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION,
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumn', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_PK_ACCELERATION },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_CREST_FACTOR },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_KURTOSIS },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS },
					]
				}
			}),
			seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION, {includeStatsLines:1}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_RMS_ACCELERATION),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_PK_ACCELERATION, {inject: {skipTitle:1, toFixedNum: 3, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_CREST_FACTOR, {inject: {skipTitle:1, toFixedNum: 2, /*postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} */}}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_HIGH_FREQ_KURTOSIS, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS, {inject: {skipTitle:1, checkForDuplicates:1}}),
			]
		},

		{
			chart_id: `chart-${BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION}`,
			updateChartTitleByMetric: true,
			canBeHidden: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning'],
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			levelZoneDataParameterId: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION,
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumn', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS },
					]
				}
			}),
			seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION, {includeStatsLines:1}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_RMS_ACCELERATION, {inject: {postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION, {inject: {skipTitle:true, toFixedNum:3, postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS, {inject: {skipTitle:1, checkForDuplicates:1}}),
			]
		},

		{
			chart_id: `chart-${BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY}`,
			canBeHidden: true,
			updateChartTitleByMetric: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning'],
			levelZoneDataParameterId: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY,
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumn', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_VELOCITY_COMPONENT_FREQ },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS },
					]
				}
			}),
			seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY, {includeStatsLines:1}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY, {inject: {checkForDuplicates:1, postfix_by_metric: {[METRIC]:'(6-1000Hz)', [IMPERIAL]:'(360-60k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_VELOCITY_COMPONENT_FREQ, {inject: {skipTitle:1, postfix_by_metric: {[METRIC]:'(6-100Hz)', [IMPERIAL]:'(360-6000 CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS, {inject: {skipTitle:1, checkForDuplicates:1}}),
			]
		},

		{
			chart_id: `chart-${BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY}`,
			canBeHidden: true,
			updateChartTitleByMetric: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning'],
			levelZoneDataParameterId: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY,
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumn', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_VELOCITY_COMPONENT_FREQ },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS },
					]
				}
			}),
			seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY, {includeStatsLines:1}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY, {inject: {checkForDuplicates:1, postfix_by_metric: {[METRIC]:'(6-1000Hz)', [IMPERIAL]:'(360-60k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_VELOCITY_COMPONENT_FREQ, {inject: {skipTitle:1, postfix_by_metric: {[METRIC]:'(6-100Hz)', [IMPERIAL]:'(360-6000 CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS, {inject: {skipTitle:1, checkForDuplicates:1}}),
			]
		},

		{
			chart_id: `chart-${BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY}`,
			canBeHidden: true,
			updateChartTitleByMetric: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning'],
			levelZoneDataParameterId: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY,
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumn', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_VELOCITY_COMPONENT_FREQ },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS },
					]
				}
			}),
			seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY, {includeStatsLines:1}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY, {inject: {checkForDuplicates:1, postfix_by_metric: {[METRIC]:'(6-1000Hz)', [IMPERIAL]:'(360-60k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_VELOCITY_COMPONENT_FREQ, {inject: {skipTitle:1, skipUnit:1}}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAX_PEAK_FREQUENCY_FROM_3_AXIS, {inject: {skipTitle:1, checkForDuplicates:1}}),
			]
		},

		{
			chart_id: `chart-${SENSOR_PARAMETERS_TYPES.TEMPERATURE}`,
			canBeHidden: true,
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_runtime_tracker: 1 },
					setupPointsData: { skipMaxValues: [2981.03, 1638.35] }
				}
			},
			seriesConfigIncludes: ['runtime_flag'],
			requestsList: [sensorParametersList(SENSOR_PARAMETERS_TYPES.TEMPERATURE)]
		},
		// ------------

		{
			chart_id: 'hi_frequency_rms_acceleration',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.hi_frequency_rms_acceleration')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (1000-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_HI_FREQ_RMS_ACCELERATION },
						{ setName: 'standardLine2', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_HI_FREQ_RMS_ACCELERATION },
						{ setName: 'standardLine3', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_HI_FREQ_RMS_ACCELERATION },
					]
				}
			}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_HI_FREQ_RMS_ACCELERATION, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_HI_FREQ_RMS_ACCELERATION, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_HI_FREQ_RMS_ACCELERATION, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},

		{
			chart_id: 'pk_acceleration',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.hi_frequency_pk_acceleration')} (`,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (1000-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' },
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PK_ACCELERATION },
						{ setName: 'standardLine2', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PK_ACCELERATION },
						{ setName: 'standardLine3', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PK_ACCELERATION },
					]
				}
			}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PK_ACCELERATION, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PK_ACCELERATION, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PK_ACCELERATION, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},

		{
			chart_id: 'crest_factor',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.hi_frequency_crest_factor')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (1000-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' },
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_CREST_FACTOR },
						{ setName: 'standardLine2', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_CREST_FACTOR },
						{ setName: 'standardLine3', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_CREST_FACTOR },
					]
				}
			}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_CREST_FACTOR, {inject: {skipTitle:1, toFixedNum:2 }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_CREST_FACTOR, {inject: {skipTitle:1, toFixedNum:2 }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_CREST_FACTOR, {inject: {skipTitle:1, toFixedNum:2 }}),
			]
		},

		{
			chart_id: 'kurtosis',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.hi_frequency_kurtosis')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (1000-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_KURTOSIS },
						{ setName: 'standardLine2', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_KURTOSIS },
						{ setName: 'standardLine3', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_KURTOSIS },
					]
				}
			}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_KURTOSIS, {inject: {skipTitle:1, toFixedNum:2 }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_KURTOSIS, {inject: {skipTitle:1, toFixedNum:2 }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_KURTOSIS, {inject: {skipTitle:1, toFixedNum:2 }}),
			]
		},

		{
			chart_id: 'full_band_rms_accel',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.hi_frequency_full_band_rms_acceleration')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (6-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (360-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_RMS_ACCEL },
						{ setName: 'standardLine2', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_RMS_ACCEL },
						{ setName: 'standardLine3', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_RMS_ACCEL },
					]
				}
			}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_RMS_ACCEL, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_RMS_ACCEL, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_RMS_ACCEL, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }})
			]
		},

		{
			chart_id: 'full_band_pk_pk_accel',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.hi_frequency_full_band_pk_pk_acceleration')} (`,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (6-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (360-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_PK_PK_ACCEL },
						{ setName: 'standardLine2', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_PK_PK_ACCEL },
						{ setName: 'standardLine3', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_PK_PK_ACCEL },
					]
				}
			}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_FULL_BAND_PK_PK_ACCEL, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_FULL_BAND_PK_PK_ACCEL, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_FULL_BAND_PK_PK_ACCEL, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
			]
		},

		{
			chart_id: 'peak_accel_freq_component',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.Full_Band_Peak_Acceleration_Frequency_Component')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (6-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (360-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_ACCEL_FREQ_COMPONENT },
						{ setName: 'standardLine2', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_ACCEL_FREQ_COMPONENT },
						{ setName: 'standardLine3', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_ACCEL_FREQ_COMPONENT },
					]
				}
			}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_PEAK_ACCEL_FREQ_COMPONENT, {inject: {skipTitle:true,  postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_PEAK_ACCEL_FREQ_COMPONENT, {inject: {skipTitle:true,  postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_PEAK_ACCEL_FREQ_COMPONENT, {inject: {skipTitle:true,  postfix_by_metric: {[METRIC]:'(6-5300Hz)', [IMPERIAL]:'(360-318k CPM)'} }}),
			]
		},

		{
			chart_id: 'all_axis_rms_velocity',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.rms_velocity')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (6-1000Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (360-60k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY },
						{ setName: 'standardLine2', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY },
						{ setName: 'standardLine3', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY },
					]
				}
			}),
			requestsList: [
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.X_RMS_VELOCITY, {inject: {skipTitle:1, checkForDuplicates:1, postfix_by_metric: {[METRIC]:'(6-1000Hz)', [IMPERIAL]:'(360-60k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Y_RMS_VELOCITY, {inject: {skipTitle:1, checkForDuplicates:1, postfix_by_metric: {[METRIC]:'(6-1000Hz)', [IMPERIAL]:'(360-60k CPM)'} }}),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.Z_RMS_VELOCITY, {inject: {skipTitle:1, checkForDuplicates:1, postfix_by_metric: {[METRIC]:'(6-1000Hz)', [IMPERIAL]:'(360-60k CPM)'} }}),
			]
		},
	],
	'banner_m25': [
		{
			chart_id: `chart-${BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS}`,
			// chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (1000-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' }, 
			updateChartTitleByMetric: true,
			canBeHidden: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning', 'lube'],
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumnLube', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS},
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_IMPACT_INDEX },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_PEAK },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CREST_FACTOR },
						// { setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CURTOSIS }
					]
				}
			}),
			// seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS, {includeStatsLines:1}),
			requestsList: [
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_RMS),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_IMPACT_INDEX, {inject: {skipTitle:1, toFixedNum: 3, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_PEAK, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CREST_FACTOR, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				// bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CURTOSIS, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(1000-5300Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},
		{
			chart_id: `chart-${BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION}`,
			// chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (1000-5300Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' }, 
			updateChartTitleByMetric: true,
			canBeHidden: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning'],
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumn', param: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.HFE_IMPACT_INDEX },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_CREST_FACTOR },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_KURTOSIS }
					]
				}
			}),
			// seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION, {includeStatsLines:1}),
			requestsList: [
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_RMS_ACCELERATION, {inject: {postfix_by_metric: {[METRIC]:'(1000-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HFE_IMPACT_INDEX, {inject: {skipTitle:1, toFixedNum: 3}}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(1000-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_CREST_FACTOR, {inject: {skipTitle:1, toFixedNum: 2,/* postfix_by_metric: {[METRIC]:'(1000-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'}*/ }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_KURTOSIS, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(1000-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},
		{
			chart_id: `chart-${BANNER_M25_PARAMETERS_TYPES.FULL_BAND_RMS_ACCELERATION}`,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (6-10000Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' }, 
			updateChartTitleByMetric: true,
			canBeHidden: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning'],
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumn', param: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_RMS_ACCELERATION },
						{ setName: 'invisibleLine', param: BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_CREST_FACTOR },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_KURTOSIS },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_PEAK_ACCELERATION_FREQ },
					]
				}
			}),
			// seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_M25_PARAMETERS_TYPES.FULL_BAND_RMS_ACCELERATION, {includeStatsLines:1}),
			requestsList: [
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.FULL_BAND_RMS_ACCELERATION),
				bannerV21vibrationParametersList(BANNER_V2_1_VIBRATION_PARAMETERS_TYPES.MAGNITUDE_FULL_BAND_PK_TO_PK_ACCELERATION, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(6-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.FULL_BAND_CREST_FACTOR, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(6-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.FULL_BAND_KURTOSIS, {inject: {skipTitle:1, toFixedNum: 2, postfix_by_metric: {[METRIC]:'(6-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.FULL_BAND_PEAK_ACCELERATION_FREQ, {inject: {skipTitle:1, toFixedNum: 3, postfix_by_metric: {[METRIC]:'(6-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},
		{
			chart_id: `chart-${BANNER_M25_PARAMETERS_TYPES.RMS_VELOCITY}`,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (6-1000Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' }, 
			updateChartTitleByMetric: true,
			canBeHidden: true,
			inject_options: {	tooltip: { split: false }	},
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 }
				}
			},
			zonesKeysList: ['alarm', 'warning'],
			seriesConfigIncludes: ['fft_flag', 'runtime_flag', 'statistic_lines'],
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardColumn', param: BANNER_M25_PARAMETERS_TYPES.RMS_VELOCITY },
						{ setName: 'invisibleLine', param: BANNER_M25_PARAMETERS_TYPES.PEAK_VELOCITY_FREQ_COMPONENT },
					]
				}
			}),
			// seriesConfigSettings: getSeriesConfigSettingsForBannerV2_1For(BANNER_M25_PARAMETERS_TYPES.RMS_VELOCITY, {includeStatsLines:1}),
			requestsList: [
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.RMS_VELOCITY),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.PEAK_VELOCITY_FREQ_COMPONENT, {inject: {skipTitle:1, toFixedNum: 3, postfix_by_metric: {[METRIC]:'(6-1000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},
		{
			chart_id: `chart-${BANNER_M25_PARAMETERS_TYPES.TEMPERATURE}`,
			canBeHidden: true,
			transformator_settings: {
				specification: {
					setupFlagsData: { enable_runtime_tracker: 1 },
					setupPointsData: { skipMaxValues: [2981.03, 1638.35] }
				}
			},
			seriesConfigIncludes: ['runtime_flag'],
			requestsList: [sensorParametersList(BANNER_M25_PARAMETERS_TYPES.TEMPERATURE)]
		},
		// ------------

		{
			chart_id: 'ultrasound_high_frequency_impact_index',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.ultrasound_high_frequency_impact_index')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (20-40kHz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_IMPACT_INDEX },
						{ setName: 'standardLine2', param: BANNER_M25_PARAMETERS_TYPES.HFE_IMPACT_INDEX },
					]
				}
			}),
			requestsList: [
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_IMPACT_INDEX, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(20-40kHz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HFE_IMPACT_INDEX, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},
		{
			chart_id: 'ultrasound_high_frequency_peak',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.ultrasound_high_frequency_peak')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (20-40kHz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_PEAK },
						{ setName: 'standardLine2', param: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION },
					]
				}
			}),
			requestsList: [
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_PEAK, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(20-40kHz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_PK_ACCELERATION, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},

		{
			chart_id: 'crest_factor',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.crest_factor')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (20-40kHz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						{ setName: 'standardLine1', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CREST_FACTOR },
						{ setName: 'standardLine2', param: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_CREST_FACTOR },
						{ setName: 'standardLine3', param: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_CREST_FACTOR },
					]
				}
			}),
			requestsList: [
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CREST_FACTOR, {inject: {skipTitle:true, }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_CREST_FACTOR, {inject: {skipTitle:true, /*postfix_by_metric: {[METRIC]:'(1000-10600Hz)', [IMPERIAL]:'(60k-318k CPM)'}*/ }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.FULL_BAND_CREST_FACTOR, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-10600Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},
		{
			chart_id: 'kurtosis',
			updateChartTitleByMetric: true,
			chart_title_prefix: `${Lang.tt('constants.kurtosis')} `,
			chart_title_postfix_by_metric: { [METRIC_SYSTEM_TYPES.METRIC]:' (1000-10000Hz)', [METRIC_SYSTEM_TYPES.IMPERIAL]:' (60k-318k CPM)' },
			// chart_title_postfix: ')',
			canBeHidden: true,
			setValue: ['chartIsHidden', true],
			inject_options: {
				chart: { type: 'line' },
				navigator: { series: { type: 'spline' } },
				tooltip: { split: false }
			},
			transformator_settings: {
				specification: {
					setupPlotlinesData: false,
					setupFlagsData: false,
					setupPointsData: { enableZones: false }
				}
			},
			seriesConfig: buildCustomSeriesConfig({
				pointsData: {
					seriesConfigsList: [
						// { setName: 'standardLine1', param: BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CURTOSIS },
						{ setName: 'standardLine2', param: BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_KURTOSIS },
						{ setName: 'standardLine3', param: BANNER_M25_PARAMETERS_TYPES.FULL_BAND_KURTOSIS },
					]
				}
			}),
			requestsList: [
				// bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.ULTRASOUND_CURTOSIS, {inject: {skipTitle:true }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.HIGH_FREQ_KURTOSIS, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(1000-10000Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
				bannerM25ParametersList(BANNER_M25_PARAMETERS_TYPES.FULL_BAND_KURTOSIS, {inject: {skipTitle:true, postfix_by_metric: {[METRIC]:'(10-10600Hz)', [IMPERIAL]:'(60k-318k CPM)'} }}),
			]
		},
	],
};

const generateListsConfig = (config_key, settings) => {
	if (config_key == 'banner_v2_generic') {
		const { sensorItem } = settings.resources.payload_1;
		const measurement =
			(settings.resources.filters && settings.resources.filters.measurement) ||
			storeGetter('sensors.statistics_filters').measurement ||
			METRIC;
		const measurementUnitsList = storeGetter('measurement_units.itemsList') || [];

		// console.log(sensorItem.bannerV2Subtype)
		if (sensorItem.bannerV2Subtype) {
			const { bannerV2SubtypeParameters } = sensorItem;
			// console.log(sensorItem)
			return sensorItem.bannerV2Subtype.parameters.map(param => {
				const { node_parameter, graph_type, id, is_visible_by_default } = param;
				let units = param.units,
						name = param.name;
				let metric_unit_id = param.metric_unit_id;
				let imperial_unit_id = param.imperial_unit_id;
				let defaultMeasurement = getMeasurementUnitDefaultMeasurement(param);
				let measurement_unit_id = getMeasurementUnitIdByMeasurement({
					parameterItem: { metric_unit_id, imperial_unit_id },
					measurement: defaultMeasurement
				});
				let measurementUnit = resolveMeasurementUnitObject({
					unit: param.metric_unit || param.imperial_unit,
					measurementUnitId: measurement_unit_id,
					items: measurementUnitsList
				});
				let y_formula = shouldConvertMeasurementUnit({
					unit: measurementUnit,
					measurement,
					defaultMeasurement
				})
					? buildMeasurementUnitFormula(
						getMeasurementUnitFormulaForMeasurement({
							unit: measurementUnit,
							measurement
						})
					)
					: null;
				const overwritingParam = findItemBy('parent_id', id, bannerV2SubtypeParameters);
				
				if (overwritingParam) {
					units = overwritingParam.units;
					name = overwritingParam.name;
					metric_unit_id =
						overwritingParam.metric_unit_id != null
							? overwritingParam.metric_unit_id
							: metric_unit_id;
					imperial_unit_id =
						overwritingParam.imperial_unit_id != null
							? overwritingParam.imperial_unit_id
							: imperial_unit_id;
					defaultMeasurement =
						getMeasurementUnitDefaultMeasurement(overwritingParam) != null
							? getMeasurementUnitDefaultMeasurement(overwritingParam)
							: defaultMeasurement;
					measurement_unit_id = getMeasurementUnitIdByMeasurement({
						parameterItem: { metric_unit_id, imperial_unit_id },
						measurement: defaultMeasurement
					});
					measurementUnit = resolveMeasurementUnitObject({
						unit:
							overwritingParam.metric_unit ||
							overwritingParam.imperial_unit ||
							param.metric_unit ||
							param.imperial_unit,
						measurementUnitId: measurement_unit_id,
						items: measurementUnitsList
					});
					y_formula = shouldConvertMeasurementUnit({
						unit: measurementUnit,
						measurement,
						defaultMeasurement
					})
						? buildMeasurementUnitFormula(
							getMeasurementUnitFormulaForMeasurement({
								unit: measurementUnit,
								measurement
							})
						)
						: null;
				}

				let chart = {
					chart_id: `chart-${node_parameter}`,
					parameter_id: node_parameter,
					canBeHidden: true,
					setValue: ['chartIsHidden', !is_visible_by_default],
					customSettings: { parameterItem: param },
					config_settings: { showCalculateThresholdsButton: true },
					transformator_settings: {
						specification: {
							setupFlagsData: { enable_fft: 1, enable_runtime_tracker: 1 },
							setupPointsData: {
								yKey: 'unit'
							}
						}
					},
					applyColorSchemeOnSeriesReady: true,
					zonesKeysList: ['alarm', 'warning', 'off_alarm'],
					seriesConfigIncludes: ['off_alarm', 'fft_flag', 'runtime_flag', 'statistic_lines'],
					requestsList: [{
						id: node_parameter,
						icon: 'icon-acceleration',
						name,
						units,
						defaultMeasurement,
						measurement_unit_id,
						metric_unit_id,
						imperial_unit_id,
						measurementUnit,
						y_formula
					}]
				}
				if (graph_type === CHART_TYPES.LINE || graph_type === CHART_TYPES.AREASPLINE) {
					let type = findItemBy('id', graph_type, chartTypesList());
					
					chart.applyColorSchemeToSeriesZones = true;
					
					chart.inject_options = {
						chart: { type: type.chart_type },
						// chart: { type: 'column' },
						navigator: { series: { type: type.chart_type } }
					}

					/*if (y_formula) {
						chart.transformator_settings.specification.setupPointsData.y_formula = y_formula;
					}*/

					if (graph_type === CHART_TYPES.AREASPLINE) {
						chart.inject_options.plotOptions = {
							areaspline: {
								boostThreshold: 11000,
								turboThreshold: 11000,
								fillOpacity: 0.5,
								fillColor: {
									linearGradient: {
										x1: 0,
										y1: 0,
										x2: 0,
										y2: 1
									},
									stops: [
										[0, 'rgba(54, 205, 138, 0.7)'],
										[1, 'rgba(54, 205, 138, 0.05)']
									]
								}
							}
						}
					}

					chart = mergeObjects(chart, settingsForSplineChartsWithSplittedSeries);
					chart.seriesConfigSettings = getSplineSeriesConfigSettings(param.alarm_type);
					// console.log(chart.seriesConfigSettings)
				}
				// console.log('chart', chart)

				return chart;
			});
		}
	} else if (config_key == 'banner_temp_vibe_v2_1' || config_key == 'banner_m25') {
		// console.log(settings.resources)
		if (settings.resources && settings.resources.payload_1.sensorItem.is_lube_mode) {
			const { sensorItem } = settings.resources.payload_1;
			return chartsListsConfig1[config_key].map(chart => {
				if (
					chart.requestsList[0].id == sensorItem.lube_trigger_metric_type
					&& !(chart.transformator_settings?.specification?.setupPlotlinesData === false)
				) {
					chart.zonesKeysList.push('lube');
					chart.seriesConfigIncludes.push('lube');
					chart.transformator_settings = mergeObjects(
						chart.transformator_settings, {
							specification: {
								setupFlagsData: {	enable_lube: 1 }
							}
						}
					);
					return chart;
				}
				return chart;
			});
		} else {
			return cloneDeep(chartsListsConfig1[config_key])
		}
	}

	return [];
};

// ----------------------------------------

const defaultSeriesConfig1 = {
	pointsData: {
		// setupOptions: [
		// { key: 'tooltip', method: setupSensorTooltip, /*payload: resources*/ }
		// some_options: { methodName: 'methodName' }
		// ],
		seriesConfigsList: {
			0: [
				// 0 - request_key
				{
					id: 'transparent-serie',
					data_path: 'transparent',
					template: 'edgeTransparent',
					inject: { customSettings: { event_key: null } }
				},
				{
					id: 'base-serie',
					data_path: 'base',
					template: 'sensor.base',
					event_key: 'pointClickEvent',
					inject: { customSettings: { threshold_level: SENSOR_THRESHOLD_TYPES.BASELINE } }
				},
				{
					id: 'warning-serie',
					data_path: 'warning',
					template: 'sensor.warning',
					event_key: 'pointClickEvent', /*tooltip: { inject: { valueSuffix: ' mm'} }*/
					inject: { customSettings: { threshold_level: SENSOR_THRESHOLD_TYPES.WARNING } }
				},
				{
					id: 'alarm-serie',
					data_path: 'alarm',
					template: 'sensor.alarm',
					event_key: 'pointClickEvent',
					inject: { customSettings: { threshold_level: SENSOR_THRESHOLD_TYPES.ALARM } }
				},
				{
					id: 'anomaly-serie',
					data_path: 'anomaly',
					template: 'sensor.anomaly',
					event_key: 'pointClickEvent'
				},
				{
					id: 'off_alarm-serie',
					data_path: 'off_alarm',
					template: 'sensor.off_alarm',
					event_key: 'pointClickEvent',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'off_alarm',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'lube-serie',
					data_path: 'lube',
					template: 'sensor.lube',
					event_key: 'pointClickEvent',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'lube',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				// не plotlinesSeriesData потому что тогда перезатирается в setupPlotlinesData
				{
					id: 'average_current-threshold-serie',
					custom_data_path: 'plotlinesSeriesData.actual_average_metric_stat_for_current_period',
					template: 'sensor.actual_average_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'statistic_lines',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'alarm_current-threshold-serie',
					custom_data_path: 'plotlinesSeriesData.alarm_zone_current',
					// custom_data_path: 'statsData.alarm_zone_current',
					template: 'sensor.alarm_actual_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'statistic_lines',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'warning_current-threshold-serie',
					custom_data_path: 'plotlinesSeriesData.warning_zone_current',
					// custom_data_path: 'statsData.warning_zone_current',
					template: 'sensor.warning_actual_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'statistic_lines',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'period_average_threshold-serie',
					custom_data_path: 'plotlinesSeriesData.average_metric_value',					
					// custom_data_path: 'statsData.average_metric_value',
					template: 'sensor.period_average_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'statistic_lines',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'period_warning_threshold-serie',
					// data_path: 'warning_level',
					custom_data_path: 'statsData.warning_level',					
					template: 'sensor.period_warning_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'statistic_lines',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'period_alarm_threshold-serie',
					// data_path: 'alarm_level',
					custom_data_path: 'statsData.alarm_level',
					template: 'sensor.period_alarm_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'statistic_lines',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
			]
		}
	},
	flagsData: {
		seriesConfigsList: {
			0: [
				{
					id: 'acute-flag-serie',
					data_path: 'acute_statistics',
					template: 'sensor.acute_flag',
					// event_key: 'pointClickEvent'
				},
				{
					id: 'chronic-flag-serie',
					data_path: 'chronic_statistics',
					template: 'sensor.chronic_flag',
					// event_key: 'pointClickEvent'
				},
				{
					id: 'crashes-flag-serie',
					data_path: 'crashes_statistics',
					template: 'sensor.crashes_flag',
					// event_key: 'pointClickEvent'
				},
				{
					id: 'note-flag-serie',
					data_path: 'notes_statistics',
					template: 'sensor.notes_flags',
					event_key: 'pointClickEvent'
				},
				{
					id: 'duplicate-note-flag-serie',
					data_path: 'duplicate_notes_statistics',
					template: 'sensor.duplicate_notes_flags',
					// event_key: 'pointClickEvent'
				},
				{
					id: 'pending_fft-flag-serie',
					data_path: 'pending_fft_statistics',
					template: 'sensor.fft_pending_flag',
					event_key: 'openFFTCharts',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'fft_flag',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'failed_fft-flag-serie',
					data_path: 'failed_fft_statistics',
					template: 'sensor.fft_failed_flag',
					event_key: 'openFFTCharts',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'fft_flag',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'completed_fft-flag-serie',
					data_path: 'completed_fft_statistics',
					template: 'sensor.fft_completed_flag',
					event_key: 'openFFTCharts',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'fft_flag',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'fft-lock-flag-serie',
					data_path: 'fft_lock_statistics',
					template: 'sensor.lube_lock_log_flag',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'fft_flag',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'lube-flag-serie_successfull',
					data_path: 'lube_statistics_successfull',
					template: 'sensor.lube_flag_successfull',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'lube',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'lube-flag-serie',
					data_path: 'lube_statistics',
					template: 'sensor.lube_flag',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'lube',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'lube-lock-log-flag-serie',
					data_path: 'lube_lock_logs_statistics',
					template: 'sensor.lube_lock_log_flag',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'lube',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'runtime-flag-serie',
					data_path: 'runtime_trackers_statistics',
					template: 'sensor.runtime_trackers_flag',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'runtime_flag',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'anomaly-flag-serie',
					data_path: 'flat_metric_data_anomaly_statistics',
					template: 'sensor.anomaly_flag'
				}
			]
		}
	},
	historyData: {
		seriesConfigsList: {
			0: [
				{
					id: 'alarm_history-serie',
					data_path: 'alarm_zone',
					template: 'sensor.alarm_history'
				},
				{
					id: 'warning_history-serie',
					data_path: 'warning_zone',
					template: 'sensor.warning_history'
				},
				{
					id: 'off_alarm_history-serie',
					data_path: 'off_alarm_zone',
					template: 'sensor.off_alarm_history',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'off_alarm',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'lubeline-history-serie',
					data_path: 'lube_zone',
					template: 'sensor.lubeline_history',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'lube',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'baseline-history-serie',
					data_path: 'baseline_zone',
					template: 'sensor.baseline_history',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'baseline',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				}
			]
		}
	},
	plotlinesSeriesData: {
		seriesConfigsList: {
			0: [
				{
					id: 'alarm_threshold-serie',
					data_path: 'alarm_zone',
					template: 'sensor.alarm_threshold',
					inject: { customSettings: { threshold_level: SENSOR_THRESHOLD_TYPES.ALARM } }
				},
				{
					id: 'warning_threshold-serie',
					data_path: 'warning_zone',
					template: 'sensor.warning_threshold',
					inject: { customSettings: { threshold_level: SENSOR_THRESHOLD_TYPES.WARNING } }
				},
				{
					id: 'off_alarm_threshold-serie',
					data_path: 'off_alarm_zone',
					template: 'sensor.off_alarm_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'off_alarm',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'lube_threshold-serie',
					data_path: 'lube_zone',
					template: 'sensor.lubeline_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'lube',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'baseline_threshold-serie',
					data_path: 'baseline_zone',
					template: 'sensor.baseline_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'baseline',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
			]
		}
	},

	plotlinesData: {
		plotlinesConfigsList: {
			0: [
				{
					id: 'alarm-plotline',
					data_path: 'alarm_zone',
					template: 'sensor.alarm_plotline',
					customSettings: {
						data_path: 'alarm_zone',
						draggable: true,
						data_accessor_min: 'levelZoneData.warning_zone'
					}
				},
				{
					id: 'warning-plotline',
					data_path: 'warning_zone',
					template: 'sensor.warning_plotline',
					customSettings: {
						data_path: 'warning_zone',
						draggable: true,
						data_accessor_max: 'levelZoneData.alarm_zone'
					}
				},
				{
					id: 'off_alarm-plotline',
					data_path: 'off_alarm_zone',
					template: 'sensor.off_alarm_plotline',
					customSettings: { data_path: 'off_alarm_zone', draggable: true },
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'off_alarm',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				},
				{
					id: 'lube-plotline',
					data_path: 'lube_zone',
					template: 'sensor.lubeline_plotline',
					customSettings: { data_path: 'lube_zone', draggable: true },
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'lube',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				}
			]
		}
	},

	/*additionalSeriesData: {
		seriesConfigsList: {
			0: [
				{
					id: 'period_average_threshold-serie',
					data_path: 'data_average_value',
					skipHistory: true,
					
					template: 'sensor.baseline_threshold',
					conditionSettings: {
						conditions: [
							{
								array_method: 'some',
								data_value: 'average',
								control_value_prop: 'seriesConfigIncludes'
							}
						]
					}
				}
			]
		}
	},*/
};

const getRequestList1 = ({parameter, sensor}) => {
	const parameterItem = sensorParametersList(parameter) ||
				sensorParametersListNCD(parameter) ||
				sensorUltraSoundParametersList(parameter) ||
				sensorBannerUltraSoundParametersList(parameter) ||
				sensorParametersListUltrasoundNCD(parameter) ||
				sensorParametersListHumidity(parameter) ||
				sensorParametersListVFDPressureRPMAmps(parameter) ||
				sensorLubematrixSDTtempC_ParametersList(parameter) ||
				bannerV21vibrationParametersList(parameter) ||
				sensorLubematrixSDTtempF_ParametersList(parameter);
				// sensorExtraVibrationParametersList(parameter);

	if (parameterItem) {
		return [parameterItem];
	} else if (sensor) {
		const chartsConfigs = generateListsConfig('banner_v2_generic', {
			resources: {
				payload_1: { sensorItem: sensor }
			}
		});

		const chartConfigItem = findItemBy('parameter_id', parameter, chartsConfigs);

		if (chartConfigItem) {
			return chartConfigItem.requestsList;
		}
	}

	return [];
};

const filterDefaultSeriesConfig = ({
	data_value,
	chart_config,
	seriesGroupsList
}) => {
	let defaultSeriesConfigLoc = {};

	seriesGroupsList.forEach(sg => {
		defaultSeriesConfigLoc[sg] = defaultSeriesConfig1[sg];
	});

	let seriesConfig = cloneDeep(defaultSeriesConfigLoc);

	for (const key in seriesConfig) {
		for (const sub_key in seriesConfig[key]) {
			if (seriesConfig[key][sub_key]) {
				seriesConfig[key][sub_key][0] = seriesConfig[key][sub_key][0].filter(si => {
					return si.conditionSettings
						? validateBySettings({
								...si.conditionSettings,
								data_value: data_value,
								dataObj: chart_config
						  })
						: true;
				});
			}
		}

		/*if (seriesConfig[key].plotlinesConfigsList) {
			seriesConfig[key].plotlinesConfigsList = seriesConfig[key].plotlinesConfigsList.filter(si => {
				return si.conditionSettings ? 
					validateBySettings({...si.conditionSettings, data_value: data_value, dataObj: chart_config })
					: true;
			});
		}*/
	}

	return seriesConfig;
};

// ----------------

export const splineSeriesConfigSettings = (alarm_type) =>
	cloneDeep(getSplineSeriesConfigSettings(alarm_type));

export const getRequestList = payload => getRequestList1(payload);

export const chartsListsConfig = (key, settings = {}) => {
	if (
		key == 'banner_v2_generic' ||
		key == 'banner_temp_vibe_v2_1' ||
		key == 'banner_m25'
	) {
		return generateListsConfig(key, settings);
	}
	return cloneDeep(chartsListsConfig1[key])
};
export const defaultSeriesConfig = payload => filterDefaultSeriesConfig(payload);
