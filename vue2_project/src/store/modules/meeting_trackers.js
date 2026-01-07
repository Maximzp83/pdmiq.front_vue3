import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

const localStorageFilters = JSON.parse(
	localStorage.getItem('meeting_trackers_filters')
);

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = {
	...dataState,
	...statusState,
	...scopedState,

	gettingSensorAlarmsForms: false,
	sensorAlarmsForms: []
};
const mutations = { ...dataMutations, ...statusMutations };

const getters = {
	getPlantsByCompany: state => companyId => {
		return state.itemsList.filter(plant => plant.company_id === companyId);
	}
};

// actions
const actions = {
	fetch_meeting_trackers(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants/meeting-trackers', payload);
	},

	fetch_meeting_tracker(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/meeting-trackers/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_meeting_tracker_last(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/plants/meeting-trackers/last`,
			extendedPayload
		);
	},

	fetch_meeting_tracker_roi(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
			// alternateResponseProp: 'data',
		};
		return multipurpose_response(
			storeArgs,
			`/plants/meeting-trackers/roi`,
			extendedPayload
		);
	},

	/*generate_meeting_tracker_pdf(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			// resultMessage: ''
			// alternateResponseProp: 'data',
		};
		return multipurpose_response(
			storeArgs,
			`/plants/meeting-trackers/${extendedPayload.itemId}/report`,
			extendedPayload
		);
	},*/

	save_meeting_tracker(storeArgs, payload) {
		let extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/plants/meeting-trackers`, extendedPayload);
	},

	delete_meeting_tracker(storeArgs, payload) {
		return delete_item(storeArgs, `/plants/meeting-trackers`, payload);
	},

	set_meeting_trackers({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_meeting_tracker({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_state_prop({ commit }, data) {
		commit('SET_NESTED_STATE', data);
	},

	set_sensor_alarms_forms({ commit, state }, formData) {
		const newValue = state.sensorAlarmsForms.slice(
			0,
			state.sensorAlarmsForms.length
		);
		newValue.push(formData);
		// if (clear) {newValue = [];}

		const payload = { stateProp: 'sensorAlarmsForms', value: newValue };
		commit('SET_STATE', payload);
	},

	set_meeting_trackers_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'meeting_trackers',
			value: filters || { ...filtersState.filters }
		});
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
