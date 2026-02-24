	import axios from './axiosService';
import { Notification } from 'element-ui';
import router from '@/router';
import { storeGetter, dispatchGetter } from '@/store';
import { getObjectVal, capitalizeFirstLetter } from '@/helpers';

import { setupWarningsData, setupTresholdsOurList } from '@/helpers/specialHelpers';

import { Lang } from '@/localization';
import { SENSOR_TYPES } from '@/constants/global';

// const storeAuthState = storeGetter('auth');
// const storeDispatch = dispatchGetter();
// console.log(storeDispath)

/*const setHttpToken1 = token => {
	if (token) {
		axios.defaults.headers.common.Authorization = `Bearer ${token}`;
	} else {
		axios.defaults.headers.common.Authorization = null;
	}

	// console.log('2: ',axios.defaults.headers.common.Authorization)
};*/

/*const checkAuthorizationHeaders1 = access_token => {
	// console.log('1: ', axios.defaults.headers.common.Authorization)
	if (
		!!axios.defaults.headers.common &&
		!!axios.defaults.headers.common.Authorization
	) {
		// empty
	} else {
		// const token = localStorage.getItem('access_token');
		// const token = store.state.auth.access_token;
		// console.log('2', store.state.auth)
		setHttpToken(storeGetter('auth').access_token || access_token);
	}
};*/

const prepareParams1 = getParams => {
	let result = {};
	for (let prop in getParams) {
		// console.log(getParams[prop])
		const value = getParams[prop];
		if (value || typeof value === 'boolean' || value === 0) {
			result[prop] = value;
		}
	}

	return result;
};

/*const setupMultipartFormData1 = (obj, form, namespace) => {
	try {
		let fd = form || new FormData();
		let formKey;
		// debugger;

		for (let property in obj) {
			if (obj[property] || obj[property] === 0) {
				if (namespace) {
					formKey = namespace + '[' + property + ']';
				} else {
					formKey = property;
				}
				// console.log(formKey)
				// if the property is an object, but not a File, use recursivity.
				if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
					setupMultipartFormData(obj[property], fd, formKey);
				} else {
					// if it's a string or a File object
					fd.append(formKey, obj[property]);
				}
			}
		}

		return fd;
	} catch (e) {
		console.warn(e);
	}
};

const parsePayload1 = (payloadData, method) => {
	const result = {};
	if (payloadData) {
		const payload = { ...payloadData };

		let newData = null;
		let newMethod = null;

		if (payload.withFile) {
			newData = setupMultipartFormData(payload.data);

			if (method == 'PUT') {
				newData.set('_method', 'PUT');
			}

			newMethod = newData && newData.has('_method') ? 'POST' : method;

			payload.headers = { 'Content-Type': 'multipart/form-data' };
			// console.log(newData.get('name'))
			// console.log(newData.get('title_ru'))
		}

		// if (!isEmpty(payload)) {
		if (payload.params) result.params = prepareParams(payload.params);
		if (payload.data) result.data = newData || payload.data;
		if (payload.url) result.mod_url = payload.url;
		if (payload.headers) result.headers = payload.headers;
		if (payload.responseType) result.responseType = payload.responseType;
		result.newMethod = newMethod || method;
		// }
	}
	return result;
};
*/
// ------------------------

const isSuccessStatus1 = ({ status, data }, statusCheckSettings = {}) => {
	if (status >= 200 && status < 300) {
		if (statusCheckSettings.withoutDataCheck) {
			return true;
		} else if (data && data.data) {
			return true;
		} else if (data && data.status) {
			return true;
		} else if (data && data.statistics) {
			return true;
		} else if (data && data.id) {
			return true;
		} else if (data && (data.pdmiq || data.dxm)) {
			return true;
		} else if (data && data.totalSensors != 'undefined') {
			return true;
		}
	}
	return false;
};

