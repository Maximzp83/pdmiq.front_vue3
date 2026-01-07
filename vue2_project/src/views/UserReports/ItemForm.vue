<template>
	<div
		class="edit-form-container user-report-form"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			class="item-edit-form"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item prop="name" :label="tt('Name')" required>
				<CustomInput v-model="formData.name" :placeholder="tt('name')"/>
			</el-form-item>

			<el-form-item prop="type" :label="tt('Type')" required>
				<CustomSelect
					class="capitalize"
					optionClassName="capitalize"
					:optionsList="userReportTypesList"
					:placeholder="`${tt('Select')} ${tt('type')}`"
					v-model="formData.type"
				/>
			</el-form-item>

			<el-form-item prop="graph_data_measurement" :label="tt('Measurement')" required
				v-if="formData.type === USER_REPORT_TYPES.COMPARE"
			>
				<CustomSelect
					class="capitalize"
					optionClassName="capitalize"
					:optionsList="metricSystemsList"
					:placeholder="`${tt('Select')} ${tt('Measurement')}`"
					v-model="formData.graph_data_measurement"
				/>
			</el-form-item>

			<el-form-item
				prop="report_for_range_days"
				:label="tt('Range')"
				required
			>
				<!-- <CustomSelect
					:optionsList="rangeList"
					:placeholder="`${tt('Select')} ${tt('range')}`"
					v-model="formData.report_for_range_days"
				/> -->
				<div class="flex align-center">
					<el-input-number class="div-block" v-model="formData.report_for_range_days" :min="1"/>

					<span class="div-block">{{ tt('days') }}</span>					
				</div>
			</el-form-item>

				<!-- class="radio-inputs-inline" -->
			<el-form-item
				:label="tt('Days')"
				prop="launch_on_weekdays"
				required
			>
				<RadioButtonsBlock
					v-model="formData.launch_on_weekdays"
					:settings="daysRadioOptions"
					:optionsList="weekDaysList"
				/>
			</el-form-item>

			<el-form-item prop="launch_time" class="time-select" :label="tt('time')">
				<el-time-select
					v-model="formData.launch_time"
					:picker-options="{
						start: '00:00',
						step: '00:15',
						end: '23:45'
					}"
					:placeholder="`${tt('select')} ${tt('time')}`"
				>
				</el-time-select>
			</el-form-item>

			<el-form-item prop="report_by_sensor_ids" :label="tt('Sensors')"
				v-if="formData.type === USER_REPORT_TYPES.COMPARE"
			>
				<FetchByQuerySelect
					v-if="enableSensorsLoadmore"
					clearable
					filterable
					multiple
					enableLoadmore
					preventResetOptionsWhenQueryIsCleared
					v-model="formData.report_by_sensor_ids"
					:optionsLoading.sync="sensorsLoading"
					:optionsList.sync="sensorsList"
					:settings="sensorQueryOptions"
					:setupLabelSettings="sensorLabelOptions"
					:placeholder="`${tt('Select')} ${tt('sensors')}`"
					prefixIcon="icomoon icon-sensor"
					:minOptionsToFetch="6"
				/>

				<CustomSelect
					v-else
					filterable
					multiple
					:optionsLoading="sensorsLoadingProps"
					:optionsList="sensorsListProps"
					:placeholder="`${tt('Select')} ${tt('sensors')}`"
					v-model="formData.report_by_sensor_ids"
					prefixIcon="icomoon icon-sensor"
					:setupLabelSettings="sensorLabelOptions"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				class=""
				:label="tt('phrases.notifiable_plants')"
			>
				<el-switch
					v-model="formData.is_report_by_notifiable_plants"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				:label="tt('phrases.Report_plants')"
				prop="report_by_plant_ids"
			>
				<CustomSelect
					filterable
					multiple
					:disabled="!!isCSM || !!formData.is_report_by_notifiable_plants"
					:optionsList="plantsListProps"
					:placeholder="`${tt('Select')} ${tt('plants')}`"
					v-model="formData.report_by_plant_ids"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				class=""
				:label="tt('phrases.thresholds_only')"
			>
				<el-switch
					v-model="formData.is_check_missing_thresholds_only"
					:active-value="1"
					:inactive-value="0"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				:label="tt('phrases.baseline_delta')" prop="baseline_delta"
			>
				<el-input-number v-model="formData.baseline_delta" :precision="2" />
				<b> %</b>
			</el-form-item>

			<el-form-item
				v-if="formData.type === USER_REPORT_TYPES.BASELINING"
				:label="tt('phrases.warning_and_alarm_delta')" prop="warning_and_alarm_delta"
			>
				<el-input-number v-model="formData.warning_and_alarm_delta" :precision="2" />
				<b> %</b>
			</el-form-item>
			
			<!-- <FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/> -->
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';

