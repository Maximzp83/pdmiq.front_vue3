import axios from 'axios';
let apiUrl = '';
// let devApiUrl = 'https://api.testmatrix.assetmatrix.com/api';
let devApiUrl = 'https://api.pdmmatrix.assetmatrix.com/api';

// console.log('API URL:', process.env.VUE_APP_SENSOR_STATISTICS_API_URL);
if (process.env.VUE_APP_API_URL) {
	apiUrl = process.env.VUE_APP_API_URL;
	// devApiUrl = process.env.VUE_APP_API_URL;
} else {
	if (
		window.location.origin === 'https://testmatrix.assetmatrix.com'
		// || window.location.origin === 'https://newcharts.industrialmatrix.com'
	) {
		apiUrl = 'https://api.testmatrix.assetmatrix.com/api';
	} else if (
		window.location.origin === 'https://app.industrialmatrix.com'
		|| window.location.origin === 'https://newcharts.industrialmatrix.com'
	) {
		apiUrl = 'https://api.pdmmatrix.assetmatrix.com/api';
	}
}
// console.log(window.location.origin, devApiUrl, apiUrl)

axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers['X-Timezone-Offset'] = -new Date().getTimezoneOffset();
axios.defaults.headers.Accept = 'application/json';
axios.defaults.headers['Content-Type'] = 'application/json;charset=UTF-8';
axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? devApiUrl : apiUrl;

export default axios;