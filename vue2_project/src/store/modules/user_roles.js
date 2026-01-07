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

const localStorageFilters = JSON.parse(localStorage.getItem('roles_filters'));
const localStorageUserRolesList = JSON.parse(
	localStorage.getItem('user_roles_list')
);

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta },

	itemsList: localStorageUserRolesList || []
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_user_roles(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/roles', payload);
	},

	fetch_user_role(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/roles/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_user_role(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/roles`, extendedPayload);
	},

	delete_user_role(storeArgs, payload) {
		return delete_item(storeArgs, `/roles`, payload);
	},

	set_user_roles({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
		// localStorage.setItem('user_roles_list', JSON.stringify(items));
	},

	set_user_role({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_user_roles_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'roles',
			value: filters || { ...filtersState.filters }
		});
	}

	/*set_user_roles({ commit }, filters) {
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
