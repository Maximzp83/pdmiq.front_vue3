import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

export function useMaintenance() {
	const fetchMaintenanceLogs = (params = {}) =>
		api_request.get('/maintenance', {
			params,
			incudeMeta: true,
			notNotify: true,
			storeName: 'maintenanceStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		});

	const fetchMaintenanceLog = ({ itemId, ...payload } = {}) =>
		api_request.get(`/maintenance/${itemId}`, {
			notNotify: true,
			storeName: 'maintenanceStore',
			stateProp: 'itemData',
			loadingProp: 'isLoading',
			...payload,
		});

	const saveMaintenanceLog = (payload = {}) =>
		api_request('/maintenance', {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			storeName: 'maintenanceStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			...payload,
		});

	const saveMaintenanceRequest = (payload = {}) =>
		api_request('/maintenance/requests', {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			...payload,
		});

	const convertMaintenanceRequest = ({ itemId, ...payload } = {}) =>
		api_request.post(`/maintenance/requests/${itemId}`, payload);

	const rejectMaintenanceRequest = ({ itemId, ...payload } = {}) =>
		api_request.delete(`/maintenance/${itemId}`, payload);

	const deleteMaintenanceLog = (payload = {}) =>
		api_request.delete('/maintenance', {
			itemName: Lang.tt('Maintenance_Log'),
			...payload,
		});

	const fetchMaintenanceStatistics = (params = {}) =>
		api_request.get('/maintenance/statistics', { params, notNotify: true });

	const closeWorkOrder = ({ itemId, ...payload } = {}) =>
		api_request.put(`/maintenance/${itemId}/close`, payload);

	const unlockWorkOrder = ({ itemId, ...payload } = {}) =>
		api_request.put(`/maintenance/${itemId}/open`, payload);

	const setInWorkWorkOrders = (payload = {}) =>
		api_request.put('/maintenance/in-work-multiple', payload);

	const completeWorkOrders = (payload = {}) =>
		api_request.put('/maintenance/complete-multiple', payload);

	const closeWorkOrders = (payload = {}) =>
		api_request.put('/maintenance/close', payload);

	const exportMaintenanceLogToExcel = (params = {}) =>
		api_request.get('/maintenance/export/excel', {
			params,
			resultMessage: Lang.tt('phrases.File_was_sent_on_your_email'),
		});

	const uploadWorkOrder = (payload = {}) =>
		api_request.post('/maintenance/upload-work-order', {
			notNotify: true,
			...payload,
		});

	const importWorkOrder = (payload = {}) =>
		api_request.post('/maintenance/import-work-order', {
			resultMessage: { text: 'Import process successfully started' },
			...payload,
		});

	const revertImportWorkOrder = ({ itemId, ...payload } = {}) =>
		api_request.post(`/maintenance/revert-import/${itemId}`, {
			resultMessage: { text: 'Import process successfully reverted' },
			...payload,
		});

	const getImportWorkOrderProgress = ({ itemId, ...payload } = {}) =>
		api_request.get(`/maintenance/import-progress/${itemId}`, {
			notNotify: true,
			...payload,
		});

	return {
		fetchMaintenanceLogs,
		fetchMaintenanceLog,
		saveMaintenanceLog,
		saveMaintenanceRequest,
		convertMaintenanceRequest,
		rejectMaintenanceRequest,
		deleteMaintenanceLog,
		fetchMaintenanceStatistics,
		closeWorkOrder,
		unlockWorkOrder,
		setInWorkWorkOrders,
		completeWorkOrders,
		closeWorkOrders,
		exportMaintenanceLogToExcel,
		uploadWorkOrder,
		importWorkOrder,
		revertImportWorkOrder,
		getImportWorkOrderProgress,
	};
}
