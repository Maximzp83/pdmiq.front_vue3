import { defineStore } from 'pinia';
// import { commonStoreMixin } from './mixins/commonStoreMixin';
import { USER_ROLES_TYPES } from '@/constants/global';
import { hasAccessTo, setupPermissionsMap } from '@/utils/hasAccessTo';
import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

const token = localStorage.getItem('access_token');
const user = JSON.parse(localStorage.getItem('authUser'));
const motorIQLink = localStorage.getItem('motorIQLink');
const redirectTo = localStorage.getItem('redirectTo');

/**
 * Auth Store
 * Manages authentication state, user data, and permissions
 *
 * Migrated from: vue2_project/src/store/modules/auth.js
 */
export const useAuthStore = defineStore('authStore', {
	state: () => {
		return {
			// ...commonStoreMixin.state,

			isLoading: false,

			isAuthenticated: !!user || false,
			access_token: token || null,
			authUser: !!token && !!user ? user : null,
			motorIQLink: motorIQLink || '',
			redirectTo: redirectTo || '',
			preventRequests: false,

			// Computed role type flags
			isIndustrialMatrix: undefined,
			isCustomer: undefined,
			isDeveloper: undefined,
		};
	},

	actions: {
		// ...commonStoreMixin.actions,

		/**
		 * Set authentication user and update role flags
		 * @param {Object} user - User object
		 */
		set_auth_user(user) {
			const { role, temp_role } = user;
			const actual_role = temp_role || role;

			localStorage.setItem('authUser', JSON.stringify(user));

			this.preventRequests = false;
			this.authUser = user;
			this.isAuthenticated = true;
			this.isIndustrialMatrix =
				actual_role &&
				(actual_role.type === USER_ROLES_TYPES.INDUSTRIAL_MATRIX ||
					actual_role.type === USER_ROLES_TYPES.DEVELOPER);
			this.isCustomer = actual_role && actual_role.type === USER_ROLES_TYPES.CUSTOMER;
			this.isDeveloper =
				actual_role && actual_role.type === USER_ROLES_TYPES.DEVELOPER;
		},

		/**
		 * Set access token in state and localStorage
		 * @param {string} access_token - JWT token
		 */
		set_access_token(access_token) {
			this.access_token = access_token;
			localStorage.setItem('access_token', access_token);
		},

		/**
		 * Clear authentication state and localStorage
		 */
		clear_auth() {
			localStorage.removeItem('access_token');
			localStorage.removeItem('authUser');

			this.preventRequests = true;
			this.isAuthenticated = false;
			this.isIndustrialMatrix = undefined;
			this.isCustomer = undefined;
			this.isDeveloper = undefined;
			this.access_token = null;
			this.authUser = null;
		},

		/**
		 * Set redirect URL
		 * @param {string} val - Redirect URL
		 */
		set_redirect_to(val) {
			this.redirectTo = val;

			if (val) {
				localStorage.setItem('redirectTo', val);
			} else {
				localStorage.removeItem('redirectTo');
			}
		},

		/**
		 * Set motorIQ link
		 * @param {string} val - MotorIQ base URL
		 */
		set_motor_iq_link(val) {
			this.motorIQLink = val;
			if (val) {
				localStorage.setItem('motorIQLink', val);
			} else {
				localStorage.removeItem('motorIQLink');
			}
		},

		/**
		 * Sign in user with credentials
		 * @param {Object} data - Login credentials (email, password, etc.)
		 * @returns {Promise} Resolves with user data or verification status
		 */
		sign_in(data) {
			this.isLoading = true;

			return api_request.post('/auth/login', {
				data
			}).then(({value}) => {
				// console.log(value)
				// Handle MFA verification status
				if (value.status === 'verification') {
					return value;
				}

				// Handle successful login with token
				if (value.access_token) {
					this.set_access_token(value.access_token);

					// Set motorIQ link if provided
					if (value.motorIQ?.baseUri) {
						this.set_motor_iq_link(value.motorIQ.baseUri);
					}
				}
				this.isLoading = false;
				return value;
			}).catch(error => {
				this.isLoading = false;
				return Promise.reject(error);
			});
		},

		/**
		 * Get authenticated user data
		 * @param {string|null} token - Optional token for token-based auth
		 * @returns {Promise} Resolves with user data
		 */
		get_auth_user(token = null) {
			let url = '/auth/user';
			const headers = {};

			// Handle token-based authentication
			if (token) {
				headers.Authorization = `Bearer ${token}`;
				this.set_access_token(token);
				url += '?refresh_token=true';
			}

			this.isLoading = true;

			return api_request.get(url, {
				headers,
				loading: true,
				notNotify: true,
			}).then(({value}) => {
				if (value.user) {
					// Use temp_role if available, otherwise use regular role
					const user = {
						...value.user,
						role: value.user.temp_role || value.user.role
					};

					// Set user language
					Lang.set(user.language);

					// Update auth store
					this.set_auth_user(user);
				}

				this.isLoading = false;
				return value;
			}).catch(error => {
				this.isLoading = false;
				return Promise.reject(error);
			})
		},

		/**
		 * Sign out user (client-side + server-side logout)
		 * @param {Object} options - Logout options (message, type, duration)
		 * @returns {Promise}
		 */
		sign_out(options = {}) {
			const { message, type = 'success', duration } = options;

			// Call server-side logout in production
			if (process.env.NODE_ENV !== 'development') {
				this.logout();
			}

			// Clear auth state
			this.clear_auth();

			// Clear all module filters
			this.clearFilters();

			// Show notification after a short delay
			return new Promise((resolve) => {
				setTimeout(() => {
					if (window.$notify) {
						window.$notify[type]({
							title: '',
							message: message || 'Successfully logged out',
							duration: duration || 3000,
						});
					}
					resolve();
				}, 100);
			});
		},

		/**
		 * Server-side logout API call
		 * @returns {Promise}
		 */
		logout() {
			return api_request.get('/auth/logout', {
				notNotify: true,
			});
		},

		/**
		 * Send password reset email
		 * @param {Object} data - Email data
		 * @returns {Promise}
		 */
		forgotPassword(data) {
			return api_request.post('/auth/password/email', {
				data,
				resultMessage: Lang.tt('aliases.reset_pass_msg'),
			});
		},

		/**
		 * Reset password with token
		 * @param {Object} data - Password reset data (token, password, password_confirmation)
		 * @returns {Promise}
		 */
		passwordReset(data) {
			return api_request.post('/auth/password/reset', {
				data,
			});
		},

		/**
		 * Check if password reset token is valid
		 * @param {Object} data - Token data
		 * @returns {Promise}
		 */
		checkPasswordToken(data) {
			return api_request.post('/auth/password/token', {
				data,
			});
		},

		/**
		 * Send MFA code via SMS
		 * @param {Object} data - Phone number data
		 * @returns {Promise}
		 */
		sendMfaCode(data) {
			return api_request.post('/auth/mfa/sms/code', {
				data,
				resultMessage: Lang.tt('aliases.mfa_code_send_msg'),
			});
		},

		/**
		 * Verify SMS MFA code
		 * @param {Object} data - Verification code data
		 * @returns {Promise}
		 */
		checkMfaCode(data) {
			return api_request.post('/auth/mfa/sms/verify', {
				data,
				resultMessage: Lang.tt('aliases.verification_ok'),
			});
		},

		/**
		 * Get Google Authenticator QR code
		 * @param {Object} data - QR code request data
		 * @returns {Promise}
		 */
		fetchQrCode(data) {
			return api_request.post('/auth/mfa/google/code', {
				data,
				notNotify: true,
			});
		},

		/**
		 * Verify Google Authenticator code
		 * @param {Object} data - Verification code data
		 * @returns {Promise}
		 */
		checkQrCode(data) {
			return api_request.post('/auth/mfa/google/verify', {
				data,
				resultMessage: Lang.tt('aliases.verification_ok'),
			});
		},

		/**
		 * Set temporary role for user
		 * @param {Object} payload - Payload with method and role data
		 * @returns {Promise}
		 */
		setTempRole(payload) {
			const { data, method = 'POST', ...rest } = payload;
			const url = '/auth/temp-role';

			return api_request(url, {
				...rest,
				method,
				data,
				notNotify: false,
			}).then(response => {
				if (response.user) {
					// Use temp_role if available, otherwise use regular role
					const user = {
						...response.user,
						role: response.user.temp_role || response.user.role
					};

					// Update auth store
					this.set_auth_user(user);
				}

				return response;
			});
		},

		/**
		 * Clear all module filters on logout
		 * This calls set filter actions across all stores
		 */
		clearFilters() {
			// Import stores as needed
			try {
				// Users
				const { useUsersStore } = require('@/stores/UsersStore');
				useUsersStore()?.set_users_filters?.(null);

				// Maintenance
				const { useMaintenanceStore } = require('@/stores/MaintenanceStore');
				useMaintenanceStore()?.set_maintenance_logs_filters?.(null);

				// Companies
				const { useCompaniesStore } = require('@/stores/CompaniesStore');
				useCompaniesStore()?.set_companies_filters?.(null);

				// Controllers
				const { useControllersStore } = require('@/stores/ControllersStore');
				useControllersStore()?.set_controllers_filters?.(null);

				// Equipments
				const { useEquipmentsStore } = require('@/stores/EquipmentsStore');
				useEquipmentsStore()?.set_equipments_filters?.(null);

				// Sensors
				const { useSensorsStore } = require('@/stores/SensorsStore');
				const sensorsStore = useSensorsStore();
				sensorsStore?.set_report_filters?.(null);
				sensorsStore?.set_sensors_filters?.(null);
				sensorsStore?.set_statistics_filters?.(null);

				// Plants
				const { usePlantsStore } = require('@/stores/PlantsStore');
				usePlantsStore()?.set_plants_filters?.(null);

				// Global
				const { useGlobalStore } = require('@/stores/GlobalStore');
				useGlobalStore()?.set_global_filters?.(null);
			} catch (error) {
				console.warn('Error clearing filters:', error);
			}
		},

		set_value(key, value, settings = {}) {
		  this[key] = value;
		  // console.log('set_value', value, this[key])
		  if (settings.toLocalStorage) {
		    const { prop } = settings.toLocalStorage;
		    localStorage.setItem(prop, JSON.stringify(value));
		  }
		},
	},

	getters: {
		/**
		 * Get permissions map for current user
		 * @returns {Object} Permissions map
		 */
		hasAccessMap: (state) => {
			if (!state.authUser?.role) return {};
			return setupPermissionsMap(state.authUser.role);
		},

		/**
		 * Check if user has access to specific permission
		 * @param {string|Array} permissionKeys - Permission key(s) to check
		 * @param {string} method - Permission method (viewing, creating, etc.)
		 * @returns {boolean}
		 */
		hasAccessTo: (state) => (permissionKeys, method) => {
			if (!state.authUser?.role) return false;
			return hasAccessTo({
				role: state.authUser.role,
				permissionKeys,
				method,
			});
		},
	},
});
