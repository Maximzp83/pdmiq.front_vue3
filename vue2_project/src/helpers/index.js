import isEmpty from 'lodash/isEmpty';
export const cloneDeep = require('lodash.clonedeep');
export const cloneDeep2 = item =>
	item ? JSON.parse(JSON.stringify(item)) : undefined;
window.cloneDeep = cloneDeep
// import cloneDeep from 'lodash/cloneDeep';

// import {store} from '@/store';
import { storeGetter } from '@/store';
import { hasAccessTo } from '@/utils/hasAccessTo';

import { isEmptyString } from '@/utils/validate';
import {
	alertRulesList,
	pumpTypesList,
	scopesList,
	rfqsTypesList,
	logTypesList,
	dataSetsList,
	settingsLogTypesList,
	workOrdersStatusesList,
	requisitionStatusesList
} from '@/constants/global';
import { lubeMethodsList } from '@/constants/ultrasound';
import { Lang } from '@/localization';
import { localeMonths } from '@/constants/date_time';

/*import {
	// calcFabShopBudget,
	//compareDatesForMaintenance
	//setupPartsList
} from '@/helpers/specialHelpers';*/
// import { ellipsisString } from '@/helpers/domHelpers';

const getList = {
	// equipmentTypesList: () => equipmentTypesList(),
	alertRulesList: () => alertRulesList(),
	pumpTypesList: () => pumpTypesList(),
	scopesList: () => scopesList,
	lubeMethodsList: () => lubeMethodsList(),
	rfqsTypesList: () => rfqsTypesList(),
	logTypesList: () => logTypesList(),
	dataSetsList: () => dataSetsList(),
	settingsLogTypesList: () => settingsLogTypesList,
	workOrdersStatusesList: () => workOrdersStatusesList(),
	requisitionStatusesList: () => requisitionStatusesList()
};

// -----------Getters/Setters-------
const findItemBy1 = (property, value, itemsList = [], settings = {}) => {
	const { notStrict, returnIndex, last } = settings;
	let result = null;
	let index;
	if (itemsList.length) {
		for (let i = 0; i < itemsList.length; i++) {
			// console.log(property, value, itemsList[i], itemsList[i][property])

			if (itemsList[i][property] || itemsList[i][property] === 0) {
				if (notStrict) {
					if (itemsList[i][property] == value) {
						result = itemsList[i];
						index = i;
						if (!last) break;
					}
				} else {
					if (itemsList[i][property] === value) {
						result = itemsList[i];
						index = i;
						if (!last) break;
					}
				}
			}
		}
	}
	return returnIndex ? { item: result, index: index } : result;
};

// console.log(testExport)

const getObjectValUtil = (obj, parts, { skipDeepCopy } /*, isDeep*/) => {
	let objVal,
		objCopy = null;

	if (parts.length) {
		objVal = obj[parts[0]];
		// console.log('getObjectVal: ', obj, parts[0])
	}

	if (objVal) {
		// console.log(parts, objVal)
		if (typeof objVal == 'object') {
			if (skipDeepCopy) {
				if (objVal instanceof Array) {
					objCopy = objVal.slice();
				} else {
					objCopy = Object.assign({}, objVal);
				}
			} else {
				objCopy = cloneDeep(objVal);
			}
		} else {
			objCopy = objVal;
		}

		for (let i = 1; i < parts.length; i++) {
			objCopy = objCopy[parts[i]];
			// if (parts.length == 2) {
			/*if (parts[i] == 'images') {
					console.log(objCopy )
				}*/
			// }
			if (isEmpty(objCopy)) {
				if (!objCopy) {
					if (typeof objCopy == 'boolean') return objCopy;
					else if (objCopy === 0) return objCopy;
					else return null;
				}
			}
		}
		// }
	} else if (typeof objVal == 'boolean' || objVal === 0) {
		objCopy = objVal;
	}
	// console.log('objCopy', objCopy)
	return objCopy;
};

const setObjectVal1 = (obj, accessors, val) => {
	let parts = accessors.split('.');
	try {
		for (let i = 0; i < parts.length - 1; i++) {
			obj = obj[parts[i]];				
		}

		// obj[parts] = obj[parts] || {};
		obj[parts[parts.length - 1]] = val;			
	} catch (e) {
		console.warn(e);
	}
};

const getObjectVal1 = (obj, accessors, settings = {}) => {
	// let isDeep = !!settings && !!settings.withoutDeep ? false : true;
	accessors = accessors || '';
	const main_parts = accessors.split('.');

	// result = objVal;

	return getObjectValUtil(obj, main_parts, settings);
};

const getValues1 = (keyName, itemsList) => {
	let result = [];

	for (let item of itemsList) {
		if (item[keyName]) {
			result.push(item[keyName]);
		}
	}
	return result;
};

const concatValues1 = (initialData, additionalData, { props }) => {
	let result = cloneDeep(initialData);

	for (let prop of props) {
		// console.log(result[prop], additionalData[prop])
		if (result[prop]) {
			if (additionalData[prop]) {
				if (result[prop] instanceof Array) {
					result[prop] = mergeArrays(result[prop], additionalData[prop]);
				} else if (result[prop] instanceof Object) {
					result[prop] = { ...result[prop], ...additionalData[prop] };
				} else {
					result[prop] = additionalData[prop];
				}
			}
		} else {
			result[prop] = additionalData[prop];
		}
	}
	return result;
};

const getItemValue1 = (id, prop, list, index = null) => {
	const item = findItemBy('id', id, list);
	// console.log(item, id, list)
	if (item) {
		const val = getObjectVal(item, prop);
		if (val) {
			return index != undefined ? val[index] : val;
		}
	}
	return '';
};

