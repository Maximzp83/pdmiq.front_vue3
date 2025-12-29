import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

const localStorageFilters = JSON.parse(localStorage.getItem('settings_filters'));

/**
 * Testing Store
 * Manages testing, settings import, and logs state
 *
 * Migrated from: vue2_project/src/store/modules/testing.js
 */
export const useTestingStore = defineStore('testingStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			filters: localStorageFilters
				? { ...localStorageFilters }
				: { ...commonStoreMixin.state.filters },
			fetchedMeta: { ...commonStoreMixin.state.fetchedMeta },
			notificationTemplates: [],
			lastImportLog: null,
		};
	},

	actions: {
		...commonStoreMixin.actions,

		/**
		 * Set notification templates in state
		 * @param {Array} items - Templates array
		 */
		set_notification_templates(items = []) {
			this.set_value('notificationTemplates', items);
		},

		/**
		 * Set settings filters
		 * @param {Object} filters - Filter object
		 */
		set_settings_filters(filters) {
			this.set_filters('settings', filters);
		},

		/**
		 * Set nested state property
		 * @param {Object} data - Data with stateProp and value
		 */
		set_state_prop(data) {
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
	},

	getters: {
		// Add getters if needed
	},
});
