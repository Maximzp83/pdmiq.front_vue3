import {
	dataState,
	statusState,
	filtersState /*, sortingState*/
} from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

// initial users state
const scopedState = {
	// postsSomeData: {}
};

const state = { ...dataState, ...statusState, ...filtersState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_ultrasound_pumps(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/ultrasound/pumps', payload);
	},

	fetch_ultrasound_pump(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/ultrasound/pumps/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_ultrasound_pump(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/ultrasound/pumps`, extendedPayload);
	},

	delete_ultrasound_pump(storeArgs, payload) {
		return delete_item(storeArgs, `/ultrasound/pumps`, payload);
	},

	set_ultrasound_pumps({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_ultrasound_pump({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_ultrasound_pumps_filters({ commit }, filters) {
		const payload = { stateProp: 'filters', value: filters };
		commit('SET_STATE', payload);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
