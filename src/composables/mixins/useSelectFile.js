import { ref } from 'vue';

export function useSelectFile({ formData, clearValidate } = {}) {
	const selectedFiles = ref([]);
	const selectedFile = ref(null);

	const onSelectFile = (e, propName, settings = {}) => {
		const { raw } = e;
		const { isMultiple } = settings;
		if (typeof clearValidate === 'function') {
			clearValidate();
		}
		const form = formData?.value || formData;
		if (!form) return;

		if (isMultiple) {
			if (!Array.isArray(form[propName])) form[propName] = [];
			form[propName].push(raw);
			selectedFiles.value.push({ name: raw.name });
		} else {
			form[propName] = raw;
			selectedFile.value = { name: raw.name };
		}
	};

	const onRemoveFile = (prop, settings = {}) => {
		const { isMultiple, event } = settings;
		const form = formData?.value || formData;
		if (!form) return;

		if (isMultiple) {
			form[prop] = (form[prop] || []).filter((fi) => fi.uid !== event.uid);
			selectedFiles.value = selectedFiles.value.filter((fi) => fi.name !== event.name);
		} else {
			form[prop] = null;
			selectedFile.value = null;
		}
	};

	return { selectedFiles, selectedFile, onSelectFile, onRemoveFile };
}
