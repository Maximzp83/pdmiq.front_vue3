import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';
import { USER_ROLES_TYPES } from '@/constants/global';
import { hasAccessTo, setupPermissionsMap } from '@/utils/hasAccessTo';

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
			...commonStoreMixin.state,

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
		...commonStoreMixin.actions,

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
		 * Set access token only in state (not localStorage)
		 * @param {string} token - JWT token
		 */
		access_token_to_state(token) {
			this.access_token = token;
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
