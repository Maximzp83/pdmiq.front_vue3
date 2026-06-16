<template>
	<div class="edit-form-container maintenance-form" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative section-row bolded-labels"
			:model="formData"
			:rules="rules"
			label-width="150px"
			label-position="top"
		>
			<div :class="['el-form-item flex mrow wrap', { showJustInfo }]">
				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item v-if="itemData?.serial_number" :label="`# ${tt('Work_Order')}`">
						<b>{{ itemData.serial_number }}</b>
					</el-form-item>

					<el-form-item :label="tt('phrases.Work_Order_Name')" prop="title" required>
						<CustomInput v-model="formData.title" :placeholder="tt('Name')" />
					</el-form-item>

					<el-form-item :label="tt('Status')" prop="status" required>
						<CustomSelectV2
							v-model="formData.status"
							:optionsList="filteredWorkOrdersStatusesList"
							:placeholder="`${tt('select')} ${tt('status')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('Work_Order_Type')" prop="category_id">
						<div class="flex">
							<div class="relative mcol-xs-10 fluid span-block">
								<CustomSelectV2
									v-model="formData.category_id"
									filterable
									clearable
									:optionsLoading="woTypesLoading"
									:optionsList="woTypesList"
									:placeholder="tt('type')"
								/>
							</div>

							<el-button
								v-if="!fromAnotherInstance"
								class="create-button span-block inverted"
								size="small"
								type="primary"
								@click="createWOType"
							>
								<i class="icomoon icon-plus"></i>
							</el-button>
						</div>
					</el-form-item>

					<el-form-item v-if="!isRecurring" :label="tt('Due_Date')" prop="finish_date" required>
						<Datepicker v-model="formData.finish_date" :placeholder="`${tt('Select')} ${tt('date')}`" />
					</el-form-item>

					<template v-if="isRecurring">
						<el-form-item v-if="!showJustInfo" label="">
							<RadioButtonsBlock
								v-model="periodMethod"
								:settings="periodMethodRadioOptions"
								:optionsList="translatedPeriodMethodsList"
							/>
						</el-form-item>

						<div v-if="periodMethod === PERIOD_METHODS.PERIOD_TYPE">
							<el-form-item :label="tt('Period')" prop="period_type" required>
								<CustomSelectV2
									v-model="formData.period_type"
									:optionsList="translatedPeriodsTypesList"
									:placeholder="`${tt('select')} ${tt('period')}`"
								/>
							</el-form-item>

							<el-form-item :label="tt('Frequency')" prop="period_frequency" required>
								<CustomSelectV2
									v-model="formData.period_frequency"
									:optionsList="frequenciesList"
									:placeholder="`${tt('select')} ${tt('frequency')}`"
									:labelKey="`${formData.period_type}`"
								/>
							</el-form-item>

							<el-form-item :label="tt('Period_Range')" required>
								<Datepicker v-model="periodDateRange" type="daterange" :pickerOptions="periodsPickerOptions" />
							</el-form-item>
						</div>

						<div v-else class="el-form-item">
							<el-form-item :label="tt('Period_Dates')" prop="period_dates">
								<div class="options-container relative">
									<div v-if="datesItemsList.length" class="content-row">
										<DateItem
											v-for="(item, idx) in datesItemsList"
											:key="`date_item-${item.id}`"
											:ref="(el) => setSubItemRef('DateItem', el, idx)"
											:item-data="item"
											:item-index="idx"
											:pickerOptions="periodsPickerOptions"
											@onRemove="(id) => removeFormItem(id, datesItemsList)"
										/>
									</div>

									<b v-else-if="showJustInfo">-</b>

									<div class="create-button-container content-row">
										<el-button
											class="action-button create-button"
											type="success"
											@click="addFormItem(datesItemsList, 'd_i-')"
										>
											<i class="icomoon icon-cross"></i>
										</el-button>
									</div>
								</div>
							</el-form-item>
						</div>
					</template>

					<div v-if="!isRecurring" class="el-form-item">
						<div class="mrow flex bottom">
							<el-form-item :label="tt('Due_Date')" prop="finish_date" class="mcol-xs-6" required>
								<Datepicker v-model="formData.finish_date" :placeholder="`${tt('Select')} ${tt('date')}`" />
							</el-form-item>
							<el-form-item v-if="!showJustInfo" label="" prop="snooze" class="mcol-xs-6">
								<el-checkbox v-model="snooze">
									<b>{{ tt('phrases.Snooze_Alerts') }}</b>
								</el-checkbox>
							</el-form-item>
						</div>
					</div>

					<div v-if="!isRecurring" class="el-form-item" v-show="snooze">
						<el-form-item class="period-block" :label="tt('Snooze')" prop="time_period">
							<div class="flex mrow align-center">
								<div v-show="!changeSnoozeRange" class="daterange">
									<i class="el-icon-date span-block"></i>
									<b class="span-block">{{ prepareRangeStr(formData.snooze_alert) }}</b>
								</div>
								<div v-if="!hasSnoozeAlert || (changeSnoozeRange && formData.snooze_alert)">
									<CustomSelectV2
										v-model="formData.snooze_alert.time_period"
										:optionsList="snoozeRangeTypesList"
										:placeholder="`${tt('Select')} ${tt('range')}`"
									/>
								</div>

								<div v-if="hasSnoozeAlert && !showJustInfo" class="mcol-xs-3">
									<span class="link underline" @click="changeSnoozeRange = !changeSnoozeRange">
										{{ changeSnoozeRange ? tt('Cancel') : tt('Change') }}
									</span>
								</div>
							</div>
						</el-form-item>

						<el-form-item
							v-if="snooze && (!hasSnoozeAlert || (changeSnoozeRange && formData.snooze_alert))"
							label=""
							prop="daterange"
						>
							<div v-show="formData.snooze_alert?.time_period === SNOOZE_RANGE_TYPES.CUSTOM_RANGE">
								<Datepicker v-model="snoozeDateRange" type="daterange" />
							</div>
						</el-form-item>
					</div>

					<el-form-item :label="tt('Description')" prop="description" required>
						<div v-if="showJustInfo" class="el-form-item el-textarea">
							<div class="flex align-center el-input__inner el-textarea__inner" v-html="formData.description || '-'"></div>
						</div>

						<el-input v-else v-model="formData.description" type="textarea" :rows="5" />
					</el-form-item>

					<div class="el-form-item">
						<div class="flex mrow">
							<el-form-item :label="tt('Attachments')" prop="attachments" class="mcol-xs-6">
								<FileUploadBlock
									:ref="(el) => setSubItemRef('AttachmentsUploadBlock', el, 0)"
									multiple
									enableLinkToFile
									keepFilePath
									showDeleteButton
									accept=" "
									:disabled="showJustInfo"
									:buttonText="tt('phrases.upload_files')"
									:pictures="attachmentsList"
								/>
							</el-form-item>

							<el-form-item :label="tt('Images')" prop="images" class="upload-form-item mcol-xs-6">
								<FileUploadBlock
									:ref="(el) => setSubItemRef('ImgUploadBlock', el, 0)"
									multiple
									keepFilePath
									showImageClickOverlay
									:disabled="showJustInfo"
									:pictures="imagesList"
									@onImgClick="togglePreviewModal"
								/>
							</el-form-item>
						</div>
					</div>

					<el-form-item :label="tt('Parts')" prop="parts" class="parts">
						<div class="flex part-create-button">
							<el-button
								v-if="!fromAnotherInstance"
								class="create-button span-block inverted"
								size="small"
								type="primary"
								@click="createPart"
							>
								<i class="icomoon icon-plus"></i>
							</el-button>
						</div>

						<div class="options-container relative">
							<div v-if="partsItemsList.length" class="content-row">
								<PartItem
									v-for="(item, idx) in partsItemsList"
									:key="`part_item-${item.id}`"
									:ref="(el) => setSubItemRef('PartItem', el, idx)"
									:item-data="item"
									:item-index="idx"
									:partsList="partsList"
									:partsLoading="partsLoading"
									:showJustInfo="showJustInfo"
									@onRemove="(id) => removeFormItem(id, partsItemsList)"
								/>
							</div>
							<b v-else-if="showJustInfo" class="el-range-input">-</b>

							<div class="create-button-container content-row">
								<el-button
									class="action-button create-button"
									type="success"
									@click="addFormItem(partsItemsList, 'p_i-')"
								>
									<i class="icomoon icon-cross"></i>
								</el-button>
							</div>
						</div>
					</el-form-item>

					<div v-if="selectedTaskProcedure && taskHasParts" class="el-form-item">
						<div class="muted">
							{{ tt('phrases.Parts_from_procedure') }} "{{ selectedTaskProcedure.name }}":
						</div>
						<ul class="muted disc">
							<InfoCell
								v-for="item in selectedTaskProcedure.processes"
								:key="`proc_info-${item.id}`"
								labelDisabled
								:valueMethod="getTaskProcedureParts"
								:settingItem="{}"
								:itemData="item"
							/>
						</ul>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item v-if="!showJustInfo" :label="tt('Task_Procedures')" prop="task_procedure_id" class="relative">
						<CustomSelectV2
							v-model="formData.task_procedure_id"
							filterable
							clearable
							:optionsLoading="taskProceduresLoading"
							:optionsList="taskProceduresList"
							:placeholder="`${tt('Select')} ${tt('Task')}`"
						/>

						<div
							v-if="!itemData"
							v-show="selectedTaskProcedure"
							class="input-sub-label info-color link semi-bold"
							@click="taskProceduresDialogVisible = true"
						>
							{{ tt('Show_procedures') }}
						</div>
					</el-form-item>

					<div :class="['card filled no-shadow el-form-item', { 'has-error': mainInstancesError }]">
						<div class="card-content" @click="mainInstancesError = false">
							<div class="semi-bold title article-title">{{ tt('Equipment') }}</div>

							<el-form-item :label="tt('Production_Line')" prop="production_line_id">
								<CustomSelectV2
									v-model="formData.production_line_id"
									@focus="mainInstancesError = false"
									filterable
									clearable
									:optionsLoading="productionLinesLoading"
									:optionsList="productionLinesList"
									:placeholder="showJustInfo ? '-' : tt('Line')"
									prefixIcon="icomoon icon-production_lines"
								/>
							</el-form-item>

							<el-form-item :label="tt('Machine')" prop="machine_id">
								<CustomSelectV2
									v-model="formData.machine_id"
									@focus="mainInstancesError = false"
									filterable
									clearable
									:optionsLoading="machinesLoading"
									:optionsList="machinesList"
									:placeholder="showJustInfo ? '-' : tt('machine')"
									prefixIcon="icomoon icon-machines"
								/>
							</el-form-item>

							<el-form-item :label="tt('Asset')" prop="asset_id">
								<FetchByQuerySelect
									v-model="formData.asset_id"
									@focus="mainInstancesError = false"
									:disabled="!formData.machine_id"
									clearable
									filterable
									enableLoadmore
									:loadmoreIsActive="!formData.machine_id"
									:optionsLoading="assetsLoading"
									:optionsList="assetsList"
									:settings="assetQueryOptions"
									:placeholder="showJustInfo ? '-' : tt('Asset')"
									prefixIcon="icomoon icon-assets"
									@update:optionsLoading="assetsLoading = $event"
									@update:optionsList="assetsList = $event"
								/>
							</el-form-item>

							<el-form-item :label="tt('Item')" prop="equipment_id">
								<FetchByQuerySelect
									v-model="formData.equipment_id"
									@focus="mainInstancesError = false"
									:disabled="!formData.asset_id"
									clearable
									filterable
									enableLoadmore
									:loadmoreIsActive="!formData.asset_id"
									:optionsLoading="equipmentsLoading"
									:optionsList="equipmentsList"
									:settings="equipmentsQueryOptions"
									:setupLabelSettings="equipmentLabelOptions"
									:placeholder="showJustInfo ? '-' : tt('Item')"
									prefixIcon="icomoon icon-equipments"
									@update:optionsLoading="equipmentsLoading = $event"
									@update:optionsList="equipmentsList = $event"
								/>
							</el-form-item>
						</div>
					</div>

					<div v-show="mainInstancesError" class="alarm-color content-row">
						{{ tt('phrases.At_least_one_of_these_fields_is_required') }}
					</div>

					<el-form-item v-if="showJustInfo" :label="tt('Technicians')">
						<div v-if="formData.users_ids.length" class="el-range-input">
							{{ assignedUsers }}
						</div>
						<div v-else-if="itemData?.team" class="el-range-input">
							{{ itemData.team.name }}
						</div>
						<b v-else class="el-range-input">-</b>
					</el-form-item>

					<el-form-item v-else :label="tt('phrases.Assigned_to')" class="content-row">
						<div class="content-row underline-tabs full-width">
							<TabsBar
								:activeTab="activeTab"
								:tabsList="tabsList"
								buttonsType="primary"
								buttonsClass="text-center"
								@switchTab="switchTab"
							/>
						</div>

						<div v-show="activeTab.prop === 'usersTab'" key="usersTab" class="content-row tab-container">
							<el-form-item prop="users_ids">
								<SimpleSpinner :active="usersLoading" />
								<div class="flex">
									<div class="relative mcol-xs-10 fluid span-block">
										<CustomSelectV2
											v-model="formData.users_ids"
											filterable
											clearable
											multiple
											collapse-tags
											:optionsLoading="usersLoading"
											:optionsList="usersList"
											:placeholder="`${tt('Select')} ${tt('Users')}`"
											labelKey="full_name"
										/>
									</div>
								</div>
							</el-form-item>
						</div>

						<div v-show="activeTab.prop === 'teamsTab'" key="teamsTab" class="content-row tab-container">
							<el-form-item prop="team_id">
								<CustomSelectV2
									v-model="formData.team_id"
									filterable
									clearable
									:optionsLoading="teamsLoading"
									:optionsList="teamsList"
									:placeholder="`${tt('Select')} ${tt('team')}`"
								/>
							</el-form-item>
						</div>
					</el-form-item>
				</div>
			</div>

			<FormOperationsButtons v-if="!fromModal && !showJustInfo" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>

		<div v-if="showJustInfo && selectedTaskProcedure" class="section-row">
			<TaskProcedureInfo
				:isLoading="taskProceduresLoading"
				:taskProcedure="selectedTaskProcedure"
			/>
		</div>

		<el-dialog
			v-model="taskProceduresDialogVisible"
			center
			:show-close="false"
			append-to-body
			class="small rounded hide-header hide-body"
		>
			<TaskProcedureInfo
				showClose
				:isLoading="taskProceduresLoading"
				:taskProcedure="selectedTaskProcedure"
				@closeDialog="taskProceduresDialogVisible = false"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, reactive, ref, shallowRef } from 'vue';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	MAINTENANCE_TYPES,
	PERIOD_METHODS,
	PERIOD_TYPES,
	SNOOZE_RANGE_TYPES,
	WORK_ORDER_STATUSES_TYPES,
	periodMethodsList,
	periodsTypesList,
	snoozeRangeTypesList as getSnoozeRangeTypesList,
	workOrdersStatusesList as getWorkOrdersStatusesList,
} from '@/constants/global';
import { required } from '@/constants/validation';
import { findItemBy, getDateRange, getLocaleStringDateRange } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useTabs } from '@/composables/mixins/useTabs';

