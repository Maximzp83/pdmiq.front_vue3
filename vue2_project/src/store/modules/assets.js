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
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';
import { ITEMS_GRID_TYPES } from '@/constants/table';

const localStorageFilters = JSON.parse(localStorage.getItem('assets_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('assets_statistics_filters')
);

const statistics_filters_init = {
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,

	daterange: getDateRange('today', {
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

	statistics_filters: localStorageStatisticsFilters
		? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today')
		: { ...statistics_filters_init },

	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_assets(storeArgs, payload = {}) {
		const newPayload = {
			...payload,
			stateProp: 'itemsList'
			// loadingProp: 'isLoading'
		};
		return fetch_items(storeArgs, '/assets', newPayload);
	},

	fetch_asset(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/assets/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_asset_roi(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/assets/roi`, extendedPayload);
	},

	save_asset(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/assets`, extendedPayload);
	},

	delete_asset(storeArgs, payload) {
		return delete_item(storeArgs, `/assets`, payload);
	},

	reorder_asset(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/assets/reorder`, extendedPayload);
	},

	set_assets({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_asset({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_assets_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'assets',
			value: filters ? { ...filters, isHideList: null } : { ...filtersState.filters }
		});
	},

	set_statistics_filters({ commit }, filters) {
		const payload = {
			stateProp: 'statistics_filters',
			prefix: 'assets_statistics',
			value: filters || { ...statistics_filters_init }
		};
		commit('SET_FILTERS', payload);
	}

	/*set_assets_filters({ commit }, filters) {
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
