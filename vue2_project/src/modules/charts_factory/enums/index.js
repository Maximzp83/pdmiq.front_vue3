import { getObjectVal } from '@/helpers';
import { LEVEL_ZONES } from '@/constants/global';
import { statsLinesLabelFormatter } from '../helpers';

export const baseColor = '#059966';
export const warningColor = '#ffde32';
export const offAlarmColor = '#777777';
export const crashColor = 'eeeeee';
export const noteColor = '#ffffff';
export const blueColor = '#0e52ef';
export const alarmColor = '#ff0000';
export const lubeColor = '#75c2db';

export const colorsList = [
	'#0ff',
	'rgba(170, 0, 255, 0.5)',
	'#0050EF',
	'#36CD8A',
	'#6A00FF',
	'#008A00',
	'#c41d1d',
	'#faff00',
	'#ffaa00',
	'#706c6c'
];

const serie_template = {
	showInNavigator: true,
	data: [],
	// name: '',
	// yAxis: 0,
	zIndex: 16,
	xAxis: 0
	// cursor: 'pointer'
};

const threshold_template = {
	type: 'line',
	className: 'thresholds-line',
	enableMouseTracking: false,
	states: {
		hover: { enabled: false },
		inactive: { opacity: 1, zIndex: 12 }
	},
	lineWidth: 2,
	opacity: 1,
	step: true,
	zIndex: 12,
	xAxis: 1
};

const history_template = {
	type: 'line',
	className: 'thresholds-line history-line',
	states: {
		inactive: { opacity: 0.9 }
	},
	dashStyle: 'Dash',
	width: 2,
	step: true,
	zIndex: 14,
	xAxis: 1	
	// enableMouseTracking: false
};

const plotline_template = {
	width: 3,
	value: 0,
	className: 'plotline',
	/*states: {
		hover: { enabled: false }
	},*/
	zIndex: 15
};

const oee_plotline_template = {
	...plotline_template,
	dash_offset: 0,
	width: 2,
	states: {
		hover: { enabled: false }
	},
	className: ' ', //this prop critical needed. but no idea why
	dashStyle: 'Dash'
};

const flags_template = {
	type: 'flags',
	zIndex: 1600,
	lineWidth: 2,
	// cropThreshold: 150,
	crisp: false,
	clip: false,
	allowOverlapX: true,
	y: 20,
	width: 15,
	height: 16
};

const fft_flag_template = {
	...flags_template,
	zIndex: 2000,
	style: { cursor: 'pointer' },
	color: crashColor,
	y: 24,	
	// shape: 'url(/static/img/icons/fft_icon.svg)',
	className: 'crash-flag ncd-fft-flag',
	custom_id: 'ncd-fft-flag'
};

const cursor_flag_template = {
	type: 'flags',
	lineColor: '#33CD8A',
	useHTML: true,
	style: { fontWeight: 500, fontSize: '13px' },
	shape: 'squarepin',
	clip: false,
	// enableMouseTracking: false,
	// y: -195,
	width: undefined,
	height: 28,
	borderRadius: 2,
	className: 'cursor-flag-serie',
	lineWidth: 1,
	allowOverlapX: true,
	zIndex: 16,
	dragDrop: {
		draggableX: true,
		dragMinX: 0
	}
	// inactiveOtherPoints: true
};
/*const downtime_flag_template = {
	type: 'column',
	title: ' ',
	name: ' ',
	zIndex: 100,

	point: {
		// events: {  click: () => {} }
	},

	allowOverlapX: true,

	// dataLabels: {
	// 	useHTML: true,
	// 	enabled: true,
	// 	className: 'custom-data-label down-time',
	// 	format: '<i class="icomoon icon-attention"/>',
	// },

	tooltip: {
		pointFormat: '',
		valueSuffix: '',
		shared: false
	},

	// color: crashColor,
	className: 'down-time-flag'
};*/

