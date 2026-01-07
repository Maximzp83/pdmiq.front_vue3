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
	localStorage.getItem('task_procedures_filters')
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
	fetch_task_procedures(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, 'plants/task-procedures', payload);
	},

	fetch_task_procedure(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`plants/task-procedures/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_task_procedure(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `plants/task-procedures`, extendedPayload);
	},

	delete_task_procedure(storeArgs, payload) {
		return delete_item(storeArgs, `plants/task-procedures`, payload);
	},

	set_task_procedures({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_task_procedure({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_task_procedures_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'task_procedures',
			value: filters || { ...filtersState.filters }
		});
	}

	/*set_task_procedures_filters({ commit }, filters) {
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
