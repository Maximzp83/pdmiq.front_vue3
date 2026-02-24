import { findItemBy } from '@/helpers';

const saveRPMParamsMixin = {
	computed: {
		// LANGUAGE_TYPES: () => LANGUAGE_TYPES,
	},

	methods: {
		saveRpmParams(data, settings={}) {
			let payload = {
				notNotify: true	
			};

			let	submitActionKey, resetFFTRPM;

			if (data.isFFTRPM) {
				payload.sensorId = this.sensorData.id;
				payload.fftId = this.fftItem.id;
				payload.data = { rpm_value: data.rpm_value };
				submitActionKey = 'set_fft_rpm_params';

			} else {
				let {id, is_rpm_visible, rpm_source_item } = this.itemData; //equipment
				let { rpmSources } = this.sensorData;
				let selectedRpmOption = findItemBy('id', rpm_source_item, this.itemSpeedOptionsList);
				let final_rpm_source_item = rpm_source_item;
				
				if (selectedRpmOption) {
					final_rpm_source_item = rpmSources[selectedRpmOption.source_key]
						? final_rpm_source_item
						: this.defaultRpmSourceItem;
				}

				payload.itemId = id;
				payload.data = {
					is_rpm_visible: !!is_rpm_visible,
					rpm_source_item: final_rpm_source_item || this.defaultRpmSourceItem,
					...data
				};

				submitActionKey = 'set_equipment_rpm_params';

				if (this.fftItem && this.fftItem.rpm_value) {
					resetFFTRPM = true;
				}

			}

				/*if (process.env.NODE_ENV === 'development') {
					if (payload.data) {

						console.log(payload, settings)
						return;
					}
				}*/

				this.loadingRPM = true;

				this[submitActionKey](payload).then(response => {
					// console.log(resetFFTRPM)
					if (resetFFTRPM) {
						this.set_fft_rpm_params({
							fftId: this.fftItem.id,
							sensorId: this.sensorData.id,
							notNotify: true,
							data: { rpm_value: null }
						}).then(responseFFT => {;
							this.showRpmSettingsDialog = false;
							this.loadingRPM = false;

							if (this.successRpmSaveCallback) {
								this.successRpmSaveCallback({
									equipmentItem:response.value,
									fftItem:responseFFT.value,
									...settings
								});
							}
						}).catch(() => {
							this.loadingRPM = false;
						})
					} else {
						this.showRpmSettingsDialog = false;
						if (this.successRpmSaveCallback) {						
							this.successRpmSaveCallback({
								fftItem: response.value,
								...settings
							});
						}
						this.loadingRPM = false;
					}

					if (settings.successMessage) {
						this.$message({
							type: 'info',
							message: settings.successMessage
						});
					}
				}).catch(()=>{
					this.loadingRPM = false;
				});
			// }
		},
	}
};

export default () => saveRPMParamsMixin;
