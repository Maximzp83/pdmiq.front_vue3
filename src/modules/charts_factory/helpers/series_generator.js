import { mergeObjects, hasOwnProperty1 } from '@/helpers';
import { chartSeriesTemplates, blueColor, baseColor, alarmColor, warningColor } from '../enums';
import { NCD_ALARM_TYPES, SENSOR_THRESHOLD_TYPES, MULTIVIEW_ALARM_TYPES } from '@/constants/global';

const methodsList = {
	setupLineSerieZones: arg => {
		let levelZoneData;
		if (arg.payload && arg.payload.levelZoneData) {
			levelZoneData = arg.payload.levelZoneData;
		} else {
			levelZoneData = arg.statistics.levelZoneData;
		}
		let zones = [];

		if (levelZoneData) {
			const { alarm_zone, warning_zone } = levelZoneData;
			const { ALARM, WARNING, BASELINE } = SENSOR_THRESHOLD_TYPES;

			if (arg.resources && arg.resources.chart_config && arg.resources.chart_config.customSettings) {
				const { parameterItem, /*useFetchedColorScheme*/ } = arg.resources.chart_config.customSettings;

					// console.log(arg.fetched_statistics_data, useFetchedColorScheme);
				if (parameterItem) {
					const { alarm_type } = parameterItem;
					if (alarm_type === NCD_ALARM_TYPES.WARNING_ALARM) {
						if (warning_zone) zones.push({ value: warning_zone, color: baseColor, threshold_level: BASELINE });
						if (alarm_zone) zones.push({ value: alarm_zone, color: warningColor, threshold_level: WARNING });
						if (zones.length) zones.push({ color: alarmColor, threshold_level: ALARM });

						return zones;
					} 
				}
			}

			if (warning_zone) zones.push({ value: warning_zone, color: blueColor, threshold_level: WARNING });
			if (alarm_zone) zones.push({ value: alarm_zone, color: baseColor, threshold_level: BASELINE });
			if (zones.length) zones.push({ color: alarmColor, threshold_level: ALARM });
		}

		return zones;
	},

	setupMultiviewLineSerieZones: arg => {
		let zones = [];
		try {
			const { plotlinesMaxValues, plotlinesMinValues } = arg.statistics;
			const { alarm_type, normalColor } = arg.payload;

			if (plotlinesMaxValues && plotlinesMaxValues.length) {
				const alarm_zone = Math.min(...plotlinesMaxValues);
				const warning_zone = Math.max(...plotlinesMinValues);

				if (alarm_type === MULTIVIEW_ALARM_TYPES.STANDARD_LOW_HIGH) {
					if (warning_zone) zones.push({ value: warning_zone, color: blueColor });
					if (alarm_zone) zones.push({ value: alarm_zone, color: normalColor });
					if (zones.length) zones.push({ color: alarmColor });
				} else if (alarm_type === MULTIVIEW_ALARM_TYPES.STANDARD_WARNING_ALARM) {
					if (warning_zone) zones.push({ value: warning_zone, color: normalColor });
					if (alarm_zone) zones.push({ value: alarm_zone, color: warningColor });
					if (zones.length) zones.push({ color: alarmColor });
				}
			}
		} catch (error) {
			console.log(error);
		}
		return zones;
	}
};

const assignEventsForSerie1 = ({ serieItem, eventsList, chart_id }) => {
	// const event_key = serieItem.customSettings && serieItem.customSettings.event_key;
	// console.log('assignEventsForSerie1', serieItem)
	if (serieItem) {
		const event_keys =
			(serieItem.customSettings && serieItem.customSettings.event_keys) || [];
		
		event_keys.forEach((eventKey, idx) => {
			if (eventKey && hasOwnProperty1(eventsList, eventKey)) {
				const eventItem = eventsList[eventKey];
				if (idx === 0) {
					serieItem.cursor = 'pointer';
					serieItem.point = serieItem.point || { events: {} };
				}
				serieItem.point.events[eventItem.name] = e => eventItem.event(e, chart_id);
			}
		});
	}

	return serieItem;
};

const setupSerieOption = ({ /*serie_config,*/ option_config }) => {
	const { method, payload, methodName } = option_config;
	let result = {};

	if (method) {
		// console.log(config, resources)
		return method({ /*serie_config,*/ payload });
	}

	if (methodName) {
		return methodsList[methodName]({ /*serie_config,*/ payload });
	}

	return result;
};

