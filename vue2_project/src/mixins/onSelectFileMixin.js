const onSelectFileMixin = {
	data: () => ({
		selectedFiles: [],
		selectedFile: null
	}),

	methods: {
		onSelectFile(e, propName, settings = {}) {
			const { raw } = e;
			const { isMultiple } = settings;
			this.clearValidate();
			if (isMultiple) {
				this.formData[propName].push(raw);
				this.selectedFiles.push({ name: raw.name });
			} else {
				this.formData[propName] = raw;
				this.selectedFile = { name: raw.name };
			}

			// console.log(this.formData[propName])
		},

		onRemoveFile(prop, settings = {}) {
			const { isMultiple, event } = settings;
			// console.log(event.uid)
			if (isMultiple) {
				this.formData[prop] = this.formData[prop].filter(fi => fi.uid !== event.uid);
				this.selectedFiles = this.selectedFiles.filter(fi => fi.name != event.name);
				// this.selectedFiles.push({ name: raw.name });
			} else {
				this.formData[prop] = null;
				this.selectedFile = null;
			}
		}
	}
};

export default () => onSelectFileMixin;
