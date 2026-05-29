import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';

import { /*getObjectVal,*/ getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';

const localStorageFilters = JSON.parse(localStorage.getItem('sensors_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('statistics_filters')
);
const localStorageReportFilters = JSON.parse(
	localStorage.getItem('equipments_report_filters')
);
const localStorageFFTStatisticsFilters = JSON.parse(
	localStorage.getItem('fft_statistics_filters')
);

const statistics_filters_init = {
	daterange: getDateRange('today', {
		getDateString: true,
		withTime: true
	})
	// daterange: ['2021-12-20', '2021-12-21'],
	// daterange: []
};

const report_filters_init = {
	// daterange: lastWeekDateRange(),
	alert_types: []
	// acknowledgeOnly: false
};

const charts_filters_init = {
	['chart-1']: { y_min: null },
	['chart-2']: { y_min: null },
	['chart-3']: { y_min: null },
	['chart-4']: { y_min: null },
	['chart-5']: { y_min: null },
	['chart-17']: { y_min: null }
};

export const useSensorsStore = defineStore('sensorsStore', {
	state: () => {
		return {
			statistics_filters: localStorageStatisticsFilters
				? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today', true)
				: { ...statistics_filters_init },

			fft_statistics_filters: localStorageFFTStatisticsFilters
				? resetDaterangeIfExpired({ ...localStorageFFTStatisticsFilters }, 'today', true)
				: { ...statistics_filters_init },

			sensorWarningsData: {},
			warningsLoading: false,
			tresholdsLoading: false,
			sensorTresholdsOurData: {},

			ultrasoundProccessLoading: false,

			filters: localStorageFilters
				? { ...localStorageFilters }
				: { ...commonStoreMixin.state.filters },
			fetchedMeta: { ...commonStoreMixin.state.fetchedMeta },

			charts_filters: {
				...charts_filters_init
			},

			sensorJobSaving: false,

			// --------------
			historyLoading: false,
			historyList: [],
			report_filters: localStorageReportFilters
				? { ...localStorageReportFilters }
				: { ...report_filters_init },

			// report_items_aligment: 'aligment-grid',
			prevent_drop_daterange: false,
			gainAdjustmentInProcess: false
		}
	},

	actions: {
		...commonStoreMixin.actions,

		set_sensors(items = []) {
			this.set_value('itemsList', items);
		},

		set_sensor(item = null) {
			this.set_value('itemData', item);
		},

		set_sensors_filters(filters) {
			this.set_value('filters', filters || { ...commonStoreMixin.state.filters }, {
				toLocalStorage: { prop: 'sensors_filters' },
			});
		},

		set_statistics_filters(filters) {
			this.set_value(
				'statistics_filters',
				filters ? { ...filters } : { ...statistics_filters_init },
				{ toLocalStorage: { prop: 'statistics_filters' } },
			);
		},

		set_fft_statistics_filters(filters) {
			this.set_value(
				'fft_statistics_filters',
				filters ? { ...filters } : { ...statistics_filters_init },
				{ toLocalStorage: { prop: 'fft_statistics_filters' } },
			);
		},

		set_charts_filters(filters) {
			this.set_value('charts_filters', filters || { ...charts_filters_init }, {
				toLocalStorage: { prop: 'charts_filters' },
			});
		},

		set_sensor_state({ stateProp, value }) {
			this.set_value(stateProp, value);
		},

		set_report_filters(filters) {
			this.set_value('report_filters', filters || { ...report_filters_init }, {
				toLocalStorage: { prop: 'equipments_report_filters' },
			});
		},
	},

	getters: {
		// ...itemsMixin.getters,
	}
});
