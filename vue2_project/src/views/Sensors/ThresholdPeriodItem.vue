<template>
	<el-form
		ref="itemForm"
		:class="['option-item-container relative']"
		:model="formData"
		:rules="rules"
		:label-position="'top'"
	>
		<!-- label-width="100px" -->
		<!-- <div class="el-form-item"> -->
		<div class="flex mrow">
			<el-form-item
				:label="
					isHumiditySensor ? tt('constants.High_zone') : tt('constants.Alarm_zone')
				"
				prop="alarm_zone"
			>
				<el-input-number
					v-model="formData.alarm_zone"
					:min="formData.warning_zone"
				/>
				<!-- :precision="3" -->

				<!-- <span class="input-description"
						v-if="sensor && sensor.type === CONTROLLER_TYPES.ULTRA_SOUND && !isOffAlarm">
						{{formData.alarm_zone + chartStatisticsData.baseline_zone}}
					</span> -->
			</el-form-item>

			<el-form-item
				prop="warning_zone"
				class="content-row"
				:label="
					isHumiditySensor ? tt('constants.Low_zone') : tt('constants.Warning_zone')
				"
			>
				<el-input-number
					v-model="formData.warning_zone"
					:min="0"
					:max="formData.alarm_zone"
				/>
				<!-- <span class="input-description"
						v-if="sensor && sensor.type === CONTROLLER_TYPES.ULTRA_SOUND && !isOffAlarm"
					>
						{{formData.warning_zone + chartStatisticsData.baseline_zone}}
					</span> -->
			</el-form-item>

			<el-form-item :label="tt('Months')" prop="months">
				<!-- class="period-block" -->
				<el-select
					multiple
					:placeholder="`${tt('select')} ${tt('months')}`"
					v-model="formData.months"
					class="multiple-select"
				>
					<el-option
						v-for="item in filteredMonthsList"
						:key="'months-' + item.id"
						:label="item.name"
						:value="item.id"
					>
					</el-option>
				</el-select>
			</el-form-item>

			<el-form-item label=" ">
				<el-button
					class="action-button inverted"
					size="mini"
					type="primary"
					@click="removeItem"
				>
					<i class="icomoon icon-cross remove-button"></i>
				</el-button>
			</el-form-item>
		</div>
		<!-- </div> -->
	</el-form>
</template>

<script>
// import { updateFormData } from '@/helpers';
import { required } from '@/constants/validation';
import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		isOffAlarm: Boolean,
		selectedMonths: Array,
		isHumiditySensor: Boolean
	},

	data() {
		return {
			formData: {
				id: null,
				baseline_zone: 0,
				warning_zone: 0,
				alarm_zone: 0,
				critical_alarm_zone: 0,
				custom_zone: 0,
				normal_zone: 0,
				months: []
			}
		};
	},

	computed: {
		rules: () => ({
			warning_zone: required,
			alarm_zone: required
		}),
		deleteNewId: () => true,

		monthsList: that =>
			that.$translate([
				{ id: 1, name: 'constants.Jan' },
				{ id: 2, name: 'constants.Feb' },
				{ id: 3, name: 'constants.Mar' },
				{ id: 4, name: 'constants.Apr' },
				{ id: 5, name: 'constants.May' },
				{ id: 6, name: 'constants.Jun' },
				{ id: 7, name: 'constants.Jul' },
				{ id: 8, name: 'constants.Aug' },
				{ id: 9, name: 'constants.Sept' },
				{ id: 10, name: 'constants.Oct' },
				{ id: 11, name: 'constants.Nov' },
				{ id: 12, name: 'constants.Dec' }
			]),

		filteredMonthsList() {
			const { monthsList, selectedMonths, formData } = this;
			// console.log(monthsList, selectedMonths)
			return monthsList.filter(
				m =>
					!selectedMonths.some(sm => sm === m.id) ||
					formData.months.some(fm => fm === m.id)
			);
		}
	},

	methods: {
		localSetupPageActions(item) {
			this.isNew = item.new || false;
			// this.disableEdit = !item.new;
		}
	},

	watch: {
		'formData.months'(ids) {
			this.$emit('selectMonth', ids);
		}
	}
};
</script>
