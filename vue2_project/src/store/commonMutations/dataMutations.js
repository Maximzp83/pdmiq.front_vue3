import { setObjectVal, concatValues } from '@/helpers';

export default {
	/*SET_ITEMS: (state, items) => {
		state.itemsList = items || [];
	},*/

	SET_STATE: (state, { stateProp, value, concatData }) => {
		if (concatData) {
			state[stateProp] = concatValues(state[stateProp], value, concatData);
		} else {
			// console.log(state, stateProp, value)
			state[stateProp] = value;
		}
	},

	/*	SET_MULTIPLE_STATE: (state, stateProps) => {
		for (let i = 0; i < stateProps.length; i++) {
			const { prop, value } = stateProps[i]
			state[prop] = value;
		}
	},*/
	SET_NESTED_STATE: (state, { stateProp, value }) => {
		setObjectVal(state, stateProp, value);
	},

	SET_FILTERS: (state, { stateProp, prefix, value, notSetToLocalStorage }) => {
		// console.log(prefix, value)
		var prop = stateProp || 'filters';
		state[prop] = value;

		var new_value = { ...value };
		if (notSetToLocalStorage) {
			notSetToLocalStorage.forEach(ei => {
				new_value[ei] = null;
			});
		}
		localStorage.setItem(`${prefix}_filters`, JSON.stringify(new_value));
	}
	/*SET_SORTING: (state, { filter, val }) => {
		state.filters[filter] = val;
	}*/
};
