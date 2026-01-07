import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

const localStorageFilters = JSON.parse(localStorage.getItem('distributors_filters'));

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta },

	locationsList: [],
	locationsLoading: false
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };

const getters = {
	getDistributorLocationsList: state => distributor_id => {
		return state.locationsList.filter(loc => loc.distributor_id === distributor_id);
	}
};

// actions
const actions = {
	fetch_distributors(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/distributors', payload);
	},

	fetch_distributor(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/distributors/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_locations(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'locationsList',
			loadingProp: 'locationsLoading'
		};
		return multipurpose_response(
			storeArgs,
			`/distributors/locations`,
			extendedPayload
		);
	},

	set_locations({ commit }, items = []) {
		const payload = { stateProp: 'locationsList', value: items };
		commit('SET_STATE', payload);
	},

	save_distributor(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/distributors`, extendedPayload);
	},

	delete_distributor(storeArgs, payload) {
		return delete_item(storeArgs, `/distributors`, payload);
	},

	set_distributors({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_distributor({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_distributors_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'distributors',
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
