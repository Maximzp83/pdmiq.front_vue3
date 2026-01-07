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

const localStorageFilters = JSON.parse(localStorage.getItem('subtypes_filters'));

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
	fetch_subtypes(storeArgs, payload = {}) {
		const newPayload = {
			...payload
		};
		return fetch_items(storeArgs, '/sensors/banner-v2/subtypes', newPayload);
	},

	fetch_subtype(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/sensors/banner-v2/subtypes/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_subtype(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/sensors/banner-v2/subtypes`, extendedPayload);
	},

	delete_subtype(storeArgs, payload) {
		return delete_item(storeArgs, `/sensors/banner-v2/subtypes`, payload);
	},

	set_subtypes({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_subtype({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_subtypes_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'subtypes_filters',
			value: filters || { ...filtersState.filters }
		});
	}

	/*set_subtypes_filters({ commit }, filters) {
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