import Datepicker from '@/components/common/Datepicker.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import InfoCell from '@/components/itemDetails/InfoItem.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import TabsBar from '@/components/common/TabsBar.vue';
import PartItem from '@/views/TaskProcedures/PartItem.vue';
import DateItem from './DateItem.vue';
import TaskProcedureInfo from './TaskProcedureInfo.vue';

const { tt } = Lang;

defineOptions({
	name: 'WorkOrderItemForm',
});

const props = defineProps(buildProps({
	isRecurring: Boolean,
	new_item_type: Number,
	formSettings: { type: Object, default: () => ({}) },
}));

const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const itemFormRef = ref(null);
const refsMap = reactive({});
const productionLinesList = shallowRef([]);
const machinesList = shallowRef([]);
const assetsList = shallowRef([]);
const equipmentsList = shallowRef([]);
const teamsList = shallowRef([]);
const usersList = shallowRef([]);
const woTypesList = shallowRef([]);
const taskProceduresList = shallowRef([]);
const partsList = shallowRef([]);
const productionLinesLoading = ref(false);
const machinesLoading = ref(false);
const assetsLoading = ref(false);
const equipmentsLoading = ref(false);
const teamsLoading = ref(false);
const usersLoading = ref(false);
const woTypesLoading = ref(false);
const taskProceduresLoading = ref(false);
const partsLoading = ref(false);
const attachmentsList = shallowRef([]);
const imagesList = shallowRef([]);
const partsItemsList = ref([]);
const datesItemsList = ref([]);
const taskProceduresDialogVisible = ref(false);
const snooze = ref(false);
const hasSnoozeAlert = ref(false);
const changeSnoozeRange = ref(false);
const snoozeDateRange = ref([]);
const periodDateRange = ref([]);
const periodMethod = ref(PERIOD_METHODS.PERIOD_TYPE);
const mainInstancesError = ref(false);

