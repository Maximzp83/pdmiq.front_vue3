import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

const localStorageFilters = JSON.parse(localStorage.getItem('ultrasound_pumps_filters'));

export const useUltrasoundPumpsStore = defineStore('ultrasoundPumpsStore', {
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
