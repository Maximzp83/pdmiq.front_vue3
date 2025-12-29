import { api_request } from '@/api/request_provider';
import { useAuthStore } from '@/stores/AuthStore';
import { Lang } from '@/localization';

/**
 * Auth composable for managing authentication and user sessions
 * Handles login, logout, MFA, password reset, and user management
 *
 * Migrated from: vue2_project/src/store/modules/auth.js
 */
export const useAuth = () => {
	const authStore = useAuthStore();

	/**
	 * Sign in user with credentials
	 * @param {Object} data - Login credentials (email, password, etc.)
	 * @returns {Promise} Resolves with user data or verification status
	 */
	const signIn = (data) => {
		return api_request.post('/auth/login', {
			data,
			loading: true,
			notNotify: true,
		}).then(response => {
			// Handle MFA verification status
			if (response.status === 'verification') {
				return response;
			}

			// Handle successful login with token
			if (response.access_token) {
				authStore.access_token_to_state(response.access_token);

				// Set motorIQ link if provided
				if (response.motorIQ?.baseUri) {
					authStore.set_motor_iq_link(response.motorIQ.baseUri);
				}
			}

			return response;
		});
	};

	/**
	 * Get authenticated user data
	 * @param {string|null} token - Optional token for token-based auth
	 * @returns {Promise} Resolves with user data
	 */
	const getAuthUser = (token = null) => {
		let url = '/auth/user';
		const headers = {};

		// Handle token-based authentication
		if (token) {
			headers.Authorization = `Bearer ${token}`;
			authStore.access_token_to_state(token);
			localStorage.setItem('access_token', token);
			url += '?refresh_token=true';
		}

		return api_request.get(url, {
			headers,
			loading: true,
			notNotify: true,
		}).then(response => {
			if (response.user) {
				// Use temp_role if available, otherwise use regular role
				const user = {
					...response.user,
					role: response.user.temp_role || response.user.role
				};

				// Set user language
				Lang.set(user.language);

				// Update auth store
				authStore.set_auth_user(user);
			}

			return response;
		});
	};

	/**
	 * Sign out user (client-side + server-side logout)
	 * @param {Object} options - Logout options (message, type, duration)
	 * @returns {Promise}
	 */
	const signOut = (options = {}) => {
		const { message, type = 'success', duration } = options;

		// Call server-side logout in production
		if (process.env.NODE_ENV !== 'development') {
			logout();
		}

		// Clear auth state
		authStore.clear_auth();

		// Clear all module filters
		clearFilters();

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
	};

	/**
	 * Server-side logout API call
	 * @returns {Promise}
	 */
	const logout = () => {
		return api_request.get('/auth/logout', {
			notNotify: true,
		});
	};

	/**
	 * Send password reset email
	 * @param {Object} data - Email data
	 * @returns {Promise}
	 */
	const forgotPassword = (data) => {
		return api_request.post('/auth/password/email', {
			data,
			resultMessage: Lang.tt('aliases.reset_pass_msg'),
		});
	};

	/**
	 * Reset password with token
	 * @param {Object} data - Password reset data (token, password, password_confirmation)
	 * @returns {Promise}
	 */
	const passwordReset = (data) => {
		return api_request.post('/auth/password/reset', {
			data,
		});
	};

	/**
	 * Check if password reset token is valid
	 * @param {Object} data - Token data
	 * @returns {Promise}
	 */
	const checkPasswordToken = (data) => {
		return api_request.post('/auth/password/token', {
			data,
		});
	};

	/**
	 * Send MFA code via SMS
	 * @param {Object} data - Phone number data
	 * @returns {Promise}
	 */
	const sendMfaCode = (data) => {
		return api_request.post('/auth/mfa/sms/code', {
			data,
			resultMessage: Lang.tt('aliases.mfa_code_send_msg'),
		});
	};

	/**
	 * Verify SMS MFA code
	 * @param {Object} data - Verification code data
	 * @returns {Promise}
	 */
	const checkMfaCode = (data) => {
		return api_request.post('/auth/mfa/sms/verify', {
			data,
			resultMessage: Lang.tt('aliases.verification_ok'),
		});
	};

	/**
	 * Get Google Authenticator QR code
	 * @param {Object} data - QR code request data
	 * @returns {Promise}
	 */
	const fetchQrCode = (data) => {
		return api_request.post('/auth/mfa/google/code', {
			data,
			notNotify: true,
		});
	};

	/**
	 * Verify Google Authenticator code
	 * @param {Object} data - Verification code data
	 * @returns {Promise}
	 */
	const checkQrCode = (data) => {
		return api_request.post('/auth/mfa/google/verify', {
			data,
			resultMessage: Lang.tt('aliases.verification_ok'),
		});
	};

	/**
	 * Set temporary role for user
	 * @param {Object} payload - Payload with method and role data
	 * @returns {Promise}
	 */
	const setTempRole = (payload) => {
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
				authStore.set_auth_user(user);
			}

			return response;
		});
	};

	/**
	 * Clear all module filters on logout
	 * This calls set filter actions across all stores
	 */
	const clearFilters = () => {
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
	};

	return {
		authStore,
		signIn,
		getAuthUser,
		signOut,
		logout,
		forgotPassword,
		passwordReset,
		checkPasswordToken,
		sendMfaCode,
		checkMfaCode,
		fetchQrCode,
		checkQrCode,
		setTempRole,
		clearFilters,
	};
};
