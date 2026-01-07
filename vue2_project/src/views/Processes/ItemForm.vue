<template>
	<div
		class="edit-form-container"
		:class="{ 'half-width': !fromAnotherInstance && !isMobile }"
	>
		<!-- :validate="" -->
		<el-form
			:class="['item-edit-form', { showJustInfo: showJustInfo }]"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Name')" prop="name">
				<CustomInput
					required
					v-model="formData.name"
					:placeholder="showJustInfo ? '-' : tt('name')"
				/>
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelect
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('plant')}`"
					v-model="formData.plant_id"
				/>
			</el-form-item>

			<el-form-item :label="tt('Controller')" prop="controller_id">
				<CustomSelect
					filterable
					:optionsLoading="controllersLoading"
					:optionsList="controllersList"
					:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('controller')}`"
					v-model="formData.controller_id"
				/>
			</el-form-item>

			<!-- <el-form-item
				:label="tt('Production_Line')"
				prop="production_line_id"
			>
				<CustomSelect
					filterable
					:optionsLoading="productionLinesLoading"
					:optionsList="productionLinesList"
					:placeholder="tt('select')"
					v-model="formData.production_line_id"
				/>
			</el-form-item> -->

			<el-form-item :label="tt('Production_Line')" prop="production_line_id">
				<CustomSelect
					filterable
					:optionsLoading="productionLinesLoading"
					:optionsList="productionLinesList"
					:placeholder="tt('select')"
					v-model="formData.production_line_id"
				/>
			</el-form-item>

			<el-form-item
				:label="tt('Machines')"
				prop="machines_ids"
				v-if="isIndustrialMatrix || canEdit"
			>
				<CustomSelect
					filterable
					multiple
					collapse-tags
					className="multiple-select"
					:optionsLoading="machinesLoading"
					:optionsList="machinesList"
					:placeholder="`${tt('Select')} ${tt('machines')}`"
					v-model="formData.machines_ids"
				/>
			</el-form-item>

			<el-form-item :label="tt('Node')" prop="order_action">
				<el-select
					v-model="formData.order_action"
					:placeholder="`${tt('Select')} ${tt('port')}`"
				>
					<el-option
						v-for="item in portsList"
						:key="'order_action-' + item"
						:label="item"
						:value="item"
					/>
				</el-select>
			</el-form-item>

			<hr class="el-form-item" />

			<div class="el-form-item">
				<el-form-item
					:label="tt('phrases.maximum_capacity')"
					prop="max_capacity"
					class="mcol-xs-12 mcol-sm-9"
				>
					<el-input v-model.number="formData.max_capacity" />
				</el-form-item>

				<!-- <el-form-item
					label="Real capacity"
					prop="real_capacity"
					class="mcol-xs-12 mcol-sm-9"
				>
					<el-input v-model.number="formData.real_capacity" />
				</el-form-item> -->

				<el-form-item
					:label="tt('work_days')"
					prop="week_work_days"
					class="mcol-xs-12 mcol-sm-9"
				>
					<CustomSelect
						multiple
						:optionsList="weekDaysList"
						:placeholder="`${tt('select')} ${tt('days')}`"
						v-model="formData.week_work_days"
						className="multiple-select"
					/>
						<!-- valueKey="day" -->
					<!-- labelKey="label" -->
				</el-form-item>

				<el-form-item
					:label="tt('work_time')"
					prop="finish_work_day"
					class="small-paddings-time mcol-xs-12 mcol-sm-9"
				>
					<div class="flex mrow">
						<div class="mcol-xs-6">
							<el-time-select
								@blur="() => clearValidate(['finish_work_day'])"
								@change="handleStartTimeChange"
								v-model="formData.start_work_day"
								value-format="HH:mm"
								:placeholder="tt('start')"
								:picker-options="timePickerOptions"
							/>
						</div>

						<div class="mcol-xs-6">
							<el-time-select
								@blur="() => clearValidate(['finish_work_day'])"
								:disabled="!formData.start_work_day"
								v-model="formData.finish_work_day"
								value-format="HH:mm"
								:placeholder="tt('finish')"
								:picker-options="endTimePickerOptions"
							/>
						</div>
					</div>
				</el-form-item>

				<!-- label="Run rate" -->
				<el-form-item prop="production_hourly_rate" class="mcol-xs-12 mcol-sm-9">
					<div slot="label" class="label-slot">
						<label class="is-required">{{ tt('Run_rate') }}</label>

						<!-- <el-tooltip placement="top"
							content="Top center"
						>	
							<span class="tooltip-container">
								<i class="el-icon-question"></i>								
							</span>
						</el-tooltip> -->
					</div>

					<el-input v-model="formData.production_hourly_rate" />
				</el-form-item>

				<!-- label="Stop Time (minutes)" -->
				<el-form-item prop="expected_downtime_minutes" class="mcol-xs-12 mcol-sm-9">
					<div slot="label" class="label-slot">
						<label class="is-required">{{
							`${tt('Stop_Time')} (${tt('minutes')})`
						}}</label>

						<el-tooltip
							placement="bottom"
							:content="tt('phrases.stop_time_tooltip')"
							popper-class="middle-width"
						>
							<span class="tooltip-container">
								<i class="el-icon-question"></i>
							</span>
						</el-tooltip>
					</div>

					<el-input-number v-model="formData.expected_downtime_minutes" :min="1" />
				</el-form-item>

				<el-form-item
					:label="tt('phrases.further_below_run_rate_percent')"
					prop="extremal_deviation_percent"
					class="mcol-xs-12 mcol-sm-9"
				>
					<div slot="label" class="label-slot">
						<label class="">{{
							tt('phrases.further_below_run_rate_percent')
						}}</label>

						<el-tooltip
							placement="bottom"
							:content="tt('phrases.further_below_run_rate_tooltip')"
							popper-class="middle-width"
						>
							<span class="tooltip-container">
								<i class="el-icon-question"></i>
							</span>
						</el-tooltip>
					</div>

					<el-input-number
						v-model="formData.extremal_deviation_percent"
						:min="0"
						:max="100"
					/>
				</el-form-item>

				<el-form-item
					:label="tt('Breaktime')"
					prop="work_breaks"
					class="mcol-xs-12 mcol-sm-9"
				>
					<div class="options-container">
						<div v-if="breakTimeItemsList.length" class="content-row">
							<BreakTimeItem
								required
								ref="BreakTimeItem"
								v-for="(item, idx) in breakTimeItemsList"
								:key="`break-time_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:workTime="workTimeSettings"
								:timePickerOptions="timePickerOptions"
								@onRemove="id => removeFormItem(id, 'breakTimeItemsList')"
								:hideRemove="!isIndustrialMatrix && !canDelete"
							/>
								<!-- @ready="blockReady" -->
						</div>

						<div class="margin-top-row" v-if="isIndustrialMatrix || canEdit">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								icon="icomoon icon-cross"
								@click="addFormItem('breakTimeItemsList', 'bt_i-')"
							/>
						</div>
					</div>
				</el-form-item>

				<el-form-item
					:label="tt('phrases.extended_work_date')"
					prop="work_dates"
					class="mcol-xs-11 "
				>
					<div class="options-container">
						<div v-if="workDatesItemsList.length" class="content-row">
							<WorkDateItem
								required
								ref="WorkDateItem"
								v-for="(item, idx) in workDatesItemsList"
								:key="`work-day_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:timePickerOptions="timePickerOptions"
								@onRemove="id => removeFormItem(id, 'workDatesItemsList')"
								:hideRemove="!isIndustrialMatrix && !canDelete"
							/>
						</div>

						<div class="margin-top-row" v-if="isIndustrialMatrix || canEdit">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								icon="icomoon icon-cross"
								@click="addFormItem('workDatesItemsList', 'wd_i-')"
							/>
						</div>
					</div>
				</el-form-item>

				<el-form-item
					:label="tt('Faults')"
					prop="faults"
					class="mcol-xs-12 mcol-sm-9"
				>
					<div class="options-container">
						<div v-if="faultsItemsList.length" class="content-row">
							<FaultItem
								required
								ref="FaultItem"
								v-for="(item, idx) in faultsItemsList"
								:key="`fault_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								@onRemove="id => removeFormItem(id, 'faultsItemsList')"
								:hideRemove="!isIndustrialMatrix && !canDelete"
							/>
						</div>

						<div class="margin-top-row" v-if="isIndustrialMatrix || canEdit">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								icon="icomoon icon-cross"
								@click="addFormItem('faultsItemsList', 'f_i-')"
							/>
						</div>
					</div>
				</el-form-item>

				<!-- <el-form-item :label="tt('Processes')" prop="conveyor_processes">
					<div class="options-container">
						<div v-if="processesItemsList.length" class="content-row">
							<ProcessItem required
								ref="ProcessItem"
								v-for="(item, idx) in processesItemsList"
								:key="`fault_item-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:machinesList="machinesList"
								:machinesLoading="machinesLoading"
								@onRemove="id => removeFormItem(id, 'processesItemsList')"
								@ready="blockReady"
							/>
						</div>

						<div class="margin-top-row">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								icon="icomoon icon-cross"
								@click="addFormItem('processesItemsList', 'pr_i-')"
							/>
						</div>
					</div>
				</el-form-item> -->
			</div>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="validateForm"
			/>
		</el-form>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { required } from '@/constants/validation';
