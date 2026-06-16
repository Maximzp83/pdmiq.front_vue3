import { api_request } from '@/api/request_provider';

const storeName = 'sensorsStore';

export function useSensors() {
	const fetchSensors = (params = {}, payload = {}) =>
		api_request.get('/sensors', {
			params,
			storeName,
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
			incudeMeta: true,
			...payload,
		});

	const fetchSensor = ({ itemId, ...payload } = {}) =>
		api_request.get(`/sensors/${itemId}`, {
			stateProp: 'itemData',
			storeName,
			notNotify: true,
			...payload,
		});

	const saveSensor = (payload = {}) =>
		api_request('/sensors', {
			stateProp: 'itemData',
			storeName,
			...payload,
		});

	const deleteSensor = (payload = {}) =>
		api_request.delete('/sensors', {
			storeName,
			...payload,
		});

	const sensorRebaseLine = ({ itemId, ...payload } = {}) =>
		api_request.put(`/sensors/${itemId}/rebaseline`, payload);

	const sensorMultipleRebaseline = (payload = {}) =>
		api_request.put('/sensors/rebaseline', payload);

	const requestNcdFft = ({ sensorId, ...payload } = {}) =>
		api_request.post(`/sensors/${sensorId}/ncd/fft`, {
			notNotify: true,
			...payload,
		});

	const fetchNcdFft = ({ sensorId, urlPostfix = '', ...payload } = {}) =>
		api_request.get(`/sensors/${sensorId}/ncd/fft${urlPostfix}`, {
			notNotify: true,
			...payload,
		});

	const requestNcdConfig = ({ sensorId, ...payload } = {}) =>
		api_request.put(`/sensors/${sensorId}/ncd/config`, {
			notNotify: true,
			alternateResponseProp: 'data.status',
			...payload,
		});

	const setSensorChartColorScheme = ({ itemId, ...payload } = {}) =>
		api_request.post(`/sensors/${itemId}/metric-threshold-levels-color-schemes/`, {
			notNotify: true,
			...payload,
		});

	const fetchSensorWarnings = (payload = {}) =>
		api_request.get('/sensors/jobs/crashes', {
			storeName,
			stateProp: 'sensorWarningsData',
			alternateResponseProp: 'data',
			prepareData: 'prepareWarningsData',
			loadingProp: 'warningsLoading',
			notNotify: true,
			...payload,
		});

	const updateThresholds = (payload = {}) =>
		api_request.put('/sensors/jobs/level-zones', {
			storeName,
			loadingProp: 'tresholdsLoading',
			...payload,
		});

	const thresholdsReBaseline = (payload = {}) =>
		api_request.put('/sensors/jobs/level-zones/re-baseline', {
			storeName,
			loadingProp: 'tresholdsLoading',
			...payload,
		});

	const fetchThresholdsOur = (payload = {}) =>
		api_request.get('/sensors/jobs/level-zones/our', {
			storeName,
			stateProp: 'sensorTresholdsOurData',
			prepareData: 'prepareTresholdsOurData',
			alternateResponseProp: 'data',
			loadingProp: 'tresholdsLoading',
			notNotify: true,
			...payload,
		});

	const applyThresholdsOur = (payload = {}) =>
		api_request.put('/sensors/jobs/level-zones/our', {
			storeName,
			loadingProp: 'tresholdsLoading',
			...payload,
		});

	const saveSensorLevelZones = ({ sensorId, ...payload } = {}) =>
		api_request.post(`/sensors/jobs/${sensorId}/level-zones`, payload);

	const updateSensorLevelZone = ({ sensorId, zoneId, ...payload } = {}) =>
		api_request.put(`/sensors/jobs/${sensorId}/level-zones/${zoneId}`, {
			notLoading: true,
			...payload,
		});

	const pdfReportRequest = ({ sensorId, ...payload } = {}) =>
		api_request.post(`/sensors/${sensorId}/graphical-digest-reports`, {
			storeName,
			loadingProp: 'sensorJobSaving',
			resultMessage: { text: 'The report request is being processed, please wait...' },
			...payload,
		});

	const plantGraphsPdfReport = ({ plantId, ...payload } = {}) =>
		api_request.post(`/plants/${plantId}/graphical-comparison-reports`, {
			notNotify: true,
			...payload,
		});

	const fetchPlantGraphsPdfReportLast = ({ plantId, ...payload } = {}) =>
		api_request.get(`/plants/${plantId}/graphical-comparison-reports/last`, {
			notNotify: true,
			...payload,
		});

	const saveChartNote = ({ sensorId, noteId, ...payload } = {}) =>
		api_request(noteId ? `/sensors/${sensorId}/graphs/notes/${noteId}` : `/sensors/${sensorId}/graphs/notes`, {
			storeName,
			loadingProp: 'sensorJobSaving',
			...payload,
		});

	const fetchDatasetFormulas = (payload = {}) =>
		api_request.get('/sensors/formulas', {
			notNotify: true,
			...payload,
		});

	const saveDatasetFormulas = (payload = {}) =>
		api_request.post('/sensors/formulas', payload);

	const sendRpm = ({ sensorId, ...payload } = {}) =>
		api_request.post(`/sensors/commands/${sensorId}/equipment-rpm`, {
			resultMessage: { text: 'RPM sended' },
			...payload,
		});

	const setFftRpmParams = ({ sensorId, fftId, ...payload } = {}) =>
		api_request.put(`/sensors/${sensorId}/ncd/fft/${fftId}/rpm-params`, payload);

	const unlockFft = ({ sensorId, ...payload } = {}) =>
		api_request.post(`/sensors/${sensorId}/fft/unlock`, payload);

	const createFftWaveform = ({ sensorId, fftId, axisId, ...payload } = {}) =>
		api_request.post(`/sensors/${sensorId}/fft/${fftId}/sound-waveform/${axisId}`, {
			notNotify: true,
			alternateResponseProp: 'data',
			...payload,
		});

	const fetchFftWaveform = ({ sensorId, fftId, axis, ...payload } = {}) =>
		api_request.get(`/sensors/${sensorId}/fft/${fftId}/sound-waveform/${axis}`, {
			notNotify: true,
			returnResponseOnly: true,
			responseType: 'arraybuffer',
			...payload,
		});

	const resetSensorRuntime = ({ sensorId, ...payload } = {}) =>
		api_request.put(`/sensors/${sensorId}/runtime-tracker`, payload);

	const fetchSensorProblems = ({ sensorId, ...payload } = {}) =>
		api_request.get(`/sensors/${sensorId}/faults`, {
			notNotify: true,
			...payload,
		});

	const gainAdjustment = ({ sensorId, ...payload } = {}) =>
		api_request.put(`/sensors/${sensorId}/gain-adjustment`, {
			notNotify: true,
			...payload,
		});

	const toggleUltrasoundCommand = ({ url, ...payload } = {}) =>
		api_request.get(url, {
			storeName,
			loadingProp: 'ultrasoundProccessLoading',
			errorMessageSettings: { messageKey: 'status' },
			...payload,
		});

	const pingSocketEndpoint = ({ url, ...payload } = {}) =>
		api_request.post(url, {
			notLoading: true,
			notNotify: true,
			notSetToStore: true,
			...payload,
		});

	return {
		fetchSensors,
		fetchSensor,
		saveSensor,
		deleteSensor,
		sensorRebaseLine,
		sensorMultipleRebaseline,
		requestNcdFft,
		fetchNcdFft,
		requestNcdConfig,
		setSensorChartColorScheme,
		fetchSensorWarnings,
		updateThresholds,
		thresholdsReBaseline,
		fetchThresholdsOur,
		applyThresholdsOur,
		saveSensorLevelZones,
		updateSensorLevelZone,
		pdfReportRequest,
		plantGraphsPdfReport,
		fetchPlantGraphsPdfReportLast,
		saveChartNote,
		fetchDatasetFormulas,
		saveDatasetFormulas,
		sendRpm,
		setFftRpmParams,
		unlockFft,
		createFftWaveform,
		fetchFftWaveform,
		resetSensorRuntime,
		fetchSensorProblems,
		gainAdjustment,
		toggleUltrasoundCommand,
		pingSocketEndpoint,
	};
}
