import { findItemBy } from '@/helpers';

const saveRPMParamsMixin = {
	computed: {
		// LANGUAGE_TYPES: () => LANGUAGE_TYPES,
	},

	methods: {
		saveRpmParams(data) {
			// if (this.enableRpmBlock) {
				let {id, is_rpm_visible, rpm_source_item } = this.itemData;
				let { rpmSources } = this.sensorData;
				let selectedRpmOption = findItemBy('id', rpm_source_item, this.itemSpeedOptionsList);
				let final_rpm_source_item = rpm_source_item;
				
				if (selectedRpmOption) {
					final_rpm_source_item = rpmSources[selectedRpmOption.source_key]
						? final_rpm_source_item
						: this.defaultRpmSourceItem;
				}

				const payload = {
					itemId: id,
					notNotify: true,				
					data: {
						is_rpm_visible: !!is_rpm_visible,
						rpm_source_item: final_rpm_source_item || this.defaultRpmSourceItem,
						...data
					}
				};

				/*if (process.env.NODE_ENV === 'development') {
					if (payload.data) {

						console.log(payload)
						return;
					}
				}*/

				this.loadingRPM = true;

				this.set_equipment_rpm_params(payload).then(({value}) => {
					// console.log(response)
					this.showRpmSettingsDialog = false;
					if (this.successRpmSaveCallback) {
						this.successRpmSaveCallback(value);
					}
					// this.$emit('event', { eventName: 'reFetchEquipment' });
					this.loadingRPM = false;
				}).catch(()=>{
					this.loadingRPM = false;
				});
			// }
		},
	}
};

export default () => saveRPMParamsMixin;
