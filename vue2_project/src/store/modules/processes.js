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
import { getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';

const localStorageFilters = JSON.parse(localStorage.getItem('processes_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('processes_statistics_filters')
);

const statistics_filters_init = {
	daterange: getDateRange('today', {
		getDateString: true
		// withTime: true
	})
	// daterange: ['2021-11-11', '2021-11-13'],
	// daterange: []
};
// console.log(localStorageFilters)
const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },

	statistics_filters: localStorageStatisticsFilters
		? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today')
		: { ...statistics_filters_init },

	downtimes_filters: { ...filtersState.filters },

	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_processes(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants/conveyor/processes', payload);
	},

	fetch_process(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/conveyor/processes/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_process_statistics(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			alternateResponseProp: 'data',
			prepareData: 'prepareProcessStatisticsData'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/conveyor/${extendedPayload.processId}/counters`,
			extendedPayload
		);
	},

	fetch_downtimes(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(
			storeArgs,
			`/plants/conveyor/${payload.processId}/downtimes`,
			payload
		);
	},

	save_process(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		// console.log(extendedPayload, save_data)
		return save_data(storeArgs, `/plants/conveyor/processes`, extendedPayload);
	},

	close_process_downtime(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/conveyor/downtimes/${extendedPayload.itemId}/close`,
			extendedPayload
		);
	},

	save_process_downtime(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST'
		};

		return multipurpose_response(
			storeArgs,
			`/plants/conveyor/${extendedPayload.processId}/downtimes`,
			extendedPayload
		);
	},

	change_process_break_time(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/conveyor/breaks/${extendedPayload.itemId}/offset`,
			extendedPayload
		);
	},

	ping_socket_endpoint(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
		};
		// console.log(extendedPayload)
		return multipurpose_response(storeArgs, payload.url, extendedPayload);
	},

	// ----------------

	delete_process(storeArgs, payload) {
		return delete_item(storeArgs, `/plants/conveyor/processes`, payload);
	},

	set_processes({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_process({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_processes_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'processes',
			value: filters || { ...filtersState.filters }
		});
	},

	set_downtimes_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			stateProp: 'downtimes_filters',
			prefix: 'downtimes',
			value: filters || { ...filtersState.filters }
		});
	},

	set_statistics_filters({ commit }, filters) {
		const payload = {
			stateProp: 'statistics_filters',
			prefix: 'processes_statistics',
			value: filters || { ...statistics_filters_init }
		};
		commit('SET_FILTERS', payload);
	}

	/*set_processes_filters({ commit }, filters) {
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
