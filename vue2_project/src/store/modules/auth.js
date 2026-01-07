import { Notification } from 'element-ui';
import { statusState } from '../commonState';
import { statusMutations, dataMutations } from '../commonMutations';
import { multipurpose_response } from '../commonActions/apiActions';
import {
	getResponseMessage,
	isSuccessStatus,
	handleError
	// setHttpToken
} from '@/services/api/api_helpers';

import { USER_ROLES_TYPES } from '@/constants/global';

import { hasAccessTo, setupPermissionsMap } from '@/utils/hasAccessTo';

import { Lang } from '@/localization';

import { api } from '@/services/api';
import axios from '@/services/api/axiosService';

import router from '@/router';

const token = localStorage.getItem('access_token');
// console.log('1', token)
const user = JSON.parse(localStorage.getItem('authUser'));
const motorIQLink = localStorage.getItem('motorIQLink');
const redirectTo = localStorage.getItem('redirectTo');

// auth state
const state = {
	...statusState,
	preventRequests: false,
	authUser: !!token && !!user ? user : null,
	// authUser: null,
	isAuthenticated: !!user || false,
	isIndustrialMatrix: undefined,
	isCustomer: undefined,
	isDeveloper: undefined,
	// isPlantAdmin: undefined,
	// isPlantUser: undefined,
	// isAuthenticated: false,
	access_token: token || null,
	first_loading_app: true,
	motorIQLink: motorIQLink || '',

	redirectTo: redirectTo || ''
	// hasAccessMap: {}
};

// getters
const getters = {
	hasAccessMap: state => setupPermissionsMap(state.authUser.role),
	hasAccessTo: state => (permissionKeys, method) =>
		hasAccessTo({
			role: state.authUser.role,
			permissionKeys,
			method
		})
	/*hasAccessMap: state => companyId => {
		return state.itemsList.filter(plant => plant.company_id === companyId);
	}*/
};