/*const compareValues = (key, order = 'asc') => {
	return function innerSort(a, b) {
		try {
			if (!a || !b) {return 0;}
			if ( !a.hasOwnProperty(key) || !b.hasOwnProperty(key) ) {
				// property doesn't exist on either object
				return 0;
			}

			const varA = (typeof a[key] === 'string')
				? a[key].toUpperCase() : a[key];
			const varB = (typeof b[key] === 'string')
				? b[key].toUpperCase() : b[key];

			let comparison = 0;
			if (varA > varB) {
				comparison = 1;
			} else if (varA < varB) {
				comparison = -1;
			}
			return (
				(order === 'desc') ? (comparison * -1) : comparison
			);
		} catch (e) {console.log(e)}
	};
};*/

/*const groupBy = (xs, key) => {
	return xs.reduce(function(rv, x) {
		(rv[x[key]] = rv[x[key]] || []).push(x);
		return rv;
	}, {});
};*/
const groupBy1 = (array, key, prefix = '') => {
	let result = {};

	array.forEach(ai => {
		(result[`${prefix}${ai[key]}`] = result[`${prefix}${ai[key]}`] || []).push(ai);
	});
	return result;
};

const sortArrayByKeyNumber1 = (array, key, direction = 'asc') => {
  return array
    .slice()
    .sort((a, b) => {
      const aHasValue = a[key] != null;
      const bHasValue = b[key] != null;

      if (!aHasValue && !bHasValue) return 0;
      if (!aHasValue) return 1;
      if (!bHasValue) return -1;

      const diff = Number(a[key]) - Number(b[key]);
      return direction === 'asc' ? diff : -diff;
    });
};

// -----------Routes/paths--------------
const hasRightsToRoute1 = route => {
	const { isAuthenticated, authUser /*first_loading_app */ } = storeGetter('auth');
	try {
		const { meta } = route;

		if (meta.auth) {
			if (!isAuthenticated) {
				return { hasAccess: false, reason: 'not_auth' };
			}
		}

		/*if (meta.userTypes) {
			if (!meta.userTypes.some(type => authUser.type === type)) {
				return { hasAccess: false, reason: 'limited_access' };
			}
		}*/

		if (meta.permissions) {
			const method = meta.permissionsMethod || undefined;
			return {
				hasAccess: hasAccessTo({
					role: authUser.role,
					permissionKeys: meta.permissions,
					method
				}),
				reason: 'limited_access',
				authUser
			};
		}

		if (meta.conditionSettings) {
			if (!validateBySettings({ ...meta.conditionSettings, dataObj: authUser })) {
				return { hasAccess: false, reason: 'limited_access' };
			}
		}
	} catch (e) {
		console.log(e);
	}

	// console.log(result)
	return { hasAccess: true, reason: '', authUser };
};

const validateRouteParams1 = id => {
	if (id) {
		return (
			id === 'new' ||
			id === 'compare' ||
			// id === 'new_ultra_sound' ||
			// id === 'new_ultra_sound_white_river' ||
			// id === 'new_count' ||
			// id === 'new_ncd' ||
			id === 'profile' ||
			/^\d+$/.test(id)
		);
	}
};

const getParentPageRoute1 = (path, steps = 1) => {
	const routeParts = path.split('/');
	let route = '/';

	if (routeParts.length) {
		routeParts.splice(routeParts.length - steps, steps);
		route = routeParts.join('/');
	}
	return route;
};

// -----------Forms--------------
const updateFormData1 = (
	itemData,
	formData,
	additionalRules = {},
	settings = {}
) => {
	// console.log(itemData)
	let item = settings.skipDeepCopy ? { ...itemData } : cloneDeep(itemData);
	let newFormData = {};

	for (let prop in formData) {
		// console.log(prop, item, item[prop])
		// console.log(item[prop])
		if (typeof item[prop] === 'boolean') {
			newFormData[prop] = item[prop] ? 1 : 0;
		} else if (item[prop] || item[prop] === 0) {
			newFormData[prop] = item[prop];
		} else {
			newFormData[prop] = formData[prop];
		}
	}
	// console.log('newFormData 1', newFormData)
	newFormData = { ...newFormData, ...additionalRules };
	// console.log('newFormData 2', newFormData)

	return newFormData;
};

const setupLabel1 = (item, { accessors, delimeter, useGetItemValue }) => {
	if (item) {
		// console.log(item)
		let label = '';
		for (let i = 0; i < accessors.length; i++) {
			let val = getObjectVal(item, accessors[i]);

			if (val) {
				if (useGetItemValue) {
					const option = findItemBy('accessor', accessors[i], useGetItemValue);
					if (option) {
						const { prop, listName } = option;
						const list = getList[listName]();

						val = getItemValue(val, prop, list);
					}
				}

				const delr = i < 2 ? '-' : delimeter;
				label += `${delr} ${val}`;
			}
		}
		return label.slice(2, label.length);
	}

	return '';
};

const isValid1 = (value, { method }) => {
	let result = true;

	if (method == 'isEmptyString') {
		result = !isEmptyString(value);
	}

	return result;
};

const prepareSubmitData1 = (formData, settings = {}) => {
	// debugger;
	// console.log('before result', formData);
	let newFormData = { ...formData };

	let result = {};
	// console.log(newFormData);
	for (let prop in newFormData) {
		const value = newFormData[prop];
		// console.log( prop);

		if (
			settings.skipValueValidationProps &&
			settings.skipValueValidationProps.some(propItem => propItem == prop)
		) {
			result[prop] = value;
		} else if (value instanceof Array) {
			result[prop] = value;
		} else if (value === 0) {
			result[prop] = value;
		} else if (typeof value == 'boolean') {
			result[prop] = value;
		} else if (typeof value == 'object') {
			// console.log(!isEmpty(value), prop, value)
			if (!isEmpty(value)) {
				result[prop] = value;
			}
		} else if (value) {
			result[prop] = value;
		}
	}
	// console.log('result', result);
	return result;
};

const getValuesFromArray1 = (array, options) => {
	const { subProp, delimeter, inline, justValue, postfix } = options;
	// console.log(array)
	let newVal = '';
	const tag = inline ? 'span' : 'div';

	for (let i = 0; i < array.length; i++) {
		let subVal = justValue ? array[i] : getObjectVal(array[i], subProp);
		let newDelimeter = delimeter;
		if (i == array.length - 1) {
			newDelimeter = postfix ? postfix : '';
		}

		newVal += `<${tag}>${subVal}${newDelimeter || ''}</${tag}>`;
	}

	return newVal;
};

