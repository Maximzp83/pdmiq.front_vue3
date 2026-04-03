import axios from 'axios';

// const DEFAULT_DEV_API_URL = 'https://api.pdmmatrix.assetmatrix.com/api';
const DEFAULT_DEV_API_URL = 'https://api.testmatrix.assetmatrix.com/api';

const HOST_API_URL_MAP = {
	'https://testmatrix.assetmatrix.com': 'https://api.testmatrix.assetmatrix.com/api',
	'https://app.industrialmatrix.com': 'https://api.pdmmatrix.assetmatrix.com/api',
	'https://newcharts.industrialmatrix.com':	'https://api.pdmmatrix.assetmatrix.com/api'
};

const normalizeBaseUrl = url => (url ? url.replace(/\/+$/, '') : '');

const resolveApiBaseUrl = () => {
	const envApiUrl = normalizeBaseUrl(process.env.VUE_APP_API_URL);

	if (envApiUrl) {
		return envApiUrl;
	}

	if (process.env.NODE_ENV === 'development') {
		return DEFAULT_DEV_API_URL;
	}

	if (typeof window !== 'undefined') {
		return HOST_API_URL_MAP[window.location.origin] || '';
	}

	return '';
};

const apiClient = axios.create({
	baseURL: resolveApiBaseUrl(),
	// timeout: 30000,
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json;charset=UTF-8',
		'X-Requested-With': 'XMLHttpRequest',
		'X-Timezone-Offset': -new Date().getTimezoneOffset()
	}
});

export default apiClient;
