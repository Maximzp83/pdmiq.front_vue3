import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

/**
 * Dashboard Store
 * Manages dashboard state including counters and statistics
 *
 * Migrated from: vue2_project/src/store/modules/dashboard.js
 */
export const useDashboardStore = defineStore('dashboardStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			// Dashboard-specific state
			countersLoading: false,
			dashboardCounters: [],
		};
	},

	actions: {
		...commonStoreMixin.actions,

		/**
		 * Set dashboard counters
		 * @param {Array} items - Counter items
		 */
		set_counters(items = []) {
			this.set_value('dashboardCounters', items);
		},
	},

	getters: {
		// Add getters if needed
	},
});