const formData = ref({
	type: MAINTENANCE_TYPES.WORK_ORDER,
	plant_id: null,
	title: '',
	status: WORK_ORDER_STATUSES_TYPES.PENDING,
	category_id: null,
	finish_date: null,
	description: '',
	production_line_id: null,
	machine_id: null,
	asset_id: null,
	equipment_id: null,
	task_procedure_id: null,
	team_id: null,
	users_ids: [],
	attachments: [],
	images: [],
	snooze_alert: {
		time_period: SNOOZE_RANGE_TYPES.DAY,
	},
	parts: [],
	is_periodic: false,
	period_type: null,
	period_frequency: null,
	period_started_at: '',
	period_finished_at: '',
	period_dates: [],
});

const rules = computed(() => ({
	title: required,
	status: required,
	...(props.isRecurring ? {} : { finish_date: required }),
	description: required,
}));

const showJustInfo = computed(() => !!props.settings?.showJustInfo);
const filteredWorkOrdersStatusesList = computed(() =>
	Object.freeze(
		getWorkOrdersStatusesList().filter((statusItem) =>
			statusItem.userTypes
				? statusItem.userTypes.some(
					(type) => authStore.isIndustrialMatrix || authStore.authUser?.role?.type === type,
				)
				: true,
		),
	)
);
const translatedPeriodMethodsList = computed(() => Object.freeze(Lang.translate(periodMethodsList)));
const translatedPeriodsTypesList = computed(() => Object.freeze(Lang.translate(periodsTypesList)));
const snoozeRangeTypesList = computed(() => Object.freeze(getSnoozeRangeTypesList()));
const periodsPickerOptions = Object.freeze({
	disabledDate(date) {
		const today = getDateRange('today');
		return date.getTime() <= today[1].getTime();
	},
});
const frequenciesList = computed(() => {
	const list = [];
	for (let i = 1; i < 13; i += 1) {
		const postfix = i === 1 ? '' : 's';
		const idx = i === 1 ? '' : i;
		list.push({
			id: i,
			name: i,
			[PERIOD_TYPES.WEEKLY]: `${tt('every')} ${idx} ${tt('week')}${postfix}`,
			[PERIOD_TYPES.MONTHLY]: `${tt('every')} ${idx} ${tt('month')}${postfix}`,
			[PERIOD_TYPES.YEARLY]: `${tt('every')} ${idx} ${tt('year')}${postfix}`,
		});
	}
	return Object.freeze(list);
});
const plantId = computed(
	() =>
		props.itemData?.plant_id ||
		props.additionalSettings?.plantId ||
		formData.value.plant_id ||
		null,
);
const tabsList = computed(() =>
	Object.freeze([
		{ title: tt('phrases.technician_users'), prop: 'usersTab' },
		{ title: tt('phrases.teams_in_the_plant'), prop: 'teamsTab' },
	])
);
const { activeTab, switchTab } = useTabs({ tabsList });
const selectedTaskProcedure = computed(() => {
	if (formData.value.task_procedure_id && taskProceduresList.value.length) {
		return Object.freeze(findItemBy('id', formData.value.task_procedure_id, taskProceduresList.value));
	}
	return null;
});
const taskHasParts = computed(() => {
	const processes = selectedTaskProcedure.value?.processes || [];
	return processes.some((processItem) => !!processItem.parts?.length);
});
const assignedUsers = computed(() => {
	if (!showJustInfo.value || !props.itemData?.users_ids?.length || !usersList.value.length) return '';
	return props.itemData.users_ids
		.map((id) => usersList.value.find((user) => user.id === id)?.full_name)
		.filter(Boolean)
		.join(', ');
});
const assetQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_assets,
		fetchByIdAction: methodsMap.fetch_asset,
		params: {
			plantId: plantId.value,
			machine_id: formData.value.machine_id,
			production_line_id: formData.value.production_line_id,
		},
	})
);
const equipmentsQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_equipments,
		fetchByIdAction: methodsMap.fetch_equipment,
		params: {
			plantId: plantId.value,
			machine_id: formData.value.machine_id,
			production_line_id: formData.value.production_line_id,
			asset_id: formData.value.asset_id,
		},
	})
);
const equipmentLabelOptions = Object.freeze({
	accessors: ['brand_name', 'machine_name', 'production_line_name', 'location_name'],
	delimeter: ',',
});
const periodMethodRadioOptions = Object.freeze({
	className: 'radio-input',
	inline: true,
});

