import { watch } from 'vue';

export const mergedBindParams = (mergeWithItems = []) => {
	const result = {};
	mergeWithItems.forEach((obj) => {
		if (obj.getValue) {
			result[obj.param] = obj.getValue();
		}
	});
	return result;
};

export const shouldFetchForBinding = ({ value, mergeWith = [], newPayload, fetchAnyWay }) => {
	if (Array.isArray(value)) {
		return value.length > 0 && value[0] !== null;
	}

	if (value || fetchAnyWay) {
		return true;
	}

	return mergeWith?.some((mi) => {
		if (!mi.noFetch && !mi.disableFetch) {
			const val = newPayload.params?.[mi.param];
			return Array.isArray(val) ? val.length > 0 && val[0] !== null : !!val;
		}
		return false;
	});
};

export const setupRequestBinding = ({
	bindTo = [],
	isInitialSetupRef,
	blockInitialFetch,
	// initialSetup,
	decorateOption,
	onWatchTrigger,
	// onFetchById,
} = {}) => {
	bindTo.forEach((item, idx) => {
		const newOption = decorateOption
			? decorateOption(item, bindTo.filter((bti) => bti !== item))
			: { ...item, mergeWith: bindTo.filter((bti) => bti !== item) };

		const getPrimary = item.getValue;
		const getAlternate = item.alternateGetValue;
		if (isInitialSetupRef?.value && idx === bindTo.length - 1) {
			// console.log('isInitialSetupRef', blockInitialFetch, initialSetup);
			if (!blockInitialFetch) {
				const bindingValue = getPrimary ? getPrimary() : undefined;
				const alternateValue = getAlternate ? getAlternate() : undefined;
				// console.log('bindingValue', () => bindingValue);
				onWatchTrigger?.(bindingValue ?? alternateValue, newOption);
			}
		}
		if (getPrimary) {
			watch(
				() => getPrimary(),
				(newVal) => {
					// console.log('newVal', newVal);
					if (!isInitialSetupRef?.value || idx === bindTo.length - 1) {
						const alternateValue = getAlternate ? getAlternate() : undefined;
						onWatchTrigger?.(newVal ?? alternateValue, newOption);
					}
				},
			);
		}
	});

	/*if (isInitialSetupRef?.value && initialSetup?.fetchById) {
		onFetchById?.(initialSetup.fetchById);
	}*/
};
