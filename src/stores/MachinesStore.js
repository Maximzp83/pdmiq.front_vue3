import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

import { /*getObjectVal,*/ getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';
import { ITEMS_GRID_TYPES } from '@/constants/table';

const localStorageFilters = JSON.parse(localStorage.getItem('machines_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('machines_statistics_filters'),
);

const statistics_filters_init = {
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,

	daterange: getDateRange('last_7_days', {
		getDateString: true,
		// withTime: true
	}),
};

export const useMachinesStore = defineStore('machinesStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			filters: localStorageFilters
				? { ...localStorageFilters }
				: { ...commonStoreMixin.state.filters },
			statistics_filters: localStorageStatisticsFilters
				? resetDaterangeIfExpired(
						{ ...localStorageStatisticsFilters },
						'last_7_days',
					)
				: { ...statistics_filters_init },
		};
	},

	actions: {
		...commonStoreMixin.actions,
	},

	getters: {
		// ...itemsMixin.getters,
	},
});