const methodsMap = {
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
	fetch_assets: createGetRequest(ENTITIES.Assets.apiBase),
	fetch_asset: createGetByIdRequest(ENTITIES.Assets.apiBase),
	fetch_equipments: createGetRequest(ENTITIES.Equipments.apiBase),
	fetch_equipment: createGetByIdRequest(ENTITIES.Equipments.apiBase),
	fetch_teams: createGetRequest(ENTITIES.Teams.apiBase),
	fetch_users: createGetRequest(ENTITIES.Users.apiBase),
	fetch_work_order_types: createGetRequest(ENTITIES.MaintenanceCategories.apiBase),
	fetch_task_procedures: createGetRequest(ENTITIES.TaskProcedures.apiBase),
	fetch_parts: createGetRequest(ENTITIES.Parts.apiBase),
};

const requestsToDoList = computed(() =>
	Object.freeze([
		{
			actionName: 'fetch_task_procedures',
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [{ getValue: () => plantId.value, param: 'plantId' }],
			localProp: taskProceduresList,
			localLoadProp: taskProceduresLoading,
		},
		{
			actionName: 'fetch_teams',
			bindTo: [
				{
					getValue: () => plantId.value,
					param: 'plantId',
					onTrigger: () => {
						formData.value.team_id = null;
					},
				},
			],
			localProp: teamsList,
			localLoadProp: teamsLoading,
		},
		{
			actionName: 'fetch_users',
			bindTo: [
				{
					getValue: () => plantId.value,
					param: 'plantId',
					onTrigger: () => {
						formData.value.users_ids = [];
					},
				},
			],
			localProp: usersList,
			localLoadProp: usersLoading,
		},
		{
			actionName: 'fetch_parts',
			payload: { params: { plantId: () => plantId.value } },
			localProp: partsList,
			localLoadProp: partsLoading,
		},
		{
			actionName: 'fetch_work_order_types',
			bindTo: [
				{
					getValue: () => plantId.value,
					param: 'plantId',
					onTrigger: () => {
						formData.value.category_id = null;
					},
				},
			],
			localProp: woTypesList,
			localLoadProp: woTypesLoading,
		},
		{
			actionName: 'fetch_production_lines',
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [{ getValue: () => plantId.value, param: 'plantId' }],
			localProp: productionLinesList,
			localLoadProp: productionLinesLoading,
		},
		{
			actionName: 'fetch_machines',
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [
				{ getValue: () => plantId.value, param: 'plantId' },
				{
					getValue: () => formData.value.production_line_id,
					param: 'productionLineId',
					onTrigger: () => {
						formData.value.machine_id = null;
					},
				},
			],
			localProp: machinesList,
			localLoadProp: machinesLoading,
		},
		{
			actionName: 'fetch_assets',
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			hasValueCase: {
				getValue: () => formData.value.asset_id,
				fetchItemActionName: 'fetch_asset',
			},
			bindTo: [
				{ getValue: () => plantId.value, param: 'plantId', noFetch: true },
				{
					getValue: () => formData.value.production_line_id,
					param: 'productionLineId',
					onTrigger: () => {
						formData.value.asset_id = null;
					},
				},
				{
					getValue: () => formData.value.machine_id,
					param: 'machineId',
					onTrigger: () => {
						formData.value.asset_id = null;
					},
				},
			],
			localProp: assetsList,
			localLoadProp: assetsLoading,
		},
		{
			actionName: 'fetch_equipments',
			hasValueCase: {
				getValue: () => formData.value.equipment_id,
				fetchItemActionName: 'fetch_equipment',
			},
			bindTo: [
				{ getValue: () => plantId.value, param: 'plantId', noFetch: true },
				{
					getValue: () => formData.value.production_line_id,
					param: 'productionLineId',
					onTrigger: () => {
						formData.value.equipment_id = null;
					},
				},
				{
					getValue: () => formData.value.machine_id,
					param: 'machineId',
					onTrigger: () => {
						formData.value.equipment_id = null;
					},
				},
				{
					getValue: () => formData.value.asset_id,
					param: 'assetId',
					onTrigger: () => {
						formData.value.equipment_id = null;
					},
				},
			],
			localProp: equipmentsList,
			localLoadProp: equipmentsLoading,
		},
	]),
);

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'PartItem', targetProp: 'parts' },
		{ ref: 'DateItem', targetProp: 'period_dates' },
		{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments', removeFilePropIfNull: true },
		{ ref: 'ImgUploadBlock', targetProp: 'images', removeFilePropIfNull: true },
	])
);

