import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

import { /*getObjectVal,*/ getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';
import { ITEMS_GRID_TYPES } from '@/constants/table';

const localStorageFilters = JSON.parse(localStorage.getItem('plants_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('plants_statistics_filters')
);

const statistics_filters_init = {
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,

	daterange: getDateRange('last_7_days', {
		getDateString: true
		// withTime: true
	})
	// daterange: ['2021-11-11', '2021-11-13'],
	// daterange: []
};

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	statistics_filters: localStorageStatisticsFilters
		? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'last_7_days')
		: { ...statistics_filters_init },
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
	fetch_plants(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants', payload);
	},

	fetch_plant(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_plant_alarms(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			alternateResponseProp: 'data',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/plants/${extendedPayload.itemId}/alarms`,
			extendedPayload
		);
	},

	plant_graphs_pdf_report(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
		};

		return multipurpose_response(
			storeArgs,
			`/plants/${extendedPayload.plantId}/graphical-comparison-reports`,
			extendedPayload
		);
	},

	fetch_plant_graphs_pdf_report_last(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};

		return multipurpose_response(
			storeArgs,
			`/plants/${extendedPayload.plantId}/graphical-comparison-reports/last`,
			extendedPayload
		);
	},

	save_plant(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/plants`, extendedPayload);
	},

	delete_plant(storeArgs, payload) {
		return delete_item(storeArgs, `/plants`, payload);
	},

	set_plants({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_plant({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_plants_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'plants',
			value: filters || { ...filtersState.filters }
		});
	},

	set_statistics_filters({ commit }, filters) {
		const payload = {
			stateProp: 'statistics_filters',
			prefix: 'plants_statistics',
			value: filters || { ...statistics_filters_init }
		};
		commit('SET_FILTERS', payload);
	},

	fetch_locations(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/locations`, extendedPayload);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
