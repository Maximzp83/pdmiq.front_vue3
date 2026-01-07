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
	fetch_solenoids(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/solenoids', payload);
	},

	fetch_solenoid(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/solenoids/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_solenoid(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/solenoids`, extendedPayload);
	},

	delete_solenoid(storeArgs, payload) {
		return delete_item(storeArgs, `/solenoids`, payload);
	},

	set_solenoids({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_solenoid({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_solenoids_filters({ commit }, filters) {
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
