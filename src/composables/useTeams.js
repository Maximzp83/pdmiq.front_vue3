import { api_request } from '@/api/request_provider';
import { useTeamsStore } from '@/stores/TeamsStore';

export function useTeams() {
	const teamsStore = useTeamsStore();

	const fetchTeams = (params = {}) => {
		return api_request.get('/teams', {
			params: { max: teamsStore.filters.max, page: teamsStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'teamsStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchTeam = (id) => {
		return api_request.get(`/teams/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'teamsStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createTeam = (data) => {
		return api_request.post('/teams', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'teamsStore',
			notify: true,
			resultMessage: 'Team created successfully',
		});
	};

	const updateTeam = (id, data) => {
		return api_request.put(`/teams/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'teamsStore',
			notify: true,
			resultMessage: 'Team updated successfully',
		});
	};

	const deleteTeam = (id) => {
		return api_request.delete(`/teams/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'teamsStore',
			notify: true,
			resultMessage: 'Team deleted successfully',
		});
	};

	return { teamsStore, fetchTeams, fetchTeam, createTeam, updateTeam, deleteTeam };
}
