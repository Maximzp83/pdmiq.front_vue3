import { api_request } from '@/api/request_provider';

const storeName = 'processesStore';

export function useProcesses() {
	const fetchProcesses = (params = {}, payload = {}) =>
		api_request.get('/plants/conveyor/processes', {
			params,
			storeName,
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			incudeMeta: true,
			...payload,
		});

	const fetchProcess = ({ itemId, ...payload } = {}) =>
		api_request.get(`/plants/conveyor/processes/${itemId}`, {
			storeName,
			stateProp: 'itemData',
			notNotify: true,
			...payload,
		});

	const saveProcess = (payload = {}) =>
		api_request('/plants/conveyor/processes', {
			storeName,
			stateProp: 'itemData',
			...payload,
		});

	const deleteProcess = (payload = {}) =>
		api_request.delete('/plants/conveyor/processes', {
			storeName,
			...payload,
		});

	const fetchDowntimes = ({ processId, ...payload } = {}) =>
		api_request.get(`/plants/conveyor/${processId}/downtimes`, {
			storeName,
			stateProp: 'downtimesList',
			loadingProp: 'downtimesLoading',
			incudeMeta: true,
			notNotify: true,
			...payload,
		});

	const closeProcessDowntime = ({ itemId, ...payload } = {}) =>
		api_request.put(`/plants/conveyor/downtimes/${itemId}/close`, payload);

	const saveProcessDowntime = ({ processId, ...payload } = {}) =>
		api_request.post(`/plants/conveyor/${processId}/downtimes`, payload);

	const changeProcessBreakTime = ({ itemId, ...payload } = {}) =>
		api_request.post(`/plants/conveyor/breaks/${itemId}/offset`, payload);

	const pingSocketEndpoint = ({ url, ...payload } = {}) =>
		api_request.post(url, {
			notNotify: true,
			...payload,
		});

	return {
		fetchProcesses,
		fetchProcess,
		saveProcess,
		deleteProcess,
		fetchDowntimes,
		closeProcessDowntime,
		saveProcessDowntime,
		changeProcessBreakTime,
		pingSocketEndpoint,
	};
}
