import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';
import { getDateRange } from '@/helpers';
import { ITEMS_GRID_TYPES } from '@/constants/table';

const localStorageFilters = JSON.parse(localStorage.getItem('production_lines_filters'));
const localStorageFiltersUtility = JSON.parse(localStorage.getItem('production_lines_utility_filters'));
const localStorageStatisticsFilters = JSON.parse(localStorage.getItem('production_lines_statistics_filters'));

const listFilters = {
	...commonStoreMixin.state.filters,
	max: 18,
	isShowListRefreshed2: false,
	isShowList: false,
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,
};

const statisticsFilters = {
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,
	isShowList: false,
	daterange: getDateRange('last_7_days', { getDateString: true }),
};

export const useProductionLinesStore = defineStore('productionLinesStore', {
	state: () => ({
		...commonStoreMixin.state,
		itemData: null,
		itemsList: [],
		filters: localStorageFilters || { ...listFilters },
		utility_filters: localStorageFiltersUtility || { ...listFilters },
		statistics_filters: localStorageStatisticsFilters || { ...statisticsFilters },
		isLoading: false,
		isSaving: false,
		fetchedMeta: {},
	}),
	actions: { ...commonStoreMixin.actions },
	getters: {},
});
