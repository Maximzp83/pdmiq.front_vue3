<template>
	<el-form
		label-width="150px"
		class="item-edit-form"
		ref="itemForm"
		:model="formData"
		label-position="left"
	>	
		<div class="text-center bold title article-title">{{ title }}</div>
		<div class="flex mrow">
			<div class="mcol-xs-11">
				<div class="el-form-item">
					<div class="flex mrow wrap align-center">
						<el-form-item
							:label="tt('constants.metric')"
							prop="is_monitor_all_metrics"
							class="mcol-xs-12 mcol-sm-7"
						>
							<div class="flex align-center">
								<el-switch 
									@change="selected_metrics_ids = []"
									v-model="formData.is_monitor_all_metrics" class="div-block"
									:active-value="1" :inactive-value="0"
								/>
								<div class="div-block">{{ tt('phrases.all_metrics') }}</div>
							</div>
						</el-form-item>

							<!-- :required="!formData.is_monitor_all_metrics" -->
						<el-form-item prop="monitor_metrics"
							class="mcol-xs-12 mcol-sm-5 label-margin-0"
						>
							<el-select
								multiple
								class="multiple-select"
								:disabled="!!formData.is_monitor_all_metrics"
								v-model="selected_metrics_ids"
								:placeholder="`${tt('Select')} ${tt('constants.metric')}`"
							>
								<el-option
									v-for="item in requestsList"
									:key="'metric_id-' + item['metric_item_id']"
									:label="setupMetricLabelMethod(item)"
									:value="item['metric_item_id']"
								/>
							</el-select>

							<!-- <CustomSelect
								multiple
								:disabled="!!formData.is_monitor_all_metrics"
								:optionsList="requestsList"
								:placeholder="`${tt('Select')} ${tt('constants.metric')}`"
								v-model="selected_metrics_ids"
								valueKey="metric_item_id"
								idKey="metric_item_id"
								:setupLabelMethod="setupMetricLabelMethod"
							/> -->
						</el-form-item>
					</div>	
				</div>
				
				<div class="el-form-item" v-if="enableTimeDelta">
					<div class="flex mrow wrap align-center">
						<el-form-item 
							required prop="time_delta"
							class="mcol-xs-12 mcol-sm-7"
							:label="tt('constants.time_delta')"
						>
							<el-input-number v-model="formData.time_delta" :min="0" />
						</el-form-item>

						<el-form-item prop="time_delta_unit"
							class="mcol-xs-12 mcol-sm-5 label-margin-0"
							required
						>	
							<CustomSelect
								:optionsList="metricUnitTypesList"
								:placeholder="`${tt('Select')} ${tt('constants.unit')}`"
								v-model="formData.time_delta_unit"
							/>
						</el-form-item>
					</div>
				</div>

				<el-form-item :label="isLowHighType ? tt('constants.high_zone') : tt('constants.Alarm_Zone')" required prop="alarm_level">
					<el-input-number v-model="formData.alarm_level" :precision="3"/>
				</el-form-item>

				<el-form-item :label="isLowHighType ? tt('constants.low_zone') : tt('constants.Warning_Zone')" required prop="warning_level">
					<el-input-number v-model="formData.warning_level" :precision="3"/>
				</el-form-item>
			</div>
			
			<div class="">
				<el-button
					class="action-button remove-button"
					size="mini"
					type="danger"
					icon="icomoon icon-cross"
					@click="removeItem"
				/>
			</div>
		</div>
	</el-form>
</template>

<script>
// import { mapState } from 'vuex';
// import { required } from '@/constants/validation';
import { findItemBy } from '@/helpers';
import { metricUnitTypesList, MULTIVIEW_ALARM_TYPES, multiviewAlarmTypesList } from '@/constants/global';

import { subItemMixin } from '@/mixins';

export default {
	mixins: [subItemMixin()],
	props: {
		metricItemsList: { type: Array, default: () => [] },
		requestsList: { type: Array, default: () => [] }
	},

	data() {
		return {
			selected_metrics_ids: [],

			formData: {
				is_monitor_all_metrics: 0,
				monitor_metrics: [
					/*{
						sensor_id: null,
						metric_type: null
					},*/
				],
				time_delta: null,
				time_delta_unit: null,
				warning_level: null,
				alarm_level: null,
				type: null
			},

		};
	},

	computed: {
		isLowHighType() {
			return this.formData.type === MULTIVIEW_ALARM_TYPES.STANDARD_LOW_HIGH;
		},
		title() {
			// console.log(this.itemData.type, )
			const alarmType = findItemBy('id', this.itemData.type, multiviewAlarmTypesList());
			return alarmType ? alarmType.name : '';
		},

		deleteNewId: () => true,
		metricUnitTypesList: () => metricUnitTypesList(),

		enableTimeDelta() {
			// console.log(this.formData.type)
			return this.formData.type === MULTIVIEW_ALARM_TYPES.COMPARE;
		}

	},

	methods: {
		setupMetricLabelMethod(item) {
			// console.log(item)
			const { sensor_name, name } = item;
			return `${sensor_name} - ${name}`;
		},

		localSetupPageActions(itemData) {
			if (itemData && !itemData.new) {
				this.selected_metrics_ids = [];
				
				itemData.monitor_metrics.forEach(mm => {
					const { sensor_id, metric_type } = mm;
					const requestItem = this.requestsList.filter(
						ri => ri.id === metric_type && ri.sensor_id === sensor_id
					)
					if (requestItem.length) {
						this.selected_metrics_ids.push(requestItem[0].metric_item_id);						
						// console.log(this.selected_metrics_ids)
					}
				})
			}
		},

		localGetFormDataCallback(formData) {
			formData.monitor_metrics = this.selected_metrics_ids.map(id => {
				const requestItem = findItemBy('metric_item_id', id, this.requestsList);
				if (requestItem) {
					const { sensor_id, id } = requestItem;
					return { sensor_id, metric_type: id };
				}
				return null;
			})

			formData.monitor_metrics = formData.monitor_metrics.filter(mm => !!mm);

			if (!this.enableTimeDelta) {
				delete formData.time_delta;
				delete formData.time_delta_unit;
			}

			return formData;
		}
	},

	created() {
		// console.log(this.itemData)
	}
};
</script>
