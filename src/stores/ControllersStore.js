import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

const localStorageFilters = JSON.parse(localStorage.getItem('controllers_filters'));

/**
 * Controllers Store
 * Manages controller devices state including DXM controllers
 *
 * Migrated from: vue2_project/src/store/modules/controllers.js
 */
export const useControllersStore = defineStore('controllersStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			filters: localStorageFilters
				? { ...localStorageFilters }
				: { ...commonStoreMixin.state.filters },
			fetchedMeta: { ...commonStoreMixin.state.fetchedMeta },
		};
	},

	actions: {
		...commonStoreMixin.actions,

		/**
		 * Set controllers list in state
		 * @param {Array} items - Controllers array
		 */
		set_controllers(items = []) {
			this.set_value('itemsList', items);
		},

		/**
		 * Set single controller in state
		 * @param {Object} item - Controller object
		 */
		set_controller(item = null) {
			this.set_value('itemData', item);
		},

		/**
		 * Set controllers filters
		 * @param {Object} filters - Filter object
		 */
		set_controllers_filters(filters) {
			this.set_filters('controllers', filters);
		},
	},

	getters: {
		// Add getters if needed
	},
});
