<template>
	<div class="card overflowHidden" v-if="globalFilters.plantId">
		<div class="card-header filled_2 ">
			<div class="title semi-bold">{{ tt('sidebar_menu.ROI_Calculator') }}</div>
		</div>

		<div class="card-content relative">
			<SimpleSpinner :active="calculationsLoading" />

			<div class="step-container flex align-center">
				<div class="step-number bold">
					<span>1</span>
				</div>

				<div class="mcol-xs-12">
					<div class="mrow flex wrap">
						<div class="mcol-xs-12 mcol-sm-3">
							<div class="el-form-item">
								<div class="label">{{ tt('phrases.Date_Selection') }}</div>
								<div class="el-form-item__content">
									<Datepicker
										class="no-min-width"
										v-model="periodDateRange"
										:picker-options="pickerOptions"
										type="daterange"
									/>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3">
							<div class="el-form-item">
								<div class="label">{{ tt('Technicians') }}</div>
								<div class="el-form-item__content">
									<CustomSelect
										clearable
										multiple
										filterable
										collapse-tags
										:optionsLoading="usersLoading"
										:optionsList="usersList"
										:placeholder="`${tt('Select')} ${tt('users')}`"
										labelKey="full_name"
										v-model="formData.users_ids"
									/>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3">
							<div class="el-form-item">
								<div class="label">{{ tt('WO') }}#</div>
								<div class="el-form-item__content">
									<CustomSelect
										filterable
										clearable
										multiple
										collapse-tags
										:optionsLoading="workOrdersLoading"
										:optionsList="workOrdersList"
										:placeholder="`${tt('select')} ${tt('order')}`"
										labelKey="id"
										v-model="formData.work_order_id"
									/>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3 self-end">
							<div class="el-form-item">
								<div class="el-form-item__content">
									<el-button
										@click="handleApply"
										type="success"
										native-type="button"
										class="item-action-button inverted"
									>
										<span class="uppercase">{{ tt('APPLY') }}</span>
									</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div :class="['step-container flex align-center']">
				<div :class="['dark-overlay', { hide: calculationsStepEnabled }]"></div>
				<div class="step-number bold">
					<span>2</span>
				</div>

				<div class="mcol-xs-12 flex">
					<div class="mrow flex">
						<div class="">
							<div class="muted">{{ tt('phrases.Tech_Hours') }}</div>
							<div class="bold">
								{{ calculateResult.tech_hours_accumulated }} $ ({{
									calculateResult.total_hours
								}}:00 hours)
							</div>
						</div>

						<div class="">
							<div class="muted">{{ tt('Running_Total') }}</div>
							<div class="bold">
								{{ calculateResult.running_total_accumulated }} $
							</div>
						</div>
					</div>
				</div>
			</div>

			<div :class="['step-container flex align-center']">
				<div :class="['dark-overlay', { hide: calculationsStepEnabled }]"></div>
				<div class="step-number bold">
					<span>3</span>
				</div>

				<div class="mcol-xs-12">
					<div class="mrow flex wrap">
						<div class="mcol-xs-12 mcol-sm-3">
							<div class="el-form-item">
								<div class="label">
									{{ `${tt('phrases.Contractor_hourly_rate')} ($/${tt('hour')})` }}
								</div>
								<div class="el-form-item__content flex">
									<el-input-number
										:controls="false"
										class="mcol-xs-6"
										v-model.number="contractor_hourly_rate_input"
										:min="0"
									/>
									<div class="mcol-xs-6 result-field">
										{{ contractor_hourly_rate_final }} $
									</div>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3">
							<div class="el-form-item">
								<div class="label">{{ tt('phrases.Contractor_Markup') }} (%)</div>
								<div class="el-form-item__content flex">
									<el-input-number
										:controls="false"
										class="mcol-xs-6"
										v-model.number="contractor_markup_percent"
										:min="0"
										:max="100"
									/>
									<div class="mcol-xs-6 result-field">
										{{ contractor_markup_percent_final }} $
									</div>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3">
							<div class="el-form-item">
								<div class="label">{{ tt('phrases.Repair_Cost_Avoidance') }}</div>
								<div class="el-form-item__content flex">
									<el-input-number
										:controls="false"
										class="mcol-xs-5 span-block"
										v-model.number="repair_cost_avoidance"
										:min="0"
									/>
									<div class="span-block bold">$</div>

									<div class="span-block mcol-xs-5 ml-auto">
										<el-button
											@click="handleCalculate"
											type="success"
											native-type="button"
											class="item-action-button"
										>
											<span class="uppercase">{{ tt('CALCULATE') }}</span>
										</el-button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				class="step-container flex align-center"
				v-if="calculationsStepEnabled && calculationsReady"
			>
				<div class="step-number bold">
					<span>4</span>
				</div>

				<div class="mcol-xs-12">
					<div class="mrow flex wrap align-center">
						<div class="mcol-xs-auto final-result">
							{{
								`${tt('phrases.Cost_Savings')} = ${calculateResult.total_savings}`
							}}
							$
						</div>

						<div class="">
							<el-button
								@click="exportPDF"
								type="success"
								icon="icomoon icon-pdf"
								class="inverted pdf-button"
								size="mini"
								native-type="button"
								:loading="exportingInProgress"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div v-else class="mcontainer">
		<PageMockImg />
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { prepareRangeParams } from '@/helpers';

import { REQUISITION_STATUSES_TYPES } from '@/constants/global';
import { datePickerYearQuartersShortcuts } from '@/constants/date_time';

