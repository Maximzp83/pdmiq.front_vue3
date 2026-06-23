import { updateFormData, prepareSubmitData, cleanObjValues } from '@/helpers';
import { checkUploadSettings } from '@/helpers/specialHelpers';

const itemFormMixin = {
	components: {
		FormOperationsButtons: () =>
			import('../components/form/FormOperationsButtons.vue')
	},
	props: {
		fromAnotherInstance: Boolean,
		itemData: {
			type: Object,
			default: () => null
		},
		itemsName: {
			type: Object,
			default: () => ({})
		},
		fromModal: Boolean,
		showSubmitButtons: Boolean,
		editInModal: Boolean,
		propsNavbarSettings: null,
		copyItem: Boolean,
		propsSuccessSubmitCallback: Function,
		settings: {
			type: Object,
			default: () => ({})
		},
		formSettings: {
			type: Object,
			default: () => ({})
		},
		additionalSettings: {
			type: Object,
			default: () => ({})
		},
		editModal: { type: Object, default: () => ({}) }
	},

	data() {
		return {
			isMobile: false,
			itemId: null,
			isInitialSetup: true
		};
	},

	computed: {
		activeItemsTable() {
			return this.$store.state.global.activeItemsTable;
		},
		globalFilters() {
			return this.$store.state.global.globalFilters;
		},

		navbarSettings() {
			return this.$store.state.global.navbarSettings;
		},

		showPlant() {
			if (this.navbarSettings && this.navbarSettings.showPlantName) {
				const { id, name } = this.navbarSettings.showPlantName;

				return Object.freeze({ id, name });
			}
			return null;
		},
		/*selectedCompany() {
			return this.$store.state.global.selectedCompany;
		},*/
		authUser() {
			return this.$store.state.auth.authUser;
		}
	},

	methods: {
		setup_navbar(settings) {
			this.$store.dispatch('setup_navbar', settings);
		},
		show_edit_modal(data) {
			// console.log('2', data)
			this.$store.dispatch('show_edit_modal', data);
		},
		set_global_state(data) {
			this.$store.dispatch('set_global_state', data);
		},

		clearValidate(props = []) {
			if (this.$refs['itemForm']) {
				this.$refs['itemForm'].clearValidate(props);
			}
		},

		initFormData() {
			this.formData = { ...this.initialFormData };
			// console.log(1, this.formData)
		},

		setupForm(itemData, formData) {
			// console.log(itemData, formData)
			let additionalRules = {};
			if (this.copyItem && this.copyOptions) {
				additionalRules = this.copyOptions.additionalRules;
			}
			// console.log(additionalRules)
			return updateFormData(itemData, formData, additionalRules);
		},

		setupPage(item, options = {}) {
			const prop = options.formDataName || 'formData';
			const idProp = options.idPropName || this.idPropName || 'id';

			if (item && Object.keys(item).length) {
				if (!this.copyItem) {
					this.itemId = item[idProp];
				}
				this[prop] = this.setupForm(item, this[prop]);
				// console.log(item, this[prop])
			} else {
				this.itemId = null;

				if (this.initialFormData) {
					this.initFormData();
				} else if (this.cleanFormDataAfterClose) {
					this[prop] = cleanObjValues(this[prop]);
					// console.log(this[prop])
				}

				if (this.new_item_type) {
					this.formData.type = this.new_item_type;
				}
			}

			// console.log(this.formSettings)
			if (this.formSettings) {
				this[prop] = { ...this[prop], ...this.formSettings };
			}

			if (this.localSetupPage) this.localSetupPage(item);

			setTimeout(() => {
				this.isInitialSetup = false;
			}, 0);
			// console.log(this.formData);
		},

		validateForm(options = {}) {
			this.clearValidate();
			const ref = options.activeFormName || 'itemForm';
			this.$refs[ref].validate(mainFormIsValid => {
				let validationResults = [mainFormIsValid];

				if (this.subItemsSettings) {
					if (this.validateSubItemsForm) {
						validationResults.push(
							this.validateSubItemsForm(this.subItemsSettings)
						);
					}
				}
				/*if (this.fromBannerSensorForm) {
					console.log('validateForm fromBannerSensorForm', this.handleValidationResult(validationResults, options))
				}*/

				this.handleValidationResult(validationResults, options);
			});
		},

		handleValidationResult(validationResults, options) {
			// console.log('validationResults', validationResults, this)
			if ( validationResults.every(item => item) ) {

				if (this.handleValidationResultCallback) {
					this.handleValidationResultCallback();
				}
				// console.log('all valid', validationResults)
				if (this.subItemsSettings) {
					if (this.collectDataFromSubItems) {
						this.resetFormDataBySubItems(this.subItemsSettings);
						// console.log('formData 1', this.formData)
						// var collectedData = this.collectDataFromSubItems(this.subItemsSettings, options);
						// console.log('collectedData 1', collectedData)
						this.formData = {
							...this.formData,
							...this.collectDataFromSubItems(this.subItemsSettings, options)
						};
						// console.log('formData 2', this.formData)
					}
				}
				
				if (this.localValidationHook) {
					/*if (this.fromBannerSensorForm) {
						console.log('localValidationHook fromBannerSensorForm' , this.localValidationHook(options))
					}*/
					this.localValidationHook(options);
				} else if (this.handleValidateRefsItems) {
					this.handleValidateRefsItems(options);
				} else {
					this.submitForm(options);
				}
			} else {
				this.$notify({
					type: 'warning',
					title: this.$t('phrases.form_isnt_ready'),
					message: this.$t(`phrases.Please_check_fields_errors_first`)
				});
				return false;
			}
		},

		submitForm(options = {}) {
			// const { formDataName, submitSettings } = options;
			// console.log('submitForm', this.formData)
			try {
				let {
					formDataName,
					/*submitSettings*/ injectToBody,
					additionalInject
				} = options;
				injectToBody = injectToBody || {};
				additionalInject = additionalInject || {};
				const settings = this.settings || {};

				let data = {
					id: this.itemId,
					...this[formDataName || 'formData'],
					...additionalInject,
					...injectToBody
				};

				// console.log('injectToBody', options, data)

				/*if (submitSettings) {
					data[submitSettings.formProp] = options.data;
				}*/

				if (this.localPrepareSubmitData) {
					data = this.localPrepareSubmitData(data, options);
				}

				// console.log('localPrepareSubmitData', data)

				// const payload = { ...prepareSubmitData(data) };
				// console.log(payload);
				/*if (process.env.NODE_ENV === 'development') {
					if (data) {
						console.log(data);
						console.log('prepared', { ...prepareSubmitData(data, this.prepareSubmitDataSettings) })
						return;
					}					
				}*/

				// console.log(this.showSubmitButtons)
				if (data) {
					if (this.localSubmit && !this.ignoreLocalSubmit) {
						return this.localSubmit(
							{ ...prepareSubmitData(data, this.prepareSubmitDataSettings) },
							options
						);
					} else if (this.editInModal || this.fromModal || this.showSubmitButtons) {
						// console.log(this.editModal)
						const itemName =
							(this.editModal && this.editModal.itemName) ||
							this.itemsName.one ||
							'Item';
						let payload = {
							data: { ...prepareSubmitData(data, this.prepareSubmitDataSettings) },
							itemName: itemName
						};

						if (this.uploadSettings) {
							payload = checkUploadSettings(payload, this.uploadSettings);
						}

						if (this.preparePayload) {
							payload = this.preparePayload(payload);
						}

						if (this.localPreSubmitHook) {
							const { next } = this.localPreSubmitHook(payload);
							if (!next) return;
						}

						const submitActionProp =
							this.submitActionProp || settings.submitActionProp || 'save_item';

						// console.log(submitActionProp)
						/*if (process.env.NODE_ENV === 'development') {
							if (payload) {
								console.log(payload)
								return
							}
						}*/
						this.$emit('event', { eventName: 'toggleSaving', data: true, onward: true });

						this[submitActionProp](payload)
							.then(answer => {
								// this.handleCloseEditModal();
								this.$emit('event', { eventName: 'toggleSaving', data: false, onward: true });

								try {
									// console.log(3, this.activeItemsTable, this.instanceName);

									// console.log('successModalSubmit 1', this.successSubmitCallback)
									this.$emit('event', {
										eventName: 'successModalSubmit',
										data: answer,
										onward: true
									});

									if (this.successSubmitCallback) {
										this.successSubmitCallback(answer);
									}

									if (this.propsSuccessSubmitCallback) {
										this.propsSuccessSubmitCallback(answer);
									} else {
										// this.show_edit_modal({ show: false });
									}

									if (
										this.activeItemsTable == this.instanceName ||
										this.instanceName == 'Sensors'
									) {
										this.set_global_state({
											stateProp: 'updateItemsList',
											value: { key: 'equipmentsList', val: true }
										});

										// console.log(this, this.filters)
										// this.fetchItems({ ...this.filters, ...this.globalFilters });
									}

									if (this.activeItemsTable || this.fromModal) {
										this.set_global_state({
											stateProp: 'updateCounters',
											value: true
										});
									}
								} catch (e) {
									console.warn(e);
								}
								// console.log(this.activeItemsTable, this.instanceName);
							})
							.catch(() => {
								this.$emit('event', { eventName: 'toggleSaving', data: false, onward: true });
							});
					} else {
						const formData = {
							...prepareSubmitData(data, this.prepareSubmitDataSettings)
						};
						if (this.localPreSubmitHook) {
							const { next } = this.localPreSubmitHook(formData);
							if (!next) return;
						}
						// console.log(formData)
						/*if (process.env.NODE_ENV === 'development') {
							if (formData) {
								console.log('submit', formData);
								return;
							}
						}*/
						this.$emit('submit', formData);
					}
				}
			} catch (e) {
				console.warn(e);
			}
		},

		/*setPlantIdToForm(id) {
			if (id && this.formData.plant_id !== undefined && !this.formData.plant_id) {
				this.formData.plant_id = id;
			}
		},*/

		handleCancel() {
			// console.log(1)
			this.$emit('onCancel');
		}
	},

	watch: {
		itemData(data) {
			if (!this.blockSetupPageInWatcher) {
				this.setupPage(data);
			}
		}

		/*'globalFilters.plantId'(id) {
			this.setPlantIdToForm(id);
		}*/
	},

	created() {
		// console.log('created mixin')

		if (this.initialFormData) {
			this.initFormData();
		}
		// this.setPlantIdToForm(this.globalFilters.plantId);
		this.setupPage(this.itemData);
	},

	beforeMount() {
		this.isMobile = document.documentElement.clientWidth < 992;
	}
};

export default () => itemFormMixin;
