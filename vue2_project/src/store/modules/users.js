import { dataState, statusState, filtersState } from '../commonState';
import {
	fetch_items,
	multipurpose_response,
	save_data,
	delete_item
} from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';
import { Lang } from '@/localization';

const localStorageFilters = JSON.parse(localStorage.getItem('users_filters'));
const localStorageReportsFilters = JSON.parse(
	localStorage.getItem('users_reports_filters')
);

const report_filters_init = {
	max: 10,
	page: 1,
	orderByColumn: '',
	orderByMethod: ''
};

const client_api_credentials_filters_init = {
	max: -1,
	page: 1,
	orderByColumn: '',
	orderByMethod: ''
};

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	reports_filters: localStorageReportsFilters
		? { ...localStorageReportsFilters }
		: { ...report_filters_init },
	client_api_credentials_filters: { ...client_api_credentials_filters_init },

	fetchedMeta: { ...filtersState.fetchedMeta }
};

const state = { ...dataState, ...statusState, ...scopedState };
const mutations = { ...dataMutations, ...statusMutations };
const getters = {};

// actions
const actions = {
	fetch_users(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/users', payload);
	},

	fetch_user(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData', method: 'GET' };
		return multipurpose_response(
			storeArgs,
			`/users/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	save_user(storeArgs, payload) {
		const extendedPayload = { ...payload, stateProp: 'itemData' };
		return save_data(storeArgs, `/users`, extendedPayload);
	},

	delete_user(storeArgs, payload) {
		return delete_item(storeArgs, `/users`, payload);
	},

	// ------------------
	fetch_reports(storeArgs, payload = {}) {
		const extendedPayload = { ...payload };

		return fetch_items(
			storeArgs,
			`/users/${extendedPayload.userId}/scheduled-reports`,
			extendedPayload
		);
	},

	save_report(storeArgs, payload) {
		const extendedPayload = { ...payload, notNotify: true };
		return save_data(
			storeArgs,
			`/users/${extendedPayload.userId}/scheduled-reports`,
			extendedPayload
		);
	},

	delete_report(storeArgs, payload) {
		// console.log('delete_report',payload)
		return delete_item(
			storeArgs,
			`/users/${payload.userId}/scheduled-reports`,
			payload
		);
	},

	start_report(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST'
		};

		const { userId, reportId } = extendedPayload;

		return multipurpose_response(
			storeArgs,
			`users/${userId}/scheduled-reports/${reportId}/start`,
			extendedPayload
		);
	},

	fetch_client_api_credentials(storeArgs, payload = {}) {
		const extendedPayload = { ...payload };

		return fetch_items(storeArgs, `/client-api-credentials`, extendedPayload);
	},

	create_client_api_credential(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			notNotify: true
		};

		return save_data(storeArgs, `/client-api-credentials`, extendedPayload);
	},

	delete_client_api_credential(storeArgs, payload) {
		return delete_item(storeArgs, `/client-api-credentials`, payload);
	},

	// --------------------
	get_phone_number_verification_code(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: Lang.tt('aliases.mfa_code_send_msg'),
			returnResponseOnly: 1
		};

		return multipurpose_response(
			storeArgs,
			`users/phone-number/code`,
			extendedPayload
		);
	},

	verify_phone_number_code(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: Lang.tt('aliases.verification_ok'),
			returnResponseOnly: 1
		};

		return multipurpose_response(
			storeArgs,
			`users/phone-number/verify`,
			extendedPayload
		);
	},

	set_users({ commit }, items = []) {
		const payload = { stateProp: 'itemsList', value: items };
		commit('SET_STATE', payload);
	},

	set_user({ commit }, item = null) {
		const payload = { stateProp: 'itemData', value: item };
		commit('SET_STATE', payload);
	},

	set_users_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'users',
			value: filters || { ...filtersState.filters }
		});
	},

	set_reports_filters({ commit }, filters) {
		const payload = {
			stateProp: 'reports_filters',
			prefix: 'users_reports',
			value: filters || { ...report_filters_init }
		};
		commit('SET_FILTERS', payload);
	},

	set_client_api_credentials_filters({ commit }, filters) {
		const payload = {
			stateProp: 'client_api_credentials_filters',
			prefix: 'users_client_api_credentials',
			value: filters || { ...client_api_credentials_filters_init }
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
