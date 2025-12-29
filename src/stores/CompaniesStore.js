import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

const localStorageFilters = JSON.parse(localStorage.getItem('companies_filters'));

export const useCompaniesStore = defineStore('companiesStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			// Company-specific state
			itemData: null, // Single company data
			itemsList: [], // Companies list

			// Filters
			filters: localStorageFilters
				? { ...localStorageFilters }
				: { ...commonStoreMixin.state.filters },

			// Loading states
			isLoading: false,
			isSaving: false,

			// Meta data from API
			fetchedMeta: {},
		};
	},

	actions: {
		...commonStoreMixin.actions,
	},

	getters: {
		// Add computed properties if needed
	},
});