const prepareWarningsData = data => {
	let newData = {};

	if (data.pdmiq && data.dxm) {
		const pdmiqData = setupWarningsData(data.pdmiq);
		const dxmData = setupWarningsData(data.dxm);

		newData = {
			pdmiq: pdmiqData.newData,
			pdmiq_meta: pdmiqData.meta,
			pdmiq_alarms_count: pdmiqData.alarms_count,
			pdmiq_warnings_count: pdmiqData.warnings_count,

			dxm: dxmData.newData,
			dxm_meta: dxmData.meta,
			dxm_alarms_count: dxmData.alarms_count,
			dxm_warnings_count: dxmData.warnings_count
		};
		// console.log(data)
	} else {
		const pdmiqData = setupWarningsData(data);

		newData = {
			pdmiq: pdmiqData.newData,
			pdmiq_meta: pdmiqData.meta,
			pdmiq_alarms_count: pdmiqData.alarms_count,
			pdmiq_warnings_count: pdmiqData.warnings_count
		};
	}
	return newData;
};
const prepareTresholdsOurData = data => {
	// console.log(data)
	let newData = {
		list: setupTresholdsOurList(data.data),
		meta: {
			current_page: data.meta.current_page,
			last_page: data.meta.last_page
		}
	};
	// console.log(data)
	return newData;
};
const prepareGlobalPlantsData = data =>
	data.map(plant => ({
		id: plant.id,
		name: plant.name,
		time_zone: plant.time_zone
	}));

const ultrasoundSensorsOnly = data => {
	let list = [];

	for (let i = 0; i < data.length; i++) {
		const sensor = data[i];
		if (sensor.type === SENSOR_TYPES.ULTRA_SOUND) {
			list.push({
				id: sensor.id,
				// uuid: sensor.ultra_sound_guuid,
				uuid: sensor.uuid,
				name: sensor.equipment.machine_name,
				item_type: sensor.equipment.item_type
			});
		}
	}
	return list;
};

const prepareCountersData = counters => {
	let list = [];

	for (const key in counters) {
		// console.log()
		const counterName = key.replace('total', '');
		const value = counters[key];

		if (
			['Utilities', 'ProdLines', 'Machines', 'Assets', 'Equipments'].indexOf(
				counterName
			) != -1
		) {
			let item = {
				title: counterName,
				instance: counterName,
				itemName: capitalizeFirstLetter(counterName.slice(0, -1)),
				iconName: counterName.toLowerCase(),
				path: counterName.toLowerCase()
			};

			if (counterName == 'ProdLines') {
				item.instance = 'ProductionLines';
				item.itemName = 'Production Line';
				item.iconName = 'production_lines';
				item.path = 'production-lines';

				/*item.tabs = [
					{
						title: 'Prod. Lines',
						prop: 'prodTab',
						hideHeader: true,
						instance: 'ProductionLines',
						itemName: 'Production Line',
						iconName: 'production_lines',
						path: 'production-lines',
						postfix_data: {
							html: `<span class="count-block">${value}</span>`
						}
					},
					{
						title: 'Utilities',
						prop: 'utilTab',
						hideHeader: true,
						itemName: 'Utility',
						instance: 'Utilities',
						iconName: 'production_lines',
						path: 'utilities',
						postfix_data: {
							html: `<span class="count-block">${counters['totalUtilities']}</span>`
						}
					}
				]*/
			}

			if (counterName == 'Equipments') {
				item.title = 'Items';
				item.itemName = 'Item';
				// item.path = 'equipments';
			}

			item.count = value;

			list.push(item);
		}
	}

	return list;
};