import { requestsListMixin, exportListToFileMixin } from '@/mixins';

export default {
	mixins: [requestsListMixin(), exportListToFileMixin()],
	props: {
		usersList: Array,
		usersLoading: Boolean,
		calculationsStepEnabled: Boolean
	},

	components: {
		Datepicker: () => import('@/components/common/Datepicker.vue'),
		PageMockImg: () => import('@/components/common/PageMockImg.vue')
	},

	data() {
		return {
			// selectedWorkOrder: null,
			exportingInProgress: false,
			calculationsReady: false,

			workOrdersList: [],
			workOrdersLoading: false,

			periodDateRange: [],

			formData: {
				users_ids: [],
				work_order_id: null
				// work_orders_ids: []
			},

			calculationsLoading: false,

			calculateResult: {
				running_total_accumulated: 0,
				tech_hours_accumulated: 0,
				contractor_hourly_rate: 0,
				total_savings: 0,
				total_hours: 0
			},

			// contractor_hourly_rate: 0,
			contractor_hourly_rate_input: 0,
			contractor_markup_percent: 0,
			repair_cost_avoidance: 0
		};
	},

	computed: {
		...mapState({
			authUser: state => state.auth.authUser,
			globalFilters: state => state.global.globalFilters,
			access_token: state => state.auth.access_token
			// plantsList: state => state.global.globalPlantsList,
		}),

		// completedWorkOrdersList: that => that.workOrdersList.filter(wi => wi.status === REQUISITION_STATUSES_TYPES.COMPLETED),

		pickerOptions() {
			return Object.freeze({
				shortcuts: datePickerYearQuartersShortcuts()
			});
		},

		contractor_markup_percent_final: that =>
			that.calculateResult.running_total_accumulated +
			that.calculateResult.running_total_accumulated *
				(that.contractor_markup_percent / 100),

		contractor_hourly_rate_final: that =>
			that.contractor_hourly_rate_input * that.calculateResult.total_hours,

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_requisitions',
					payload: { params: { status: REQUISITION_STATUSES_TYPES.COMPLETED } },
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'workOrdersList',
					localLoadProp: 'workOrdersLoading'
				}
			])

		// MAINTENANCE_TYPES: () => MAINTENANCE_TYPES
	},

	methods: {
		...mapActions({
			// fetch_users: 'users/fetch_users'
			fetch_requisitions: 'plant_requisitions/fetch_requisitions',
			calculate_requisitions_roi: 'plant_requisitions/calculate_requisitions_roi'

			// save_item: 'plant_requisitions/save_maintenance_log'
		}),

		prepareFilters(filters) {
			let newFilters = { ...filters };

			if (newFilters.daterange && newFilters.daterange.length) {
				newFilters = {
					...newFilters,
					...prepareRangeParams(newFilters.daterange)
				};
			}

			delete newFilters.daterange;
			delete newFilters.items_active_grid_type;

			return newFilters;
		},

		handleApply() {
			this.contractor_hourly_rate_input = 0;
			this.contractor_markup_percent = 0;
			this.repair_cost_avoidance = 0;

			const filters = {
				daterange: this.periodDateRange,
				technicians: this.formData.users_ids,
				id: this.formData.work_order_id,
				status: REQUISITION_STATUSES_TYPES.COMPLETED,
				plantId: this.globalFilters.plantId,
				max: -1
			};

			this.$emit('event', {
				eventName: 'applyFilters',
				data: filters
			});
			this.calculationsReady = false;
			this.handleGetCalculations(filters);
		},

		handleCalculate() {
			const filters = {
				daterange: this.periodDateRange,
				technicians: this.formData.users_ids,
				id: this.formData.work_order_id,
				contractor_hourly_rate: this.contractor_hourly_rate_input,
				contractor_markup_percent: this.contractor_markup_percent,
				repair_cost_avoidance: this.repair_cost_avoidance,
				plantId: this.globalFilters.plantId
			};

			this.handleGetCalculations(filters);
			this.calculationsReady = true;
		},

		handleGetCalculations(filters) {
			if (!filters.id) {
				delete filters.id;
			}

			this.calculationsLoading = true;
			this.calculate_requisitions_roi({ params: this.prepareFilters(filters) })
				.then(response => {
					this.setupResult(response);
					this.calculationsLoading = false;
				})
				.catch(e => {
					console.warn(e);
					this.calculationsLoading = false;
				});
		},

		setupResult({ value }) {
			// console.log(response)
			this.calculateResult = {
				...value,
				repair_cost_avoidance:
					value.repair_cost_avoidance || this.calculateResult.repair_cost_avoidance,
				total_hours: value.total_hours || this.calculateResult.total_hours
			};
		},

		exportPDF() {
			const filters = {
				daterange: this.periodDateRange,
				technicians: this.formData.users_ids,
				id: this.formData.work_order_id,
				status: REQUISITION_STATUSES_TYPES.COMPLETED,
				contractor_hourly_rate: this.contractor_hourly_rate_input,
				contractor_markup_percent: this.contractor_markup_percent,
				repair_cost_avoidance: this.repair_cost_avoidance,
				format: 'pdf',
				plantId: this.globalFilters.plantId,
				max: -1
			};

			if (!filters.id) {
				delete filters.id;
			}

			this.handleExportItem({
				url: `plants/work-orders/roi`,
				filters: filters
			});
		}
	}
};
</script>
