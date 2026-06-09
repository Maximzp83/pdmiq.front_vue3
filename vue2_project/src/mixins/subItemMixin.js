import { updateFormData /*prepareUploadData*/ } from '@/helpers';

const subItemMixin = {
	props: {
		itemIndex: Number,
		// clearable: Boolean,
		// query: String,
		itemData: {
			type: Object,
			required: true
		},

		required: Boolean
	},

	data() {
		return {
			isMobile: false,
			isInitialSetup: true,

			new: false,
			itemId: null,

			// validation_errors: []
		};
	},

	methods: {
		setupForm(itemData, formData) {
			// console.log(itemData, formData)
			return updateFormData(itemData, formData, {}, this.updateFormDataSettings);
		},

		setupPage(item) {
			if (item && Object.keys(item).length) {
				this.new = item.new || this.isNew || false;
				this.itemId = item.id;
				
				if (this.localSetupPageHook) {
					const { next, itemForSetup } = this.localSetupPageHook(item);
					// console.log(itemForSetup, next)
					if (next) {
						this.formData = this.setupForm(itemForSetup, this.formData);
					}
				} else {
					this.formData = this.setupForm(item, this.formData);
				}
			} else {
				this.new = true;
			}

			if (this.localSetupPageActions) {
				this.localSetupPageActions(item);
			}

			setTimeout(() => {
				this.isInitialSetup = false;
			}, 0);
		},

		validateItemForm(options = {}) {
			let validationResults = [];

			const FormInstance = this.$refs['itemForm'];

			if (FormInstance && FormInstance.validate) {
				FormInstance.fields.forEach(field => {
					const { prop } = field._props;					
					FormInstance.validateField(prop, error => {
						if (error) {
							validationResults.push(false);
						}
					})
				});
			}

			if (this.subItemsSettings) {
				if (this.validateSubItemsForm) {
					// console.log('ok 3', this.validateSubItemsForm)
					validationResults.push(
						this.validateSubItemsForm(this.subItemsSettings)
					);
				}
			}

			// let isValid = validationResults.every(item => item);

			if (this.localValidationHook) {
				validationResults.push(this.localValidationHook(options));
			} 
			// console.log('sub item validation', this, validationResults)
			return validationResults.every(item => item);
		},

		getFormData(options) {
			let formData = { ...this.formData };

			if (this.subItemsSettings) {
				if (this.collectDataFromSubItems) {
					formData = {
						...formData,
						...this.collectDataFromSubItems(this.subItemsSettings, options)
					};
				}
			}

			if ((this.deleteNewId && this.new) || this.deleteFileId || this.deleteId) {
				delete formData.id;
			}
			if (this.localGetFormDataCallback) {
				formData = this.localGetFormDataCallback(formData, options);
			}

			if (this.localGetFormData) {
				return this.localGetFormData(formData, options);
			}
			// console.log('1', formData.id, this )
			
			return formData;
		},

		submitItemForm(options) {
			let formData = this.getFormData(options);

			this.localSubmit(formData, options);
		},

		removeItem() {
			this.$emit('onRemove', this.itemId);
			// this.$emit('onRemove', { id: this.itemId, listName: 'statesItemsList' });
		},

		addItem() {
			this.$emit('onCreate');
		},

		handleResetValidate() {
			this.$refs['itemForm'].clearValidate();
		}
	},

	created() {
		this.setupPage(this.itemData);
	},

	mounted() {
		if (this.itemData) {
			const { focus } = this.itemData;

			// console.log(focus, this.$refs[focus])
			if (focus && this.$refs[focus]) {
				this.$refs[focus].focus();
			}
		}
	}
};

export default () => subItemMixin;
