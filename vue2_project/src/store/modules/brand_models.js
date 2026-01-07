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

const localStorageFilters = JSON.parse(localStorage.getItem('brand_models_filters'));
const localStorageStoreroomsFilters = JSON.parse(
	localStorage.getItem('storeroom_brand_models_filters')
);

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta },

	storeroom_brand_models_filters: localStorageStoreroomsFilters
		? { ...localStorageStoreroomsFilters, isStoreroom: true }
		: { ...filtersState.filters, isStoreroom: true }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_brand_models(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/equipments/brands/models', payload);
	},

	fetch_brand_model(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/brands/models/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_brand_model(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/equipments/brands/models`, extendedPayload);
	},

	delete_brand_model(storeArgs, payload) {
		return delete_item(storeArgs, `/equipments/brands/models`, payload);
	},

	set_brand_models({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_brand_model({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_brand_models_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'brand_models',
			value: filters || { ...filtersState.filters }
		});
	},

	set_storerooms_filters({ commit }, filters) {
		const payload = {
			stateProp: 'storeroom_brand_models_filters',
			prefix: 'storeroom_brand_models',
			value: filters || {
				...filtersState.storeroom_brand_models_filters,
				isStoreroom: true
			}
		};
		commit('SET_FILTERS', payload);
	}

	/*set_brand_models_filters({ commit }, filters) {
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