const getTaskProcedureParts = (arg = {}, data = {}) => {
	arg ? null : null;
	const parts = data.parts || [];
	return `<div>${parts
		.map((partItem) => `${partItem.stockPart?.part_number || ''} - ${partItem.quantity || ''}`)
		.join('')}</div>`;
};

const togglePreviewModal = (data) => {
	emit('event', {
		eventName: 'togglePreviewModal',
		data,
		onward: true,
	});
};

const prepareRangeStr = (data) => {
	if (data?.date_start) {
		return getLocaleStringDateRange([data.date_start, data.date_finish]);
	}
	return '';
};

const createPart = () => {
	globalStore.show_edit_modal({
		editModalProp: 'editModalClassicSecond',
		show: true,
		instanceName: 'Parts',
		size: 'small',
		instanceData: {
			plant_id: props.additionalSettings?.plantId,
		},
		settings: {
			fromAnotherInstance: true,
			disablePlant: true,
		},
		title: tt('phrases.Create_Part'),
		formComponentFileLoader: () => import('@/views/Parts/ItemForm.vue'),
		callback: partCreated,
	});
};

const partCreated = ({ data } = {}) => {
	const requestOption = requestsToDoList.value[3];
	if (requestOption) startFetchAction(requestOption);

	if (data?.data) {
		addFormItem(partsItemsList, 'p_i-', {
			formData: { part_id: data.data.id },
		});
	}

	globalStore.show_edit_modal({ show: false, editModalProp: 'editModalClassicSecond' });
};

