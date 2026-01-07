<template>
	<div class="edit-form-container success-dashboard-form">
		<!-- :class="{ 'half-width': !fromAnotherInstance && !isMobile }" -->
		<!-- :validate="" -->
		<el-form
			class="item-edit-form meeting-tracker"
			label-width="150px"
			ref="itemForm"
			:model="formData"
			:rules="rules"
			:label-position="'top'"
		>
			<div class="flex mrow wrap big-padding">
				<div class="mcol-xs-12">
					<div class="card top-section">
						<div class="card-header filled_2 flex wrap mrow align-center">
							<!-- <div class="pdm-logo div-block" v-if="false">
								<span>PDM</span>
								<span class="primary-color">Matrix</span>
								<sup>TM</sup>
							</div> -->

							<div
								class="mcol-xs-12 mcol-sm-auto flex"
								v-if="industrialServicesList.length"
							>
								<div
									class="imgWrapper div-block"
									v-for="item in industrialServicesList"
									:key="`service-${item.id}`"
								>
									<img :src="item.file" alt="img" />
								</div>
							</div>

							<el-form-item
								prop="last_tracker_created_at"
								:required="!showJustInfo"
								class="ml-auto mini"
								:label="$t('Last')"
							>
								<!-- <div class="muted">Last</div> -->
								<div
									v-if="showJustInfo"
									class="date semi-bold"
									v-text="
										cleanDateString(formData.last_tracker_created_at, {
											withoutTime: 1
										}) || '-'
									"
								></div>
								<Datepicker
									v-else
									class="mini"
									v-model="formData.last_tracker_created_at"
								/>
							</el-form-item>

							<el-form-item
								prop="current_created_at"
								:required="!showJustInfo"
								class="mini"
								:label="$t('Current')"
							>
								<!-- <div class="muted">Current</div> -->
								<div
									v-if="showJustInfo"
									class="date semi-bold"
									v-text="
										cleanDateString(formData.current_created_at, {
											withoutTime: 1
										}) || '-'
									"
								></div>

								<Datepicker
									v-else
									class="mini"
									v-model="formData.current_created_at"
								/>
							</el-form-item>

							<div class="mcol-xs-12 mcol-sm-4 mcol-lg-auto logo-img imgWrapper">
								<img :src="main_logo" alt="logo" />
							</div>
						</div>

						<div class="card-content">
							<div class="mrow flex wrap big-padding">
								<ul
									class="mcol-xs-12 mcol-sm-4 fluid info-list primary dots-in-text"
								>
									<InfoCell
										v-for="item in topSectionSettings_1"
										:key="`info-${item.label}`"
										:settingItem="item"
										:itemData="mergedItemData"
									/>

									<!-- <li>
										<span :class="['key']">Champions: </span>
										<span class="value champions-list">{{ championsNames }}</span>

										<span class="value" v-else>
											<CustomSelect
												 clearable multiple collapse-tags
												:optionsLoading="usersLoading"
												:optionsList="intendentsUsersList"
												:placeholder="`${tt('Select')} ${tt('users')}`"
												labelKey="full_name"
												v-model="formData.champions"
											/>
										</span>
									</li> -->
								</ul>

								<ul
									class="mcol-xs-12 mcol-sm-4 fluid info-list primary dots-in-text"
								>
									<InfoCell
										v-for="item in topSectionSettings_2"
										:key="`info-${item.label}`"
										:settingItem="item"
										:itemData="mergedItemData"
									/>

									<li>
										<span :class="['key']"
											>{{ $t('phrases.next_launch_date') }}:
										</span>
										<span class="value" v-if="showJustInfo">{{
											formData.next_launch_date
										}}</span>
										<span class="value mcol-xs-4" v-else>
											<CustomInput
												:placeholder="tt('date')"
												v-model="formData.next_launch_date"
											/>
										</span>
									</li>
								</ul>

								<div class="mcol-xs-12 mcol-sm-3 flex justify-center">
									<div class="logo-img plant-logo imgWrapper">
										<img
											v-if="logoSrc"
											:src="logoSrc"
											alt="logo error or plant hasn't logo"
										/>
										<img v-else src="/static/img/no_logo.jpg" alt="error" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo: showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">
								{{ $t('phrases.activities_completed_this_week_period') }}
							</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="current_activities">
								<div v-if="activitiesItemsList.length" class="content-row">
									<DynamicFormItem
										ref="CurrentFormItem"
										v-for="(item, idx) in activitiesItemsList"
										:key="`form_item-${item.id}`"
										enableName
										:item-data="item"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:showJustInfo="showJustInfo"
										:item-index="idx"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										:isLast="idx == activitiesItemsList.length - 1"
										@onCreate="
											addFormItem('activitiesItemsList', 'a_i-', {
												focus: 'description'
											})
										"
										@onRemove="id => removeFormItem(id, 'activitiesItemsList')"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6']">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">
								{{ $t('phrases.asset_monitoring') }}
							</div>
						</div>

						<div class="card-content special-decorated-form">
							<div class="section-row warnings-block card">
								<div class="card-content filled relative">
									<SimpleSpinner :active="alarmsLoading" />

									<div class="flex mrow">
										<div class="mcol-xs-4 text-center">
											<div class="title article-title semi-bold">
												{{ $t('constants.WARNING') }}
											</div>
											<div
												:class="[
													'span-block round-info-item warning pointer',
													{ pointer: plantAlarms.warnings_count > 0 }
												]"
												@click="showAlarmsCharts"
												v-text="plantAlarms.warnings_count"
											></div>
											<div
												class="semi-bold span-block muted p-5"
												v-text="plantAlarms.warnings_duration"
											></div>
										</div>

										<div class="mcol-xs-4 text-center">
											<div class="title article-title semi-bold">
												{{ $t('constants.ALARM') }}
											</div>
											<div
												:class="[
													'span-block round-info-item alarm pointer',
													{ pointer: plantAlarms.alarms_count > 0 }
												]"
												@click="showAlarmsCharts"
												v-text="plantAlarms.alarms_count"
											></div>
											<div
												class="semi-bold span-block muted p-5"
												v-text="plantAlarms.alarms_duration"
											></div>
										</div>

										<div
											class="mcol-xs-4 text-center"
											v-if="plantAlarms.has_sensors_ultrasound_parameter"
										>
											<div class="title article-title semi-bold">
												{{ $t('constants.LUBE') }}
											</div>
											<div
												:class="[
													'span-block round-info-item lube pointer',
													{ pointer: plantAlarms.lube_alarms_count > 0 }
												]"
												@click="showAlarmsCharts"
												v-text="plantAlarms.lube_alarms_count"
											></div>
											<div
												class="semi-bold span-block muted p-5"
												v-text="plantAlarms.lube_alarms_duration"
											></div>
										</div>
									</div>
								</div>
							</div>

							<div
								:class="[
									'section-row article-title semi-bold',
									{ title: !showJustInfo }
								]"
							>
								{{ $t('phrases.recommended_actions') }}
							</div>

							<el-form-item
								prop="recommended_actions"
								:class="{ showJustInfo: showJustInfo }"
							>
								<div v-if="recommendedActionsItemsList.length" class="content-row">
									<DynamicFormItem
										ref="RecommendedFormItem"
										v-for="(item, idx) in recommendedActionsItemsList"
										:key="`form_item-${item.id}`"
										:item-data="item"
										:item-index="idx"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										:showJustInfo="showJustInfo"
										:isLast="idx == recommendedActionsItemsList.length - 1"
										@onCreate="
											addFormItem('recommendedActionsItemsList', 'ra_i-', {
												focus: 'description'
											})
										"
										@onRemove="
											id => removeFormItem(id, 'recommendedActionsItemsList')
										"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>

							<div class="section-row"></div>

							<div class="section-row card">
								<div class="card-content filled relative">
									<SimpleSpinner :active="workOrdersLoading" />
									<div class="content-row">
										<i
											class="icomoon icon-docs span-block section-title primary-color text-middle"
										></i>
										<span
											class="span-block article-title semi-bold text-middle uppercase"
											>{{ $t('WORK_ORDERS') }}</span
										>
									</div>
									<div class="content-row semi-bold">
										<InfoCell
											tag="span"
											labelDisabled
											:settingItem="workOrderSetting"
											:itemData="{ list: filteredWorkOrdersList }"
										/>
									</div>
								</div>
							</div>

							<div class="section-row card">
								<div class="card-content filled relative">
									<SimpleSpinner :active="sensorsLoading" />
									<div class="content-row">
										<img
											class="span-img span-block text-middle"
											:src="not_wifi_icon"
											alt=""
										/>
										<span
											class="span-block article-title semi-bold text-middle uppercase"
											>{{ $t('phrases.sensors_offline') }}</span
										>
									</div>
									<div class="content-row semi-bold">
										<InfoCell
											tag="span"
											labelDisabled
											:settingItem="sensorSetting"
											:itemData="{ list: sensorsListInActive }"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo: showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">
								{{ $t('phrases.activities_in_progress') }}
							</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="progress_activities">
								<div v-if="activitiesInProgressItemsList.length" class="content-row">
									<DynamicFormItem
										ref="ProgressFormItem"
										v-for="(item, idx) in activitiesInProgressItemsList"
										:key="`form_item-${item.id}`"
										enableName
										:item-data="item"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:showJustInfo="showJustInfo"
										:item-index="idx"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										:isLast="idx == activitiesInProgressItemsList.length - 1"
										@onCreate="
											addFormItem('activitiesInProgressItemsList', 'ap_i-', {
												focus: 'description'
											})
										"
										@onRemove="
											id => removeFormItem(id, 'activitiesInProgressItemsList')
										"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo: showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">
								{{ $t('phrases.success_expansion_plans') }}
							</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="expansion_plans">
								<div v-if="expansionPlansItemsList.length" class="content-row">
									<DynamicFormItem
										ref="ExpansionFormItem"
										v-for="(item, idx) in expansionPlansItemsList"
										:key="`form_item-${item.id}`"
										enableName
										:item-data="item"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:showJustInfo="showJustInfo"
										:item-index="idx"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										:isLast="idx == expansionPlansItemsList.length - 1"
										@onCreate="
											addFormItem('expansionPlansItemsList', 'exp_i-', {
												focus: 'description'
											})
										"
										@onRemove="id => removeFormItem(id, 'expansionPlansItemsList')"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo: showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">
								{{ $t('phrases.activities_planned_for_next_week_period') }}
							</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="next_activities">
								<div
									v-if="activitiesPlannedForNextItemsList.length"
									class="content-row"
								>
									<DynamicFormItem
										ref="NextFormItem"
										v-for="(item, idx) in activitiesPlannedForNextItemsList"
										:key="`form_item-${item.id}`"
										enableName
										:item-data="item"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:showJustInfo="showJustInfo"
										:item-index="idx"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										:isLast="idx == activitiesPlannedForNextItemsList.length - 1"
										@onCreate="
											addFormItem('activitiesPlannedForNextItemsList', 'an_i-', {
												focus: 'description'
											})
										"
										@onRemove="
											id => removeFormItem(id, 'activitiesPlannedForNextItemsList')
										"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo: showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">
								{{ $t('phrases.recurring_issues_continuous_issue_discussion') }}
							</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="recurring_issues">
								<div v-if="recurringIssuesItemsList.length" class="content-row">
									<DynamicFormItem
										ref="RecurringFormItem"
										v-for="(item, idx) in recurringIssuesItemsList"
										:key="`form_item-${item.id}`"
										enableName
										:item-data="item"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:showJustInfo="showJustInfo"
										:item-index="idx"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										:isLast="idx == recurringIssuesItemsList.length - 1"
										@onCreate="
											addFormItem('recurringIssuesItemsList', 'ri_i-', {
												focus: 'description'
											})
										"
										@onRemove="id => removeFormItem(id, 'recurringIssuesItemsList')"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6']">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">
								{{ $t('phrases.roi_value_creation_summary') }}
							</div>
						</div>

						<div class="card-content">
							<ul class="section-row semi-bold">
								<!-- <InfoCell
									v-for="item in roiOnePagersList"
									:key="`info-${item.id}`"
									labelDisabled
									:settingItem="{	prop: 'name'}"
									:itemData="item"
								/> -->
								<li
									class="content-row"
									v-for="item in roiOnePagersList"
									:key="`info-${item.id}`"
								>
									<router-link
										class="link underline secondary-color"
										:to="`/success-dashboard/roi-one-pager/${item.id}`"
										>{{ item.name }}</router-link
									>
								</li>
							</ul>

							<div class="section-row">
								<a
									class="el-button el-button--primary item-action-button inverted"
									target="_blank"
									:href="`${originURL}/success-dashboard/roi-one-pager/new`"
								>
									<span class="uppercase">{{
										$t('phrases.questionnaire_form')
									}}</span>
								</a>
							</div>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo: showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">
								{{ $t('phrases.customer_product_feedback') }}
							</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="customer_feedback">
								<div v-if="feedbackItemsList.length" class="content-row">
									<DynamicFormItem
										ref="CustomerFormItem"
										v-for="(item, idx) in feedbackItemsList"
										:key="`form_item-${item.id}`"
										enableName
										:item-data="item"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:showJustInfo="showJustInfo"
										:item-index="idx"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										:isLast="idx == feedbackItemsList.length - 1"
										@onCreate="
											addFormItem('feedbackItemsList', 'f_i-', {
												focus: 'description'
											})
										"
										@onRemove="id => removeFormItem(id, 'feedbackItemsList')"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>
			</div>

			<div class="el-form-item FormOperationsButtons" v-if="!showJustInfo">
				<el-button
					@click="validateForm"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span class="uppercase">{{ $t('SAVE') }}</span>
				</el-button>

				<el-button
					@click="validateForm({ additionalInject: { notify: true } })"
					type="primary"
					native-type="button"
					class="item-action-button"
				>
					<span class="uppercase">{{ $t('phrases.save_send') }}</span>
				</el-button>
			</div>
		</el-form>

		<el-dialog
			append-to-body
			top
			class="dialog-decorate-header big sensors-alarms-charts new with-description"
			:title="tt('Alarms')"
			:visible.sync="openSensorsAlarmsDialog"
			:close-on-click-modal="false"
		>
			<SensorsAlarmsContainer
				ref="SensorsAlarmsContainer"
				v-if="openSensorsAlarmsDialog"
				@event="handleEventNew"
				:sensorsAlarms="formData.graphs"
				:itemData="itemData"
				:sensorsList="sensorsList"
				@closeDialog="openSensorsAlarmsDialog = false"
				:rootFilters="chartsRange"
				:measurement="plantItem.metric_system_type"
				:additionalProps="additionalPropsForCharts"
			/>
		</el-dialog>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import {
	cloneDeep,
	getTimeDifference,
	cleanDateString,
	getDateRange,
	getValues
	/*cloneArr*/
} from '@/helpers';
// import { required /*number*/ } from '@/constants/validation';
import { main_logo, not_wifi_icon, MAINTENANCE_TYPES } from '@/constants/global';
// const testImgSrc = '/static/img/email/pulsar.png';
// const test_company_logo = require('@/assets/img/test_company_logo.png');

