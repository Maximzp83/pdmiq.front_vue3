import { defineStore } from 'pinia';
import { commonStoreMixin } from './mixins/commonStoreMixin';
import { api_request } from '@/api/request_provider';

const localStorageFilters = JSON.parse(localStorage.getItem('settings_filters'));

/**
 * Testing Store
 * Manages testing, settings import, and logs state
 *
 * Migrated from: vue2_project/src/store/modules/testing.js
 */
export const useTestingStore = defineStore('testingStore', {
	state: () => {
		return {
			...commonStoreMixin.state,

			filters: localStorageFilters
				? { ...localStorageFilters }
				: { ...commonStoreMixin.state.filters },
			fetchedMeta: { ...commonStoreMixin.state.fetchedMeta },
			notificationTemplates: [],
			lastImportLog: null,
		};
	},

	actions: {
		...commonStoreMixin.actions,

		/**
		 * Set notification templates in state
		 * @param {Array} items - Templates array
		 */
		set_notification_templates(items = []) {
			this.set_value('notificationTemplates', items);
		},

		/**
		 * Set settings filters
		 * @param {Object} filters - Filter object
		 */
		set_settings_filters(filters) {
			this.set_filters('settings', filters);
		},

		/**
		 * Set nested state property
		 * @param {Object} data - Data with stateProp and value
		 */
		set_state_prop(data) {
			const { stateProp, value } = data;
			if (stateProp.includes('.')) {
				const keys = stateProp.split('.');
				let current = this;
				for (let i = 0; i < keys.length - 1; i++) {
					current = current[keys[i]];
				}
				current[keys[keys.length - 1]] = value;
			} else {
				this.set_value(stateProp, value);
			}
		},

		import_settings(payload = {}) {
			return api_request.post('/settings/import', {
				storeName: 'testingStore',
				...payload,
			});
		},

		upload_masterDB(payload = {}) {
			return api_request.post('/settings/upload-masterDB', {
				notNotify: true,
				storeName: 'testingStore',
				...payload,
			});
		},

		import_masterDB(payload = {}) {
			return api_request.post('/settings/import-masterDB', {
				resultMessage: { text: 'Import operation successfull' },
				storeName: 'testingStore',
				...payload,
			});
		},

		upload_motorIQ(payload = {}) {
			return api_request.post('/settings/upload-motorIQ', {
				notNotify: true,
				storeName: 'testingStore',
				...payload,
			});
		},

		import_motorIQ(payload = {}) {
			return api_request.post('/settings/import-motorIQ', {
				notNotify: true,
				storeName: 'testingStore',
				...payload,
			});
		},

		import_motorIQ_repeat(payload = {}) {
			return api_request.post('/settings/import-motorIQ/repeat', {
				resultMessage: { text: 'Repeat import operation successfull' },
				storeName: 'testingStore',
				...payload,
			});
		},

		delete_import_motorIQ_row(payload = {}) {
			return api_request.delete(`/settings/import/log-rows/${payload.rowId}`, {
				resultMessage: { text: 'Row deleted successfully' },
				storeName: 'testingStore',
				...payload,
			});
		},

		get_import_plant_progress({ itemId, ...payload } = {}) {
			return api_request.get(`/settings/import/progress/${itemId}`, {
				notNotify: true,
				storeName: 'testingStore',
				...payload,
			});
		},

		fetch_log({ itemId, ...payload } = {}) {
			return api_request.get(`/logs/${itemId}`, {
				notNotify: true,
				stateProp: 'itemData',
				storeName: 'testingStore',
				...payload,
			});
		},

		fetch_log_errors({ itemId, params, ...payload } = {}) {
			return api_request.get(`/logs/${itemId}/rows`, {
				params,
				incudeMeta: true,
				notNotify: true,
				storeName: 'testingStore',
				...payload,
			});
		},
	},

	getters: {
		// Add getters if needed
	},
});
