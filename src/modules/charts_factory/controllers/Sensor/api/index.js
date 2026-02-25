import { request } from '../../../api/request_provider.js';
import { mergeArrays } from '@/helpers';
import { getResponseValue } from '@/services/api/api_helpers';

const fetchStatisticsRequestUtil = payload => {
	return new Promise((resolve, reject) => {
		let resultPoints = [];

		request(``, payload)
			.then(response => {
				let statisticsResponse = response.value.data;

				if (statisticsResponse.points) {
					resultPoints = mergeArrays(resultPoints, statisticsResponse.points);
				}

				if (statisticsResponse.Cursor) {
					// const newParams = { ...payload.params, ...statisticsResponse.Cursor };
					const newPayload = {
						...payload,
						params: {
							...payload.params,
							Cursor: `${JSON.stringify(statisticsResponse.Cursor)}`
						}
					};

					fetchStatisticsRequestUtil(newPayload)
						.then(points => {
							resolve(mergeArrays(resultPoints, points));
						})
						.catch(e => {
							console.warn(e);
							reject(e);
						});
				} else {
					if (resultPoints) {
						resolve(resultPoints);
					} else {
						reject(statisticsResponse);
					}
				}
			})
			.catch(e => {
				console.warn(e);
				reject(e);
			});
	});
};

const fetch_sensor_statistics1 = payload => {
	const extendedPayload = {
		...payload,
		method: 'GET',
		notNotify: true,
		alternateResponseProp: 'data',
		returnResponseOnly: 1
	};

	return new Promise((resolve, reject) => {
		let sensorOtherData;
		const params_1 = { ...extendedPayload.params, excepts: ['statistics'] };
		const payload_1 = { ...extendedPayload, params: params_1 };
		delete params_1.daterange_setted_at;

		request(`/sensors/jobs/${extendedPayload.sensorId}/mixins`, payload_1)
			.then(response => {
				sensorOtherData = response.value.data;
					// 'https://bx5ln527mjdqj3ocq3i655uuja0ghpyc.lambda-url.ca-central-1.on.aws'; -old
				let baseURL = 'https://graph.industrialmatrix.com';
				// let baseURL = 'https://e4qsnej4po7dizmnk4p2vfrv3m0ggvpj.lambda-url.ca-central-1.on.aws';
				// let baseURL = 'https://bx5ln527mjdqj3ocq3i655uuja0ghpyc.lambda-url.ca-central-1.on.aws' // old;

				if (process.env.VUE_APP_SENSOR_STATISTICS_API_URL) {
					baseURL = process.env.VUE_APP_SENSOR_STATISTICS_API_URL;
				} else {
					if (
						window.location.origin === 'https://app.industrialmatrix.com'
						|| window.location.origin === 'https://newcharts.industrialmatrix.com'
					) {
						baseURL = 'https://graph.industrialmatrix.com';
					} else if (
						window.location.origin === 'https://testmatrix.assetmatrix.com'
						//|| window.location.origin === 'https://newcharts.industrialmatrix.com'
					) {
						baseURL = 'https://e4qsnej4po7dizmnk4p2vfrv3m0ggvpj.lambda-url.ca-central-1.on.aws';
					}
				}

				// -----------------------------
				const params_2 = {
					...extendedPayload.params,
					sensorId: extendedPayload.sensorId
				};
				const payload_2 = {
					...extendedPayload,
					params: params_2,
					baseURL: baseURL
					// baseURL: 'https://jka63vugs9.execute-api.ca-central-1.amazonaws.com'
				};
				delete params_2.daterange_setted_at;

				fetchStatisticsRequestUtil(payload_2)
					.then(points => {
						const mergedData = {
							data: { ...sensorOtherData, statistics: points }
						};
						const preparedData = getResponseValue(mergedData, {
							...extendedPayload
						});

						resolve(preparedData);
					})
					.catch(e => {
						console.warn(e);
						reject(e);
					});
			})
			.catch(e => {
				console.warn(e);
				reject(e);
			});
	});
};