const generateSerieItem = ({
	serie_config,
	commonOptions,
	setupOptions,
	data_key,
	seriesEvents,
	chart_id
}) => {
	const {
		id,
		template,
		responseDataKey,
		data_path,
		custom_data_path,
		inject,
		event_key,
		event_keys,
		customSettings,
		setupSerieOptions
	} = serie_config;
	const data_accessor = custom_data_path
		? custom_data_path
		: `${data_key}.${data_path || 'base'}`;

	const initialSerieItem = chartSeriesTemplates(template);

	let serieItem = {
		...initialSerieItem,
		id,
		customSettings: {
			data_accessor,
			...initialSerieItem.customSettings,
			...customSettings
		}
	};
	// console.log(serieItem, serie_config)
	/*if (data_key == 'levelZoneData') {
		console.log(serieItem)
	}*/

	if (responseDataKey) serieItem.customSettings.responseDataKey = responseDataKey;
	// console.log(event_key, event_keys)
	if (event_key || event_keys) {
		serieItem.customSettings.event_keys = [];
		event_key ? serieItem.customSettings.event_keys.push(event_key) : null;
		if (event_keys) {
			serieItem.customSettings.event_keys = serieItem.customSettings.event_keys.concat(
				event_keys
			);
		}
		if (seriesEvents) {
			serieItem = assignEventsForSerie({
				serieItem,
				eventsList: seriesEvents,
				chart_id
			});
		}
	}
	// console.log(id, event_key, customSettings, serieItem)
	// if (customSettings && customSettings.deleteCustomSettings) delete serieItem.customSettings;

	if (commonOptions) {
		serieItem = mergeObjects(serieItem, commonOptions);
	}

	if (setupOptions) {
		setupOptions.forEach(option => {
			serieItem[option.key] = setupSerieOption({
				option_config: option
				// serie_config,
				// resources,
			});
		});
	}

	if (setupSerieOptions) {
		setupSerieOptions.forEach(option => {
			serieItem[option.key] = setupSerieOption({
				option_config: option
				// serie_config,
				// resources,
			});
			// console.log(option.key, setupSerieOption({option_config: option }))
		});
	}
	// console.log(resultData, data_key, data_path)
	// serieItem.data = resultData[data_key][data_path];

	if (inject) {
		serieItem = mergeObjects(serieItem, inject);
	}
	// console.log('serieItem', serieItem, data_key, serie_config, commonOptions, setupOptions)
	return serieItem;
};

const generateSeries1 = ({
	/*resultData,*/ seriesConfig,
	seriesEvents,
	chart_id
}) => {
	try {
		let seriesList = [];

		if (seriesConfig) {
			// console.log(seriesConfig)
			for (const data_key in seriesConfig) {
				// console.log(data_key, seriesConfig[data_key])
				if (seriesConfig[data_key]) {
					const { seriesConfigsList, commonOptions, setupOptions } = seriesConfig[
						data_key
					];
					// console.log(configsList)
					for (const request_key in seriesConfigsList) {
						// console.log(seriesConfigsList[request_key])
						if (seriesConfigsList[request_key]) {
							seriesConfigsList[request_key].forEach(serie_config => {
								if (serie_config) {
									seriesList.push(
										generateSerieItem({
											serie_config,
											commonOptions,
											setupOptions,
											data_key,
											seriesEvents,
											chart_id
										})
									);
								}
							});
						}
					}
				}
			}
		}
		// return [];
		// console.log('seriesList', seriesList)
		return seriesList;
	} catch (e) {
		console.warn(e);
	}
};

const setupYAxisPlotlines1 = ({ plotlinesConfigsList, data_key, axisIdx }) => {
	// console.log('setupYAxisPlotlines1',plotlinesConfigsList, data_key )
	let plotlines = [];

	plotlinesConfigsList.forEach(serie_config => {
		if (serie_config.axis_index !== undefined) {
			if (serie_config.axis_index == axisIdx) {
				plotlines.push(
					generateSerieItem({ serie_config, data_key: data_key || 'levelZoneData' })
				);
			}
		} else {
				// console.log('setupYAxisPlotlines1', serie_config, generateSerieItem({ serie_config, data_key: data_key || 'levelZoneData' }))
			plotlines.push(
				generateSerieItem({ serie_config, data_key: data_key || 'levelZoneData' })
			);
		}
	});
	return plotlines;
};

export const generateSeries = (payload = {}) => generateSeries1(payload);
export const setupYAxisPlotlines = (payload = {}) => setupYAxisPlotlines1(payload);
export const assignEventsForSerie = (payload = {}) => assignEventsForSerie1(payload);
export const executeMethodFromList = key => methodsList[key];
