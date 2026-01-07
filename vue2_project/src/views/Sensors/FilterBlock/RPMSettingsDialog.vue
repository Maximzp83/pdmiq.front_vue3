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
import { findItemBy } from '@/helpers';

import {
	itemSpeedOptionsList
} from '@/constants/global';



export default {
	props: {
		sensorData: {
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

		preparedItemSpeedOptionsList() {
			var { rpmSources } = this.sensorData;
			var list = [];

			Object.keys(rpmSources).forEach(source_key => {
				const option = findItemBy('source_key', source_key, this.itemSpeedOptionsList);
				// console.log('dialog', rpmSources, source_key, rpmSources[source_key])
				if (option && (rpmSources[source_key] || rpmSources[source_key] == 0)) {
					list.push({
						id: option.id,
						name: option.name,
						value: rpmSources[source_key]
					});
				}
			})

			return Object.freeze(list);
		},

		radioSettings: () =>
			Object.freeze({
				className: 'el-checkbox',
				title: 'RPM',
				isCheckbox: true,
				alwaysSwitch: true,
				additionalInfoKey: 'value'
			}),

	},

	methods: {
		handleSave() {
			this.$emit('save', this.rpm_source_item);
		},

		handleCancel() {
			this.$emit('close');	
		}
	},

	created() {
		this.rpm_source_item = this.currentRpmSource;
	}
};
</script>
