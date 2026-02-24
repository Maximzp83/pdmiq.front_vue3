import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';
import { /*getObjectVal,*/ getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';

const localStorageFilters = JSON.parse(localStorage.getItem('sensors_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('statistics_filters')
);
const localStorageReportFilters = JSON.parse(
	localStorage.getItem('equipments_report_filters')
);
const localStorageFFTStatisticsFilters = JSON.parse(
	localStorage.getItem('fft_statistics_filters')
);

const statistics_filters_init = {
	daterange: getDateRange('today', {
		getDateString: true,
		withTime: true
	})
	// metricSystemType: 1
	// daterange: ['2021-12-20', '2021-12-21'],
	// daterange: []
};

const report_filters_init = {
	// daterange: lastWeekDateRange(),
	alert_types: []
	// acknowledgeOnly: false
};

const charts_filters_init = {
	['chart-1']: { y_min: null },
	['chart-2']: { y_min: null },
	['chart-3']: { y_min: null },
	['chart-4']: { y_min: null },
	['chart-5']: { y_min: null },
	['chart-17']: { y_min: null }
};

// console.log(new Date(localStorageStatisticsFilters.daterange_setted_at))
// console.log(resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today', true))

const scopedState = {
	// externalSensorsLoading: false,
	// externalSensorsList: [],

	statistics_filters: localStorageStatisticsFilters
		? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today', true)
		: { ...statistics_filters_init },

	fft_statistics_filters: localStorageFFTStatisticsFilters
		? resetDaterangeIfExpired({ ...localStorageFFTStatisticsFilters }, 'today', true)
		: { ...statistics_filters_init },

	sensorWarningsData: {},
	warningsLoading: false,
	tresholdsLoading: false,
	sensorTresholdsOurData: {},

	// levelZonesSaving: false,
	ultrasoundProccessLoading: false,

	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta },

	charts_filters: {
		...charts_filters_init
	},

	sensorJobSaving: false,

	// --------------
	// sensorCrashesList: [],
	// acknowledgeCrashesList: [],
	// sensorCrashesLoading: false,
	// acknowledgeCrashesLoading: false,
	// acknowledgeCrashSaving: false,
	historyLoading: false,
	historyList: [],
	report_filters: localStorageReportFilters
		? { ...localStorageReportFilters }
		: { ...report_filters_init },

	// report_items_aligment: 'aligment-grid',
	prevent_drop_daterange: false,
	gainAdjustmentInProcess: false
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };

const getters = {
	/*getsensorsByCompany: state => companyId => {
		return state.itemsList.filter(plant => plant.company_id === companyId);
	}*/
};

// actions

const actions = {
	fetch_sensors(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/sensors', payload);
	},

	/*fetch_external_sensors(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			// stateProp: 'externalSensorsList',
			// loadingProp: 'externalSensorsLoading',
			notNotify: true
		};
		return multipurpose_response(storeArgs, '/motorIQ/sensors', extendedPayload);
	},*/

	fetch_sensor(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			stateProp: 'itemData',
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/sensors/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_sensor_warnings(storeArgs, payload) {
		const extendedPayload = {
			method: 'GET',
			// notSetToStore:true,
			stateProp: 'sensorWarningsData',
			alternateResponseProp: 'data',
			prepareData: 'prepareWarningsData',
			loadingProp: 'warningsLoading',
			notNotify: true,
			url: `/sensors/jobs/crashes`,
			...payload
		};
		// console.log(extendedPayload)
		return multipurpose_response(storeArgs, extendedPayload.url, extendedPayload);
	},

	fetch_ncd_fft(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		let urlPostfix = payload.urlPostfix || '';

		return multipurpose_response(
			storeArgs,
			`/sensors/${extendedPayload.sensorId}/ncd/fft${urlPostfix}`,
			// `/sensors/${extendedPayload.sensorId}/ncd/fft/${extendedPayload.fftId}`,
			extendedPayload
		);
	},

	fetch_ncd_rssi(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			prepareData: 'prepareRSSIStatisticsData'
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${extendedPayload.sensorId}/rssi`,
			extendedPayload
		);
	},

	fetch_sensor_problems(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
			// prepareData: 'prepareRSSIStatisticsData'
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${extendedPayload.sensorId}/faults`,
			extendedPayload
		);
	},

	// ------------------
	update_sensor_level_zone(storeArgs, payload) {
		const extendedPayload = {
			method: 'PUT',
			...payload,
			// stateProp: 'sensorLevelZones',
			notLoading: true
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/jobs/${payload.sensorId}/level-zones/${payload.zoneId}`,
			extendedPayload
		);
	},

	save_sensor_level_zones(storeArgs, payload) {
		const extendedPayload = {
			method: 'POST',
			...payload
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/jobs/${payload.sensorId}/level-zones`,
			extendedPayload
		);
	},

	sensor_rebase_line(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${extendedPayload.itemId}/rebaseline`,
			extendedPayload
		);
	},

	update_thresholds(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT',
			loadingProp: 'tresholdsLoading'
			// stateProp: 'sensorLevelZones',
			// notLoading: true
		};
		return multipurpose_response(
			storeArgs,
			`/sensors/jobs/level-zones`,
			extendedPayload
		);
	},

	thresholds_re_baseline(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT',
			loadingProp: 'tresholdsLoading'
			// stateProp: 'sensorLevelZones',
			// notLoading: true
		};
		return multipurpose_response(
			storeArgs,
			`/sensors/jobs/level-zones/re-baseline`,
			extendedPayload
		);
	},

	fetch_thresholds_our(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			stateProp: 'sensorTresholdsOurData',
			prepareData: 'prepareTresholdsOurData',
			alternateResponseProp: 'data',
			loadingProp: 'tresholdsLoading',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/sensors/jobs/level-zones/our`,
			extendedPayload
		);
	},

	apply_thresholds_our(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT',
			loadingProp: 'tresholdsLoading'
			// stateProp: 'sensorLevelZones',
			// notLoading: true
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/jobs/level-zones/our`,
			extendedPayload
		);
	},

	save_sensor(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/sensors`, extendedPayload);
	},

	delete_sensor(storeArgs, payload) {
		return delete_item(storeArgs, `/sensors`, payload);
	},

	toggle_ultrasound_command(storeArgs, payload) {
		const extendedPayload = {
			method: 'GET',
			loadingProp: 'ultrasoundProccessLoading',
			errorMessageSettings: {
				messageKey: 'status'
			},
			...payload
		};
		// console.log(storeArgs, payload.url, extendedPayload)
		return multipurpose_response(storeArgs, payload.url, extendedPayload);
	},

	ping_socket_endpoint(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notLoading: true,
			notNotify: true,
			notSetToStore: true
		};
		// console.log(extendedPayload)
		return multipurpose_response(storeArgs, payload.url, extendedPayload);
	},

	pdf_report_request(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			loadingProp: 'sensorJobSaving',
			resultMessage: {
				text: 'The report request is being processed, please wait...'
			}
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${payload.sensorId}/graphical-digest-reports`,
			extendedPayload
		);
	},

	save_chart_note(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			// method: 'POST'
		};

		return multipurpose_response(storeArgs, extendedPayload.url, extendedPayload);
	},

	fetch_dataset_formulas(storeArgs, payload) {
		const extendedPayload = { ...payload, method: 'GET', notNotify: true };
		return multipurpose_response(storeArgs, `/sensors/formulas`, extendedPayload);
	},

	save_dataset_formulas(storeArgs, payload) {
		const extendedPayload = { ...payload, method: 'POST' };
		return multipurpose_response(storeArgs, `/sensors/formulas`, extendedPayload);
	},

	send_rpm(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: {
				text: 'RPM sended'
			}
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/commands/${payload.sensorId}/equipment-rpm`,
			extendedPayload
		);
	},

	gain_adjustment(storeArgs, payload) {
		const extendedPayload = {
			method: 'PUT',
			...payload,
			notNotify: true
			/*resultMessage: {
				text: 'Gain Adjustment Success'
			}*/
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${payload.sensorId}/gain-adjustment`,
			extendedPayload
		);
	},

	request_ncd_fft(storeArgs, payload) {
		const extendedPayload = {
			method: 'POST',
			notNotify: true,
			...payload
			/*resultMessage: {
				text: 'Request FFT Success'
			}*/
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${payload.sensorId}/ncd/fft`,
			extendedPayload
		);
	},

	unlock_fft(storeArgs, payload) {
		const extendedPayload = {
			method: 'POST',
			...payload
			/*resultMessage: {
				text: 'Request FFT Success'
			}*/
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${payload.sensorId}/fft/unlock`,
			extendedPayload
		);
	},

	request_ncd_config(storeArgs, payload) {
		const extendedPayload = {
			method: 'PUT',
			...payload,
			notNotify: true,
			alternateResponseProp: 'data.status'
			/*resultMessage: {
				text: 'Request FFT Success'
			}*/
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${payload.sensorId}/ncd/config`,
			extendedPayload
		);
	},

	reset_sensor_runtime(storeArgs, payload) {
		const extendedPayload = {
			method: 'PUT',
			...payload
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${payload.sensorId}/runtime-tracker`,
			extendedPayload
		);
	},

	create_fft_waveform(storeArgs, payload) {
		const extendedPayload = {
			method: 'POST',
			...payload,
			notNotify: true,
			alternateResponseProp: 'data'
			/*resultMessage: {
				text: 'Request FFT Success'
			}*/
		};

		const {sensorId, fftId, axisId} = payload;

		return multipurpose_response(
			storeArgs,
			`/sensors/${sensorId}/fft/${fftId}/sound-waveform/${axisId}`,
			extendedPayload
		);
	},

	fetch_fft_waveform(storeArgs, payload) {
		const extendedPayload = {
			method: 'GET',
			notNotify: true,
			returnResponseOnly: true,
			responseType: 'arraybuffer',
			...payload
		};
		const { sensorId, fftId, axis } = payload;

		return multipurpose_response(
			storeArgs,
			`/sensors/${sensorId}/fft/${fftId}/sound-waveform/${axis}`,
			extendedPayload
		);
	},
	
	sensor_multiple_rebaseline(storeArgs, payload) {
		const extendedPayload = {
			method: 'PUT',
			...payload,
			// notNotify: true,
			/*resultMessage: {
				text: 'Request FFT Success'
			}*/
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/rebaseline`,
			extendedPayload
		);
	},

	set_sensor_chart_color_scheme(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			notNotify: true,
			method: 'POST',
			/*resultMessage: {
				text: 'Request FFT Success'
			}*/
		};

		return multipurpose_response(
			storeArgs,
			`/sensors/${extendedPayload.itemId}/metric-threshold-levels-color-schemes/`,
			extendedPayload
		);
	},

	set_fft_rpm_params(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT',
			// notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/sensors/${payload.sensorId}/ncd/fft/${payload.fftId}/rpm-params`,
			extendedPayload
		);
	},
	// ----------------------

	set_sensors({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_sensor({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_sensors_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'sensors',
			value: filters || { ...filtersState.filters }
		});
	},

	set_sensors_warnings({ commit }, data = {}) {
		const payload = { stateProp: 'sensorWarningsData', value: data };
		commit('SET_STATE', payload);
	},

	set_statistics_filters({ commit }, filters) {
		const payload = {
			stateProp: 'statistics_filters',
			prefix: 'statistics',
			value: filters ? { ...filters } : { ...statistics_filters_init },
			notSetToLocalStorage: ['metricSystemType']
		};
		commit('SET_FILTERS', payload);
	},

	set_fft_statistics_filters({ commit }, filters) {
		const payload = {
			stateProp: 'fft_statistics_filters',
			prefix: 'fft_statistics',
			value: filters ? { ...filters } : { ...statistics_filters_init },
			notSetToLocalStorage: ['metricSystemType']
		};
		commit('SET_FILTERS', payload);
	},

	set_charts_filters({ commit }, filters) {
		const payload = {
			stateProp: 'charts_filters',
			prefix: 'charts',
			value: filters || { ...charts_filters_init }
		};
		// console.log(payload)
		commit('SET_FILTERS', payload);
	},

	set_sensor_state({ commit }, payload) {
		// const payload = { stateProp: stateProp, value: value };
		commit('SET_STATE', payload);
	},
	/*set_sensor_nested_state({ commit }, payload) {
		// const payload = { stateProp: stateProp, value: value };
		commit('SET_NESTED_STATE', payload);
	},*/

	// ------------------

	set_report_filters({ commit }, filters) {
		const payload = {
			stateProp: 'report_filters',
			prefix: 'equipments_report',
			value: filters || { ...report_filters_init }
		};
		commit('SET_FILTERS', payload);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
