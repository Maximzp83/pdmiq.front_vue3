import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

// import { Notification } from 'element-ui';
import { Lang } from '@/localization';

const localStorageFilters = JSON.parse(localStorage.getItem('global_filters'));
const localStorageItemsActiveGridType = JSON.parse(
	localStorage.getItem('items_active_grid_type')
);
const localStorageCompareList = JSON.parse(localStorage.getItem('compare_list'));

const globalFiltersInit = {
	plantId: null,
	companyId: null
};

export const useGlobalStore = defineStore('globalStore', {
	state: () => {
		return {
			overlay: {
				show: false,
				text: '',
				onClick: () => {}
			},
			mainPreloader: false,
			editModal: {
				instanceName: '',
				itemName: '',
				instanceData: null,
				formSettings: null,
				callback: null
			},

			editModalSecond: {
				// show: false,
				instanceName: '',
				itemName: '',
				instanceData: null,
				formSettings: null,
				callback: null
			},

			editModalClassic: {
				// show: false,
				instanceName: '',
				itemName: '',
				instanceData: null,
				formSettings: null,
				callback: null
			},

			editModalClassicSecond: {
				// show: false,
				instanceName: '',
				itemName: '',
				instanceData: null,
				formSettings: null,
				callback: null
			},

			navbarSettings: {},
			activeItemsTable: null,
			nextActiveItemsTable: null,
			fromDashboard: false,

			globalTabsList: [],
			globalActiveTab: {},
			updateItemsList: false,

			globalFilters: localStorageFilters
				? { ...localStorageFilters }
				: { ...globalFiltersInit },

			globalPlantsList: [],
			globalPlantsLoading: false,

			globalCompaniesList: [],
			globalCompaniesLoading: false,

			isSidebarCollapse: false,

			layout_click_target: null,

			compareList: localStorageCompareList || [],

			items_active_grid_type: localStorageItemsActiveGridType || 2,

			viewContentComponentKey: 1,
			DashboardLayoutComponentKey: 1,

			disposableHistoryButton: false,
			updateCounters: false,

			callMethod: null,

			beforeEachHook: null,
			redirectTo: null,
			printHTMLWindowIsOpen: false
		}
	},

	actions: {
		...commonStoreMixin.actions,

		forceRerender(componentKey) {
			this[componentKey]++;
		},

	},

	getters: {
		// ...itemsMixin.getters,
	}
})



// import { dataState, statusState, filtersState, sortingState } from '../commonState';
// import { multipurpose_response } from '../commonActions/apiActions';
// import { dataMutations } from '../commonMutations';
// import axios from '@/services/api/axiosService';

/*const itemsModules = [
	{ moduleName: 'companies', action: 'set_companies_filters' },
	// { moduleName: 'plants', action: 'set_plants_filters'},
	{ moduleName: 'controllers', action: 'set_controllers_filters' },
	{ moduleName: 'sensors', action: 'set_sensors_filters' }
];*/


/*const mutations = {
	...dataMutations,

	SET_GRID_VIEW: (state, value) => {
		state.items_active_grid_type = value;
		localStorage.setItem(`items_active_grid_type`, JSON.stringify(value));
	},
	SET_COMPARE_LIST: (state, value) => {
		state.compareList = value;
		localStorage.setItem(`compare_list`, JSON.stringify(value));
	}
};*/
// const getters = {};

// actions
const actions = {
	/*show_overlay({ commit }, data) {
		const payload = { stateProp: 'overlay', value: data };
		commit('SET_STATE', payload);
	},

	show_edit_modal({ commit, state }, data) {
		if (data.multiform) {
			if (!state.globalFilters.plantId) {
				Notification.warning({
					title: '',
					message: Lang.tt('phrases.Select_Plant_first')
				});
				return;
			}
		}

		commit('SET_STATE', {
			stateProp: data.editModalProp || 'editModal',
			value: data
		});
	},

	set_layout_click({ commit }, target) {
		const payload = { stateProp: 'layout_click_target', value: target };
		commit('SET_STATE', payload);
	},
	setup_navbar({ commit }, data = {}) {
		const payload = { stateProp: 'navbarSettings', value: data };
		commit('SET_STATE', payload);
	},

	set_global_filters({ commit }, globFilters) {
		// console.log('set_global_filters', globFilters);
		const payload = {
			stateProp: 'globalFilters',
			prefix: 'global',
			value: globFilters || { ...globalFiltersInit }
		};
		commit('SET_FILTERS', payload);
	},

	fetch_global_plants(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			setToStore: true,
			load: true,
			stateProp: 'globalPlantsList',
			prepareData: 'prepareGlobalPlantsData',
			loadingProp: 'globalPlantsLoading',
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/plants`, extendedPayload);
	},

	fetch_global_companies(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			setToStore: true,
			load: true,
			stateProp: 'globalCompaniesList',
			// prepareData: 'prepareGlobalCompaniesData',
			loadingProp: 'globalCompaniesLoading',
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/companies`, extendedPayload);
	},

	save_visit_analytics(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/analytics/page-visits`,
			extendedPayload
		);
	},

	set_global_plants({ commit }, items = []) {
		const payload = { stateProp: 'globalPlantsList', value: items };
		commit('SET_STATE', payload);
	},

	set_compare_list({ commit }, items = []) {
		commit('SET_COMPARE_LIST', items);
	},*/

	/*set_global_filters({ commit, dispatch, rootState }, { setForAll, globFilters, itemsFilters }) {
		const payload = { stateProp: 'globalFilters', value: globFilters };
		commit('SET_STATE', payload);

		if (setForAll) {
			for (let moduleItem of itemsModules) {
				const { moduleName, action } = moduleItem;
				const newItemFilters = { ...rootState[moduleName].filters, ...itemsFilters };
				dispatch(`${moduleName}/${action}`, newItemFilters, { root: true });
			}
		}
	},*/

	/*minimizeSidebar({ commit, state }) {
		const payload = {
			stateProp: 'isSidebarCollapse',
			value: !state.isSidebarCollapse
		};
		commit('SET_STATE', payload);
	},

	set_global_state({ commit }, data) {
		commit('SET_NESTED_STATE', data);
	},

	forceRerender({ commit, state }, componentKey) {
		const payload = {
			stateProp: componentKey,
			value: state[componentKey] + 1
		};
		commit('SET_STATE', payload);
	},

	set_active_grid_type({ commit }, value) {
		commit('SET_GRID_VIEW', value);
	}*/

	/*emit_submit_item_form({ commit }, data = {}) {
		const payload = { stateProp: 'navbarSettings', value: data };
		commit('SET_STATE', payload);
	}*/
};

/*export default {
	state,
	getters,
	actions,
	mutations
};*/
