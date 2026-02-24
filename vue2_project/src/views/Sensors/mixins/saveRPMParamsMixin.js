import { findItemBy } from '@/helpers';

const saveRPMParamsMixin = {
	computed: {
		// LANGUAGE_TYPES: () => LANGUAGE_TYPES,
	},

	methods: {
		saveRpmParams(data, settings={}) {
			if (data.isFFTRPM) {
				this.saveFftRpmParams(data, settings);
			} else {
				this.saveEquipmentRpmParams(data, settings);
			}
		},

		saveFftRpmParams(data, settings={}) {
			const payload = {
				notNotify: true,
				sensorId: this.sensorData.id,
				fftId: this.fftItem.id,
				data: { rpm_value: data.rpm_value }
			};

			this.loadingRPM = true;

			this.set_fft_rpm_params(payload).then(response => {
				this.showRpmSettingsDialog = false;
				this.loadingRPM = false;

				if (this.successRpmSaveCallback) {
					this.successRpmSaveCallback({
						fftItem: response.value,
						...settings
					});
				}

				if (settings.successMessage) {
					this.$message({
						type: 'info',
						message: settings.successMessage
					});
				}
			}).catch(() => {
				this.loadingRPM = false;
			});
		},

		saveEquipmentRpmParams(data, settings={}) {
			const equipment = this.equipmentData || this.itemData || {};
			let { id, is_rpm_visible, rpm_source_item } = equipment;
			let { rpmSources } = this.sensorData;
			let selectedRpmOption = findItemBy('id', rpm_source_item, this.itemSpeedOptionsList);
			let final_rpm_source_item = rpm_source_item;

			if (selectedRpmOption) {
				final_rpm_source_item = rpmSources[selectedRpmOption.source_key]
					? final_rpm_source_item
					: this.defaultRpmSourceItem;
			}

			const payload = {
				notNotify: true,
				itemId: id,
				data: {
					is_rpm_visible: !!is_rpm_visible,
					rpm_source_item: final_rpm_source_item || this.defaultRpmSourceItem,
					...data
				}
			};

			const resetFFTRPM = this.fftItem && this.fftItem.rpm_value;

			this.loadingRPM = true;

			this.set_equipment_rpm_params(payload).then(response => {
				if (resetFFTRPM) {
					this.set_fft_rpm_params({
						fftId: this.fftItem.id,
						sensorId: this.sensorData.id,
						notNotify: true,
						data: { rpm_value: null }
					}).then(responseFFT => {
						this.showRpmSettingsDialog = false;
						this.loadingRPM = false;

						if (this.successRpmSaveCallback) {
							this.successRpmSaveCallback({
								equipmentItem: response.value,
								fftItem: responseFFT.value,
								...settings
							});
						}
					}).catch(() => {
						this.loadingRPM = false;
					});
				} else {
					this.showRpmSettingsDialog = false;
					this.loadingRPM = false;

					if (this.successRpmSaveCallback) {
						this.successRpmSaveCallback({
							equipmentItem: response.value,
							...settings
						});
					}
				}

				if (settings.successMessage) {
					this.$message({
						type: 'info',
						message: settings.successMessage
					});
				}
			}).catch(() => {
				this.loadingRPM = false;
			});
		},
	}
};

export default () => saveRPMParamsMixin;
