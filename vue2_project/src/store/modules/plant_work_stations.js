import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

const localStorageFilters = JSON.parse(
	localStorage.getItem('work_stations_filters')
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
	fetch_work_stations(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants/work-stations', payload);
	},

	fetch_work_station(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-stations/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_work_station(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/plants/work-stations`, extendedPayload);
	},

	delete_work_station(storeArgs, payload) {
		return delete_item(storeArgs, `/plants/work-stations`, payload);
	},

	set_work_stations({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_work_station({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_work_stations_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'work_stations',
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