// import { removeObjProps } from '@/helpers';

import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin()
	],
	components: {
		FormOperationsButtons: () =>
			import('@/components/form/FormOperationsButtons.vue'),
		FaultItem: () => import('./FaultItem.vue'),
		BreakTimeItem: () => import('./BreakTimeItem.vue'),
		WorkDateItem: () => import('./WorkDateItem.vue'),
		// ProcessItem: () => import('./ProcessItem.vue'),
		ElTimeSelect: () =>
			import(/* webpackChunkName: "ElTimePicker" */ 'element-ui/lib/time-select')
	},

	data() {
		return {
			plantsLoading: false,
			plantsList: [],
			machinesLoading: false,
			machinesList: [],
			controllersLoading: false,
			controllersList: [],
			productionLinesLoading: false,
			productionLinesList: [],

			faultsItemsList: [],
			breakTimeItemsList: [],
			workDatesItemsList: [],
			// processesItemsList: [],

			formData: {
				name: '',
				plant_id: null,
				controller_id: null,
				order_action: 0,
				// port_number: null,
				machines_ids: [],
				production_line_id: null,

				// ------
				max_capacity: 0,
				// real_capacity: 0,
				start_work_day: '',
				finish_work_day: '',
				faults: [],
				work_breaks: [],
				week_work_days: [],
				work_dates: [],
				conveyor_processes: [],
				production_hourly_rate: null,
				expected_downtime_minutes: 1,
				extremal_deviation_percent: 20
			}
		};
	},

	computed: {
		instanceName: () => 'Processes',

		canEdit: that => that.$hasAccessTo(['edit_oee']),
		canDelete: that => that.$hasAccessTo(['delete_oee']),

		showJustInfo: that => !that.isIndustrialMatrix && !that.canEdit,

		rules: () =>
			Object.freeze({
				name: required,
				plant_id: required,
				controller_id: required,
				production_line_id: required,
				// machines_ids: required,
				start_work_day: required,
				finish_work_day: required
			}),

		requestsToDoList() {
			let list = [
				{
					action: 'fetch_plants',
					localProp: 'plantsList',
					localLoadProp: 'plantsLoading'
				},
				{
					action: 'fetch_production_lines',
					bindTo: [
						{
							prop: 'formData.plant_id',
							param: 'plantId'
						}
					],
					localProp: 'productionLinesList',
					localLoadProp: 'productionLinesLoading'
				},
				{
					action: 'fetch_controllers',
					bindTo: [
						{
							prop: 'formData.plant_id',
							param: 'plantId',
							alternate_prop: 'globalFilters.plantId',
							clean_prop: 'formData.controller_id'
						}
					],
					localProp: 'controllersList',
					localLoadProp: 'controllersLoading'
				}
			];

			if (this.isIndustrialMatrix || this.canEdit) {
				list.push({
					action: 'fetch_machines',
					bindTo: [
						{
							prop: 'formData.plant_id',
							param: 'plantId',
							alternate_prop: 'globalFilters.plantId',
							clean_prop: 'formData.machines_ids'
						},
						{
							prop: 'formData.production_line_id',
							param: 'productionLineId',
							clean_prop: 'formData.machines_ids'
						}
					],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				});
			}

			return Object.freeze(list);
		},

		weekDaysList: () =>
			Object.freeze([
				{ /*id: 1,*/ id: 0, name: 'Sunday' },
				{ /*id: 2,*/ id: 1, name: 'Monday' },
				{ /*id: 3,*/ id: 2, name: 'Tuesday' },
				{ /*id: 4,*/ id: 3, name: 'Wednesday' },
				{ /*id: 5,*/ id: 4, name: 'Thursday' },
				{ /*id: 6,*/ id: 5, name: 'Friday' },
				{ /*id: 7,*/ id: 6, name: 'Saturday' }
			]),

		portsList() {
			const list = [];
			for (let i = 0; i < 41; i++) {
				list.push(i);
			}
			return Object.freeze(list);
		},

		timePickerOptions: () => ({
			start: '00:00',
			step: '00:15',
			end: '23:45'
		}),

		endTimePickerOptions: that => ({
			...that.timePickerOptions,
			minTime: that.formData.start_work_day
		}),

		workTimeSettings() {
			return {
				start_work_day: this.formData.start_work_day,
				finish_work_day: this.formData.finish_work_day
			}
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'BreakTimeItem', targetProp: 'work_breaks' },
			{ ref: 'FaultItem', targetProp: 'faults' },
			{ ref: 'WorkDateItem', targetProp: 'work_dates' }
		]),
		
		isIndustrialMatrix() {
			return this.$store.state.auth.isIndustrialMatrix;
		}
	},

	methods: {
		...mapActions({
			fetch_plants: 'plants/fetch_plants',
			fetch_controllers: 'controllers/fetch_controllers',
			fetch_machines: 'machines/fetch_machines',
			fetch_production_lines: 'production_lines/fetch_production_lines',

			save_item: 'processes/save_process'
		}),

		handleStartTimeChange() {
			this.formData.finish_work_day = '';
		},

		localSetupPage(itemData) {
			if (itemData) {
				this.faultsItemsList = this.setupFormSubItemsList(itemData.faults, 'f_i');

				this.breakTimeItemsList = this.setupFormSubItemsList(
					itemData.work_breaks,
					'bt_i'
				);

				this.workDatesItemsList = this.setupFormSubItemsList(
					itemData.work_dates,
					'wd_i'
				);
				/*this.processesItemsList = this.setupFormSubItemsList(
					itemData.conveyor_processes,
					'pr_i'
				);*/
			}

			if (!this.isIndustrialMatrix) {
				this.formData.company_id = this.authUser.company_id;
			}
		}
	}

	/*watch: {
		'formData.plant_id'(id) {
			this.setMultiFormFilters({plantId: id});
		},
	}*/
};
</script>
