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

const localStorageFilters = JSON.parse(localStorage.getItem('parts_filters'));

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
	fetch_parts(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants/parts', payload);
	},

	fetch_part(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/plants/parts/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_part(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/plants/parts`, extendedPayload);
	},

	delete_part(storeArgs, payload) {
		return delete_item(storeArgs, `/plants/parts`, payload);
	},

	set_parts({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_part({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_parts_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'parts',
			value: filters || { ...filtersState.filters }
		});
	}

	/*set_parts_filters({ commit }, filters) {
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
