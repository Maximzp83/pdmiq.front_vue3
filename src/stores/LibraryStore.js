import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

const localStorageFilters = JSON.parse(localStorage.getItem('libraries_filters'));

export const useLibraryStore = defineStore('libraryStore', {
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