const prepareValue1 = settings => {
	const {
		args,
		useAllInstanceData,
		localMethod,
		row,
		currentValue,
		$index
	} = settings;
	const cellValue = useAllInstanceData ? row : currentValue;
	if (localMethod) {
		// console.log(args)
		return localMethod(cellValue, args, $index);
	}
};

// ---------------Table-----------
const getCellValue1 = (row, column, scope) => {
	let { prop, props, meta, settings, prefix, delimeter } = column;
	const $index = scope && scope.$index ? scope.$index : scope;
	const emptyText = meta && meta.emptyText !== undefined ? meta.emptyText : '-';
	prop = prop || '';
	let val = getObjectVal(row, prop, settings);
	/*if (column.label == 'Completed ROIs') {
		console.log('getCellValue', val)
	}*/
	try {
		if (meta) {
			if (meta.prepareValue) {
				val = prepareValue({
					...meta.prepareValue,
					currentValue: val,
					row: row,
					$index: $index
				});
			}

			if (meta.getItemValue) {
				const { prop, listName } = meta.getItemValue;
				const list = meta.getItemValue.list || getList[listName]();
				if (val instanceof Array) {
					let newVal = '';

					for (let i = 0; i < val.length; i++) {
						newVal += `${getItemValue(val[i], prop, list)}${
							i < val.length - 1 ? ', ' : ''
						}`;
					}
					val = newVal;
				} else {
					val = getItemValue(val, prop, list);
				}
			}
			// if (prop == 'lube_method') {console.log(val)}

			if (meta.boolean) {
				const { trueVal, falseVal } = meta.boolean;
				if (val instanceof Array) {
					val = val.length ? trueVal : falseVal;
				} else {
					val = val ? trueVal : falseVal;
					// console.log(val);
				}
			}

			if (meta.fromArray) {
				val = getValuesFromArray(val, meta.fromArray);
			}
		}

		if (props) {
			let newVal = '';
			for (let i = 0; i < props.length; i++) {
				// newVal += `${getObjectVal(row, props[i])}`;

				if (meta && meta.prepareValue) {
					newVal += `${prepareValue({
						...meta.prepareValue,
						currentValue: getObjectVal(row, props[i]),
						row: row,
						$index: $index
					})}`;
				} else {
					newVal += `${getObjectVal(row, props[i])}`;
				}

				if (delimeter && i < props.length - 1) {
					newVal += delimeter;
				}
			}
			// val = val || emptyText;
			newVal = newVal || emptyText;

			if (val) {
				val = `${val}/${newVal}`;
			} else {
				val = `${newVal}`;
			}
		}

		// console.log(row, column, val)

		if (val || val !== undefined) {
			/*if (column.label == 'Parts') {
				console.log('getCellValue', val, val !== undefined)
			}*/
			if (prefix) return `${prefix}${val}`;
			if (!val) {
				return val === 0 ? val : emptyText;
			}
			return val || emptyText;
		} else {
			return emptyText;
		}
	} catch (e) {
		console.warn(e);
	}
};

const compareValues1 = ({ val1, val2, method }) => {
	if (method == '==') {
		return val1 == val2;
	} else if (method == '!=') {
		return val1 != val2;
	} else if (method == '>') {
		return val1 > val2;
	} else if (method == '<') {
		return val1 < val2;
	} else if (method == 'notEmpty') {
		return val1 ? !isEmpty(val1) : null;
	} else if (method == 'empty') {
		return val1 ? false : isEmpty(val1);
	}
	console.warn('wrong compare method str');
	return null;
};

const validateConditionItem1 = item => {
	// console.log('1', item)
	try {
		// let checkResults = [];
		let {
			method,
			call_method,
			array_method,
			prop,
			control_value_prop,
			control_value,
			controlObj,
			dataObj,
			data_value,
			next_conditions,
			checkMethod_next /*checkMethod*/
		} = item;

		let pre_result;
		// checkMethod = checkMethod || 'every';
		// console.log('1', prop, control_value, control_value_prop)

		if (prop || data_value !== undefined) {
			const first_ctrl_value = prop
				? getObjectValUtil(controlObj, prop.split('.'), {skipDeepCopy:false})
				: data_value;
			// console.log('1.1', prop, data_value, first_ctrl_value)

			const second_ctrl_value = control_value_prop
				? getObjectValUtil(controlObj, control_value_prop.split('.'), {skipDeepCopy:false})
				: control_value;
			// console.log('1.2', control_value_prop, second_ctrl_value)

			if (call_method) {
				// pre_result = methodsList[call_method](first_ctrl_value, control_value);
				pre_result = call_method.method({
					...call_method.payload,
					first_ctrl_value
				});
			} else {
				if (second_ctrl_value instanceof Array) {
					array_method = array_method || 'every';
					// console.log(first_ctrl_value, second_ctrl_value)
					pre_result = second_ctrl_value[array_method](vi =>
						compareValues({
							val1: first_ctrl_value,
							val2: vi,
							method: method || '=='
						})
					);
				} else {
					pre_result = compareValues({
						val1: first_ctrl_value,
						val2: second_ctrl_value,
						method: method || '=='
					});
				}
			}

			/*if (prop == 'is_acknowledge_by_supervisor' ||
					prop == 'creator.id') {
				console.log(first_ctrl_value, control_value, pre_result)
			}*/
		}

		// let pre_result = checkResults[checkMethod](i => i);

		if (pre_result && next_conditions) {
			return validateBySettings({
				checkMethod: checkMethod_next || 'every',
				conditions: next_conditions,
				data_value: data_value,
				dataObj: dataObj
			});
		}
		// console.log('2', prop, pre_result)
		return pre_result;
	} catch (e) {
		console.warn(e);
	}
};