const prepareEquipmentsList = (data, settings = {}) => {
	let list = [];
	let newData = data instanceof Array ? data : [data];

	let settingsList = [
		{ key: 'id', val_key: 'id' },
		{ key: 'equipment_type_id', val_key: 'equipment_type_id' },
		{ key: 'brand_id', val_key: 'brand_id' },
		{ key: 'brand_name', val_key: 'brand.name' },
		{ key: 'brand_is_crossover_excluded', val_key: 'brand.is_crossover_excluded' },
		{ key: 'brand_model_id', val_key: 'brand_model_id' },
		{ key: 'sensor_location', val_key: 'sensor_location' },
		{ key: 'application_name', val_key: 'asset.machine.application.name' },
		{ key: 'location_name', val_key: 'asset.location.name' },
		{ key: 'asset_name', val_key: 'asset.name' },
		{ key: 'equipments_count', val_key: 'asset.equipments_count' },
		{ key: 'machine_id', val_key: 'asset.machine.id' },
		{ key: 'machine_name', val_key: 'asset.machine.name' },
		{ key: 'production_line_id', val_key: 'asset.machine.production_line_id' },
		{ key: 'production_line_name', val_key: 'asset.machine.productionLine.name' },
		{ key: 'machine_pictures', val_key: 'asset.machine.pictures' },
		{ key: 'plant_name', val_key: 'plant.name' },
		{ key: 'company_name', val_key: 'plant.company.name' },
		{ key: 'brand_model_name', val_key: 'model.name' },
		{ key: 'brand_model_img', val_key: 'model.full_file_name' },
		{
			key: 'brand__model_is_crossover_excluded',
			val_key: 'model.is_crossover_excluded'
		},
		{ key: 'equipment_type_name', val_key: 'equipmentType.name' },
		{ key: 'equipment_type_img', val_key: 'equipmentType.full_file_name' },
		{ key: 'asset_id', val_key: 'asset_id' },
		{ key: 'plant_id', val_key: 'plant_id' },
		{ key: 'is_limbo', val_key: 'is_limbo' },
		{ key: 'is_store_room', val_key: 'is_store_room' },
		// { key: 'loc_on_machine', val_key: 'asset.loc_on_machine' },
		{ key: 'loc_on_machine', val_key: 'loc_on_machine' },
		{ key: 'location_name', val_key: 'asset.location.name' },
		{ key: 'notes', val_key: 'notes' },
		{ key: 'has_breakdown', val_key: 'has_breakdown' },
		{ key: 'repairNow', val_key: 'repairNow' },
		{ key: 'storeRooms', val_key: 'storeRooms' },
		{ key: 'equipmentStoreRooms', val_key: 'equipmentStoreRooms' },
		{ key: 'dashboardSensors', val_key: 'dashboardSensors' },
		{ key: 'className', val_key: 'className' },
		{ key: 'equipmentType', val_key: 'equipmentType' },
		{ key: 'typeOptions', val_key: 'typeOptions' },
		{ key: 'pictures', val_key: 'pictures' },
		{ key: 'histories', val_key: 'histories' },
		// { key: 'equipmentSubType', val_key: 'equipmentSubType' },
		// { key: 'subtypeBrand', val_key: 'subtypeBrand' },
		// { key: 'subtypeModel', val_key: 'subtypeModel' },
		{ key: 'equipment_subtype_id', val_key: 'equipment_subtype_id' },
		{ key: 'subtype_brand_id', val_key: 'subtype_brand_id' },
		{ key: 'subtype_brand_model_id', val_key: 'subtype_brand_model_id' },
		{ key: 'subtype_brand_model_name', val_key: 'subTypeModel.name' },
		{ key: 'subTypeOptions', val_key: 'subTypeOptions' },
		{
			key: 'plant_is_equipment_runtime_tracking',
			val_key: 'plant.is_equipment_runtime_tracking'
		},
		{
			key: 'linespeedSensor',
			val_key: 'asset.machine.productionLine.linespeedSensor'
		},
		{ key: 'is_rpm_params_set', val_key: 'is_rpm_params_set' },
		{ key: 'is_rpm_visible', val_key: 'is_rpm_visible' },
		{ key: 'rpm_source_item', val_key: 'rpm_source_item' },
		{ key: 'rpm_option_value_id', val_key: 'rpm_option_value_id' },
		{ key: 'rpm_value', val_key: 'rpm_value' },
		{ key: 'external_rpm_id', val_key: 'external_rpm_id' },
		{ key: 'rpm_formula', val_key: 'rpm_formula' },
		{ key: 'rpm_external_node_id', val_key: 'rpm_external_node_id' },
		{ key: 'rpm_external_node_parameter', val_key: 'rpm_external_node_parameter' },
		{ key: 'rpmSources', val_key: 'rpmSources' },
		{ key: 'rpm_external_value', val_key: 'rpm_external_value' },
		{ key: 'rpm_external_source_type', val_key: 'rpm_external_source_type' },
		{ key: 'rpm_formula', val_key: 'rpm_formula' },
		
		{ key: 'prodline_rpm_source_type', val_key: 'asset.machine.productionLine.rpm_source_type' },
		{ key: 'prodline_rpm_value', val_key: 'asset.machine.productionLine.rpm_value' },
		{ key: 'prodline_rpm_node_parameter', val_key: 'asset.machine.productionLine.rpm_node_parameter' },
		{ key: 'prodline_rpm_node_id', val_key: 'asset.machine.productionLine.rpm_node_id' },		
		{ key: 'child_components', val_key: 'child_components' },		
		{ key: 'vibration_analysis_rules', val_key: 'vibration_analysis_rules' },		
		{ key: 'option_values', val_key: 'option_values' },
		{ key: 'metric_multi_views', val_key: 'metric_multi_views' },
		{ key: 'is_my_favorite', val_key: 'is_my_favorite' },
		{ key: 'is_company_favorite', val_key: 'is_company_favorite' },
	];

	if (settings.addSettingItems) {
		settingsList = settingsList.concat(settings.addSettingItems);
	}

	for (let i = 0; i < newData.length; i++) {
		let resultItem = {};
		const equipment = newData[i];

		for (const setting of settingsList) {
			resultItem[setting.key] = getObjectVal(equipment, setting.val_key);
		}

		if (
			!resultItem.asset &&
			equipment.equipmentStoreRooms &&
			equipment.equipmentStoreRooms.length
		) {
			resultItem['last_asset_name'] =
				equipment.equipmentStoreRooms[0].last_asset_name;
		}
		/*if (resultItem.storeRooms && resultItem.storeRooms.length) {
			resultItem['storeroom_name'] = resultItem.storeRooms[0].name;
		}*/

		list.push(resultItem);
	}

	// console.log(list[0].rpm_source_item)
	return data instanceof Array ? list : list[0];
};

