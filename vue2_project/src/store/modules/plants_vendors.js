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

const localStorageFilters = JSON.parse(
	localStorage.getItem('plants_vendors_filters')
);

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_plants_vendors(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants/vendors', payload);
	},

	fetch_plants_vendor(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/vendors/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_plants_vendor(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/plants/vendors`, extendedPayload);
	},

	delete_plants_vendor(storeArgs, payload) {
		return delete_item(storeArgs, `/plants/vendors`, payload);
	},

	set_plants_vendors({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_plants_vendor({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_plants_vendors_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'plants_vendors_filters',
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