const validateBySettings1 = settings => {
	let { data_value, dataObj, checkMethod, conditions } = settings;
	checkMethod = checkMethod || 'every';

	if (conditions) {
		return conditions[checkMethod](ci =>
			validateConditionItem1({
				...ci,
				controlObj: ci.controlObj || dataObj,
				dataObj: dataObj,
				data_value: ci.data_value !== undefined ? ci.data_value : data_value
			})
		);
	}
	return false;
};

const setupAssignedUsers1 = (cellValue, args) => {
	const { users_ids, team } = cellValue;
	if (team) {
		return `${team.name}`;
	} else if (users_ids.length) {
		let users = args.usersList.filter(ui => users_ids.some(id => id === ui.id));
		let postfix = '';
		const { max } = args;

		if (max && users.length > max) {
			users = users.slice(0, max);
			postfix = '...';
		}
		// console.log(users_ids, `${getValuesFromArray(users, { subProp: 'full_name', delimeter: ', ' })}`)
		return `${getValuesFromArray(users, {
			subProp: 'full_name',
			delimeter: ', ',
			postfix: postfix
		})}`;
	}
	return '-';
};

const getWOStatus1 = (status, args = {}) => {
	const { listName } = args;

	const item = findItemBy('id', status, getList[listName]());
	// console.log(status, getList[listName])
	return `<span class="requisition-status-label"
						style="background-color: ${item.color}"
					>
						<span>${item.name || item.label}
					</span>`;
};

// -------Dates--------
const convertMsToHours1 = total_ms => {
	let total_time = total_ms / 3600000;
	let total_hours = Math.floor(total_time);
	let total_mins = Math.round((total_time % 1) * 60);
	return { total_hours, total_mins };
};

const decomposeDate1 = str => {
	let date;
	if (str) date = new Date(str);
	else date = new Date();

	if (date) {
		return {
			year: date.getFullYear(),
			month: date.getMonth(),
			dt: date.getDate()
		};
	}
	return {};
};

const getPassedTime1 = (from, to) => {
	if (typeof to === 'string') {
		to = ((from || Date.now()) - Date.parse(to)) / 1000;
	}
	// console.log('getPassedTime1', to)
	if (to < 60) {
		return `${Math.floor(to)} ${Lang.tt('sec')}`;
	}
	if (to < 3600) {
		return `${Math.floor(to / 60)} ${Lang.tt('min')}`;
	}
	if (to < 3600 * 24) {
		const t = Math.floor(to / 3600);
		return `${t} ${(t == 1 ? Lang.tt('hour') : Lang.tt('hours') )}`;
	}
	if (to < 3600 * 24 * 30) {
		const t = Math.floor(to / (3600 * 24));
		return `${t} ${(t == 1 ? Lang.tt('day') : Lang.tt('days') )}`;
	}

	return `${Math.floor(to / (3600 * 24 * 30))} ${Lang.tt('months')}`;
};

const getTimeDifference1 = ({ from, to, timeOnly, nextDayWhenLessZero, to_ms }) => {
	let timeStart, timeEnd;

	if (to_ms !== undefined) {
		timeStart = 0;
		timeEnd = to_ms;
	} else if (timeOnly) {
		timeStart = Date.parse('01/01/2007 ' + from);
		timeEnd = Date.parse('01/01/2007 ' + to);
	} else {
		let startTime = from.length <= 10 ? from + ' 00:00' : from;
		let finishTime = to.length <= 10 ? to + ' 00:00' : to;
		timeStart = Date.parse(startTime);
		timeEnd = Date.parse(finishTime);
	}
	let lessZero = timeEnd < timeStart;
	if (nextDayWhenLessZero && lessZero) {
		timeEnd = Date.parse('02/01/2007 ' + to);
		lessZero = false;
	}
	const diff = Math.abs(timeEnd - timeStart);
	const days = Math.floor(diff / 86400000);
	const hours_total = Math.floor(diff / 3600000);
	const minutes_total = Math.floor(diff / 60000);
	const seconds_total = Math.floor(diff / 1000);
	const hours = hours_total - days * 24;
	const minutes = minutes_total - hours_total * 60;
	const seconds = seconds_total - minutes_total * 60;

	const days_final = lessZero ? days * -1 : days;

	let time_total = '';
	if (days) time_total += `${days_final}d `;
	if (hours) time_total += `${hours}h `;
	if (minutes) time_total += `${minutes}min `;
	if (seconds) time_total += `${seconds}s`;

	return {
		lessZero: lessZero,
		time_total: time_total,
		days: days_final,
		hours: hours,
		minutes: minutes,
		seconds: seconds,
		hours_total: hours_total,
		minutes_total: minutes_total,
		seconds_total: seconds_total,
		ms: diff
	};
};

const convertDateToISOString1 = (date, settings = {}) => {
	const str = getYmdDateString({
		dateObj: date,
		timeZone: settings.timeZone,
		withTime: 1
	});

	return `${str.split(' ').join('T')}.000000Z`;
};

const getYmdDateString1 = ({
	dateObj,
	ms,
	withTime,
	withoutSeconds,
	format,
	obj,
	timeOnly,
	timeZone
}) => {
	if (dateObj || ms || obj) {
		// const delimeterSign = delimeter || '-'
		const current_format = format || 'default';
		let date;
		if (obj) {
			const { year, month, dt } = obj;
			date = new Date(year, month, dt);
		} else {
			if (timeZone) {
				date = convertTZ(dateObj || new Date(ms), timeZone);
			} else {
				date = dateObj || new Date(ms);
			}
		}
		let y = date.getFullYear();
		let m = date.getMonth() + 1;
		let d = date.getDate();
		m = m < 10 ? `0${m}` : m;
		d = d < 10 ? `0${d}` : d;

		// console.log('date', d, ms, withTime, current_format)
		if (withTime) {
			let h = date.getHours();
			let mins = date.getMinutes();
			let s = '';

			if (!withoutSeconds) {
				s = date.getSeconds();
				s = s < 10 ? `:0${s}` : `:${s}`;
			}

			h = h < 10 ? `0${h}` : h;
			mins = mins < 10 ? `0${mins}` : mins;

			// console.log(ms, date, h, mins)
			if (current_format == 'default') {
				if (timeOnly) {
					return `${h}:${mins}${s}`;
				}
				return `${y}-${m}-${d} ${h}:${mins}${s}`;
			} else if (current_format == 'lodash') {
				return `${y}_${m}_${d}_${h}_${mins}`;
			}
		}

		if (current_format == 'default') {
			return `${y}-${m}-${d}`;
		} else if (current_format == 'lodash') {
			return `${y}_${m}_${d}`;
		} else if (current_format == 'localeStr') {
			m = date.getMonth();
			return `${Lang.tt(localeMonths()[m])} ${d}, ${y}`;
		} else if (current_format == 'localeStrWithoutYear') {
			m = date.getMonth();
			return `${Lang.tt(localeMonths()[m])} ${d}`;
		}
	}
	return '-';
};

