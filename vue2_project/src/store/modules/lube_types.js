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

const localStorageFilters = JSON.parse(localStorage.getItem('lube_types_filters'));

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
	fetch_lube_types(storeArgs, payload = {}) {
		const newPayload = {
			...payload
		};
		return fetch_items(storeArgs, '/ultrasound/lubricant-types', newPayload);
	},

	fetch_lube_type(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/ultrasound/lubricant-types/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	calculate_lube_params(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/ultrasound/lubes/params`,
			extendedPayload
		);
	},

	save_lube_type(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/ultrasound/lubricant-types`, extendedPayload);
	},

	delete_lube_type(storeArgs, payload) {
		return delete_item(storeArgs, `/ultrasound/lubricant-types`, payload);
	},

	set_lube_types({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_lube_type({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_lube_types_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'lube_types_filters',
			value: filters || { ...filtersState.filters }
		});
	}

	/*set_lube_types_filters({ commit }, filters) {
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
