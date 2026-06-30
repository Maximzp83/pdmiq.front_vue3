<template>
	<div class="edit-form-container success-dashboard-form">
		<el-form
			ref="itemFormRef"
			class="item-edit-form meeting-tracker"
			label-width="150px"
			label-position="top"
			:model="formData"
			:rules="rules"
		>
			<div class="flex mrow wrap big-padding">
				<div class="mcol-xs-12">
					<div class="card top-section">
						<div class="card-header filled_2 flex wrap mrow align-center">
							<div v-if="industrialServicesList.length" class="mcol-xs-12 mcol-sm-auto flex">
								<div
									v-for="item in industrialServicesList"
									:key="`service-${item.id}`"
									class="imgWrapper div-block"
								>
									<img :src="item.file" alt="img" />
								</div>
							</div>

							<el-form-item
								prop="last_tracker_created_at"
								:required="!showJustInfo"
								class="ml-auto mini"
								:label="tt('Last')"
							>
								<div v-if="showJustInfo" class="date semi-bold">
									{{ cleanDateString(formData.last_tracker_created_at, { withoutTime: 1 }) || '-' }}
								</div>
								<Datepicker v-else v-model="formData.last_tracker_created_at" class="mini" />
							</el-form-item>

							<el-form-item
								prop="current_created_at"
								:required="!showJustInfo"
								class="mini"
								:label="tt('Current')"
							>
								<div v-if="showJustInfo" class="date semi-bold">
									{{ cleanDateString(formData.current_created_at, { withoutTime: 1 }) || '-' }}
								</div>
								<Datepicker v-else v-model="formData.current_created_at" class="mini" />
							</el-form-item>

							<div class="mcol-xs-12 mcol-sm-4 mcol-lg-auto logo-img imgWrapper">
								<img :src="mainLogo" alt="logo" />
							</div>
						</div>

						<div class="card-content">
							<div class="mrow flex wrap big-padding">
								<ul class="mcol-xs-12 mcol-sm-4 fluid info-list primary dots-in-text">
									<InfoCell
										v-for="item in topSectionSettings1"
										:key="`info-${item.label}`"
										:settingItem="item"
										:itemData="mergedItemData"
									/>
								</ul>

								<ul class="mcol-xs-12 mcol-sm-4 fluid info-list primary dots-in-text">
									<InfoCell
										v-for="item in topSectionSettings2"
										:key="`info-${item.label}`"
										:settingItem="item"
										:itemData="mergedItemData"
									/>

									<li>
										<span class="key">{{ tt('phrases.next_launch_date') }}: </span>
										<span v-if="showJustInfo" class="value">{{ formData.next_launch_date || '-' }}</span>
										<span v-else class="value mcol-xs-4">
											<CustomInput v-model="formData.next_launch_date" :placeholder="tt('date')" />
										</span>
									</li>
								</ul>

								<div class="mcol-xs-12 mcol-sm-3 flex justify-center">
									<div class="logo-img plant-logo imgWrapper">
										<img v-if="logoSrc" :src="logoSrc" alt="logo error or plant hasn't logo" />
										<img v-else :src="noLogoSrc" alt="error" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">{{ tt('phrases.activities_completed_this_week_period') }}</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="current_activities">
								<div v-if="formData.current_activities.length" class="content-row">
									<DynamicFormItem
										v-for="(item, idx) in formData.current_activities"
										:key="item._id"
										v-model="formData.current_activities[idx]"
										enableName
										:item-index="idx"
										:isLast="idx === formData.current_activities.length - 1"
										:showJustInfo="showJustInfo"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										@onCreate="addFormItem('current_activities')"
										@remove="removeFormItem('current_activities', idx)"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-lg-6">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">{{ tt('phrases.asset_monitoring') }}</div>
						</div>

						<div class="card-content special-decorated-form">
							<div class="section-row warnings-block card">
								<div class="card-content filled relative">
									<SimpleSpinner :active="alarmsLoading" />
									<div class="flex mrow">
										<div class="mcol-xs-4 text-center">
											<div class="title article-title semi-bold">{{ tt('constants.WARNING') }}</div>
											<div
												:class="['span-block round-info-item warning pointer', { pointer: plantAlarms.warnings_count > 0 }]"
												@click="showAlarmsCharts"
											>
												{{ plantAlarms.warnings_count }}
											</div>
											<div class="semi-bold span-block muted p-5">{{ plantAlarms.warnings_duration }}</div>
										</div>

										<div class="mcol-xs-4 text-center">
											<div class="title article-title semi-bold">{{ tt('constants.ALARM') }}</div>
											<div
												:class="['span-block round-info-item alarm pointer', { pointer: plantAlarms.alarms_count > 0 }]"
												@click="showAlarmsCharts"
											>
												{{ plantAlarms.alarms_count }}
											</div>
											<div class="semi-bold span-block muted p-5">{{ plantAlarms.alarms_duration }}</div>
										</div>

										<div v-if="plantAlarms.has_sensors_ultrasound_parameter" class="mcol-xs-4 text-center">
											<div class="title article-title semi-bold">{{ tt('constants.LUBE') }}</div>
											<div
												:class="['span-block round-info-item lube pointer', { pointer: plantAlarms.lube_alarms_count > 0 }]"
												@click="showAlarmsCharts"
											>
												{{ plantAlarms.lube_alarms_count }}
											</div>
											<div class="semi-bold span-block muted p-5">{{ plantAlarms.lube_alarms_duration }}</div>
										</div>
									</div>
								</div>
							</div>

							<div :class="['section-row article-title semi-bold', { title: !showJustInfo }]">
								{{ tt('phrases.recommended_actions') }}
							</div>

							<el-form-item prop="recommended_actions" :class="{ showJustInfo }">
								<div v-if="formData.recommended_actions.length" class="content-row">
									<DynamicFormItem
										v-for="(item, idx) in formData.recommended_actions"
										:key="item._id"
										v-model="formData.recommended_actions[idx]"
										:item-index="idx"
										:isLast="idx === formData.recommended_actions.length - 1"
										:showJustInfo="showJustInfo"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										@onCreate="addFormItem('recommended_actions')"
										@remove="removeFormItem('recommended_actions', idx)"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>

							<div class="section-row"></div>

							<div class="section-row card">
								<div class="card-content filled relative">
									<SimpleSpinner :active="workOrdersLoading" />
									<div class="content-row">
										<i class="icomoon icon-docs span-block section-title primary-color text-middle"></i>
										<span class="span-block article-title semi-bold text-middle uppercase">{{ tt('WORK_ORDERS') }}</span>
									</div>
									<div class="content-row semi-bold">
										<InfoCell tag="span" labelDisabled :settingItem="workOrderSetting" :itemData="{ list: filteredWorkOrdersList }" />
									</div>
								</div>
							</div>

							<div class="section-row card">
								<div class="card-content filled relative">
									<SimpleSpinner :active="sensorsLoading" />
									<div class="content-row">
										<img class="span-img span-block text-middle" :src="notWifiIcon" alt="" />
										<span class="span-block article-title semi-bold text-middle uppercase">{{ tt('phrases.sensors_offline') }}</span>
									</div>
									<div class="content-row semi-bold">
										<InfoCell tag="span" labelDisabled :settingItem="sensorSetting" :itemData="{ list: sensorsListInActive }" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">{{ tt('phrases.activities_in_progress') }}</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="progress_activities">
								<div v-if="formData.progress_activities.length" class="content-row">
									<DynamicFormItem
										v-for="(item, idx) in formData.progress_activities"
										:key="item._id"
										v-model="formData.progress_activities[idx]"
										enableName
										:item-index="idx"
										:isLast="idx === formData.progress_activities.length - 1"
										:showJustInfo="showJustInfo"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										@onCreate="addFormItem('progress_activities')"
										@remove="removeFormItem('progress_activities', idx)"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">{{ tt('phrases.success_expansion_plans') }}</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="expansion_plans">
								<div v-if="formData.expansion_plans.length" class="content-row">
									<DynamicFormItem
										v-for="(item, idx) in formData.expansion_plans"
										:key="item._id"
										v-model="formData.expansion_plans[idx]"
										enableName
										:item-index="idx"
										:isLast="idx === formData.expansion_plans.length - 1"
										:showJustInfo="showJustInfo"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										@onCreate="addFormItem('expansion_plans')"
										@remove="removeFormItem('expansion_plans', idx)"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">{{ tt('phrases.activities_planned_for_next_week_period') }}</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="next_activities">
								<div v-if="formData.next_activities.length" class="content-row">
									<DynamicFormItem
										v-for="(item, idx) in formData.next_activities"
										:key="item._id"
										v-model="formData.next_activities[idx]"
										enableName
										:item-index="idx"
										:isLast="idx === formData.next_activities.length - 1"
										:showJustInfo="showJustInfo"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										@onCreate="addFormItem('next_activities')"
										@remove="removeFormItem('next_activities', idx)"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">{{ tt('phrases.recurring_issues_continuous_issue_discussion') }}</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="recurring_issues">
								<div v-if="formData.recurring_issues.length" class="content-row">
									<DynamicFormItem
										v-for="(item, idx) in formData.recurring_issues"
										:key="item._id"
										v-model="formData.recurring_issues[idx]"
										enableName
										:item-index="idx"
										:isLast="idx === formData.recurring_issues.length - 1"
										:showJustInfo="showJustInfo"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										@onCreate="addFormItem('recurring_issues')"
										@remove="removeFormItem('recurring_issues', idx)"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-lg-6">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">{{ tt('phrases.roi_value_creation_summary') }}</div>
						</div>

						<div class="card-content">
							<ul class="section-row semi-bold">
								<li v-for="item in roiOnePagersList" :key="`info-${item.id}`" class="content-row">
									<router-link class="link underline secondary-color" :to="`/success-dashboard/roi-one-pager/${item.id}`">
										{{ item.name }}
									</router-link>
								</li>
								<li v-if="!roiOnePagersList.length" class="content-row">-</li>
							</ul>

							<div class="section-row">
								<a
									class="el-button el-button--primary item-action-button inverted"
									target="_blank"
									:href="`${originURL}/success-dashboard/roi-one-pager/new`"
								>
									<span class="uppercase">{{ tt('phrases.questionnaire_form') }}</span>
								</a>
							</div>
						</div>
					</div>
				</div>

				<div :class="['mcol-xs-12 mcol-lg-6', { showJustInfo }]">
					<div class="card vertical-fluid">
						<div class="card-header filled_2">
							<div class="semi-bold uppercase">{{ tt('phrases.customer_product_feedback') }}</div>
						</div>

						<div class="card-content special-decorated-form striped">
							<el-form-item prop="customer_feedback">
								<div v-if="formData.customer_feedback.length" class="content-row">
									<DynamicFormItem
										v-for="(item, idx) in formData.customer_feedback"
										:key="item._id"
										v-model="formData.customer_feedback[idx]"
										enableName
										:item-index="idx"
										:isLast="idx === formData.customer_feedback.length - 1"
										:showJustInfo="showJustInfo"
										:usersList="usersList"
										:usersLoading="usersLoading"
										:machinesList="machinesList"
										:machinesLoading="machinesLoading"
										:sensorsList="sensorsList"
										:sensorsLoading="sensorsLoading"
										@onCreate="addFormItem('customer_feedback')"
										@remove="removeFormItem('customer_feedback', idx)"
									/>
								</div>
								<div v-else>-</div>
							</el-form-item>
						</div>
					</div>
				</div>
			</div>

			<div v-if="!showJustInfo" class="el-form-item FormOperationsButtons">
				<el-button type="primary" native-type="button" class="item-action-button" @click="validateForm">
					<span class="uppercase">{{ tt('SAVE') }}</span>
				</el-button>
				<el-button
					type="primary"
					native-type="button"
					class="item-action-button"
					@click="validateForm({ additionalInject: { notify: true } })"
				>
					<span class="uppercase">{{ tt('phrases.save_send') }}</span>
				</el-button>
			</div>
		</el-form>

		<el-dialog
			v-model="openSensorsAlarmsDialog"
			append-to-body
			class="dialog-decorate-header big sensors-alarms-charts new with-description"
			:title="tt('Alarms')"
			:close-on-click-modal="false"
		>
			<SensorsAlarmsContainer
				v-if="openSensorsAlarmsDialog"
				:sensorsAlarms="formData.graphs"
				:itemData="itemData"
				:sensorsList="sensorsList"
				:sensorsLoading="sensorsLoading"
				:rootFilters="chartsRange"
				:measurement="plantItem.metric_system_type"
				:additionalProps="additionalPropsForCharts"
				@event="handleEvent"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
	cleanDateString,
	cloneDeep,
	getDateRange,
	getTimeDifference,
	getValues,
} from '@/helpers';
import { main_logo, not_wifi_icon, MAINTENANCE_TYPES } from '@/constants/global';
import { api_request } from '@/api/request_provider';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSuccessDashboard } from '@/composables/useSuccessDashboard';
import { useMachines } from '@/composables/useMachines';
import { useMaintenance } from '@/composables/useMaintenance';
import noLogoSrc from '@/assets/img/no_logo.jpg';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import InfoCell from '@/components/itemDetails/InfoItem.vue';
import DynamicFormItem from './DynamicFormItem.vue';
import SensorsAlarmsContainer from '../common/SensorsAlarmsContainer.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'SuccessMeetingTrackerItemForm' });

