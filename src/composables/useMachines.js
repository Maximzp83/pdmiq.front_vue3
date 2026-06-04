import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

const baseUrl = '/machines';

export function useMachines() {
	const fetchMachines = (params = {}) =>
		api_request.get(baseUrl, {
			params,
			incudeMeta: true,
			notNotify: true,
			storeName: 'machinesStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		});

	const fetchMachine = ({ itemId, ...payload } = {}) =>
		api_request.get(`${baseUrl}/${itemId}`, {
			notNotify: true,
			storeName: 'machinesStore',
			stateProp: 'itemData',
			loadingProp: 'isLoading',
			...payload,
		});

	const saveMachine = (payload = {}) =>
		api_request(baseUrl, {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			storeName: 'machinesStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			...payload,
		});

	const deleteMachine = (payload = {}) =>
		api_request.delete(baseUrl, {
			itemName: Lang.tt('Machine'),
			...payload,
		});

	const reorderMachine = (payload = {}) =>
		api_request.post(`${baseUrl}/reorder`, {
			notNotify: true,
			...payload,
		});

	const fetchMachineAlarms = (params = {}) =>
		api_request.get(`${baseUrl}/alarms`, { params, notNotify: true });

	const fetchMachineRoi = (params = {}) =>
		api_request.get(`${baseUrl}/roi`, { params, notNotify: true });

	return {
		fetchMachines,
		fetchMachine,
		saveMachine,
		deleteMachine,
		reorderMachine,
		fetchMachineAlarms,
		fetchMachineRoi,
	};
}