import { weekdays } from '@/constants/date_time';
import { userReportTypesList, USER_REPORT_TYPES } from '@/constants/global';
import { metricSystemsList } from '@/modules/charts_factory/controllers/Sensor/enums';
// import { updateFormData } from '@/helpers';
import { required } from '@/constants/validation';
import { itemFormMixin, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [itemFormMixin(), fetchItemsHelper()],
	components: {
		// FormOperationsButtons: () => import('@/components/form/FormOperationsButtons.vue')
		RadioButtonsBlock: () => import('@/components/form/RadioButtonsBlock.vue'),
		FetchByQuerySelect: () => import('@/components/form/FetchByQuerySelect.vue'),
	},

	props: {
		sensorsLoadingProps: Boolean,

		// enableSensorsLoadmore: Boolean,
	},

	data() {
		return {
			sensorsList: [],
			sensorsLoading: false,

			formData: {
				id: null,
				name: '',
				type: null,
				graph_data_measurement: null,
				report_for_range_days: null,
				report_by_sensor_ids: [],
				launch_on_weekdays: [],
				launch_time: '',

				report_by_plant_ids: [],
				is_report_by_notifiable_plants: 0,
				is_check_missing_thresholds_only: 0,
				baseline_delta: 10,
				warning_and_alarm_delta: 50
			},

			rules: {
				name: required,
				report_by_plant_ids: null,
				is_report_by_notifiable_plants: null,
				// plant_id: required
			}
		};
	},

	computed: {
		USER_REPORT_TYPES: () => Object.freeze(USER_REPORT_TYPES),
		metricSystemsList: () => Object.freeze(metricSystemsList()),


		userId: that => that.additionalSettings.userId,
		isCSM: that => that.additionalSettings.isCSM,
		enableBaselineReport: that => that.additionalSettings.enableBaselineReport,
		
		userReportTypesList() {
			const { enableBaselineReport } = this;

			if (!enableBaselineReport) {
				return Object.freeze(userReportTypesList().filter(ri => ri.id !== USER_REPORT_TYPES.BASELINING));
			}
			return Object.freeze(userReportTypesList());
		},	
		
		sensorsListProps: that => that.additionalSettings.sensorsListProps || [],
		plantsListProps: that => that.additionalSettings.plantsListProps || [],
		enableSensorsLoadmore: that => !that.sensorsListProps.length,

		daysRadioOptions: () =>	Object.freeze({
			className: 'standard semi-bold button-rounded',
			inline: true,
			disableInlineWrap: true,
			valueAsArray: true
		}),
		weekDaysList: () =>	Object.freeze(weekdays().map((day, idx) => {
			return { name: day[0], id: idx };
		})),

		sensorQueryOptions() {
			return Object.freeze({
				fetchAction: 'sensors/fetch_sensors',
				params: {
					orderByColumn: 'name',
					orderByMethod: 'asc',
				}
			});
		},

		sensorLabelOptions: () =>
			Object.freeze({
				accessors: [
					'equipment.asset.machine.name',
					'equipment.asset.name',
					'location_in_equipment'
				],
				/*useGetItemValue: [
					{ accessor: 'data_set', prop: 'label', listName: 'dataSetsList' }
				],*/
				delimeter: ','
			}),
	},

	methods: {
		...mapActions({
			fetch_sensors: 'sensors/fetch_sensors',
			save_item: 'users/save_report'
		}),

		fetchSensors(ids) {
			this.doFetchAction('fetch_sensors', 'sensorsList', 'sensorsLoading', {
				params: { max: -1, ids }
			});
		},

		localPrepareSubmitData(data) {
			if (data.type == USER_REPORT_TYPES.COMPARE) {
				data.report_by_plant_ids = [];
				delete data.baseline_delta;
				delete data.warning_and_alarm_delta;
				delete data.is_report_by_notifiable_plants;
				delete data.is_check_missing_thresholds_only;
			} else if (data.type == USER_REPORT_TYPES.BASELINING) {
				data.report_by_sensor_ids = [];
				delete data.graph_data_measurement;
			}
			return data;
		},

		preparePayload(payload) {
			return {
				...payload,
				userId: this.userId
			}
		}
	},

	watch: {
		'formData.report_by_plant_ids'(ids) {
			this.rules.is_report_by_notifiable_plants = ids ? null : required;
			// this.formData.is_report_by_notifiable_plants = 0;
		},
		'formData.is_report_by_notifiable_plants'(isTrue) {
			if (this.isCSM) {
				this.rules.report_by_plant_ids = null;
			} else {
				this.rules.report_by_plant_ids = isTrue ? null : required;
			}
			this.formData.report_by_plant_ids = [];
		}
	},

	created() {
		if (this.itemData && this.itemData.report_by_sensor_ids.length) {
			this.fetchSensors(this.itemData.report_by_sensor_ids);
		}
	}
};
</script>
