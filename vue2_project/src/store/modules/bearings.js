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

const localStorageFilters = JSON.parse(localStorage.getItem('bearings_filters'));

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters, max: 18 },
	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_bearings(storeArgs, payload = {}) {
		const newPayload = {
			...payload
		};
		return fetch_items(storeArgs, '/bearings', newPayload);
	},

	fetch_bearing(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/bearings/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_bearing(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/bearings`, extendedPayload);
	},

	delete_bearing(storeArgs, payload) {
		return delete_item(storeArgs, `/bearings`, payload);
	},

	set_bearings({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_bearing({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_bearings_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'bearings_filters',
			value: filters || { ...filtersState.filters }
		});
	}

	/*set_bearings_filters({ commit }, filters) {
		const payload = { stateProp: 'filters', value: filters };
		commit('SET_STATE', payload);
	}*/
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
