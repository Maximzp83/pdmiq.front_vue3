import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

const localStorageFilters = JSON.parse(localStorage.getItem('users_filters'));
const localStorageReportsFilters = JSON.parse(
	localStorage.getItem('users_reports_filters'),
);

const report_filters_init = {
	max: 10,
	page: 1,
	orderByColumn: '',
	orderByMethod: '',
};

export const useUsersStore = defineStore('usersStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			// User-specific state
			itemData: null, // Single user data
			itemsList: [], // Users list

			// Filters
			filters: localStorageFilters
				? { ...localStorageFilters }
				: { ...commonStoreMixin.state.filters },

			reports_filters: localStorageReportsFilters
				? { ...localStorageReportsFilters }
				: { ...report_filters_init },

			// Loading states
			isLoading: false,
			isSaving: false,

			// Meta data from API
			fetchedMeta: {},
		};
	},

	actions: {
		...commonStoreMixin.actions,

		// Optional: Add specific actions if needed for state transformations
		// (NOT for API calls - those go in components/composables)
	},

	getters: {
		// Add computed properties if needed
		// Example:
		// activeUsers: (state) => state.itemsList.filter(user => user.is_active),
	},
});
