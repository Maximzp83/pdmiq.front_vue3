import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';
import { getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';
import { ITEMS_GRID_TYPES } from '@/constants/table';

const localStorageFilters = JSON.parse(localStorage.getItem('assets_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('assets_statistics_filters'),
);

const filters_init = {
	...commonStoreMixin.state.filters,
	max: 18,
	isShowListRefreshed2: false,
	isShowList: false,
};

const statistics_filters_init = {
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,
	daterange: getDateRange('today', {
		getDateString: true,
	}),
};

export const useAssetsStore = defineStore('assetsStore', {
	state: () => ({
		...commonStoreMixin.state,
		itemData: null,
		itemsList: [],
		filters: localStorageFilters
			? resetDaterangeIfExpired({ ...localStorageFilters, isHideList: null }, 'today')
			: { ...filters_init },
		statistics_filters: localStorageStatisticsFilters
			? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today')
			: { ...statistics_filters_init },
		isLoading: false,
		isSaving: false,
		fetchedMeta: {},
	}),
	actions: {
		...commonStoreMixin.actions,

		set_assets_filters(filters) {
			this.set_filters(
				'assets',
				filters ? { ...filters, isHideList: null } : { ...filters_init },
			);
		},

		set_statistics_filters(filters) {
			this.set_filters('assets_statistics', filters || { ...statistics_filters_init }, {
				stateProp: 'statistics_filters',
			});
		},
	},
	getters: {},
});