const props = defineProps(buildProps({
	plantItem: { type: Object, default: () => ({}) },
	sensorsLoading: Boolean,
	sensorsList: { type: Array, default: () => [] },
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const {
	fetchLastMeetingTracker,
	fetchMeetingTrackerRoi,
	fetchRoiOnePagers,
	fetchPlantAlarms,
} = useSuccessDashboard();
const { fetchMachines } = useMachines();
const { fetchMaintenanceLogs } = useMaintenance();

const itemFormRef = ref(null);
const openSensorsAlarmsDialog = ref(false);
const usersLoading = ref(false);
const usersList = ref([]);
const alarmsLoading = ref(false);
const alarmsList = ref({});
const workOrdersLoading = ref(false);
const workOrdersList = ref([]);
const machinesLoading = ref(false);
const machinesList = ref([]);
const roiOnePagersLoading = ref(false);
const roiOnePagersList = ref([]);
const meetingTrackerLoading = ref(false);
const meetingTrackerLast = ref(null);
const meetingTrackerRoiLoading = ref(false);
const meetingTrackerRoiData = ref({});
const isInitialSetup = ref(true);

const makeRow = (prefix = 'row') => ({
	_id: `${prefix}-${Date.now()}-${Math.random()}`,
	description: '',
	users_name: '',
	users_ids: [],
	machine_id: null,
	sensor_id: null,
	sensor_ids: [],
});
const initialFormData = {
	plant_id: props.plantItem?.id,
	next_launch_date: '',
	champions: [],
	recommended_actions: [],
	current_activities: [],
	progress_activities: [],
	expansion_plans: [],
	next_activities: [],
	recurring_issues: [],
	customer_feedback: [],
	roi_cost: 0,
	roi_count: 0,
	graphs: [],
	last_tracker_created_at: '',
	current_created_at: '',
};
const formData = ref({ ...initialFormData });
const itemData = computed(() => props.itemData);
const itemId = computed(() => itemData.value?.id || null);
const routeQuery = computed(() => (Object.keys(route.query || {}).length ? route.query : null));
const showJustInfo = computed(() =>
	!authStore.hasAccessTo(['edit_customer_success']) ||
	(itemData.value?.id && (!routeQuery.value || !routeQuery.value.edit)),
);
const rules = computed(() => ({}));
const mainLogo = computed(() => main_logo);
const notWifiIcon = computed(() => not_wifi_icon);
const originURL = computed(() => window.location.origin);
const logoSrc = computed(() => props.plantItem?.file || null);
const industrialServicesList = computed(() => props.plantItem?.industrialServices || []);
const chartsRange = computed(() => ({ daterange: graphsPeriod.value }));
const additionalPropsForCharts = computed(() =>
	Object.freeze({
		showDisableChartButton: !showJustInfo.value,
		showChartSelectionButton: !showJustInfo.value,
		showDatePicker: !showJustInfo.value,
		enableDragNDrop: !showJustInfo.value,
		showJustInfo: showJustInfo.value,
		enableAnnotations: true,
		enableDescriptionForm: true,
		showSaveButton: !showJustInfo.value,
	}),
);
const graphsPeriod = computed(() => {
	const { last_tracker_created_at, current_created_at } = formData.value;
	if (last_tracker_created_at && current_created_at) {
		return Object.freeze([
			cleanDateString(last_tracker_created_at, { withoutTime: 1 }),
			cleanDateString(current_created_at, { withoutTime: 1 }),
		]);
	}
	return [];
});
const topSectionSettings1 = computed(() =>
	Object.freeze(
		translate([
			{ label: 'Customer', prop: 'plant.company.name' },
			{ label: 'Region', prop: 'plant.region' },
			{
				label: 'Renewal_Date',
				prop: 'plant.billing_plant_renewal_date',
				meta: {
					prepareValue: {
						localMethod: cleanDateString,
						args: { withoutTime: true },
					},
				},
			},
			{
				label: 'IM_CSM',
				prop: 'plant.im_csms',
				meta: { fromArray: { subProp: 'full_name' } },
			},
			{
				label: 'Champions',
				prop: itemId.value ? 'meetingTracker.champions' : 'plant.champions',
				meta: { fromArray: { subProp: 'full_name' } },
			},
		]),
	),
);
const topSectionSettings2 = computed(() =>
	Object.freeze(
		translate([
			{ label: 'phrases.completed_rois', prop: 'roiData.count' },
			{ label: 'phrases.roi_salvings_ca', prop: 'roiData.cost' },
			{ label: 'phrases.of_sensors', prop: 'meetingTracker.sensors_count' },
		]),
	),
);
const mergedItemData = computed(() => {
	let data = { plant: props.plantItem };
	if (itemData.value) {
		data = { ...data, meetingTracker: itemData.value };
	} else {
		data = { ...data, meetingTracker: { sensors_count: props.sensorsList.length } };
	}

	if (itemId.value && itemData.value) {
		data = {
			...data,
			roiData: {
				count: itemData.value.roi_count,
				cost: itemData.value.roi_cost,
			},
		};
	} else if (meetingTrackerRoiData.value) {
		data = { ...data, roiData: meetingTrackerRoiData.value };
	}

	return Object.freeze(data);
});
const filteredWorkOrdersList = computed(() => workOrdersList.value.filter((item) => !!item.title));
const workOrderSetting = computed(() =>
	Object.freeze({
		prop: 'list',
		meta: { fromArray: { subProp: 'title', delimeter: ', ', inline: true } },
	}),
);
const sensorSetting = computed(() =>
	Object.freeze({
		prop: 'list',
		meta: { fromArray: { subProp: 'location_in_equipment', delimeter: ', ', inline: true } },
	}),
);
const plantAlarms = computed(() => {
	const result = {
		warnings_count: 0,
		warnings_duration: 0,
		alarms_count: 0,
		alarms_duration: 0,
		has_sensors_ultrasound_parameter: false,
		lube_alarms_count: 0,
		lube_alarms_duration: 0,
	};
	const source = Object.keys(alarmsList.value || {}).length ? alarmsList.value : itemData.value;
	if (!source) return Object.freeze(result);

	result.warnings_count = source.warnings_count || 0;
	result.warnings_duration = getTimeDifference({ to_ms: (source.warnings_duration || 0) * 1000 }).time_total;
	result.alarms_count = source.alarms_count || 0;
	result.alarms_duration = getTimeDifference({ to_ms: (source.alarms_duration || 0) * 1000 }).time_total;

	if (source.has_sensors_ultrasound_parameter) {
		result.has_sensors_ultrasound_parameter = source.has_sensors_ultrasound_parameter;
		result.lube_alarms_count = source.lube_alarms_count || 0;
		result.lube_alarms_duration = getTimeDifference({ to_ms: (source.lube_alarms_duration || 0) * 1000 }).time_total;
	}

	return Object.freeze(result);
});
const sensorsListInActive = computed(() => props.sensorsList.filter((sensor) => sensor.is_inactive));

const methodsMap = {
	fetch_users: ({ params } = {}) => api_request.get('/users', { params, notNotify: true }),
	fetch_meeting_tracker_last: ({ params } = {}) => fetchLastMeetingTracker(params),
	fetch_maintenance_logs: ({ params } = {}) => fetchMaintenanceLogs(params),
	fetch_roi_one_pagers: ({ params } = {}) => fetchRoiOnePagers(params),
	fetch_machines: ({ params } = {}) => fetchMachines(params),
	fetch_meeting_tracker_roi: ({ params } = {}) => fetchMeetingTrackerRoi(params),
	fetch_alarms: ({ itemId, params } = {}) => fetchPlantAlarms({ itemId, params }),
};

const bindToPlant = () => [
	{
		getValue: () => props.plantItem?.id,
		param: 'plantId',
	},
];

const requestsToDoList = computed(() => {
	const list = [
		{
			action: methodsMap.fetch_users,
			bindTo: bindToPlant(),
			localProp: usersList,
			localLoadProp: usersLoading,
		},
		{
			action: methodsMap.fetch_meeting_tracker_last,
			bindTo: bindToPlant(),
			localProp: meetingTrackerLast,
			localLoadProp: meetingTrackerLoading,
		},
		{
			action: methodsMap.fetch_maintenance_logs,
			payload: {
				params: {
					max: -1,
					onlyProcessing: true,
					type: MAINTENANCE_TYPES.WORK_ORDER,
				},
			},
			bindTo: bindToPlant(),
			localProp: workOrdersList,
			localLoadProp: workOrdersLoading,
		},
		{
			action: methodsMap.fetch_roi_one_pagers,
			payload: { params: { max: 5 } },
			bindTo: bindToPlant(),
			localProp: roiOnePagersList,
			localLoadProp: roiOnePagersLoading,
		},
		{
			action: methodsMap.fetch_machines,
			bindTo: bindToPlant(),
			localProp: machinesList,
			localLoadProp: machinesLoading,
		},
	];

	if (!itemId.value) {
		list.push({
			action: methodsMap.fetch_meeting_tracker_roi,
			bindTo: bindToPlant(),
			localProp: meetingTrackerRoiData,
			localLoadProp: meetingTrackerRoiLoading,
		});
	}

	return Object.freeze(list);
});

const setupRows = (rows = [], prefix = 'row') => rows.map((row) => ({ ...makeRow(prefix), ...row }));
const ensureRows = () => {
	if (showJustInfo.value) return;
	const keys = [
		'current_activities',
		'recommended_actions',
		'progress_activities',
		'expansion_plans',
		'next_activities',
		'recurring_issues',
		'customer_feedback',
	];
	keys.forEach((key) => {
		if (!formData.value[key]?.length) {
			formData.value[key] = [makeRow(key)];
		}
	});
};
const localSetupPage = (item = {}) => {
	const source = item || {};
	formData.value = {
		...formData.value,
		...source,
		plant_id: source.plant_id || props.plantItem?.id || null,
		current_activities: setupRows(source.current_activities, 'a_i'),
		recommended_actions: setupRows(source.recommended_actions, 'ra_i'),
		progress_activities: setupRows(source.progress_activities, 'ap_i'),
		expansion_plans: setupRows(source.expansion_plans, 'exp_i'),
		next_activities: setupRows(source.next_activities, 'an_i'),
		recurring_issues: setupRows(source.recurring_issues, 'ri_i'),
		customer_feedback: setupRows(source.customer_feedback, 'f_i'),
		graphs: source.graphs || [],
	};

	ensureRows();

	if (!formData.value.current_created_at) {
		formData.value.current_created_at = getDateRange('today', { getDateString: true })[1];
	}
};
const addFormItem = (key) => {
	formData.value[key] = [...(formData.value[key] || []), makeRow(key)];
};
const removeFormItem = (key, index) => {
	formData.value[key] = formData.value[key].filter((_, idx) => idx !== index);
};

const filterEmptyItems = (list = []) =>
	list.filter((item) => item.id || item.description || item.users_name || item.users_ids?.length || item.machine_id || item.sensor_id || item.sensor_ids?.length);

const cleanRows = (rows = [], includeUsers = true) =>
	filterEmptyItems(rows).map(({ _id, sensor_id, ...row }) => {
		const next = { ...row };
		if (sensor_id && !next.sensor_ids?.length) {
			next.sensor_ids = [sensor_id];
		}
		if (!includeUsers) {
			delete next.users_name;
			delete next.users_ids;
		} else if (!next.users_name) {
			delete next.users_name;
		}
		if (!next.machine_id) delete next.machine_id;
		return next;
	});

const localPrepareSubmitData = (data) => {
	const next = {
		...data,
		current_activities: cleanRows(data.current_activities),
		progress_activities: cleanRows(data.progress_activities),
		expansion_plans: cleanRows(data.expansion_plans),
		recommended_actions: cleanRows(data.recommended_actions, false),
		next_activities: cleanRows(data.next_activities),
		recurring_issues: cleanRows(data.recurring_issues),
		customer_feedback: cleanRows(data.customer_feedback),
	};

	if (next.current_created_at) next.current_created_at = cleanDateString(next.current_created_at);
	if (next.last_tracker_created_at) next.last_tracker_created_at = cleanDateString(next.last_tracker_created_at);
	if (next.champions?.length) next.champions = getValues('id', next.champions);
	if (!itemId.value) {
		next.roi_count = mergedItemData.value.roiData?.count;
		next.roi_cost = mergedItemData.value.roiData?.cost;
	}
	return next;
};

const fetchAlarms = (period) => {
	if (!props.plantItem?.id || !period?.length) return;
	doFetchAction(
		methodsMap.fetch_alarms,
		alarmsList,
		alarmsLoading,
		{
			itemId: props.plantItem.id,
			params: { dateStart: period[0], dateFinish: period[1] },
		},
	);
};

const showAlarmsCharts = () => {
	if (formData.value.graphs?.length) {
		openSensorsAlarmsDialog.value = true;
	}
};

const { handleEvent } = useEventHandler({
	updateFormDataGraphs: ({ graphs }) => {
		openSensorsAlarmsDialog.value = false;
		formData.value.graphs = graphs;
	},
	handleChartContainerReady: () => {},
	chartLoadEvent: () => {},
});
const { validateForm } = useItemForm({
	entityKey: 'MeetingTrackers',
	itemData,
	formData,
	initialFormData,
	formRef: itemFormRef,
	localSetupPage,
	localPrepareSubmitData,
	emit,
});

const { initiateRequestsToDoList, doFetchAction } = useRequestsList({
	requestsToDoList,
	initialRequestsListResponsesReadyCallback: () => {
		isInitialSetup.value = false;
		if (graphsPeriod.value.length) {
			fetchAlarms(graphsPeriod.value);
		}
	},
});
initiateRequestsToDoList.value = false;

watch(meetingTrackerLast, (last) => {
	if (!itemId.value && last && Object.keys(last).length) {
		const newCurrentActivities = []
			.concat((last.recommended_actions || []).filter((item) => item.is_completed))
			.concat(last.current_activities || []);
		localSetupPage({
			...last,
			id: null,
			current_activities: newCurrentActivities,
			last_tracker_created_at: null,
			current_created_at: null,
		});

		if (graphsPeriod.value.length) {
			fetchAlarms(graphsPeriod.value);
		}
	}

	if (!formData.value.last_tracker_created_at) {
		formData.value.last_tracker_created_at = last
			? cleanDateString(last.created_at)
			: getDateRange('last_7_days', { getDateString: true })[0];
	}
});
watch(graphsPeriod, (period) => {
	if (!isInitialSetup.value && period.length) {
		fetchAlarms(period);
	}
});
watch(alarmsList, (list) => {
	if (list?.graphs) {
		formData.value.graphs = cloneDeep(list.graphs);
	}
});

onMounted(async () => {
	if (itemData.value && props.plantItem?.id !== itemData.value.plant_id) {
		router.push({ path: '/success-dashboard/meeting-tracker' });
		return;
	}

	initiateRequestsToDoList.value = true;
});

defineExpose({ validateForm });
</script>
