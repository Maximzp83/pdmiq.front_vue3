import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';
import { getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';
import { ITEMS_GRID_TYPES } from '@/constants/table';

const localStorageFilters = JSON.parse(localStorage.getItem('equipments_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('equipments_statistics_filters'),
);

const filters_init = {
	...commonStoreMixin.state.filters,
	daterange: getDateRange('today', {
		getDateString: true,
	}),
	max: 24,
	hasSensors: true,
	isShowList: true,
	isShowListRefreshed2: false,
};

const statistics_filters_init = {
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,
	daterange: getDateRange('today', {
		getDateString: true,
	}),
};

/**
 * Equipments Store
 * Manages equipment items, faults, vibration analysis rules, and metrics
 *
 * Migrated from: vue2_project/src/store/modules/equipments.js
 */
export const useEquipmentsStore = defineStore('equipmentsStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			filters: localStorageFilters
				? resetDaterangeIfExpired(
						{ ...localStorageFilters, isHideList: null },
						'today',
					)
				: { ...filters_init },
			statistics_filters: localStorageStatisticsFilters
				? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today')
				: { ...statistics_filters_init },
			fetchedMeta: { ...commonStoreMixin.state.fetchedMeta },
		};
	},

	actions: {
		...commonStoreMixin.actions,

		/**
		 * Set equipments faults list
		 * @param {Array} items - Equipment faults array
		 */
		set_equipments_faults(items = []) {
			this.set_value('itemsList', items);
		},

		/**
		 * Set single equipment fault
		 * @param {Object} item - Equipment fault object
		 */
		set_equipments_fault(item = null) {
			this.set_value('itemData', item);
		},

		/**
		 * Set equipments list
		 * @param {Array} items - Equipments array
		 */
		set_equipments(items = []) {
			this.set_value('itemsList', items);
		},

		/**
		 * Set single equipment
		 * @param {Object} item - Equipment object
		 */
		set_equipment(item = null) {
			this.set_value('itemData', item);
		},

		/**
		 * Set equipments filters
		 * @param {Object} filters - Filter object
		 */
		set_equipments_filters(filters) {
			this.set_filters(
				'equipments',
				filters ? { ...filters, isHideList: null } : null,
			);
		},

		/**
		 * Set statistics filters
		 * @param {Object} filters - Filter object
		 */
		set_statistics_filters(filters) {
			this.set_filters('equipments_statistics', filters, {
				stateProp: 'statistics_filters',
			});
		},
	},

	getters: {
		// Add getters if needed
	},
});