const cleanDateString1 = (str, options = {}) => {
	let result = '';
	let splitBy = options.splitBy || 'T';
	if (str) {
		// console.log(str, options)
		const splited = str.split(splitBy);
		if (splited.length > 1) {
			result += splited[0];
			// console.log(splited, !options.withoutTime)

			if (!options.withoutTime) {
				const secondPart = splited[1].split('.');
				if (secondPart.length > 1) {
					result += ' ' + secondPart[0];
				}
			}
		} else {
			result = str;
		}
	}

	// console.log(result)
	return result;
};

const getDateRange1 = (range_name, options = {}) => {
	const { getDateString, withTime, customDate, isDate, todayEndsAtMidNight } = options;
	let start;
	let end;

	if (customDate) {
		start = isDate ? customDate : new Date(customDate);
		end = isDate ? customDate : new Date(customDate);
	} else {
		start = new Date();
		end = new Date();
	}

	switch (range_name) {
		case '1_hour':
			start.setTime(start.getTime() - 3600 * 1000 * 1);
			// end.setTime(end.getTime() + 3600 * 1000 * 1);
			break;

		case '3_hours':
			start.setTime(start.getTime() - 3600 * 1000 * 3);
			// end.setTime(end.getTime() + 3600 * 1000 * 1);
			break;

		case '12_hours':
			start.setTime(start.getTime() - 3600 * 1000 * 12);
			// end.setTime(end.getTime() + 3600 * 1000 * 1);
			break;

		case 'today':
			start.setHours(0, 0, 0);
			if (todayEndsAtMidNight) {
				end.setHours(23, 59, 59);
			}
			// end.setTime(end.getTime() + 3600 * 1000 * 1);
			break;

		case 'yesterday':
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
			end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
			start.setHours(0, 0, 0);
			end.setHours(23, 59, 0);
			break;

		case 'last_7_days':
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
			break;

		case 'last_30_days':
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
			break;
		case 'last_60_days':
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
			break;
		case 'last_90_days':
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
			break;

		case 'this_month':
			// let nextMonth = start.getMonth() + 1;
			start.setDate(1);
			end.setMonth(start.getMonth() + 1);
			end.setDate(0);
			break;

		case 'this_year':
			start.setFullYear(start.getFullYear(), 0, 1);
			start.setHours(0);
			start.setMinutes(0);
			// console.log(start, start.getFullYear())
			break;

		case 'last_month':
			// let prevMonth = start.getMonth() - 1;
			start.setMonth(start.getMonth() - 1);
			start.setDate(1);
			end.setDate(0);
			break;

		case 'last_3_months':
			start.setFullYear(start.getFullYear(), start.getMonth() - 3, start.getDate());

			// start.setTime(start.getTime() - 3600 * 1000 * 24 * 30 * 3);
			break;

		case 'last_12_months':
			start.setFullYear(start.getFullYear(), start.getMonth() - 12, start.getDate());

			// start.setTime(start.getTime() - 3600 * 1000 * 24 * 30 * 12);
			break;

		case 'first_quarter':
			start.setFullYear(start.getFullYear(), 0, 1);
			start.setHours(0);
			start.setMinutes(0);
			end.setFullYear(start.getFullYear(), 3, 0);
			start.setHours(23);
			start.setMinutes(59);
			break;

		case 'second_quarter':
			start.setFullYear(start.getFullYear(), 3, 1);
			start.setHours(0);
			start.setMinutes(0);
			end.setFullYear(start.getFullYear(), 6, 0);
			start.setHours(23);
			start.setMinutes(59);
			break;

		case 'third_quarter':
			start.setFullYear(start.getFullYear(), 6, 1);
			start.setHours(0);
			start.setMinutes(0);
			end.setFullYear(start.getFullYear(), 9, 0);
			start.setHours(23);
			start.setMinutes(59);
			break;

		case 'fourth_quarter':
			start.setFullYear(start.getFullYear(), 9, 1);
			start.setHours(0);
			start.setMinutes(0);
			end.setFullYear(start.getFullYear(), 12, 0);
			start.setHours(23);
			start.setMinutes(59);
			break;

		default:
			console.error('no correct range_name');
	}
	// console.log()
	if (getDateString) {
		return [
			getYmdDateString({ dateObj: start, withTime: withTime }),
			getYmdDateString({ dateObj: end, withTime: withTime })
		];
	}
	return [start, end];
};

const prepareRangeParams1 = (daterange, settings = {}) => {
	let dateStartKey = settings.dateStartKey || 'dateStart';
	let dateFinishKey = settings.dateFinishKey || 'dateFinish';

	let payload = { [dateStartKey]: '', [dateFinishKey]: '' };

	let newDaterange = cloneDeep(daterange);

	if (settings.convertToUTC) {
		newDaterange[0] = getYmdDateString1({
			dateObj: newDaterange[0],
			timeZone: 'UTC',
			withTime: 1
		});
		newDaterange[1] = getYmdDateString1({
			dateObj: newDaterange[1],
			timeZone: 'UTC',
			withTime: 1
		});
	}

	if (newDaterange && newDaterange.length) {
		payload[dateStartKey] = cleanDateString(newDaterange[0]);
		payload[dateFinishKey] = cleanDateString(newDaterange[1]);
		delete payload.daterange;
	}

	return payload;
};

