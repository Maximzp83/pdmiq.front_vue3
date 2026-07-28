import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash.clonedeep';

const getObjectValue = (object, path = '') => {
	const parts = path.split('.');
	let value = object?.[parts[0]];

	if (value && typeof value === 'object') {
		value = cloneDeep(value);
	}

	for (let index = 1; index < parts.length; index++) {
		value = value?.[parts[index]];
		if (isEmpty(value) && value !== false && value !== 0) return null;
	}

	return value ?? (value === false || value === 0 ? value : null);
};

export const compareValues = ({ val1, val2, method }) => {
	if (method === '==') return val1 == val2;
	if (method === '!=') return val1 != val2;
	if (method === '>') return val1 > val2;
	if (method === '<') return val1 < val2;
	if (method === 'notEmpty') return val1 ? !isEmpty(val1) : null;
	if (method === 'empty') return val1 ? false : isEmpty(val1);

	console.warn('wrong compare method str');
	return null;
};

export const validateConditionItem = (item) => {
	try {
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
			checkMethod_next,
		} = item;

		let result;
		if (prop || data_value !== undefined) {
			const firstValue = prop ? getObjectValue(controlObj, prop) : data_value;
			const secondValue = control_value_prop
				? getObjectValue(controlObj, control_value_prop)
				: control_value;

			if (call_method) {
				result = call_method.method({
					...call_method.payload,
					first_ctrl_value: firstValue,
				});
			} else if (secondValue instanceof Array) {
				result = secondValue[array_method || 'every']((value) =>
					compareValues({ val1: firstValue, val2: value, method: method || '==' }),
				);
			} else {
				result = compareValues({ val1: firstValue, val2: secondValue, method: method || '==' });
			}
		}

		if (result && next_conditions) {
			return validateBySettings({
				checkMethod: checkMethod_next || 'every',
				conditions: next_conditions,
				data_value,
				dataObj,
			});
		}

		return result;
	} catch (error) {
		console.warn(error);
		return undefined;
	}
};

export const validateBySettings = ({ data_value, dataObj, checkMethod = 'every', conditions }) => {
	if (!conditions) return false;

	return conditions[checkMethod]((condition) =>
		validateConditionItem({
			...condition,
			controlObj: condition.controlObj || dataObj,
			dataObj,
			data_value: condition.data_value !== undefined ? condition.data_value : data_value,
		}),
	);
};
