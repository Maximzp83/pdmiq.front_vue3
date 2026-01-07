import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';

const localStorageFilters = JSON.parse(
	localStorage.getItem('roi_one_pagers_filters')
);

const scopedState = {
	filters: localStorageFilters
		? resetDaterangeIfExpired({ ...localStorageFilters }, 'last_7_days')
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };

const getters = {
	getPlantsByCompany: state => companyId => {
		return state.itemsList.filter(plant => plant.company_id === companyId);
	}
};

// actions
const actions = {
	fetch_roi_one_pagers(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants/roi/one-pagers', payload);
	},

	fetch_roi_one_pager(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/roi/one-pagers/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_roi_one_pager(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/plants/roi/one-pagers`, extendedPayload);
	},

	delete_roi_one_pager(storeArgs, payload) {
		return delete_item(storeArgs, `/plants/roi/one-pagers`, payload);
	},

	set_roi_one_pagers({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_roi_one_pager({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_roi_one_pagers_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'roi_one_pagers',
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
