<template>
	<div class="rpm-settings-list">
		<div class="section-row">
			<RadioButtonsBlock
				v-model="rpm_source_item"
				:settings="radioSettings"
				:optionsList="preparedItemSpeedOptionsList"
			/>
		</div>

		<div slot="footer" class="dialog-footer dialog-decorate-footer text-center">
			<!-- :loading="sensorJobSaving" -->
			<el-button
				type="primary"
				@click="handleSave"
				class="uppercase semi-bold"
				>{{ tt('Save') }}</el-button
			>

			<el-button
				class="uppercase semi-bold"
				@click="handleCancel"
				>{{ tt('Cancel') }}</el-button
			>
		</div>
		
	</div>
</template>

<script>
// import { mapActions, /*mapState*/ } from 'vuex';
// import { findItemBy } from '@/helpers';
import { setupItemSpeedOptionsList } from '@/helpers/specialHelpers';

import {
	itemSpeedOptionsList,
	ITEM_SPEED_OPTIONS
} from '@/constants/global';

export default {
	props: {
		sensorData: {
			type: Object,
			default: () => ({})
		},
		fftItem: {
			type: Object,
			default: () => ({})
		},
		rootFilters: {
			type: Object,
			default: () => ({})
		},
		currentRpmSource: null
	},
	components: {
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
	},
	data() {
		return {
			rpm_source_item: null
		};
	},

	computed: {
		itemSpeedOptionsList: () => itemSpeedOptionsList(),
		preparedItemSpeedOptionsList: that => setupItemSpeedOptionsList({
			sensorData: that.sensorData,
			measurement: that.rootFilters.measurement,
			itemSpeedOptionsList: that.itemSpeedOptionsList,
			fftItem: that.fftItem
		}),

		radioSettings: () =>
			Object.freeze({
				className: 'el-checkbox',
				title: 'RPM',
				isCheckbox: true,
				alwaysSwitch: true,
				additionalInfoKey: 'value',
				valueAsObject: { props: ['id', 'value'], isActiveKey: 'id', valueKey: 'value' },
			}),

	},

	methods: {
		handleSave() {
			let data = {
				rpm_source_item: this.rpm_source_item.id,
			}
			if (this.rpm_source_item.id === ITEM_SPEED_OPTIONS.MANUAL_RPM) {
				data.rpm_value = +this.rpm_source_item.value;
			} else if (this.rpm_source_item.id === 'fft-rpm') {
				// console.log('rpm_source_item', this.rpm_source_item)
				data.rpm_value = +this.rpm_source_item.value;
				data.isFFTRPM = true;
			}
			this.$emit('save', data);
		},

		handleCancel() {
			this.$emit('close');	
		}
	},

	created() {
		this.rpm_source_item = {
			...this.currentRpmSource
		};
	}
};
</script>