const fetch_ncd_sensor_fft_statistics1 = payload => {
	let baseURL =
		'https://7i4l4qqai25gqquke4teubtkt40hjcaw.lambda-url.ca-central-1.on.aws';
	//let baseURL = 'https://graph.industrialmatrix.com/fft';
	
	if (process.env.VUE_APP_FFT_STATISTICS_API_URL) {
		baseURL = process.env.VUE_APP_FFT_STATISTICS_API_URL;
	} else {
		if (
			window.location.origin === 'https://app.industrialmatrix.com'
			|| window.location.origin === 'https://newcharts.industrialmatrix.com'
		) {
			baseURL = 'https://graph.industrialmatrix.com/fft';
		} else if (
			window.location.origin === 'https://testmatrix.assetmatrix.com'
			//|| window.location.origin === 'https://newcharts.industrialmatrix.com'
		) {
			baseURL = 'https://7i4l4qqai25gqquke4teubtkt40hjcaw.lambda-url.ca-central-1.on.aws';
		}
	}
	// console.log(baseURL)
	const extendedPayload = {
		...payload,
		method: 'GET',
		notNotify: true,
		alternateResponseProp: 'data',
		baseURL: baseURL
	};

	return request('', extendedPayload);
};

const calculate_thresholds_our1 = payload => {
	const extendedPayload = {
		...payload,
		method: 'GET',
		alternateResponseProp: 'data',
		notNotify: true
	};

	return new Promise((resolve, reject) => {
		request(
			`/sensors/jobs/${payload.sensorId}/level-zones/our`,
			extendedPayload
		).then(({ value }) => {
			try {
				if (value) {
					const { baseline_zone, warning_zone, alarm_zone } = value.ourLevelZone;

					const { measurement, parameterType } = payload.params;

					const zonesPayload = {
						sensorId: payload.sensorId,
						method: 'POST',
						data: {
							metric_system_type: measurement,
							parameter_type: parameterType,
							baseline_zone: baseline_zone,
							warning_zone: warning_zone,
							alarm_zone: alarm_zone
						}
					};

					save_sensor_level_zones1(zonesPayload)
						.then(() => {
							resolve();
						})
						.catch(() => {
							reject();
						});
				}
			} catch (e) {
				console.warn(e);
			}
		});
	});
};

const fetch_period_stats_data1 = payload => {
	const extendedPayload = {
		...payload,
		method: 'GET',
		// alternateResponseProp: 'data',
		notNotify: true
	};

	return new Promise((resolve, reject) => {
		request(
			`/sensors/${payload.sensorId}/rebaseline`,
			extendedPayload
		).then((response) => {
			resolve(response);
		})
		.catch((e) => {
			reject(e);
		});
	});
};

const save_sensor_level_zones1 = payload => {
	const extendedPayload = { ...payload };

	let url = `/sensors/jobs/${payload.sensorId}/level-zones`;
	if (extendedPayload.zoneId) {
		url += `/${extendedPayload.zoneId}`;
	}

	// console.log('save_sensor_level_zones', extendedPayload)
	return request(url, extendedPayload);
};

const fetch_multi_views_alerts1 = payload => {
	const extendedPayload = {
		...payload,
		method: 'GET',
		alternateResponseProp: 'data',
		notNotify: true
	};
	const { multiViewId, graphId } = payload;
	
	return new Promise((resolve, reject) => {
		request(
			`/metric-multi-views/${multiViewId}/graphs/${graphId}/mixins`,
			extendedPayload
		).then((response) => {
			resolve(response);
		})
		.catch((e) => {
			reject(e);
		});
	});
};

export const fetch_sensor_statistics = payload => fetch_sensor_statistics1(payload);
export const fetch_ncd_sensor_fft_statistics = payload =>
	fetch_ncd_sensor_fft_statistics1(payload);
export const calculate_thresholds_our = payload =>
	calculate_thresholds_our1(payload);
export const save_sensor_level_zones = payload => save_sensor_level_zones1(payload);
export const fetch_period_stats_data = payload => fetch_period_stats_data1(payload);
export const fetch_multi_views_alerts = payload => fetch_multi_views_alerts1(payload);
