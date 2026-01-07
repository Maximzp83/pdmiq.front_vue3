import { dataState, statusState, filtersState } from '../commonState';
import { multipurpose_response, fetch_items } from '../commonActions/apiActions';
import { dataMutations, statusMutations } from '../commonMutations';

const localStorageFilters = JSON.parse(localStorage.getItem('settings_filters'));

const scopedState = {
	filters: localStorageFilters
		? { ...localStorageFilters }
		: { ...filtersState.filters },
	fetchedMeta: { ...filtersState.fetchedMeta },
	notificationTemplates: []
};

const state = {
	...dataState,
	...statusState,
	...scopedState,
	lastImportLog: null
};
const mutations = { ...dataMutations, ...statusMutations };

const getters = {};

// actions
const actions = {
	sent_notification(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notSetToStore: true,
			loadingProp: 'isSaving',
			resultMessage: { text: 'notification sended' }
		};
		return multipurpose_response(
			storeArgs,
			`/notifications/emulate`,
			extendedPayload
		);
	},
	// ------------------

	fetch_notification_templates(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/notifications/templates`,
			extendedPayload
		);
	},

	save_notification_templates(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			action: 'fetch_notification_templates'
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/notifications/templates`,
			extendedPayload
		);
	},

	set_notification_templates({ commit }, items = []) {
		const payload = { stateProp: 'notificationTemplates', value: items };
		commit('SET_STATE', payload);
	},

	import_settings(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST'
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(storeArgs, `/settings/import`, extendedPayload);
	},

	upload_masterDB(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/settings/upload-masterDB`,
			extendedPayload
		);
	},

	import_masterDB(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: { text: 'Import operation successfull' }
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/settings/import-masterDB`,
			extendedPayload
		);
	},

	upload_motorIQ(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/settings/upload-motorIQ`,
			extendedPayload
		);
	},

	import_motorIQ(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			notNotify: true
			// resultMessage: { text: 'Import operation successfull' }
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/settings/import-motorIQ`,
			extendedPayload
		);
	},

	import_motorIQ_repeat(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'POST',
			resultMessage: { text: 'Repeat import operation successfull' }
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/settings/import-motorIQ/repeat`,
			extendedPayload
		);
	},

	delete_import_motorIQ_row(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'DELETE',
			resultMessage: { text: 'Row deleted successfully' }
			// stateProp: 'notificationTemplates'
		};
		return multipurpose_response(
			storeArgs,
			`/settings/import/log-rows/${payload.rowId}`,
			extendedPayload
		);
	},

	get_import_plant_progress(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true
		};
		return multipurpose_response(
			storeArgs,
			`/settings/import/progress/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_logs(storeArgs, payload = {}) {
		// const newPayload = {...payload, stateProp:'itemsList'}
		return fetch_items(storeArgs, '/logs', payload);
	},
	fetch_log(storeArgs, payload) {
		const extendedPayload = {
			...payload,
			method: 'GET',
			notNotify: true,
			stateProp: 'itemData'
		};
		return multipurpose_response(
			storeArgs,
			`/logs/${extendedPayload.itemId}`,
			extendedPayload
		);
	},

	fetch_log_errors(storeArgs, payload) {
		return fetch_items(storeArgs, `/logs/${payload.itemId}/rows`, payload);
	},

	set_settings_filters({ commit }, filters) {
		commit('SET_FILTERS', {
			prefix: 'settings',
			value: filters || { ...filtersState.filters }
		});
	},

	set_state_prop({ commit }, data) {
		commit('SET_NESTED_STATE', data);
	}

	// set_sensor({ commit }, item = null) {
	// 	const payload = { stateProp: 'itemData', value: item };
	// 	commit('SET_STATE', payload);
	// },
};

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
