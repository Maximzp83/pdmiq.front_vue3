import { api_request } from '@/api/request_provider';

export function useSettings() {
	const fetchEquipmentTypes = (payload = {}) =>
		api_request.get('/equipments/types', {
			notNotify: true,
			...payload,
		});

	const registerCommand = (payload = {}) =>
		api_request.post('/registers/command', payload);

	const fetchCompanies = (payload = {}) =>
		api_request.get('/companies', {
			notNotify: true,
			...payload,
		});

	const fetchPlants = (payload = {}) =>
		api_request.get('/plants', {
			notNotify: true,
			...payload,
		});

	const fetchControllers = (payload = {}) =>
		api_request.get('/controllers', {
			notNotify: true,
			...payload,
		});

	return {
		fetchEquipmentTypes,
		registerCommand,
		fetchCompanies,
		fetchPlants,
		fetchControllers,
	};
}
