import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';
import { resetDaterangeIfExpired } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';

const localStorageFilters = JSON.parse(
	localStorage.getItem('maintenance_logs_filters')
);
const localStorageFiltersWO = JSON.parse(
	localStorage.getItem('maintenance_wo_filters')
);
const localStorageFiltersBreakdown = JSON.parse(
	localStorage.getItem('maintenance_logs_breakdown_filters')
);
const localStorageFiltersRequests = JSON.parse(
	localStorage.getItem('maintenance_requests_filters')
);

const scopedState = {
	filters: localStorageFilters
		? resetDaterangeIfExpired({ ...localStorageFilters }, 'last_7_days')
		: { ...filtersState.filters },
	filters_wo: localStorageFiltersWO
		? resetDaterangeIfExpired({ ...localStorageFiltersWO }, 'last_7_days')
		: { ...filtersState.filters },
	filters_breakdown: localStorageFiltersBreakdown
		? { ...localStorageFiltersBreakdown }
		: { ...filtersState.filters },
	filters_requests: localStorageFiltersRequests
		? { ...localStorageFiltersRequests }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };

const getters = {};

// actions
const actions = {
	fetch_maintenance_logs(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/maintenance', payload);
	},

	/*fetch_maintenance_requests(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/maintenance/requests', payload);
	},*/

	fetch_maintenance_log(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_maintenance_statistics(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/statistics`,
			extendedPayload
		);
	},

	save_maintenance_log(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/maintenance`, extendedPayload);
	},

	save_maintenance_request(storeArgs, payload) {
		const extendedPayload = { ...payload };
		return save_data(storeArgs, `/maintenance/requests`, extendedPayload);
	},

	convert_maintenance_request(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/requests/${extendedPayload.itemId}`,
			extendedPayload
		);
	},
	reject_maintenance_request(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'DELETE'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	close_work_order(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/${extendedPayload.itemId}/close`,
			extendedPayload
		);
	},

	set_in_work_work_orders(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/in-work-multiple`,
			extendedPayload
		);
	},

	complete_work_orders(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/complete-multiple`,
			extendedPayload
		);
	},

	close_work_orders(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(storeArgs, `/maintenance/close`, extendedPayload);
	},

	unlock_work_order(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/${extendedPayload.itemId}/open`,
			extendedPayload
		);
	},

	delete_maintenance_log(storeArgs, payload) {
		return delete_item(storeArgs, `/maintenance`, payload);
	},

	export_maintenance_log_to_excel(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			resultMessage: Lang.tt('phrases.File_was_sent_on_your_email')
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/export/excel`,
			extendedPayload
		);
	},

	// -------Import-----------
	upload_work_order(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			notNotify: true,
			method: 'POST'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/upload-work-order`,
			extendedPayload
		);
	},

	import_work_order(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: { text: 'Import process successfully started' }
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/import-work-order`,
			extendedPayload
		);
	},

	revert_import_work_order(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: { text: 'Import process successfully reverted' }
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/revert-import/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	get_import_work_order_progress(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/maintenance/import-progress/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	set_maintenance_logs({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_maintenance_log({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_maintenance_logs_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'maintenance_logs',
			value: filters || { ...filtersState.filters }
		});
	},
	set_maintenance_wo_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'maintenance_wo',
			stateProp: 'filters_wo',
			value: filters || { ...filtersState.filters }
		});
	},
	set_maintenance_logs_breakdown_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'maintenance_logs_breakdown',
			stateProp: 'filters_breakdown',
			value: filters || { ...filtersState.filters }
		});
	},
	set_maintenance_requests_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'maintenance_requests',
			stateProp: 'filters_requests',
			value: filters || { ...filtersState.filters }
		});
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