import {
	itemFormMixin,
	requestsListMixin,
	subItemsListMixin,
	navigation,
	eventHandler
	// dragNdropSortableMixin,
	// sensorsAlarmsChartsFormsMixin
} from '@/mixins';

export default {
	mixins: [
		itemFormMixin(),
		requestsListMixin(),
		subItemsListMixin(),
		navigation(),
		eventHandler()
		// dragNdropSortableMixin(),
		// sensorsAlarmsChartsFormsMixin()
	],
	components: {
		InfoCell: () => import('@/components/itemDetails/InfoItem.vue'),
		DynamicFormItem: () => import('./DynamicFormItem.vue'),
		SensorsAlarmsContainer: () => import('../common/SensorsAlarmsContainer.vue'),
		Datepicker: () => import('@/components/common/Datepicker.vue')
	},

	props: {
		plantItem: Object,
		sensorsLoading: Boolean,
		sensorsList: Array
	},

	data() {
		return {
			openSensorsAlarmsDialog: false,
			activitiesItemsList: [],
			recommendedActionsItemsList: [],
			activitiesInProgressItemsList: [],
			expansionPlansItemsList: [],
			activitiesPlannedForNextItemsList: [],
			recurringIssuesItemsList: [],
			feedbackItemsList: [],

			usersLoading: false,
			usersList: [],
			alarmsLoading: false,
			alarmsList: {},
			workOrdersLoading: false,
			workOrdersList: [],
			machinesLoading: false,
			machinesList: [],
			// sensorsList2: [],

			roiOnePagersLoading: false,
			roiOnePagersList: [],
			meetingTrackerLoading: false,
			meetingTrackerLast: null,
			meetingTrackerRoiLoading: false,
			meetingTrackerRoiData: {},

			reorderGraphsHistory: [],

			// graphs_period: [],

			formData: {
				plant_id: this.plantItem.id,
				next_launch_date: '',
				champions: [],
				recommended_actions: [],
				current_activities: [],
				progress_activities: [],
				expansion_plans: [],
				next_activities: [],
				recurring_issues: [],
				customer_feedback: [],
				// sensors_alarms: [],

				roi_cost: 0,
				roi_count: 0,

				graphs: [],

				last_tracker_created_at: '',
				current_created_at: ''
			}
		};
	},

	computed: {
		// ...mapState({}),

		additionalPropsForCharts: that =>
			Object.freeze({
				showDisableChartButton: !that.showJustInfo,
				showChartSelectionButton: !that.showJustInfo,
				showDatePicker: !that.showJustInfo,
				enableDragNDrop: !that.showJustInfo,
				showJustInfo: that.showJustInfo,
				enableAnnotations: true,
				enableDescriptionForm: true,
				showSaveButton: !that.showJustInfo
			}),

		cleanDateString: () => cleanDateString,

		chartsRange: that => ({ daterange: that.graphs_period }),

		main_logo: () => main_logo,
		// testImgSrc: () => testImgSrc,
		// test_company_logo: () => test_company_logo,
		not_wifi_icon: () => not_wifi_icon,

		routeQuery() {
			const { query } = this.$route;

			return Object.keys(query).length ? query : null;
		},

		showJustInfo: that =>
			!that.$hasAccessTo(['edit_customer_success']) ||
			(that.itemData &&
				that.itemData.id &&
				(!that.routeQuery || !that.routeQuery.edit)),

		/*championsNames() {
			const { champions } = this.formData;

			let names = '';

			champions.forEach((user, idx) => {
				if (idx != 0 ) names += '/ '
				names += `${user.full_name}`;
			})
			return names || ' - ';
		},*/

		originURL: () => window.location.origin,

		logoSrc() {
			if (this.plantItem) {
				return this.plantItem.file;
			}
			return null;
		},

		industrialServicesList: that => that.plantItem.industrialServices,

		rules: () => ({}),

		topSectionSettings_1: that =>
			Object.freeze(
				that.$translate([
					{
						label: 'Customer',
						prop: 'plant.company.name'
					},
					{
						label: 'Region',
						prop: 'plant.region'
					},
					{
						label: 'Renewal_Date',
						prop: 'plant.billing_plant_renewal_date',
						meta: {
							prepareValue: {
								localMethod: cleanDateString,
								args: { withoutTime: true }
							}
						}
					},
					{
						label: 'IM_CSM',
						prop: 'plant.im_csms',
						meta: {
							fromArray: { subProp: 'full_name' }
						}
					},
					{
						label: 'Champions',
						prop: that.itemId ? 'meetingTracker.champions' : 'plant.champions',
						meta: {
							fromArray: { subProp: 'full_name' }
						}
					}
				])
			),
		topSectionSettings_2: that =>
			Object.freeze(
				that.$translate([
					{
						label: 'phrases.completed_rois',
						prop: 'roiData.count'
					},
					{
						label: 'phrases.roi_salvings_ca',
						prop: 'roiData.cost'
					},
					{
						label: 'phrases.of_sensors',
						prop: 'meetingTracker.sensors_count'
					}
				])
			),

		mergedItemData() {
			const {
				itemData,
				plantItem,
				meetingTrackerRoiData,
				sensorsList,
				itemId
			} = this;
			let data = { plant: plantItem };

			if (itemData) {
				data = { ...data, meetingTracker: itemData };
			} else {
				data = { ...data, meetingTracker: { sensors_count: sensorsList.length } };
			}

			if (itemId && itemData) {
				data = {
					...data,
					roiData: {
						count: itemData.roi_count,
						cost: itemData.roi_cost
					}
				};
			} else if (meetingTrackerRoiData) {
				data = { ...data, roiData: meetingTrackerRoiData };
			}

			return Object.freeze(data);
		},

		filteredWorkOrdersList: that => that.workOrdersList.filter(wi => !!wi.title),

		workOrderSetting: () =>
			Object.freeze({
				prop: 'list',
				meta: {
					fromArray: { subProp: 'title', delimeter: ', ', inline: true }
				}
			}),
		sensorSetting: () =>
			Object.freeze({
				prop: 'list',
				meta: {
					fromArray: {
						subProp: 'location_in_equipment',
						delimeter: ', ',
						inline: true
					}
				}
			}),

		plantAlarms() {
			let result = {
				warnings_count: 0,
				warnings_duration: 0,
				alarms_count: 0,
				alarms_duration: 0,
				has_sensors_ultrasound_parameter: false
				// sensors_alarms: {}
			};

			let key = '';

			if (Object.keys(this.alarmsList).length) {
				key = 'alarmsList';
			} else if (this.itemId && this.itemData) {
				key = 'itemData';
			}

			if (key) {
				const {
					alarms_count,
					alarms_duration,
					warnings_count,
					warnings_duration,
					has_sensors_ultrasound_parameter,
					lube_alarms_count,
					lube_alarms_duration
				} = this[key];

				result.warnings_count = warnings_count;
				result.warnings_duration = getTimeDifference({
					to_ms: warnings_duration * 1000
				}).time_total;
				result.alarms_count = alarms_count;
				result.alarms_duration = getTimeDifference({
					to_ms: alarms_duration * 1000
				}).time_total;

				if (has_sensors_ultrasound_parameter) {
					result.has_sensors_ultrasound_parameter = has_sensors_ultrasound_parameter;
					result.lube_alarms_count = lube_alarms_count;
					result.lube_alarms_duration = getTimeDifference({
						to_ms: lube_alarms_duration * 1000
					}).time_total;
				}
			}
			// result.sensors_alarms = sensors_alarms;

			return Object.freeze(result);
		},

		// lastMeetingDate: that => that.meetingTrackerLast && cleanDateString(that.meetingTrackerLast.created_at, { withoutTime: 1 }),
		// currentMeetingDate: that => that.itemData && cleanDateString(that.itemData.created_at, { withoutTime: 1 }),

		graphs_period() {
			const { last_tracker_created_at, current_created_at } = this.formData;
			if (last_tracker_created_at && current_created_at) {
				return Object.freeze([
					cleanDateString(last_tracker_created_at, { withoutTime: 1 }),
					cleanDateString(current_created_at, { withoutTime: 1 })
				]);
			}
			return [];
		},

		sensorsListInActive: that => that.sensorsList.filter(si => si.is_inactive),

		requestsToDoList() {
			let list = [
				{
					action: 'fetch_users',
					bindTo: [{ prop: 'plantItem.id', param: 'plantId' }],
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				},
				{
					action: 'fetch_meeting_tracker_last',
					bindTo: [{ prop: 'plantItem.id', param: 'plantId' }],
					localProp: 'meetingTrackerLast',
					localLoadProp: 'meetingTrackerLoading'
				},
				{
					action: 'fetch_maintenance_logs',
					payload: {
						params: {
							max: -1,
							onlyProcessing: true,
							type: MAINTENANCE_TYPES.WORK_ORDER
						}
					},
					bindTo: [{ prop: 'plantItem.id', param: 'plantId' }],
					localProp: 'workOrdersList',
					localLoadProp: 'workOrdersLoading'
				},
				/*{
					action: 'fetch_sensors',
					payload: { params: {max: -1, onlyInactive: true } },
					bindTo: [{ prop: 'plantItem.id', param: 'plantId' }],
					localProp: 'sensorsList2',
					// localLoadProp: 'sensorsLoading'
				},*/
				{
					action: 'fetch_roi_one_pagers',
					payload: { params: { max: 5 } },
					bindTo: [{ prop: 'plantItem.id', param: 'plantId' }],
					localProp: 'roiOnePagersList',
					localLoadProp: 'roiOnePagersLoading'
				},
				{
					action: 'fetch_machines',
					bindTo: [{ prop: 'plantItem.id', param: 'plantId' }],
					localProp: 'machinesList',
					localLoadProp: 'machinesLoading'
				}
			];

			if (!this.itemId) {
				list.push({
					action: 'fetch_meeting_tracker_roi',
					// payload: { params: {max: -1, onlyProcessing: true } },
					bindTo: [{ prop: 'plantItem.id', param: 'plantId' }],
					localProp: 'meetingTrackerRoiData',
					localLoadProp: 'meetingTrackerRoiLoading'
				});
			}
			/*console.log(this.plantItem , !this.itemData , this.graphs_period.length)
			if (this.plantItem && !this.itemData && this.graphs_period.length) {
				list.push({
					action: 'fetch_alarms',
					payload: { 
						params: { dateStart: this.graphs_period[0], dateFinish: this.graphs_period[1] }
					},
					bindTo: [{ prop: 'plantItem.id', mainParam: 'itemId' }],
					localProp: 'alarmsList',
					localLoadProp: 'alarmsLoading'
				})
			}*/

			return Object.freeze(list);
		},

		subItemsSettings: () => Object.freeze([
			{ ref: 'CurrentFormItem', targetProp: 'current_activities' },
			{ ref: 'RecommendedFormItem', targetProp: 'recommended_actions' },
			{ ref: 'ProgressFormItem', targetProp: 'progress_activities' },
			{ ref: 'ExpansionFormItem', targetProp: 'expansion_plans' },
			{ ref: 'NextFormItem', targetProp: 'next_activities' },
			{ ref: 'RecurringFormItem', targetProp: 'recurring_issues' },
			{ ref: 'CustomerFormItem', targetProp: 'customer_feedback' },
		]),

		/*refsList: () => ['DynamicFormItem'],
		refsOperationsSettings: () => ({
			submitActionName: 'submitForm',
			dataAsArray: true,
			itemSubmitMethod: 'validateItemForm'
		})*/
	},

	methods: {
		...mapActions({
			fetch_users: 'users/fetch_users',
			fetch_alarms: 'plants/fetch_plant_alarms',
			fetch_maintenance_logs: 'maintenance/fetch_maintenance_logs',
			fetch_sensors: 'sensors/fetch_sensors',
			fetch_roi_one_pagers: 'roi_one_pagers/fetch_roi_one_pagers',
			fetch_meeting_tracker_roi: 'meeting_trackers/fetch_meeting_tracker_roi',
			fetch_meeting_tracker_last: 'meeting_trackers/fetch_meeting_tracker_last',
			fetch_machines: 'machines/fetch_machines'
		}),

		fetchAlarms(period) {
			const payload = {
				itemId: this.plantItem.id,
				params: { dateStart: period[0], dateFinish: period[1] }
			};

			this.doFetchAction('fetch_alarms', 'alarmsList', 'alarmsLoading', payload);
		},

		showAlarmsCharts() {
			// if (this.plantAlarms.warnings_count || this.plantAlarms.alarms_count) {
			if (this.formData.graphs.length) {
				this.openSensorsAlarmsDialog = true;
			}
		},

		updateFormDataGraphs({ graphs, newNotesSettings }) {
			this.openSensorsAlarmsDialog = false;

			this.formData.graphs = graphs;

			if (newNotesSettings.length) {
				this.setupNewNotes(newNotesSettings);
			}
		},

		setupNewNotes(newNotesSettings) {
			newNotesSettings.forEach(ns => {
				const { listName, prefix, formItemSettings } = ns;
				this.addFormItem(listName, prefix, formItemSettings);
			});
		},

		/*disableChart({ sensor_id, parameter_id }) {
			// console.log(sensor_id, parameter_id)
			let { sensors_alarms } = this.formData;

			let new_settings = cloneDeep(sensors_alarms) || [];
			// new_settings.hidden = new_settings.hidden || [];

			let contains = false;

			new_settings.forEach((sai, idx) => {
				if (sai.sensor_id == sensor_id && sai.parameter == parameter_id) {
					contains = true;
					new_settings[idx].hidden = !new_settings[idx].hidden;
				}
			});

			if (!contains) {
				new_settings.push({
					sensor_id: sensor_id,
					parameter: parameter_id,
					hidden: false
				});
			}
			this.formData.sensors_alarms = new_settings;
		},*/

		filterEmptyItems(list) {
			return list.filter(li => li.id || li.description || li.users_name);
		},

		localSetupPage(item) {
			if (item) {
				this.activitiesItemsList = this.setupFormSubItemsList(
					item.current_activities,
					'a_i'
				);
				this.recommendedActionsItemsList = this.setupFormSubItemsList(
					item.recommended_actions,
					'ra_i'
				);
				this.activitiesInProgressItemsList = this.setupFormSubItemsList(
					item.progress_activities,
					'ap_i'
				);
				this.expansionPlansItemsList = this.setupFormSubItemsList(
					item.expansion_plans,
					'exp_i'
				);
				this.recurringIssuesItemsList = this.setupFormSubItemsList(
					item.recurring_issues,
					'ri_i'
				);
				this.feedbackItemsList = this.setupFormSubItemsList(
					item.customer_feedback,
					'f_i'
				);
				this.activitiesPlannedForNextItemsList = this.setupFormSubItemsList(
					item.next_activities,
					'an_i'
				);

				// this.alarmsList = item;
			}
			// console.log(this.$route)
			if (!this.showJustInfo) {
				if (!this.activitiesItemsList.length) {
					this.addFormItem('activitiesItemsList', 'a_i-');
				}
				if (!this.recommendedActionsItemsList.length) {
					this.addFormItem('recommendedActionsItemsList', 'ra_i-');
				}
				if (!this.activitiesInProgressItemsList.length) {
					this.addFormItem('activitiesInProgressItemsList', 'ap_i-');
				}
				if (!this.expansionPlansItemsList.length) {
					this.addFormItem('expansionPlansItemsList', 'exp_i-');
				}
				if (!this.activitiesPlannedForNextItemsList.length) {
					this.addFormItem('activitiesPlannedForNextItemsList', 'an_i-');
				}
				if (!this.recurringIssuesItemsList.length) {
					this.addFormItem('recurringIssuesItemsList', 'ri_i-');
				}
				if (!this.feedbackItemsList.length) {
					this.addFormItem('feedbackItemsList', 'f_i-');
				}
			}

			if (!this.formData.current_created_at) {
				this.formData.current_created_at = getDateRange('today', {
					getDateString: true
				})[1];
				// console.log(this.formData.current_created_at, getDateRange('today', {getDateString: true}))
			}
			// console.log(item, this.formData)
		},

		localPrepareSubmitData(formData) {
			formData.current_activities = this.filterEmptyItems(
				formData.current_activities
			);
			formData.progress_activities = this.filterEmptyItems(
				formData.progress_activities
			);
			formData.expansion_plans = this.filterEmptyItems(formData.expansion_plans);
			formData.recommended_actions = this.filterEmptyItems(
				formData.recommended_actions
			);
			formData.next_activities = this.filterEmptyItems(formData.next_activities);
			formData.recurring_issues = this.filterEmptyItems(formData.recurring_issues);
			formData.customer_feedback = this.filterEmptyItems(formData.customer_feedback);

			if (formData.sensors_alarms instanceof Array) {
				// formData.sensors_alarms = formData.sensors_alarms.filter(ai => !!ai.description);
			} else {
				delete formData.sensors_alarms;
			}

			if (formData.current_created_at) {
				formData.current_created_at = cleanDateString(formData.current_created_at);
			}
			if (formData.last_tracker_created_at) {
				formData.last_tracker_created_at = cleanDateString(
					formData.last_tracker_created_at
				);
			}

			if (formData.champions.length) {
				formData.champions = getValues('id', formData.champions);
			}

			if (!this.itemId) {
				formData.roi_count = this.mergedItemData.roiData.count;
				formData.roi_cost = this.mergedItemData.roiData.cost;
			}

			return formData;
		}
	},

	watch: {
		meetingTrackerLast(last) {
			if (!this.itemId && last && Object.keys(last).length) {
				// console.log(last)
				const newCurrentActivities = [].concat(
					last.recommended_actions.filter(ni => ni.is_completed),
					last.current_activities
				);
				this.setupPage({
					...last,
					id: null,
					// next_activities: last.next_activities.filter(ni => ni.is_completed),
					current_activities: newCurrentActivities,
					last_tracker_created_at: null,
					current_created_at: null
					// recommended_actions: last.recommended_actions.filter(ni => ni.is_completed)
				});

				if (this.graphs_period.length) {
					this.fetchAlarms(this.graphs_period);
				}
			}

			if (!this.formData.last_tracker_created_at) {
				this.formData.last_tracker_created_at = last
					? cleanDateString(last.created_at)
					: getDateRange('last_7_days', { getDateString: true })[0];
			}
		},

		graphs_period(period) {
			// console.log(this.isInitialSetup)
			if (!this.isInitialSetup && period.length) {
				this.fetchAlarms(period);
			}
		},

		alarmsList(list) {
			if (list.graphs) {
				// console.log(list.graphs)
				this.formData.graphs = cloneDeep(list.graphs);
			}
		}
	},

	created() {
		// console.log(this.plantItem, this.itemData.plant_id)
		if (this.itemData) {
			if (this.plantItem.id !== this.itemData.plant_id) {
				this.changeRoute({ path: '/success-dashboard/meeting-tracker' });
			}
		}
	}
};
</script>