// actions
const actions = {
	sign_in({ commit }, payload) {
		commit('SET_STATUS_LOADING', true);

		return new Promise((resolve, reject) => {

			api('POST', '/auth/login', payload)
				.then(response => {
					// console.log('sign_in', response)
					if (isSuccessStatus(response)) {
						if (response.data.status && response.data.status == 'verification') {
							resolve(response);
						} else if (response.data.data && response.data.data.access_token) {
							const { access_token, motorIQ } = response.data.data;
							// commit('AUTH_TOKEN_SUCCESS', { token: access_token, user: user });
							// commit('AUTH_TOKEN_SUCCESS', access_token);
							commit('ACCESS_TOKEN_TO_STATE', access_token);
							
							if (motorIQ) {
								localStorage.setItem('motorIQLink', motorIQ.baseUri);
								commit('SET_STATE', {
									stateProp: 'motorIQLink',
									value: motorIQ.baseUri
								});
							}

							// console.log(response)
							resolve(response.data);
							// router.push('/');
							// Notification.success(`Welcome ${user.full_name}`);
						} else {
							commit('AUTH_CLEAR');
							reject();
							// toastr.error('Ошибка', message || 'ответ не содержит данных', { timeOut: 0 });
						}
					} else {
						const message = getResponseMessage(response);
						Notification.error({
							title: Lang.tt(`Error`),
							message: message || 'wrong response status',
							duration: 0
						});
						reject();
					}
					commit('SET_STATUS_LOADING', false);
				})
				.catch(error => {
					// console.log(error)
					commit('AUTH_CLEAR');
					handleError(error, { commit: commit, loading: true, notify: true });
					reject();
				});
		})
	},

	set_access_token({commit/*, state*/}, access_token) {
		const token = access_token /*|| state.access_token*/;
		commit('ACCESS_TOKEN_TO_LOCAL_STORAGE', token);		
	},

	/*remote_authorization({ commit, dispatch }, token) {
		commit('SET_STATUS_LOADING', true);

		commit('SET_STATE', { stateProp: 'access_token', value: token });
		localStorage.setItem('access_token', token);
		

		dispatch('get_auth_user')
			.then(data => {
				
			});			

		api('GET', '/auth/user')
			.then(response => {
				if (isSuccessStatus(response)) {
					if (response.data.data) {
						const { user } = response.data.data;
						commit('SET_STATE', { stateProp: 'authUser', value: user });
					} else {
						commit('AUTH_CLEAR');
					}
				} else {
					const message = getResponseMessage(response);
					Notification.error({ title: Lang.tt(`Error`), message: message || 'wrong response status' });
				}
				commit('SET_STATUS_LOADING', false);
			})
			.catch(error => {
				commit('AUTH_CLEAR');
				handleError(error, { commit: commit, customMessage: 'auth user not fetched' });
			});
	},*/

	get_auth_user({ commit }, token) {
		commit('SET_STATUS_LOADING', true);
		let url = '/auth/user';

		if (token) {
			axios.defaults.headers.common.Authorization = `Bearer ${token}`;

			// setHttpToken(token);
			commit('SET_STATE', { stateProp: 'access_token', value: token });
			localStorage.setItem('access_token', token);
			url += '?refresh_token=true';
		}

		// dispatch('get_auth_user')
		return new Promise((resolve, reject) => {
			api('GET', url)
				.then(response => {
					// console.log('get_auth_user then');
					if (isSuccessStatus(response)) {
						if (response.data.data) {
							let { user } = response.data.data;
							const newUser = { ...user, role: user.temp_role || user.role };

							// if (process.env.NODE_ENV === 'development') newUser.type = 2;

							// ---------------
							Lang.set(newUser.language);

							if (
								window.location.origin !== 'https://testmatrix.assetmatrix.com' &&
								window.location.origin !== 'https://app.industrialmatrix.com'
							) {
								// Lang.set(2); //todo
							}
							// console.log(Lang.currentLangId)
							// setLocalization(newUser.language);
							// ---------------

							commit('AUTH_USER_SUCCESS', newUser);
							// commit('SET_STATE', { stateProp: 'authUser', value: user });
						} else {
							commit('AUTH_CLEAR');
						}
						resolve(response.data);
					} else {
						const message = getResponseMessage(response);
						reject(response);
						Notification.error({
							title: Lang.tt(`Error`),
							message: message || 'wrong response status'
						});
					}
					commit('SET_STATUS_LOADING', false);
				})
				.catch(error => {
					// console.log('get_auth_user catch');
					handleError(error, {
						commit: commit,
						reject: reject,
						customMessage: 'auth user not fetched',
						loading: true
					});
					commit('AUTH_CLEAR');
				});
		});
	},

	sign_out({ commit, dispatch }, payload) {
		payload = payload || {};
		// console.log(payload)
		let { message, type, duration } = payload;
		type = type || 'success';

		commit('SET_STATUS_LOADING', true);

		if (process.env.NODE_ENV !== 'development') {
			dispatch('logout');
		}

		router.push('/login');
		commit('AUTH_CLEAR');
		dispatch('clear_filters');
		// commit('FILTERS_CLEAR');
		// if (message) {
		setTimeout(() => {
			commit('SET_STATUS_LOADING', false);
			Notification[type]({
				title: '',
				message: message || `Successfuly logout`,
				duration: duration
			});
		}, 100);
		// }
	},

	logout({commit, dispatch}) {
		commit('AUTH_CLEAR');
		return multipurpose_response({commit, dispatch}, `/auth/logout`, {
			method: 'GET',
			notNotify: true
		});
	},

	clear_auth({ commit }) {
		commit('AUTH_CLEAR');
	},

	forgot_password(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: Lang.tt('aliases.reset_pass_msg')
			// notNotify: true,
		};
		return multipurpose_response(
			storeArgs,
			`/auth/password/email`,
			extendedPayload
		);
	},

	password_reset(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			// notNotify: true,
		};
		return multipurpose_response(
			storeArgs,
			`/auth/password/reset`,
			extendedPayload
		);
	},

	send_mfa_code(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: Lang.tt('aliases.mfa_code_send_msg'),
			returnResponseOnly: 1			
			// notNotify: true,
		};
		return multipurpose_response(
			storeArgs,
			`/auth/mfa/sms/code`,
			extendedPayload
		);
	},

	check_mfa_code(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: Lang.tt('aliases.verification_ok'),
			returnResponseOnly: 1			
			// notNotify: true,
		};
		return multipurpose_response(
			storeArgs,
			`/auth/mfa/sms/verify`,
			extendedPayload
		);
	},
	check_qr_code(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: Lang.tt('aliases.verification_ok'),
			returnResponseOnly: 1			
			// notNotify: true,
		};
		return multipurpose_response(
			storeArgs,
			`/auth/mfa/google/verify`,
			extendedPayload
		);
	},

	fetch_qr_code(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true,
			returnResponseOnly: 1
			// resultMessage: Lang.tt('aliases.mfa_code_send_msg'),
		};
		return multipurpose_response(
			storeArgs,
			`/auth/mfa/google/code`,
			extendedPayload
		);
	},

	check_password_token(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			// returnResponseOnly: 1			
			// notNotify: true,
		};
		return multipurpose_response(
			storeArgs,
			`/auth/password/token`,
			extendedPayload
		);
	},


	clear_filters({ dispatch }) {
		dispatch('users/set_users_filters', null, { root: true });
		dispatch('maintenance/set_maintenance_logs_filters', null, { root: true });
		dispatch('companies/set_companies_filters', null, { root: true });
		dispatch('controllers/set_controllers_filters', null, { root: true });
		dispatch('equipments/set_equipments_filters', null, { root: true });
		dispatch('sensors/set_report_filters', null, { root: true });
		dispatch('plants/set_plants_filters', null, { root: true });
		dispatch('sensors/set_sensors_filters', null, { root: true });
		dispatch('sensors/set_statistics_filters', null, { root: true });
		dispatch('set_global_filters', null, { root: true });
	},

	set_data({ commit }, data) {
		// console.log('set_data', data)
		commit('SET_STATE', data);
	},

	set_redirect_to({commit}, val) {
		commit('SET_STATE', { stateProp: 'redirectTo', value: val });
		if (val) {
			localStorage.setItem('redirectTo', val);
		} else {
			localStorage.removeItem('redirectTo');
		}
	},

	set_temp_role({ commit }, payload) {
		return new Promise((resolve, reject) => {
			api(payload.method, '/auth/temp-role', payload)
				.then(response => {
					// console.log('get_auth_user then');
					if (isSuccessStatus(response)) {
						let { user } = response.data.data;
						const newUser = { ...user, role: user.temp_role || user.role };
						commit('AUTH_USER_SUCCESS', newUser);
						resolve(user);
					} else {
						const message = getResponseMessage(response);
						reject(response);
						Notification.error({
							title: Lang.tt(`Error`),
							message: message || 'wrong response status'
						});
					}
				})
				.catch(error => {
					handleError(error, {
						commit: commit,
						reject: reject,
						// loading: loading,
						notify: true
					});
				});
		});
	},

	set_auth_user({ commit }, user) {
		commit('AUTH_USER_SUCCESS', user);
	}
};

