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
import { /*getObjectVal,*/ getDateRange } from '@/helpers';
import { ITEMS_GRID_TYPES } from '@/constants/table';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';

const localStorageFilters = JSON.parse(
	localStorage.getItem('production_lines_filters')
);
const localStorageFiltersUtility = JSON.parse(
	localStorage.getItem('production_lines_utility_filters')
);
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('production_lines_statistics_filters')
);

const statistics_filters_init = {
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,
	isShowList: false,

	daterange: getDateRange('last_7_days', {
		getDateString: true
		// withTime: true
	})
	// daterange: ['2021-11-11', '2021-11-13'],
	// daterange: []
};

const scopedState = {
	filters: localStorageFilters
		? resetDaterangeIfExpired({ ...localStorageFilters, isHideList: null }, 'today')
		: {
				...filtersState.filters,
				max: 18,
				isShowListRefreshed2: false,
				isShowList: false
		  },

	utility_filters: localStorageFiltersUtility
		? resetDaterangeIfExpired(
				{ ...localStorageFiltersUtility, isHideList: null },
				'last_7_days'
		  )
		: {
				...filtersState.filters,
				max: 18,
				isShowListRefreshed2: false,
				isShowList: false
		  },

	statistics_filters: localStorageStatisticsFilters
		? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'last_7_days')
		: { ...statistics_filters_init },

	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_production_lines(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/production-lines', payload);
	},

	fetch_production_line(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/production-lines/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_production_line_roi(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/production-lines/roi`,
			extendedPayload
		);
	},

	fetch_production_line_rpm_nodes(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/production-lines/rpm-nodes`,
			extendedPayload
		);
	},

	save_production_line(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/production-lines`, extendedPayload);
	},

	delete_production_line(storeArgs, payload) {
		return delete_item(storeArgs, `/production-lines`, payload);
	},

	reorder_production_line(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/production-lines/reorder`,
			extendedPayload
		);
	},

	set_production_lines({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_production_line({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_production_lines_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'production_lines',
			value: filters ? { ...filters, isHideList: null } : { ...filtersState.filters }
		});
	},

	set_statistics_filters({ commit }, filters) {
		const payload = {
			stateProp: 'statistics_filters',
			prefix: 'production_lines_statistics',
			value: filters || { ...statistics_filters_init }
		};
		commit('SET_FILTERS', payload);
	},

	set_utilities_filters({ commit }, filters) {
		const payload = {
			stateProp: 'utility_filters',
			prefix: 'production_lines_utility',
			value: filters ? { ...filters, isHideList: null } : { ...filtersState.filters }
		};
		commit('SET_FILTERS', payload);
	}
	/*set_production_lines_filters({ commit }, filters) {
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
