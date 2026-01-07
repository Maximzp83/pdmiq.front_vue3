import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

const localStorageFilters = JSON.parse(localStorage.getItem('teams_filters'));

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
	fetch_teams(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/team', payload);
	},

	fetch_team(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/team/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_team(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/team`, extendedPayload);
	},

	delete_team(storeArgs, payload) {
		return delete_item(storeArgs, `/team`, payload);
	},

	set_teams({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_team({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_teams_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'teams',
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
