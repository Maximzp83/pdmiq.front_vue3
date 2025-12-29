import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';

const localStorageFilters = JSON.parse(
	localStorage.getItem('maintenance_logs_filters'),
);
const localStorageFiltersWO = JSON.parse(
	localStorage.getItem('maintenance_wo_filters'),
);
const localStorageFiltersBreakdown = JSON.parse(
	localStorage.getItem('maintenance_logs_breakdown_filters'),
);
const localStorageFiltersRequests = JSON.parse(
	localStorage.getItem('maintenance_requests_filters'),
);

/**
 * Maintenance Store
 * Manages work orders, maintenance logs, and work order imports
 *
 * Migrated from: vue2_project/src/store/modules/maintenance.js
 */
export const useMaintenanceStore = defineStore('maintenanceStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			filters: localStorageFilters
				? resetDaterangeIfExpired({ ...localStorageFilters }, 'last_7_days')
				: { ...commonStoreMixin.state.filters },
			filters_wo: localStorageFiltersWO
				? resetDaterangeIfExpired({ ...localStorageFiltersWO }, 'last_7_days')
				: { ...commonStoreMixin.state.filters },
			filters_breakdown: localStorageFiltersBreakdown
				? { ...localStorageFiltersBreakdown }
				: { ...commonStoreMixin.state.filters },
			filters_requests: localStorageFiltersRequests
				? { ...localStorageFiltersRequests }
				: { ...commonStoreMixin.state.filters },
			fetchedMeta: { ...commonStoreMixin.state.fetchedMeta },
		};
	},

	actions: {
		...commonStoreMixin.actions,

		/**
		 * Set maintenance logs list
		 * @param {Array} items - Maintenance logs array
		 */
		set_maintenance_logs(items = []) {
			this.set_value('itemsList', items);
		},

		/**
		 * Set single maintenance log
		 * @param {Object} item - Maintenance log object
		 */
		set_maintenance_log(item = null) {
			this.set_value('itemData', item);
		},

		/**
		 * Set maintenance logs filters
		 * @param {Object} filters - Filter object
		 */
		set_maintenance_logs_filters(filters) {
			this.set_filters('maintenance_logs', filters);
		},

		/**
		 * Set work order filters
		 * @param {Object} filters - Filter object
		 */
		set_maintenance_wo_filters(filters) {
			this.set_filters('maintenance_wo', filters, { stateProp: 'filters_wo' });
		},

		/**
		 * Set breakdown filters
		 * @param {Object} filters - Filter object
		 */
		set_maintenance_logs_breakdown_filters(filters) {
			this.set_filters('maintenance_logs_breakdown', filters, {
				stateProp: 'filters_breakdown',
			});
		},

		/**
		 * Set requests filters
		 * @param {Object} filters - Filter object
		 */
		set_maintenance_requests_filters(filters) {
			this.set_filters('maintenance_requests', filters, {
				stateProp: 'filters_requests',
			});
		},
	},

	getters: {
		// Add getters if needed
	},
});
