// import { dataState, statusState, filtersState /*, sortingState*/ } from '../commonState';
import { /*fetch_items,*/ multipurpose_response } from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

// initial users state
const scopedState = {
	countersLoading: false,
	dashboardCounters: []
	// postsSomeData: {}
};

const state = { /*...dataState, ...statusState, ...filtersState,*/ ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_counters(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			// notSetToStore:true,
			stateProp: 'dashboardCounters',
			alternateResponseProp: 'data',
			prepareData: 'prepareCountersData',
			loadingProp: 'countersLoading',
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/dashboard/counters`, extendedPayload);
	},

	fetch_dashboard_pdm_statistics(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			alternateResponseProp: 'data',
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/dashboard/pdm`, extendedPayload);
	},

	set_counters({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	}

	/*set_companies_filters({ commit }, filters) {
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
