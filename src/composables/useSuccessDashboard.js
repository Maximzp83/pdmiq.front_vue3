import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';

const meetingTrackersBaseUrl = '/plants/meeting-trackers';
const roiOnePagersBaseUrl = '/plants/roi/one-pagers';

export function useSuccessDashboard() {
	const fetchMeetingTrackers = (params = {}) =>
		api_request.get(meetingTrackersBaseUrl, {
			params,
			incudeMeta: true,
			notNotify: true,
			storeName: 'meetingtrackersStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		});

	const fetchMeetingTracker = ({ itemId, ...payload } = {}) =>
		api_request.get(`${meetingTrackersBaseUrl}/${itemId}`, {
			notNotify: true,
			storeName: 'meetingtrackersStore',
			stateProp: 'itemData',
			loadingProp: 'isLoading',
			...payload,
		});

	const fetchLastMeetingTracker = (params = {}) =>
		api_request.get(`${meetingTrackersBaseUrl}/last`, { params, notNotify: true });

	const fetchMeetingTrackerRoi = (params = {}) =>
		api_request.get(`${meetingTrackersBaseUrl}/roi`, { params, notNotify: true });

	const saveMeetingTracker = (payload = {}) =>
		api_request(meetingTrackersBaseUrl, {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			storeName: 'meetingtrackersStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			...payload,
		});

	const deleteMeetingTracker = (payload = {}) =>
		api_request.delete(meetingTrackersBaseUrl, {
			itemName: Lang.tt('Meeting_Tracker'),
			...payload,
		});

	const fetchRoiOnePagers = (params = {}) =>
		api_request.get(roiOnePagersBaseUrl, {
			params,
			incudeMeta: true,
			notNotify: true,
			storeName: 'roionepagersStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		});

	const fetchRoiOnePager = ({ itemId, ...payload } = {}) =>
		api_request.get(`${roiOnePagersBaseUrl}/${itemId}`, {
			notNotify: true,
			storeName: 'roionepagersStore',
			stateProp: 'itemData',
			loadingProp: 'isLoading',
			...payload,
		});

	const saveRoiOnePager = (payload = {}) =>
		api_request(roiOnePagersBaseUrl, {
			method: payload.itemId && payload.itemId !== 'new' ? 'PUT' : 'POST',
			storeName: 'roionepagersStore',
			stateProp: 'itemData',
			loadingProp: 'isSaving',
			...payload,
		});

	const deleteRoiOnePager = (payload = {}) =>
		api_request.delete(roiOnePagersBaseUrl, {
			itemName: Lang.tt('ROI_One_Pager'),
			...payload,
		});

	const fetchPlantAlarms = ({ itemId, ...payload } = {}) =>
		api_request.get(`/plants/${itemId}/alarms`, { notNotify: true, ...payload });

	const fetchHealthStatistics = (params = {}) =>
		api_request.get('/equipments/health', { params, notNotify: true });

	return {
		fetchMeetingTrackers,
		fetchMeetingTracker,
		fetchLastMeetingTracker,
		fetchMeetingTrackerRoi,
		saveMeetingTracker,
		deleteMeetingTracker,
		fetchRoiOnePagers,
		fetchRoiOnePager,
		saveRoiOnePager,
		deleteRoiOnePager,
		fetchPlantAlarms,
		fetchHealthStatistics,
	};
}
