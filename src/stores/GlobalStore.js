import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';
import { api_request } from '@/api/request_provider';

// import { Notification } from 'element-ui';
import { Lang } from '@/localization';

const localStorageFilters = JSON.parse(localStorage.getItem('global_filters'));
const localStorageItemsActiveGridType = JSON.parse(
	localStorage.getItem('items_active_grid_type'),
);
const localStorageCompareList = JSON.parse(localStorage.getItem('compare_list'));

const globalFiltersInit = {
	plantId: undefined,
	companyId: null,
};

export const useGlobalStore = defineStore('globalStore', {
	state: () => {
		return {
			overlayData: {
				show: false,
				text: '',
				onClick: () => {},
			},
			overlay: {},
			mainPreloader: false,
			editModal: {
				instanceName: '',
				itemName: '',
				instanceData: null,
				formSettings: null,
				successSubmitCallback: null,
			},

			editModalSecond: {
				// show: false,
				instanceName: '',
				itemName: '',
				instanceData: null,
				formSettings: null,
				successSubmitCallback: null,
			},

			editModalClassic: {
				// show: false,
				instanceName: '',
				itemName: '',
				instanceData: null,
				formSettings: null,
				successSubmitCallback: null,
			},

			editModalClassicSecond: {
				// show: false,
				instanceName: '',
				itemName: '',
				instanceData: null,
				formSettings: null,
				successSubmitCallback: null,
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
			printHTMLWindowIsOpen: false,
		};
	},

	actions: {
		...commonStoreMixin.actions,

		show_overlay(data) {
			this.set_value('overlay', data);
		},

		show_edit_modal(data) {
			if (data.multiform) {
				if (!this.globalFilters.plantId) {
					import('element-plus').then(({ ElNotification }) => {
						ElNotification.warning({
							title: '',
							message: Lang.tt('phrases.Select_Plant_first'),
						});
					});
					return;
				}
			}

			const editModalProp = data.editModalProp || 'editModal';
			// console.log('show_edit_modal', editModalProp, data);
			this.set_value(editModalProp, data);
		},

		set_layout_click(target) {
			this.set_value('layout_click_target', target);
		},

		setup_navbar(data = {}) {
			// console.log('setup_navbar', data);
			this.set_value('navbarSettings', data);
		},

		set_global_filters(globFilters) {
			const filters = globFilters || { ...globalFiltersInit };
			this.set_value('globalFilters', filters, {
				toLocalStorage: { prop: 'global_filters' },
			});
		},

		set_compare_list(items = []) {
			this.set_value('compareList', items, {
				toLocalStorage: { prop: 'compare_list' },
			});
		},

		minimizeSidebar() {
			this.set_value('isSidebarCollapse', !this.isSidebarCollapse);
		},

		set_global_state(data) {
			// Handle nested state updates
			const { stateProp, value } = data;
			if (stateProp.includes('.')) {
				const keys = stateProp.split('.');
				let current = this;
				for (let i = 0; i < keys.length - 1; i++) {
					current = current[keys[i]];
				}
				current[keys[keys.length - 1]] = value;
			} else {
				this.set_value(stateProp, value);
			}
		},

		forceRerender(componentKey) {
			this[componentKey]++;
		},

		set_active_grid_type(value) {
			this.set_value('items_active_grid_type', value, {
				toLocalStorage: { prop: 'items_active_grid_type' },
			});
		},

		fetch_global_plants(payload = {}) {
			const extendedPayload = {
				...payload,
				method: 'GET',
				setToStore: true,
				loading: true,
				storeName: 'GlobalStore',
				stateProp: 'globalPlantsList',
				prepareData: 'prepareGlobalPlantsData',
				loadingProp: 'globalPlantsLoading',
				notNotify: true,
			};
			return api_request(`/plants`, extendedPayload);
		},

		fetch_global_companies(payload = {}) {
			const extendedPayload = {
				...payload,
				method: 'GET',
				setToStore: true,
				loading: true,
				storeName: 'GlobalStore',
				stateProp: 'globalCompaniesList',
				loadingProp: 'globalCompaniesLoading',
				notNotify: true,
			};
			return api_request(`/companies`, extendedPayload);
		},

		save_visit_analytics(payload = {}) {
			const extendedPayload = {
				...payload,
				method: 'POST',
				notNotify: true,
			};
			return api_request(`/analytics/page-visits`, extendedPayload);
		},
	},

	getters: {
		// ...itemsMixin.getters,
	},
});
