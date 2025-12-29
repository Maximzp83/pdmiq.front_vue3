import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

const localStorageFilters = JSON.parse(localStorage.getItem('plants-vendors_filters'));

export const usePlantsVendorsStore = defineStore('plantsvendorsStore', {
	state: () => ({
		...commonStoreMixin.state,
		itemData: null,
		itemsList: [],
		filters: localStorageFilters || { ...commonStoreMixin.state.filters },
		isLoading: false,
		isSaving: false,
		fetchedMeta: {},
	}),
	actions: { ...commonStoreMixin.actions },
	getters: {},
});
