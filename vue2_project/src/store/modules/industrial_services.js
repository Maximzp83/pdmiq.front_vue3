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
// import { getObjectVal, getDateRange } from '@/helpers';

const localStorageFilters = JSON.parse(
	localStorage.getItem('industrial_services_filters')
);

/*const statistics_filters_init = {
	daterange: getDateRange('today', {
		getDateString: true
		// withTime: true
	})
	// daterange: ['2021-11-11', '2021-11-13'],
	// daterange: []
};*/

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
	fetch_industrial_services(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/settings/industrial-services', payload);
	},

	fetch_industrial_service(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/settings/industrial-services/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_industrial_service(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/settings/industrial-services`, extendedPayload);
	},

	delete_industrial_services(storeArgs, payload) {
		return delete_item(storeArgs, `/settings/industrial-services`, payload);
	},

	set_industrial_services_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'industrial_services',
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
