import {
	dataState,
	statusState,
	filtersState
} from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

const localStorageFilters = JSON.parse(localStorage.getItem('measurement_units_filters'));

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters, max: 18 },
	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

const actions = {
	fetch_measurement_units(storeArgs, payload = {}) {
		return fetch_items(storeArgs, '/measurement-units', payload);
	},

	fetch_measurement_unit(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/measurement-units/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_measurement_unit(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, '/measurement-units', extendedPayload);
	},

	delete_measurement_unit(storeArgs, payload) {
		return delete_item(storeArgs, '/measurement-units', payload);
	},

	set_measurement_units({ commit }, items = []) {
		commit('SET_STATE', { stateProp: 'itemsList', value: items });
	},

	set_measurement_unit({ commit }, item = null) {
		commit('SET_STATE', { stateProp: 'itemData', value: item });
	},

	set_measurement_units_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'measurement_units_filters',
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