export const prepareDataFunctions = {
	prepareWarningsData: payload => prepareWarningsData(payload),
	prepareTresholdsOurData: payload => prepareTresholdsOurData(payload),
	prepareGlobalPlantsData: payload => prepareGlobalPlantsData(payload),
	ultrasoundSensorsOnly: payload => ultrasoundSensorsOnly(payload),
	prepareCountersData: payload => prepareCountersData(payload),
	prepareEquipmentsList: (payload, settings) =>
		prepareEquipmentsList(payload, settings)
};

// --------------------------

const getResponseValue1 = (response, payload) => {
	try {
		let result;

		const { alternateResponseProp, prepareData, prepareDataSettings } = payload;
		if (alternateResponseProp) {
			result = getObjectVal(response, payload.alternateResponseProp, {
				withoutDeep: true
			});
		} else {
			result = response.data.data;
		}
		if (prepareData) {
			// console.log(result, prepareDataSettings)
			result = prepareDataFunctions[prepareData](result, prepareDataSettings);
		}
		return result;
	} catch (e) {
		console.warn(e);
	}
};

const getResponseMessage1 = (originalResponse, settings = {}) => {
	let result = '';

	if (originalResponse) {
		const response = originalResponse.data
			? originalResponse.data
			: originalResponse.response;

		if (response) {
			if (response.data) {
				let { messages, /*status,*/ message } = response.data;
				if (settings.messageKey) {
					message = response.data[settings.messageKey];
				}

				/*if (status) {
					result += status + ' ';
				}*/

				if (!settings.messageKey && messages && messages instanceof Array) {
					for (let i = 0; i < messages.length; i++) {
						for (let j = 0; j < messages[i].length; j++) {
							const comma = j === messages[i].length - 1 ? '.' : ', ';
							result += `${messages[i][j]}${comma}`;
						}
					}
				} else if (message) {
					result += message;
				}
			}
		}
	}

	return result;
};

const getResultMessage1 = (resultMessageData, itemData) => {
	let message = '';
	if (resultMessageData) {
		if (typeof resultMessageData === 'object') {
			const { is_true, is_false, flag, text } = resultMessageData;
			if (text) {
				message = text;
			} else if (flag && itemData) {
				message = itemData[flag] ? is_true : is_false;
			}
		} else {
			message = resultMessageData;
		}
	}

	return message;
};

