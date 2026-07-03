import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';
import { getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';

const localStorageFilters = JSON.parse(localStorage.getItem('processes_filters'));
const localStorageStatisticsFilters = JSON.parse(localStorage.getItem('processes_statistics_filters'));
const statisticsFiltersInit = {
	daterange: getDateRange('today', {
		getDateString: true,
	}),
};

export const useProcessesStore = defineStore('processesStore', {
	state: () => ({
		...commonStoreMixin.state,
		itemData: null,
		itemsList: [],
		filters: localStorageFilters || { ...commonStoreMixin.state.filters },
		statistics_filters: localStorageStatisticsFilters
			? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today')
			: { ...statisticsFiltersInit },
		downtimes_filters: { ...commonStoreMixin.state.filters },
		isLoading: false,
		isSaving: false,
		fetchedMeta: {},
	}),
	actions: { ...commonStoreMixin.actions },
	getters: {},
});
