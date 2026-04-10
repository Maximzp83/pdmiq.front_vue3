import { dataState, statusState, filtersState } from '../commonState';
import { dataMutations, statusMutations } from '../commonMutations';
import { api } from '@/services/api';
import {
	getResponseValue,
	isSuccessStatus,
	handleError
} from '@/services/api/api_helpers';
import { buildEventLogsMeta } from '@/helpers/eventLogs';

const localStorageFilters = JSON.parse(localStorage.getItem('event_logs_filters'));

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters, max: 25 },
	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

const actions = {
	fetch_event_logs({ commit }, payload = {}) {
		const loading = payload.loading;

		if (loading) commit('SET_STATUS_LOADING', true);

		return new Promise((resolve, reject) => {
			api('GET', '/event-logs', payload)
				.then(response => {
					if (isSuccessStatus(response)) {
						const value = getResponseValue(response, payload) || [];
						const fetchedMeta = buildEventLogsMeta(response.data.pagination);

						if (payload.setToStore) {
							commit('SET_STATE', { stateProp: 'itemsList', value });
							commit('SET_STATE', { stateProp: 'fetchedMeta', value: fetchedMeta });
						}

						resolve({
							value,
							request_payload: payload,
							fetchedMeta
						});
					} else {
						reject(response);
					}

					if (loading) commit('SET_STATUS_LOADING', false);
				})
				.catch(error => {
					handleError(error, {
						commit,
						reject,
						loading,
						notify: !payload.notNotifyError
					});
				});
		});
	},

	set_event_logs_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'event_logs',
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
