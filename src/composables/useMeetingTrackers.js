import { api_request } from '@/api/request_provider';
import { useMeetingTrackersStore } from '@/stores/MeetingTrackersStore';

export function useMeetingTrackers() {
	const meetingtrackersStore = useMeetingTrackersStore();

	const fetchMeetingTrackers = (params = {}) => {
		return api_request.get('/meeting-trackers', {
			params: { max: meetingtrackersStore.filters.max, page: meetingtrackersStore.filters.page, ...params },
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'meetingtrackersStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	const fetchMeetingTrackersSingle = (id) => {
		return api_request.get(`/meeting-trackers/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'meetingtrackersStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	const createMeetingTrackersSingle = (data) => {
		return api_request.post('/meeting-trackers', {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'meetingtrackersStore',
			notify: true,
			resultMessage: 'Meeting tracker created successfully',
		});
	};

	const updateMeetingTrackersSingle = (id, data) => {
		return api_request.put(`/meeting-trackers/${id}`, {
			data,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'meetingtrackersStore',
			notify: true,
			resultMessage: 'Meeting tracker updated successfully',
		});
	};

	const deleteMeetingTrackersSingle = (id) => {
		return api_request.delete(`/meeting-trackers/${id}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'meetingtrackersStore',
			notify: true,
			resultMessage: 'Meeting tracker deleted successfully',
		});
	};

	return { meetingtrackersStore, fetchMeetingTrackers, fetchMeetingTrackersSingle, createMeetingTrackersSingle, updateMeetingTrackersSingle, deleteMeetingTrackersSingle };
}
