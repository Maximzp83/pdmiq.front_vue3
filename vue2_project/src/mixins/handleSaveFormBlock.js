const handleSaveFormBlock = {
	methods: {
		validateByFieldsList(formData, fields) {
			let errors = [];

			for (let prop of fields) {
				if (!formData[prop]) {
					errors.push(prop);
				}
			}

			return errors;
		},

		handleValidateRefsItems() {
			let payload = { isValid: null, data: {} };
			const { validate } = this.options;
			const { formData } = this;

			if (validate) {
				const { fields, validateMethod } = validate;
				if (validateMethod && this[validateMethod]) {
					payload.isValid = this[validateMethod](formData);
				} else {
					if (fields && fields.length) {
						const errors = this.validateByFieldsList(formData, fields);
						payload.isValid = errors.length < 1;
					} else {
						payload.isValid = Object.values(formData).every(val => !!val);
					}
				}
			} else {
				payload.isValid = true;
			}

			if (payload.isValid) {
				if (this.isSelectorBlock && this.options.multiple) {
					payload.data = this.prepareSelectorData(formData);
				} else {
					payload.data = {
						...formData
					};
				}
			} else {
				payload.titles = [];
				const { fields } = validate;

				if (fields && fields.length) {
					payload.titles = this.validateByFieldsList(formData, fields);
				} else {
					for (let prop in formData) {
						if (!formData[prop]) {
							payload.titles.push(prop);
						}
					}
				}
			}
			// console.log('payload.isValid ', payload)

			this.$emit('blockReady', payload);
		}
	}
};

export default () => handleSaveFormBlock;