const handleError1 = (
	error,
	{
		commit,
		customMessage,
		reject = null,
		loading,
		notify,
		loadingProp,
		errorMessageSettings
	}
) => {
	try {
		const message = getResponseMessage(error, errorMessageSettings);

		if (error.response) {
			if (error.response.status === 401) {
				router.push('/login');
				commit('SET_STATUS_LOADING', false);
				commit('SET_STATUS_SAVING', false);

				if (reject) reject(error);
				Notification.warning({
					title: Lang.tt(`phrases.Not_authorized`),
					message: message || Lang.tt('phrases.Try_sign_in_again')
				});
				dispatchGetter('auth/clear_auth', { root: true });
				return;
			}
		}
		if (reject) {
			reject(error);
		}
		if (loading) {
			if (loadingProp) {
				commit('SET_STATE', { stateProp: loadingProp, value: false });
			} else {
				commit('SET_STATUS_LOADING', false);
				commit('SET_STATUS_SAVING', false);
			}
		}
		// console.log(customMessage, message, error.message)
		if (notify) {
			Notification.error({
				title: Lang.tt(`Error`),
				message: customMessage || message || error.message,
				duration: 0
			});
		}
	} catch (e) {
		console.log(e);
	}
};

const getParamsFromUrl1 = url => {
	const urlSplitted = url.split('?');
	let pathOnly = urlSplitted[0];
	let result = {
		pathOnly: pathOnly
	};

	if (urlSplitted && urlSplitted.length > 1) {
		const params = urlSplitted[urlSplitted.length - 1].split('&');
		for (let i = 0; i < params.length; i++) {
			let param = params[i];

			/*if (/#_=_/.test(param)) {
				param = param.replace('#_=_', '');		
			}*/

			const paramSplitted = param.split('=');
			result[paramSplitted[0]] = paramSplitted[1];
		}
	}
	return result;
};

const getValuesFromRouteQuery1 = valuesStr => {
	let result = [];
	const values = valuesStr.split(',');

	for (let value of values) {
		if (isNaN(+value)) {
			result.push(value);
		} else {
			result.push(+value);
		}
	}
	return result;
};

const setupGetParamsStr1 = (url, params) => {
	let params_array = [];

	for (let prop in params) {
		if (params[prop] instanceof Array) {
			params[prop].forEach(vi => {
				params_array.push(`${prop}[]=${vi}`);
			});
			// id[]=4, id[]=5
		} else {
			params_array.push(`${prop}=${params[prop]}`);
		}
	}
	let params_str = params_array.join('&');
	if (params_str.length) {
		return `${url}?${params_str}`;
	}

	return '';
};

const generateUrl1 = ({ path, filters }) => {
	let params = { ...filters };
	params.token = storeGetter('auth').access_token;
	const { baseURL } = axios.defaults;
	let finalUrl = `${baseURL}/${path}`;
	return setupGetParamsStr1(finalUrl, params);
};

const encodeUrl1 = (url) => {
  // Разделяем на "основу" и query-параметры
  const [base, query] = url.split('?');
  if (!query) return url; // если нет параметров

  const params = new URLSearchParams(query);
  for (const [key, value] of params.entries()) {
    params.set(key, encodeURIComponent(value));
  }

  return `${base}?${params.toString()}`;
}

// export const setHttpToken = token => setHttpToken1(token);
// export const checkAuthorizationHeaders = access_token => checkAuthorizationHeaders1(access_token);
export const prepareParams = getParams => prepareParams1(getParams);
// export const setupMultipartFormData = (obj, form, namespace) => setupMultipartFormData1(obj, form, namespace);
// export const parsePayload = (payloadData, method) => parsePayload1(payloadData, method);
export const isSuccessStatus = (data, statusCheckSettings) =>
	isSuccessStatus1(data, statusCheckSettings);
export const getResponseValue = (response, payload) =>
	getResponseValue1(response, payload);
export const getResponseMessage = (originalResponse, settings) =>
	getResponseMessage1(originalResponse, settings);
export const getResultMessage = (resultMessageData, itemData) =>
	getResultMessage1(resultMessageData, itemData);
export const handleError = (error, settings) => handleError1(error, settings);
export const getParamsFromUrl = url => getParamsFromUrl1(url);
export const getValuesFromRouteQuery = valuesStr =>
	getValuesFromRouteQuery1(valuesStr);
export const setupGetParamsStr = (url, params) => setupGetParamsStr1(url, params);
export const generateUrl = settings => generateUrl1(settings);
export const encodeUrl = settings => encodeUrl1(settings);
export const isPrevent = () => storeGetter('auth').preventRequests;
