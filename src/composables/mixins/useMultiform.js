export function useMultiform({ emit, formData, instancesItemsData, multiFormFilters } = {}) {
	const resolve = (val) =>
		val && typeof val === 'object' && 'value' in val ? val.value : val;

	const setMultiFormFilters = (filters) => {
		if (resolve(instancesItemsData) && emit) {
			const newFilters = { ...(resolve(multiFormFilters) || {}), ...filters };
			emit('event', 'setMultiFormFilters', newFilters);
		}
	};

	const setupByParentInstance = (
		instancesData,
		instanceProp,
		formDataProp,
		settings = {},
	) => {
		if (instancesData && instancesData[instanceProp]) {
			const fd = resolve(formData);
			if (fd && formDataProp in fd) {
				fd[formDataProp] = instancesData[instanceProp].id;
			}
			if (settings.callback) {
				settings.callback();
			}
		}
	};

	return { setMultiFormFilters, setupByParentInstance };
}