const updateDateRange1 = (daterange, settings) => {
	const { dateStart, dateFinish } = daterange;
	const { concat, start, finish } = settings;

	let newDateStart = dateStart,
		newDateFinish = dateFinish;

	if (concat) {
		newDateStart += start;
		newDateFinish += finish;
	}

	return {
		dateStart: newDateStart,
		dateFinish: newDateFinish
	};
};

const updateTime1 = (time, { h, m, s }) => {
	let timeArray = time.split(':');

	let n_h = +timeArray[0] || 0;
	let n_m = +timeArray[1] || 0;
	let n_s = +timeArray[2] || 0;

	if (h) n_h = n_h + h;
	if (m) n_m = n_m + m;
	if (s) n_s = n_s + s;

	n_h = n_h < 10 ? `0${n_h}` : n_h + '';
	n_m = n_m < 10 ? `0${n_m}` : n_m + '';
	n_s = n_s < 10 ? `0${n_s}` : n_s + '';

	return `${n_h}:${n_m}:${n_s}`;
};

const formatTime1 = (str, format) => {
	if (str && str != '-') {
		let strArray = str.split(':');
		let formatArray = format.split(':');
		let result = [];
		formatArray.forEach((fi, idx) => {
			if (fi == 'h')
				result.push(strArray[idx][0] == '0' ? strArray[idx][1] : strArray[idx]);
			if (fi == 'H' || fi == 'M')
				result.push(strArray[idx].length < 2 ? `0${strArray[idx]}` : strArray[idx]);
			if (fi == 'm') result.push(strArray[idx] ? strArray[idx] : '00');
			if (fi == 's') result.push(strArray[idx] ? strArray[idx] : '00');
		});
		// console.log(str, format, result)

		if (result.length) {
			return result.join(':');
		}
	}
	return str;
};

const convertTimeToNumberValue1 = str => {
	// console.log(str, format)
	let result = 0;
	let timeArray = str.split(':');

	timeArray.forEach((ti, idx) => {
		if (idx == 0) {
			result += Number(ti);
		} else if (idx == 1) {
			result += Number(ti) / 60;
		}
	});

	return getRoundedValue1(result, 1, 1);
};

const isTodayRange1 = (daterange, options = {}) => {
	const { oneDate } = options;
	const now = new Date();

	const start = new Date(daterange[0]);

	const isTodayStart =
		start.getDate() == now.getDate() &&
		start.getMonth() == now.getMonth() &&
		start.getFullYear() == now.getFullYear();

	if (oneDate) {
		return isTodayStart;
	}

	const end = new Date(daterange[1]);

	const isTodayEnd =
		end.getDate() == now.getDate() &&
		end.getMonth() == now.getMonth() &&
		end.getFullYear() == now.getFullYear();

	return isTodayStart && isTodayEnd;
};

/*const getLocaleStringDateRange = range => {
	let options = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
	};
	// const start = convertTZ(new Date(range[0]), "America/Vancouver", options);
	// const end = convertTZ(new Date(range[1]), "America/Vancouver", options);
	const start = new Date(range[0]).toLocaleString('en-US', options);
	const end = new Date(range[1]).toLocaleString('en-US', options);
	return `${start} - ${end}`;
};*/

const convertTZ1 = (date, tzString) => {
	return new Date(
		(typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', {
			timeZone: tzString
		})
	);
};

const getLocaleStringDateRange1 = range => {
	let options = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
	};

	// const start = convertTZ(new Date(range[0]), "America/Vancouver", options);
	// const end = convertTZ(new Date(range[1]), "America/Vancouver", options);
	const start = new Date(range[0]).toLocaleString('en-US', options);
	const end = new Date(range[1]).toLocaleString('en-US', options);
	return `${start} - ${end}`;
};

const todayDateRange1 = () => {
	const today = getYmdDateString({ dateObj: new Date() });
	return [today, today];
};

export function isoToYmdHis(isoString) {
  return isoString.replace(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?Z$/,
    '$1 $2'
  );
};

export function localToUtcYmdHis(dateString) {
  // убираем Z, чтобы Date воспринял строку как локальное время
  const normalized = dateString.replace(/Z$/, '');

  const d = new Date(normalized);

  const pad = (value) => String(value).padStart(2, '0');

  return (
    `${d.getUTCFullYear()}-` +
    `${pad(d.getUTCMonth() + 1)}-` +
    `${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:` +
    `${pad(d.getUTCMinutes())}:` +
    `${pad(d.getUTCSeconds())}`
  );
};

/*const thisMonthDateRange = () => {
	const this_month = getDateRange('this_month');
	
	return [
		getYmdDateString({dateObj: this_month[0]}),
		getYmdDateString({dateObj: this_month[1]}),
	];
};*/

// ------------------

const removeObjProps1 = (obj, props) => {
	let newObj = cloneDeep(obj);
	for (let i = 0; i < props.length; i++) {
		delete newObj[props[i]];
	}
	return newObj;
};

const cleanObjValues1 = (obj, settings = {}) => {
	let newObj = {};
	for (let prop in obj) {
		if (obj[prop] instanceof Array) {
			newObj[prop] = [];
		} else if (obj[prop] instanceof Object) {
			newObj[prop] = {};
		} else {
			newObj[prop] = settings.toZero ? 0 : null;
		}
	}
	return newObj;
};

const cleanValuesByList1 = (array, obj) => {
	for (let i = 0; i < array.length; i++) {
		let prop = array[i];

		if (obj[prop] !== undefined) {
			if (obj[prop] instanceof Array) {
				obj[prop] = [];
			} else if (obj[prop] instanceof Object) {
				obj[prop] = {};
			} else {
				obj[prop] = null;
			}
		}
	}
};