// mutations
const mutations = {
	...statusMutations,
	...dataMutations,

	AUTH_TOKEN_SUCCESS: (state, token) => {
		// console.log(state, token);
		localStorage.setItem('access_token', token);
		state.access_token = token;
	},

	ACCESS_TOKEN_TO_STATE: (state, token) => {
		state.access_token = token;
	},
	ACCESS_TOKEN_TO_LOCAL_STORAGE: (state, token) => {
		// console.log('ACCESS_TOKEN_TO_LOCAL_STORAGE', token)
		localStorage.setItem('access_token', token);
	},

	AUTH_USER_SUCCESS: (state, user) => {
		const { role, temp_role } = user;
		const actual_role = temp_role || role;
		localStorage.setItem('authUser', JSON.stringify(user));
		state.preventRequests = false;
		state.authUser = user;
		state.isAuthenticated = true;
		state.isIndustrialMatrix =
			actual_role &&
			(actual_role.type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX ||
				actual_role.type === USER_ROLES_TYPES.DEVELOPER);
		state.isCustomer = actual_role && actual_role.type === USER_ROLES_TYPES.CUSTOMER;
		state.isDeveloper =
			actual_role && actual_role.type === USER_ROLES_TYPES.DEVELOPER;
		// state.isPlantAdmin = role && user.role.type === USER_ROLES_TYPES.PLANT_ADMIN;
		// state.isPlantUser = user.role && user.role.type === USER_ROLES_TYPES.PLANT_USER;
		// state.isCustomer = user.role && user.role.type === USER_ROLES_TYPES.CUSTOM;
	},

	AUTH_CLEAR: state => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('authUser');
		axios.defaults.headers.common.Authorization = null;
		// setHttpToken(null);
		state.preventRequests = true;
		state.isAuthenticated = false;
		state.isIndustrialMatrix = undefined;
		state.isCustomer = undefined;
		state.isDeveloper = undefined;
		state.access_token = null;
		state.authUser = null;
	},

	FILTERS_CLEAR: () => {
		console.log(localStorage);

		// localStorage.removeItem('users_filters');
	}
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
