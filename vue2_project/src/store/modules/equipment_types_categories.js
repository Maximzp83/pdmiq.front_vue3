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
	localStorage.getItem('equipment_types_filters')
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
	fetch_equipment_types_categories(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/equipments/types/options/categories', payload);
	},

	fetch_equipment_type_category(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/types/options/categories/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_equipment_type_category(storeArgs, payload) {
		const extendedPayload = { ...payload };
		return save_data(
			storeArgs,
			`/equipments/types/options/categories`,
			extendedPayload
		);
	},

	delete_equipment_type_category(storeArgs, payload) {
		return delete_item(storeArgs, `/equipments/types/options/categories`, payload);
	},

	set_equipment_types_categories({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_equipment_type_category({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_equipment_types_categories_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'equipment_types',
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
