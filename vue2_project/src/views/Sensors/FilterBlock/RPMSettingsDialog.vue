<template>
	<div class="rpm-settings-list">
		<div class="section-row">
			<div class="rpm-settings-grid">
				<div class="rpm-settings-grid__header">
					<div class="rpm-settings-grid__cell rpm-settings-grid__cell--option"></div>
					<div class="bold rpm-settings-grid__cell rpm-settings-grid__cell--value">RPM</div>
					<div class="bold rpm-settings-grid__cell rpm-settings-grid__cell--value">Hz</div>
				</div>

				<div
					v-for="item in preparedItemSpeedOptionsList"
					:key="`rpm-source-${item.id}`"
					:class="['rpm-settings-grid__row', { 'is-active': isActive(item) }]"
					@click="handleSelect(item)"
				>
					<div class="rpm-settings-grid__cell rpm-settings-grid__cell--option el-checkbox">
						<span
							:class="['el-checkbox__input', { 'is-checked': isActive(item) }]"
						>
							<span class="el-checkbox__inner"></span>
						</span>
						<span class="rpm-settings-grid__label capitalize" v-html="item.name" />
					</div>

					<div class="rpm-settings-grid__cell rpm-settings-grid__cell--value">
						<CustomInput
							v-if="item.hasInput && isActive(item)"
							v-model="rpm_source_item.value"
							class="mini additional-input-cell"
							@click.native.stop
						/>
						<span v-else>{{ formatValue(getRpmValue(item)) }}</span>
					</div>

					<div class="rpm-settings-grid__cell rpm-settings-grid__cell--value">
						<span>{{ formatValue(getHzValue(item), 2) }}</span>
					</div>
				</div>
			</div>
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
import { setupItemSpeedOptionsList } from '@/helpers/specialHelpers';

import {
	itemSpeedOptionsList,
	ITEM_SPEED_OPTIONS,
} from '@/constants/global';

export default {
	props: {
		sensorData: {
			type: Object,
			default: () => ({})
		},
		rootFilters: {
			type: Object,
			default: () => ({})
		},
		fftItem: {
			type: Object,
			default: () => null
		},
		currentRpmSource: null,
	},
	components: {
		CustomInput: () => import('@/components/form/CustomInput.vue'),
	},
	data() {
		return {
			rpm_source_item: null
		};
	},

	computed: {
		itemSpeedOptionsList: () => itemSpeedOptionsList(),
		preparedItemSpeedOptionsList: that => {
			return setupItemSpeedOptionsList({
				sensorData: that.sensorData,
				itemSpeedOptionsList: that.itemSpeedOptionsList,
				fftItem: that.fftItem,
				rootFilters: that.rootFilters
			})

		},
	},

	methods: {
		isActive(item) {
			return this.rpm_source_item && this.rpm_source_item.id === item.id;
		},

		handleSelect(item) {
			this.rpm_source_item = {
				id: item.id,
				value: this.getRpmValue(item)
			};
		},

		getRpmValue(item) {
			if (this.isActive(item) && this.rpm_source_item) {
				return this.rpm_source_item.value;
			}
			return item.rpmValue != null ? item.rpmValue : item.value;
		},

		getHzValue(item) {
			const rpmValue = this.getRpmValue(item);
			return rpmValue != null && rpmValue !== '' && !isNaN(+rpmValue) ? +rpmValue / 60 : null;
		},

		formatValue(value, fixed = 0) {
			if (value == null || value === '' || isNaN(+value)) {
				return '-';
			}
			return (+value).toFixed(fixed);
		},

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

<style lang="scss" scoped>
.rpm-settings-grid {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.rpm-settings-grid__header,
.rpm-settings-grid__row {
	display: grid;
	grid-template-columns: minmax(0, 1.5fr) minmax(90px, 120px) minmax(90px, 120px);
	gap: 12px;
	align-items: center;
}

.rpm-settings-grid__header {
	font-weight: 600;
}

.rpm-settings-grid__row {
	max-height: 35px;
	height: 35px;
	box-sizing: border-box;
	/*border: 1px solid #dcdfe6;*/
	/*border-radius: 6px;*/
	cursor: pointer;

}

/*.rpm-settings-grid__row.is-active {
	border-color: #409eff;
	background: #f4f9ff;
}*/

.rpm-settings-grid__cell--option {
	display: flex;
	align-items: center;
	gap: 10px;
}

.rpm-settings-grid__cell--value {
	display: flex;
	align-items: center;
	justify-content: center;
	// min-height: 24px;
	text-align: center;

	.custom-input {
		width: 60px;
		margin: 0;

		:deep(input) {
			height: 24px;
			line-height: 24px;
			box-sizing: border-box;
			text-align: center;
			padding: 2px 4px !important;
		}
	}
}

.rpm-settings-grid__label {
	line-height: 1.3;
}
</style>
