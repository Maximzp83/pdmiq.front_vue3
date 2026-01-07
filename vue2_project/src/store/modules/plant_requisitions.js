import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

const localStorageFilters = JSON.parse(localStorage.getItem('requisitions_filters'));

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };

const getters = {};

// actions
const actions = {
	fetch_requisitions(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants/work-orders', payload);
	},

	/*fetch_requisitions_roi(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/plants/work-orders/roi', payload);
	},*/

	fetch_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_requisition(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/plants/work-orders`, extendedPayload);
	},

	fetch_analytics(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			notNotify: true,
			method: 'GET'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/analytics`,
			extendedPayload
		);
	},

	calculate_requisitions_roi(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			notNotify: true,
			method: 'GET'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/roi`,
			extendedPayload
		);
	},

	deny_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}/deny`,
			extendedPayload
		);
	},

	approve_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}/approve`,
			extendedPayload
		);
	},

	reset_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}/reset`,
			extendedPayload
		);
	},

	unapprove_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}/unapprove`,
			extendedPayload
		);
	},

	hold_on_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}/on-hold`,
			extendedPayload
		);
	},

	conclude_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}/conclude`,
			extendedPayload
		);
	},

	take_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}/take`,
			extendedPayload
		);
	},

	complete_requisition(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/plants/work-orders/${extendedPayload.itemId}/complete`,
			extendedPayload
		);
	},

	delete_requisition(storeArgs, payload) {
		return delete_item(storeArgs, `/plants/work-orders`, payload);
	},

	set_requisitions({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_requisition({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_requisitions_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'requisitions',
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