const createWOType = () => {
	globalStore.show_edit_modal({
		editModalProp: 'editModalClassicSecond',
		show: true,
		instanceName: 'MaintenanceCategories',
		size: 'small',
		settings: {
			fromAnotherInstance: true,
		},
		title: tt('phrases.Create_Work_Order_Type'),
		formComponentFileLoader: () => import('@/views/MaintenanceCategories/ItemForm.vue'),
		callback: woTypeCreated,
	});
};

const woTypeCreated = () => {
	const requestOption = requestsToDoList.value[4];
	if (requestOption) startFetchAction(requestOption);
	globalStore.show_edit_modal({ show: false, editModalProp: 'editModalClassicSecond' });
};

const localSetupPage = (item) => {
	if (props.isRecurring) {
		formData.value.is_periodic = true;
	}
	formData.value.plant_id = props.additionalSettings?.plantId || item?.plant_id || formData.value.plant_id;

	if (!item) return;

	attachmentsList.value = item.attachments || [];
	imagesList.value = item.images || [];
	partsItemsList.value = setupFormSubItemsList(item.parts, 'p_i');

	if (item.snooze_alert) {
		snooze.value = true;
		hasSnoozeAlert.value = true;
		if (item.snooze_alert.time_period === SNOOZE_RANGE_TYPES.CUSTOM_RANGE) {
			snoozeDateRange.value = [item.snooze_alert.date_start, item.snooze_alert.date_finish];
		}
	}

	if (props.isRecurring) {
		if (item.period_type) {
			periodDateRange.value = [item.period_started_at, item.period_finished_at];
		} else {
			periodMethod.value = PERIOD_METHODS.PERIOD_DATES;
			datesItemsList.value = setupFormSubItemsList(item.period_dates, 'd_i');
		}
	}

	if (item.team_id) {
		switchTab(tabsList.value[1]);
	}
};

