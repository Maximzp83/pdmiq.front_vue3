import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

const localStorageFilters = JSON.parse(localStorage.getItem('controllers_filters'));

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
	fetch_controllers(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/controllers', payload);
	},

	fetch_controller(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/controllers/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_controller(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/controllers`, extendedPayload);
	},

	controller_cmd(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'PUT'
		};
		return multipurpose_response(
			storeArgs,
			`/controllers/${extendedPayload.itemId}/cmd`,
			extendedPayload
		);
	},

	fetch_dxm_commands_history(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/controllers/${extendedPayload.controllerId}/commands`,
			extendedPayload
		);
	},

	request_dxm_command(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			notNotify: true,
			method: 'POST'
		};
		return multipurpose_response(
			storeArgs,
			`/controllers/${extendedPayload.controllerId}/commands`,
			extendedPayload
		);
	},

	controller_multiple_fft(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			// notNotify: true,
			method: 'POST'
		};
		return multipurpose_response(
			storeArgs,
			`/controllers/fft/${extendedPayload.controllerId}/group`,
			extendedPayload
		);
	},

	export_controllers(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			alternateResponseProp: 'data'
			// responseType: 'blob'
		};
		return multipurpose_response(storeArgs, `/controllers/export`, extendedPayload);
	},

	register_cmd(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST'
		};
		return multipurpose_response(storeArgs, `/registers/command`, extendedPayload);
	},

	delete_controller(storeArgs, payload) {
		return delete_item(storeArgs, `/controllers`, payload);
	},

	set_controllers({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_controller({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_controllers_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'controllers',
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