const chartSeriesTemplates1 = {
	edgeTransparent: {
		...serie_template,
		custom_id: 'transparent_series',
		type: 'column',
		enableMouseTracking: false,
		color: 'transparent'
	},

	pie: {
		base: {
			name: ' '
		}
	},

	bar: {
		base: {
			name: ' '
		}
	},

	fft: {
		base: {
			// custom_id: 'base_series',
			name: ' ',
			color: '#1E90FF'
		}
	},

	oee: {
		counters: {
			custom_id: 'count',
			name: 'Count',
			yAxis: 0,
			type: 'spline',
			color: '#009C67',
			marker: { symbol: 'circle' },
			zIndex: 10
		},

		totalWorkday: {
			custom_id: 'totalWorkdayCount',
			name: 'Total workday count',
			yAxis: 1,
			type: 'areaspline',
			lineWidth: 3,
			color: 'rgba(255, 218, 42, 0.8)',
			marker: { symbol: 'triangle' },
			fillColor: {
				linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
				stops: [
					[0, 'rgba(255, 218, 42, 0.5)'],
					[1, 'rgba(255, 218, 42, 0)']
				]
			}
		},

		plotline_ability: {
			...oee_plotline_template,
			color: '#2CCD89'
		},

		plotline_real_ability: {
			...oee_plotline_template,
			color: '#4A90E2'
		},

		plotline_production_hourly_rate: {
			...oee_plotline_template,
			color: '#a770ff'
		},

		downtime_flag: {
			type: 'column',
			title: ' ',
			name: ' ',
			zIndex: 100,
			// point: {},
			allowOverlapX: true,
			tooltip: {
				pointFormat: '',
				valueSuffix: '',
				shared: false
			},
			// color: crashColor,
			className: 'down-time-flag'
		}
	},

	sensor: {
		invisible: {
			...serie_template,
			custom_id: 'invisible_series',
			color: 'transparent',
			showInNavigator: false,
			zIndex: 1,
			xAxis: 1
		},

		base: {
			...serie_template,
			custom_id: 'base_series',
			color: baseColor,
			zIndex: 1,
		},
		warning: {
			...serie_template,
			custom_id: 'warning_series',
			color: warningColor,
			zIndex: 2,
		},
		alarm: {
			...serie_template,
			custom_id: 'alarm_series',
			color: alarmColor,
			zIndex: 3,
		},
		off_alarm: {
			...serie_template,
			custom_id: 'off_alarm_series',
			color: 'black'
		},
		lube: {
			...serie_template,
			custom_id: 'lube_series',
			color: lubeColor,
			zIndex: 4,
			// pointPadding: 0,
			// groupPadding: 0
		},

		alarm_history: {
			...history_template,
			name: 'old alarm',
			color: 'red',
			dash_offset: 0
		},
		warning_history: {
			...history_template,
			name: 'old warning',
			color: 'orange',
			dash_offset: 6
		},
		high_alarm_history: {
			...history_template,
			name: 'old high alarm',
			color: 'red',
			dash_offset: 6
		},
		low_alarm_history: {
			...history_template,
			name: 'old low alarm',
			color: blueColor,
			dash_offset: 6
		},
		baseline_history: {
			...history_template,
			name: 'old baseline',
			color: 'grey',
			dash_offset: 6,
			zIndex: 15
		},
		off_alarm_history: {
			...history_template,
			name: 'old off_alarm',
			color: 'black',
			dash_offset: 6,
			zIndex: 15
		},
		lubeline_history: {
			...history_template,
			name: 'old lubeline',
			color: lubeColor,
			dash_offset: 6,
			zIndex: 15
		},

		alarm_threshold: {
			...threshold_template,
			// id: `plotline-overlay-3`, //LEVEL_ZONES.ALARM id
			color: 'red'
		},
		warning_threshold: {
			...threshold_template,
			// id: `plotline-overlay-2`, //LEVEL_ZONES.WARNING id
			color: 'orange'
		},
		humidity_warning_threshold: {
			...threshold_template,
			// id: `plotline-overlay-2`, //LEVEL_ZONES.WARNING id
			color: blueColor
		},
		baseline_threshold: {
			...threshold_template,
			// id: `plotline-overlay-1`, //LEVEL_ZONES.BASELINE id
			color: 'gray',
			zIndex: 15
		},
		lubeline_threshold: {
			...threshold_template,
			// id: `plotline-overlay-8`, //LEVEL_ZONES.LUBELINE id
			color: lubeColor,
			zIndex: 15
		},
		off_alarm_threshold: {
			...threshold_template,
			// id: `plotline-overlay-7`, //LEVEL_ZONES.OFF_ALARM id
			color: offAlarmColor,
			zIndex: 15
		},
		alarm_actual_threshold: {
			...threshold_template,
			color: 'red',
			className: 'statistics-line',
			dataLabels: {
				enabled: true,
				color: 'red',
				style: { textOutline: 'none' },
				allowOverlap: true,
				x: -100,
				formatter: statsLinesLabelFormatter
			},
			zIndex: 18
		},
		period_alarm_threshold: {
			...threshold_template,
			color: '#8c2a2a',
			className: 'statistics-line',
			dataLabels: {
				enabled: true,
				color: '#8c2a2a',
				style: { textOutline: 'none' },
				allowOverlap: true,
				x: -150,
				formatter: statsLinesLabelFormatter
			},
			zIndex: 18
		},
		warning_actual_threshold: {
			...threshold_template,
			color: 'orange',
			className: 'statistics-line',
			dataLabels: {
				enabled: true,
				color: 'orange',
				style: { textOutline: 'none' },
				allowOverlap: true,
				x: -50,
				formatter: statsLinesLabelFormatter
			},
			zIndex: 18
		},
		period_warning_threshold: {
			...threshold_template,
			color: '#ad8c16',
			className: 'statistics-line',
			dataLabels: {
				enabled: true,
				color: '#ad8c16',
				style: { textOutline: 'none' },
				allowOverlap: true,
				x: -200,
				formatter: statsLinesLabelFormatter
			},
			zIndex: 18
		},
		period_average_threshold: {
			...threshold_template,
			color: 'violet',
			className: 'statistics-line',
			dataLabels: {
				enabled: true,
				style: { textOutline: 'none' },
				allowOverlap: true,
				color: 'violet',
				formatter: statsLinesLabelFormatter
			},
			zIndex: 18
		},
		actual_average_threshold: {
			...threshold_template,
			color: '#9a2dc7',
			className: 'statistics-line',
			dataLabels: {
				enabled: true,
				style: { textOutline: 'none' },
				allowOverlap: true,
				color: '#9a2dc7',
				formatter: statsLinesLabelFormatter
			},
			zIndex: 18
		},
		
		// ----------------------
		// downtime_flag: downtime_flag_template,
		alarm_plotline: {
			...plotline_template,
			zone_id: LEVEL_ZONES.ALARM,
			zone_label: 'constants.Alarm_Zone',
			zone_key: 'alarm_zone',
			color: 'red',
			min_value: 0
		},
		warning_plotline: {
			...plotline_template,
			zone_id: LEVEL_ZONES.WARNING,
			zone_label: 'constants.Warning_Zone',
			zone_key: 'warning_zone',
			color: 'orange',
			max_value: 0
		},
		baseline_plotline: {
			...plotline_template,
			zone_id: LEVEL_ZONES.BASELINE,
			zone_label: 'constants.Baseline_Zone',
			zone_key: 'baseline_zone',
			color: 'gray'
		},
		off_alarm_plotline: {
			...plotline_template,
			zone_id: LEVEL_ZONES.OFF_ALARM,
			zone_label: 'constants.Off_Alarm_Zone',
			zone_key: 'off_alarm_zone',
			color: offAlarmColor
		},
		lubeline_plotline: {
			...plotline_template,
			zone_id: LEVEL_ZONES.LUBELINE,
			zone_label: 'constants.Lubeline_Zone',
			zone_key: 'lubeline_zone',
			color: lubeColor
		},
		low_alarm_plotline: {
			...plotline_template,
			zone_id: LEVEL_ZONES.WARNING,
			zone_label: 'constants.Low_Alarm_Zone',
			zone_key: 'low_alarm_zone',
			color: blueColor
		},

		// ----------------------
		lube_flag_successfull: {
			...flags_template,
			color: '#3366cc',
			style: { color: '#3366cc' },
			shape: 'squarepin',
			// enableMouseTracking: false,
			y: -270,
			width: 26
		},
		lube_flag: {
			...flags_template,
			color: '#3366cc',
			style: { color: '#3366cc' },
			shape: 'squarepin',
			// enableMouseTracking: false,
			y: -270,
			width: 26,
			zIndex: 2100
		},

		lube_lock_log_flag: {
			...flags_template,
			zIndex: 2000,
			className: 'crash-flag lock-log-flag',
			custom_id: 'lube_lock_flag'
			// style: { color: '#3366cc' }
		},

		success_adjustments_flag: {
			...flags_template,
			zIndex: 2000,
			color: crashColor,
			shape: 'url(/static/img/icons/success.svg)',
			className: 'crash-flag success-adjust-flag'
		},

		crashes_flag: {
			...flags_template,
			zIndex: 2000,
			color: crashColor,
			shape: 'url(/static/img/icons/warning.svg)',
			className: 'crash-flag',
			custom_id: 'crashes_flag',
			style: { color: '#3366cc' }
		},
		acute_flag: {
			...flags_template,
			zIndex: 2000,
			color: crashColor,
			shape: 'url(/static/img/icons/acute_icon.svg)',
			className: 'crash-flag',
			custom_id: 'crashes_flag'
			// style: { color: '#3366cc' }
		},
		chronic_flag: {
			...flags_template,
			zIndex: 2000,
			color: crashColor,
			shape: 'url(/static/img/icons/chronic_icon.svg)',
			className: 'crash-flag',
			custom_id: 'crashes_flag'
			// style: { color: '#3366cc' }
		},

		warning_flag: {
			...flags_template,
			zIndex: 2000,
			// color: crashColor,
			shape: 'url(/static/img/icons/warning_yellow.svg)',
			// shape: 'url(/static/img/icons/success.svg)',
			className: 'crash-flag',
			custom_id: 'warning_flag'
			// style: { color: '#3366cc' }
		},

		notes_flags: {
			...flags_template,
			custom_id: 'notes_flag',
			zIndex: 2010,
			color: noteColor,
			shape: 'url(/static/img/icons/note-icon-green.svg)',
			className: 'crash-flag note'
		},

		duplicate_notes_flags: {
			...flags_template,
			custom_id: 'duplicate_notes_flag',
			zIndex: 2009,
			color: noteColor,
			shape: 'url(/static/img/icons/note-icon.svg)',
			className: 'crash-flag note'
		},

		fft_pending_flag: {
			...fft_flag_template,
			shape: 'url(/static/img/icons/fft_icon_gray.svg)'
		},

		fft_failed_flag: {
			...fft_flag_template,
			shape: 'url(/static/img/icons/fft_icon.svg)'
		},

		fft_completed_flag: {
			...fft_flag_template,
			shape: 'url(/static/img/icons/fft_icon_green.svg)'
		},

		ncd_fft_flag: {
			...flags_template,
			zIndex: 2000,
			style: { cursor: 'pointer' },
			color: crashColor,
			shape: 'url(/static/img/icons/fft_icon.svg)',
			className: 'crash-flag ncd-fft-flag',
			custom_id: 'ncd-fft-flag'
		},

		runtime_trackers_flag: {
			...flags_template,
			custom_id: 'runtime_flag',
			zIndex: 2000,
			shape: 'url(/static/img/icons/reset_icon.svg)',
			className: 'crash-flag runtime'
		},

		cursor_flag_odd: {
			...cursor_flag_template,
			height: 14,
			y: -195
		},
		cursor_flag_even: {
			...cursor_flag_template,
			height: 14,
			y: -175
		},

		periodic_cursor_flag_odd: {
			...cursor_flag_template,
			height: 14,
			y: -330
		},
		periodic_cursor_flag_even: {
			...cursor_flag_template,
			height: 14,
			y: -310
		},

		peak_flag: {
			...flags_template,
			onSeries: 'base-serie',
			fillColor: '#F30606',
			lineColor: '#e6e6e6',
			style: { fontSize: '12px', color: '#ffffff' },
			shape: 'squarepin',
			enableMouseTracking: false,
			y: -33,
			width: 22,
			height: 22,
			borderRadius: 6,
			lineWidth: 1
		}

		// ---------
		/*extra_vibration_1: { ...extraviv_serie_template, color: '#0ff' },
		extra_vibration_2: {
			...extraviv_serie_template,
			color: 'rgba(170, 0, 255, 0.5)'
		},
		extra_vibration_3: { ...extraviv_serie_template, color: '#0050EF' },
		extra_vibration_4: { ...extraviv_serie_template, color: '#36CD8A' },
		extra_vibration_5: { ...extraviv_serie_template, color: '#6A00FF' },
		extra_vibration_6: { ...extraviv_serie_template, color: '#008A00' },
		extra_vibration_7: { ...extraviv_serie_template, color: '#A4C400' },
		extra_vibration_8: { ...extraviv_serie_template, color: '#6D8764' },
		extra_vibration_9: { ...extraviv_serie_template, color: '#d5d81d' },
		extra_vibration_10: { ...extraviv_serie_template, color: '#647687' }*/
	}
};

export const chartSeriesTemplates = accessors =>
	getObjectVal(chartSeriesTemplates1, accessors);