const localValidationHook = () => {
	const hasMainInstance = [
		'production_line_id',
		'machine_id',
		'asset_id',
		'equipment_id',
	].some((prop) => !!formData.value[prop]);

	mainInstancesError.value = !hasMainInstance;
	return hasMainInstance;
};

const localPrepareSubmitData = (data) => {
	const preparedData = {
		...data,
		type: MAINTENANCE_TYPES.WORK_ORDER,
		is_periodic: props.isRecurring ? 1 : 0,
	};

	if (snooze.value) {
		if (
			(!hasSnoozeAlert.value || changeSnoozeRange.value) &&
			preparedData.snooze_alert?.time_period === SNOOZE_RANGE_TYPES.CUSTOM_RANGE
		) {
			preparedData.snooze_alert.date_start = snoozeDateRange.value[0];
			preparedData.snooze_alert.date_finish = snoozeDateRange.value[1];
		}
	} else {
		delete preparedData.snooze_alert;
	}

	if (props.isRecurring) {
		if (periodMethod.value === PERIOD_METHODS.PERIOD_TYPE) {
			preparedData.period_started_at = periodDateRange.value[0];
			preparedData.period_finished_at = periodDateRange.value[1];
			delete preparedData.period_dates;
		} else {
			delete preparedData.period_started_at;
			delete preparedData.period_finished_at;
			delete preparedData.period_frequency;
			delete preparedData.period_type;
			preparedData.period_dates = (preparedData.period_dates || []).map((item) =>
				item && typeof item === 'object' ? item.date || item.value : item
			);
		}
		delete preparedData.finish_date;
	} else {
		delete preparedData.period_started_at;
		delete preparedData.period_finished_at;
		delete preparedData.period_frequency;
		delete preparedData.period_type;
		delete preparedData.period_dates;
	}

	if (preparedData.users_ids?.length) {
		delete preparedData.team_id;
	} else if (preparedData.team_id) {
		delete preparedData.users_ids;
	}

	return preparedData;
};

const preparePayload = (payload) => {
	const nextPayload = {
		...payload,
		data: {
			...payload.data,
			attachments: payload.data.attachments || [],
			images: payload.data.images || [],
			production_line_id: payload.data.production_line_id || null,
			machine_id: payload.data.machine_id || null,
			asset_id: payload.data.asset_id || null,
			equipment_id: payload.data.equipment_id || null,
		},
	};

	const hasNewAttach = nextPayload.data.attachments.some((item) => !!item.file);
	const hasNewImg = nextPayload.data.images.some((item) => !!item.file);

	if (hasNewAttach || hasNewImg) {
		nextPayload.withFile = true;
	}

	return nextPayload;
};

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const { startFetchAction } = useRequestsList({
	methodsMap,
	requestsToDoList,
});

const { isMobile, validateForm, handleCancel } = useItemForm({
	entityKey: 'WorkOrders',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	fromAnotherInstance: props.fromAnotherInstance,
	formSettings: props.formSettings,
	localSetupPage,
	localValidationHook,
	localPrepareSubmitData,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	preparePayload,
	emit,
});

defineExpose({
	validateForm,
});
</script>