/*const mergeObjects1 = (...objects) => {
	const isObject = obj => obj && typeof obj === 'object';

	return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach(key => {
			const pVal = prev[key];
			const oVal = obj[key];

			if (Array.isArray(pVal) && Array.isArray(oVal)) {
				// prev[key] = pVal.concat(...oVal);
				prev[key] = cloneArr(oVal);
				// console.log(pVal, oVal, prev[key])
			} else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = mergeObjects1(pVal, oVal);
			} else {
				prev[key] = oVal;
			}
		});

		return prev;
	}, {});
};*/

export const hasOwnProperty1 = (object, property) => {
	return Object.prototype.hasOwnProperty.call(object, property);
};

const mergeObjects1 = (obj1, obj2, settings = {}) => {
	const isObject = obj => obj && typeof obj === 'object';

	let result = {};
	// debugger

	if (isObject(obj1)) {
		if (Array.isArray(obj1) && Array.isArray(obj2)) {
			if (settings.concatArrays) {
				result = obj1.concat(obj2);
			} else {
				result = cloneArr(obj2);
			}
		} else {
			for (let key in obj1) {
				const obj1Val = obj1[key];
				const obj2Val = obj2[key];

				if (Array.isArray(obj1Val) || Array.isArray(obj2Val)) {
					if (Array.isArray(obj1Val) && Array.isArray(obj2Val)) {
						if (settings.concatArrays) {
							result[key] = obj1Val.concat(obj2Val);
						} else {
							result[key] = cloneArr(obj2Val);
						}
					} else {
						result[key] = obj2Val === undefined ? obj1Val : obj2Val;
					}
				} else if (isObject(obj2Val) && isObject(obj1Val)) {
					result[key] = mergeObjects1(obj1Val, obj2Val, settings);
					// console.log('result key', key, result)
				} else {
					result[key] = obj2Val === undefined ? obj1Val : obj2Val;
				}
			}

			if (isObject(obj2)) {
				for (let key in obj2) {
					if (!hasOwnProperty1(obj1, key)) {
						result[key] = obj2[key];
					}
				}
			}
		}
	} else {
		result = obj2;
	}

	return result;
};

const mergeArrays1 = (array1, array2, settings = {}) => {
	let newList = [];
	const { duplicateCheckProp, duplicateCheck } = settings;

	for (let i = 0; i < array1.length; i++) {
		newList.push(array1[i]);
	}

	for (let j = 0; j < array2.length; j++) {
		if (duplicateCheckProp) {
			if (
				array1.every(i1 => i1[duplicateCheckProp] !== array2[j][duplicateCheckProp])
			) {
				newList.push(array2[j]);
			}
		} else if (duplicateCheck) {
			if (array1.every(i1 => i1 != array2[j])) {
				newList.push(array2[j]);
			}
		} else {
			newList.push(array2[j]);
		}
	}
	// console.log('newList', newList)
	return newList;
};

const getMaxValue1 = (array, settings = {}) => {
	let max = -999999,
		min = 999999;

	for (let i = 0; i < array.length; i++) {
		const val = array[i];
		if (val > max) {
			max = val;
		}
		if (val < min) {
			min = val;
		}
	}

	if (settings.returnMinMax) return { max, min };

	return max;
};

const filterByIds1 = (array, ids) => {
	return array.filter(ai => {
		return ids.some(id => ai.id === id);
	});
};

const removeDuplicatesFromArray1 = (array, key) => {
	let newList = [];

	array.forEach(ai => {
		let isContains = newList.some(li => li[key] == ai[key]);
		if (!isContains) {
			newList.push(ai);
		}
	});

	return newList;
};

const removeDuplicatesObjectsArray1 = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// export const correctSumm = (a, b) => ((a*10000) + (b*10000))/10000;

const roundUsing = (func, prec, number) => {
	if (func) {
		var temp = number * Math.pow(10, prec);
		temp = func(temp);
		return temp / Math.pow(10, prec);
	} else {
		return Number(number.toFixed(prec));
	}
};

const countDecimalOrder1 = number => {
	const decimalPart = number.toString().split('.')[1];

	if (decimalPart) {
		const countZeros = (decimalPart.match(/^0*/)[0] || []).length + 1;
		return countZeros;
	} else {
		return 0;
	}
};

const getRoundedValue1 = (value, multiplier, afterDot) => {
	let method;
	if (multiplier < 0) {
		method = Math.floor;
	} else if (multiplier > 0) {
		method = Math.ceil;
	} else method = Math.round;

	const absVal = Math.abs(value);
	let q = afterDot || 0;
	//countDecimalOrder1(Math.abs(value)); //getCountAfterDot(newMax);
	if (afterDot === undefined) {
		if (absVal < 0.000001) q = 7;
		else if (absVal < 0.00001) q = 6;
		else if (absVal < 0.0001) q = 5;
		else if (absVal < 0.001) q = 4;
		else if (absVal < 0.01) q = 3;
		else if (absVal < 0.1) q = 2;
		else if (absVal < 1) q = 1;
	}
	let result = roundUsing(method, q, value);

	/*if (afterDot === undefined) {
		if (result > 10 || result < -10) result = method(result / 10) * 10;
	}*/
	return result;
};

const getCountAfterDot1 = x =>
	x.toString().includes('.')
		? x
				.toString()
				.split('.')
				.pop().length
		: 0;

/*const generateWarnings = count => {
	let result = [];

	for (let i = 1; i < count; i++) {
		result.push({
			id: i,
			sensor_name: 'sensor',
			sensor_parameter_name: 'x-axis',
			alert_rule_name: 'Acute',
			alert_type_name: 'Alarm',
			created_at: '2020-07-07 13:15:51'
		});
	}
	return result;
};*/

const getFileType1 = str => {
	const videoExtensions = ['mp4'];
	const imageExtensions = ['jpg', 'png', 'gif', 'jpeg', 'svg'];
	if (str) {
		try {
			const fileExtension = str
				.split('.')
				.pop()
				.toLowerCase();

			if (fileExtension) {
				if (videoExtensions.includes(fileExtension)) return 'video';
				if (imageExtensions.includes(fileExtension)) return 'image';
			}
		} catch (e) {
			console.warn(e);
		}
	}
	// if (/[.png]/.test(url);) {}
	return '';
};

