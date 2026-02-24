import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';
import { /*getObjectVal,*/ getDateRange } from '@/helpers';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';

import { ITEMS_GRID_TYPES } from '@/constants/table';

// import { lastWeekDateRange } from '@/services/api/api_helpers';
const localStorageFilters = JSON.parse(localStorage.getItem('equipments_filters'));
const localStorageStatisticsFilters = JSON.parse(
	localStorage.getItem('equipments_statistics_filters')
);

const filters_init = {
	...filtersState.filters,
	daterange: getDateRange('today', {
		getDateString: true
		// withTime: true
	}),
	max: 24,
	hasSensors: true,
	isShowList: true,
	isShowListRefreshed2: false
};

const statistics_filters_init = {
	items_active_grid_type: ITEMS_GRID_TYPES.GRID,

	daterange: getDateRange('today', {
		getDateString: true
		// withTime: true
	})
	// daterange: ['2021-11-11', '2021-11-13'],
	// daterange: []
};
// console.log(localStorageFilters, filters_init)

const scopedState = {
	// postsSomeData: {}
	filters: localStorageFilters
		? resetDaterangeIfExpired({ ...localStorageFilters, isHideList: null }, 'today')
		: { ...filters_init },
	statistics_filters: localStorageStatisticsFilters
		? resetDaterangeIfExpired({ ...localStorageStatisticsFilters }, 'today')
		: { ...statistics_filters_init },
	// daterange: ['2021-12-20', '2021-12-21'],

	fetchedMeta: { ...filtersState.fetchedMeta }
	// analoguesList: [],
	// analoguesLoading: false
};
// console.log(scopedState)

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };

const getters = {};

// actions
const actions = {
	fetch_equipments_faults(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/equipments/faults', payload);
	},

	fetch_equipments_fault(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/faults/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_analogues(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			// stateProp: 'analoguesList',
			// loadingProp: 'analoguesLoading',
			notNotify: true,
			alternateResponseProp: 'data'
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/${extendedPayload.itemId}/analogues`,
			extendedPayload
		);
	},

	fetch_rpm_options(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			// alternateResponseProp: 'data'
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/rpm-options`,
			extendedPayload
		);
	},

	save_equipments_fault(storeArgs, payload) {
		const extendedPayload = { ...payload, notSetToStore: true };
		return save_data(storeArgs, `/equipments/faults`, extendedPayload);
	},

	delete_equipments_faults(storeArgs, payload) {
		return delete_item(storeArgs, `/equipments/faults`, payload);
	},

	set_equipments_faults({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_equipments_fault({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	/*set_equipments_faults_filters({ commit }, filters) {
		commit('SET_FILTERS', { prefix: 'equipments', value: filters || { ...filtersState.filters } });
	},*/

	// ------------
	fetch_equipments(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			prepareData: 'prepareEquipmentsList'
		};
		return fetch_items(storeArgs, '/equipments', extendedPayload);
	},

	fetch_equipments_dashboard(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			prepareData: 'prepareEquipmentsList'
		};
		return fetch_items(storeArgs, '/equipments/dashboard', extendedPayload);
	},

	equipment_repairs_process(storeArgs, payload) {
		const extendedPayload = {
			...payload
		};
		// console.log(extendedPayload)
		return multipurpose_response(
			storeArgs,
			`/equipments/${extendedPayload.itemId}/repairs`,
			extendedPayload
		);
	},

	ping_socket_endpoint(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
		};
		// console.log(extendedPayload)
		return multipurpose_response(storeArgs, payload.url, extendedPayload);
	},

	fetch_health_statistics(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/equipments/health`, extendedPayload);
	},

	set_equipment_rpm_params(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT',
			// notNotify: true
		};
		return multipurpose_response(storeArgs, `/equipments/${payload.itemId}/rpm-params`, extendedPayload);
	},

	// -------------------------

	fetch_vibration_analysis_rules(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/types/${payload.equipmentTypeId}/vibration-analysis-rules`,
			extendedPayload
		);
	},

	update_vibration_analysis_rules(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			resultMessage: 'Vibration Analysis Rules Saved',
			method: 'POST',
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/types/${payload.equipmentTypeId}/vibration-analysis-rules`,
			extendedPayload
		);
	},

	fetch_vibration_analysis_rule_crossover_options(storeArgs, payload = {}) {
		const extendedPayload = {
			...payload,
			notNotify: true
		};
		const {equipmentTypeId, ruleId } = extendedPayload;

		return multipurpose_response(
			storeArgs,
			`/equipments/types/${equipmentTypeId}/vibration-analysis-rules/${ruleId}/crossover-options-values`,
			extendedPayload
		);
	},


	//-------------
	fetch_metric_multi_views(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
		};
		return multipurpose_response(storeArgs, `/equipments/${payload.equipmentId}/metric-multi-views`, extendedPayload);
	},

	save_metric_multi_views(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: { text: 'multi-view saved' }
		};
		return multipurpose_response(storeArgs, `/equipments/${payload.equipmentId}/metric-multi-views`, extendedPayload);
	},

	save_metric_multi_views_thresholds(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: { text: 'thresholds updated' }
		};
		const {multiViewId, graphId} = payload;
		return multipurpose_response(storeArgs, `/metric-multi-views/${multiViewId}/graphs/${graphId}/thresholds`, extendedPayload);
	},

	// ----------

	fetch_equipment(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData',
			prepareData: 'prepareEquipmentsList',
			prepareDataSettings: {
				addSettingItems: [{ key: 'equipmentSubType', val_key: 'equipmentSubType' }]
			}
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_equipment(storeArgs, payload) {
		const extendedPayload = { ...payload, notSetToStore: true };
		return save_data(storeArgs, `/equipments`, extendedPayload);
	},

	delete_equipment(storeArgs, payload) {
		return delete_item(storeArgs, `/equipments`, payload);
	},

	reorder_equipment(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
		};
		return multipurpose_response(storeArgs, `/equipments/reorder`, extendedPayload);
	},

	reorder_sensors(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/${extendedPayload.itemId}/card-items-order`,
			extendedPayload
		);
	},

	move_equipment(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST'
			// notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/equipments/move/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	add_to_favorites_equipment(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			alternateResponseProp: 'data'			
			// notNotify: true
		};

		/*if (extendedPayload) {
			console.log(extendedPayload)
			return
		}*/

		return multipurpose_response(
			storeArgs,
			`/equipments/${extendedPayload.itemId}/favorite`,
			extendedPayload
		);
	},

	set_equipments({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_equipment({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_equipments_filters({ commit }, filters) {
		// console.log({...filters, isHideList: null })
		commit('SET_FILTERS', {
			prefix: 'equipments',
			value: filters ? { ...filters, isHideList: null } : { ...filtersState.filters }
		});
	},

	set_statistics_filters({ commit }, filters) {
		const payload = {
			stateProp: 'statistics_filters',
			prefix: 'equipments_statistics',
			value: filters || { ...statistics_filters_init }
		};
		commit('SET_FILTERS', payload);
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