const capitalizeFirstLetter1 = string => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const setupTableCellImage1 = (picturesList, settings = {}) => {
	const pathKey = settings.pathKey || 'full_thumb_file_name';
	// console.log(picturesList)
	if (picturesList instanceof Array) {
		if (picturesList.length) {
			return `<img src="${picturesList[0][pathKey]}"
									alt="img error"
								/>`;
		}
	} else if (typeof picturesList == 'string') {
		return `<img src="${picturesList}"
								alt="img error"
							/>`;
	}

	return '-';
};

const getFileName1 = str => {
	// console.log(str)

	let result = str;
	if (result) {
		let splited = result.split('/');
		if (splited.length > 1) {
			result = splited[splited.length - 1];
		}
	}
	return result;
};

const getRandomInt1 = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildFormula1 = (formula) => {
  // заменяем {key} → data.key
  const expression = formula.replace(
    /\{(\w+)\}/g,
    (_, key) => `data.${key}`
  );

  return new Function(
    'data',
    `return ${expression};`
  );
};

export const findItemBy = (property, value, itemsList, settings) =>
	findItemBy1(property, value, itemsList, settings);
export const setObjectVal = (obj, accessors, val) =>
	setObjectVal1(obj, accessors, val);
export const getObjectVal = (obj, accessors, settings) =>
	getObjectVal1(obj, accessors, settings);
export const getValues = (keyName, itemsList) => getValues1(keyName, itemsList);
export const concatValues = (initialData, additionalData, payload) =>
	concatValues1(initialData, additionalData, payload);
export const getItemValue = (id, prop, list, index) =>
	getItemValue1(id, prop, list, index);
export const groupBy = (array, key, prefix) => groupBy1(array, key, prefix);
export const sortArrayByKeyNumber = (array, key, direction) => sortArrayByKeyNumber1(array, key, direction);
export const hasRightsToRoute = route => hasRightsToRoute1(route);
export const validateRouteParams = id => validateRouteParams1(id);
export const getParentPageRoute = (path, steps) => getParentPageRoute1(path, steps);
export const updateFormData = (itemData, formData, additionalRules, settings) =>
	updateFormData1(itemData, formData, additionalRules, settings);
export const setupLabel = (item, options) => setupLabel1(item, options);
export const isValid = (value, options) => isValid1(value, options);
export const prepareSubmitData = (formData, settings) =>
	prepareSubmitData1(formData, settings);
export const getValuesFromArray = (array, options) =>
	getValuesFromArray1(array, options);
export const prepareValue = settings => prepareValue1(settings);
export const getCellValue = (row, column, scope) =>
	getCellValue1(row, column, scope);
export const compareValues = payload => compareValues1(payload);
export const validateConditionItem = item => validateConditionItem1(item);
export const validateBySettings = settings => validateBySettings1(settings);
export const setupAssignedUsers = (cellValue, args) =>
	setupAssignedUsers1(cellValue, args);
export const getWOStatus = (status, args) => getWOStatus1(status, args);
export const decomposeDate = str => decomposeDate1(str);
export const convertMsToHours = ms => convertMsToHours1(ms);
export const getPassedTime = (from, to) => getPassedTime1(from, to);
export const getTimeDifference = payload => getTimeDifference1(payload);
export const convertDateToISOString = (date, settings) =>
	convertDateToISOString1(date, settings);
export const getYmdDateString = payload => getYmdDateString1(payload);
export const cleanDateString = (str, options) => cleanDateString1(str, options);
export const getDateRange = (range_name, options) =>
	getDateRange1(range_name, options);
export const prepareRangeParams = (daterange, settings) =>
	prepareRangeParams1(daterange, settings);
export const updateDateRange = (daterange, settings) =>
	updateDateRange1(daterange, settings);
export const updateTime = (time, settings) => updateTime1(time, settings);
export const formatTime = (str, format) => formatTime1(str, format);
export const convertTimeToNumberValue = str => convertTimeToNumberValue1(str);
export const isTodayRange = (daterange, options) =>
	isTodayRange1(daterange, options);
export const convertTZ = (date, tzString) => convertTZ1(date, tzString);
export const getLocaleStringDateRange = range => getLocaleStringDateRange1(range);
export const todayDateRange = () => todayDateRange1();
export const cloneObj = o => ({ ...o });
export const cloneArr = arr => arr.slice(0, arr.length);
// export const removeItemFromArray = (array, index) => array.splice(index, 1);
export const cloneDeep1 = item => cloneDeep(item);
export const removeObjProps = (obj, props) => removeObjProps1(obj, props);
export const cleanObjValues = (obj, settings) => cleanObjValues1(obj, settings);
export const cleanValuesByList = (array, obj) => cleanValuesByList1(array, obj);
export const mergeObjects = (...objects) => mergeObjects1(...objects);
export const mergeArrays = (array1, array2, settings) =>
	mergeArrays1(array1, array2, settings);

export const getMaxValue = (array, settings) => getMaxValue1(array, settings);
export const filterByIds = (array, ids) => filterByIds1(array, ids);
export const removeDuplicatesFromArray = (array, key) => removeDuplicatesFromArray1(array, key);
export const removeDuplicatesObjectsArray = (array, key) => removeDuplicatesObjectsArray1(array, key);
export const getRoundedValue = (value, multiplier, afterDot) =>
	getRoundedValue1(value, multiplier, afterDot);
export const countDecimalOrder = value => countDecimalOrder1(value);
export const roundNearest5 = num => Math.round(num / 5) * 5;
export const roundNearest = (q, num) => Math.round(num / q) * q;
export const getCountAfterDot = x => getCountAfterDot1(x);
export const getFileType = str => getFileType1(str);
export const capitalizeFirstLetter = string => capitalizeFirstLetter1(string);
export const setupTableCellImage = (picturesList, settings) =>
	setupTableCellImage1(picturesList, settings);
export const getFileName = str => getFileName1(str);
export const getRandomInt = (min, max) => getRandomInt1(min, max);
export const buildFormula = (formula) => buildFormula1(formula);

