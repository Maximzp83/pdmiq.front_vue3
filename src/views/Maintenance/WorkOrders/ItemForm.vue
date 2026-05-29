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
			<div class="el-form-item flex mrow wrap">
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
							:optionsList="workOrdersStatusesList"
							:placeholder="`${tt('select')} ${tt('status')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('Work_Order_Type')" prop="category_id">
						<CustomSelectV2
							v-model="formData.category_id"
							filterable
							clearable
							:optionsLoading="woTypesLoading"
							:optionsList="woTypesList"
							:placeholder="tt('type')"
						/>
					</el-form-item>

					<el-form-item v-if="!isRecurring" :label="tt('Due_Date')" prop="finish_date" required>
						<Datepicker v-model="formData.finish_date" :placeholder="`${tt('Select')} ${tt('date')}`" />
					</el-form-item>

					<template v-if="isRecurring">
						<el-form-item :label="tt('Period')" prop="period_type">
							<CustomSelectV2
								v-model="periodMethod"
								:optionsList="translatedPeriodMethodsList"
								:placeholder="tt('Period')"
							/>
						</el-form-item>

						<div v-if="periodMethod === PERIOD_METHODS.PERIOD_TYPE">
							<el-form-item :label="tt('Period')" prop="period_type" required>
								<CustomSelectV2
									v-model="formData.period_type"
									:optionsList="periodsTypesList"
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
								<Datepicker v-model="periodDateRange" type="daterange" />
							</el-form-item>
						</div>

						<el-form-item v-else :label="tt('Period_Dates')" prop="period_dates">
							<div v-if="datesItemsList.length" class="content-row">
								<DateItem
									v-for="(item, idx) in datesItemsList"
									:key="`date_item-${item.id}`"
									:ref="(el) => setSubItemRef('DateItem', el, idx)"
									:item-data="item"
									@onRemove="(id) => removeFormItem(id, datesItemsList)"
								/>
							</div>

							<div class="create-button-container content-row">
								<el-button
									class="action-button create-button"
									type="success"
									icon="icomoon icon-cross"
									@click="addFormItem(datesItemsList, 'd_i-')"
								/>
							</div>
						</el-form-item>
					</template>

					<div v-if="!isRecurring" class="el-form-item" v-show="snooze">
						<el-form-item :label="tt('Snooze')" prop="time_period">
							<CustomSelectV2
								v-model="formData.snooze_alert.time_period"
								:optionsList="snoozeRangeTypesList"
								:placeholder="`${tt('Select')} ${tt('range')}`"
							/>
						</el-form-item>

						<el-form-item
							v-if="formData.snooze_alert.time_period === SNOOZE_RANGE_TYPES.CUSTOM_RANGE"
							label=""
							prop="daterange"
						>
							<Datepicker v-model="snoozeDateRange" type="daterange" />
						</el-form-item>
					</div>

					<el-form-item v-if="!isRecurring" label="" prop="snooze">
						<el-checkbox v-model="snooze">
							<b>{{ tt('phrases.Snooze_Alerts') }}</b>
						</el-checkbox>
					</el-form-item>

					<el-form-item :label="tt('Description')" prop="description" required>
						<el-input v-model="formData.description" type="textarea" :rows="5" />
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
									:pictures="imagesList"
								/>
							</el-form-item>
						</div>
					</div>

					<el-form-item :label="tt('Parts')" prop="parts" class="parts">
						<div v-if="partsItemsList.length" class="content-row">
							<PartItem
								v-for="(item, idx) in partsItemsList"
								:key="`part_item-${item.id}`"
								:ref="(el) => setSubItemRef('PartItem', el, idx)"
								:item-data="item"
								:item-index="idx"
								:partsList="partsList"
								:partsLoading="partsLoading"
								@onRemove="(id) => removeFormItem(id, partsItemsList)"
							/>
						</div>

						<div class="create-button-container content-row">
							<el-button
								class="action-button create-button"
								type="success"
								icon="icomoon icon-cross"
								@click="addFormItem(partsItemsList, 'p_i-')"
							/>
						</div>
					</el-form-item>
				</div>

				<div class="mcol-xs-12 mcol-sm-6">
					<el-form-item :label="tt('Production_Line')" prop="production_line_id">
						<CustomSelectV2
							v-model="formData.production_line_id"
							filterable
							clearable
							:optionsLoading="productionLinesLoading"
							:optionsList="productionLinesList"
							:placeholder="tt('Production_Line')"
						/>
					</el-form-item>

					<el-form-item :label="tt('Machine')" prop="machine_id">
						<CustomSelectV2
							v-model="formData.machine_id"
							filterable
							clearable
							:optionsLoading="machinesLoading"
							:optionsList="machinesList"
							:placeholder="tt('Machine')"
						/>
					</el-form-item>

					<el-form-item :label="tt('Asset')" prop="asset_id">
						<CustomSelectV2
							v-model="formData.asset_id"
							filterable
							clearable
							:optionsLoading="assetsLoading"
							:optionsList="assetsList"
							:placeholder="tt('Asset')"
						/>
					</el-form-item>

					<el-form-item :label="tt('item')" prop="equipment_id">
						<CustomSelectV2
							v-model="formData.equipment_id"
							filterable
							clearable
							:optionsLoading="equipmentsLoading"
							:optionsList="equipmentsList"
							:placeholder="tt('item')"
						/>
					</el-form-item>

					<el-form-item :label="tt('Team')" prop="team_id">
						<CustomSelectV2
							v-model="formData.team_id"
							filterable
							clearable
							:optionsLoading="teamsLoading"
							:optionsList="teamsList"
							:placeholder="tt('Team')"
						/>
					</el-form-item>

					<el-form-item :label="tt('Assigned_Users')" prop="users_ids">
						<CustomSelectV2
							v-model="formData.users_ids"
							filterable
							multiple
							collapse-tags
							clearable
							:optionsLoading="usersLoading"
							:optionsList="usersList"
							labelKey="full_name"
							:placeholder="tt('Users')"
						/>
					</el-form-item>

					<el-form-item :label="tt('Task_Procedures')" prop="task_procedure_id">
						<CustomSelectV2
							v-model="formData.task_procedure_id"
							filterable
							clearable
							:optionsLoading="taskProceduresLoading"
							:optionsList="taskProceduresList"
							:placeholder="`${tt('Select')} ${tt('Task')}`"
						/>
					</el-form-item>
				</div>
			</div>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, reactive, ref, shallowRef } from 'vue';

import { createGetRequest } from '@/api/request_factories';
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
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import Datepicker from '@/components/common/Datepicker.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import PartItem from '@/views/TaskProcedures/PartItem.vue';
import DateItem from './DateItem.vue';

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
const snooze = ref(false);
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

const workOrdersStatusesList = computed(() => Object.freeze(getWorkOrdersStatusesList()));
const translatedPeriodMethodsList = computed(() => Object.freeze(Lang.translate(periodMethodsList)));
const snoozeRangeTypesList = computed(() => Object.freeze(getSnoozeRangeTypesList()));
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

const methodsMap = {
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
	fetch_assets: createGetRequest(ENTITIES.Assets.apiBase),
	fetch_equipments: createGetRequest(ENTITIES.Equipments.apiBase),
	fetch_teams: createGetRequest(ENTITIES.Teams.apiBase),
	fetch_users: createGetRequest(ENTITIES.Users.apiBase),
	fetch_work_order_types: createGetRequest(ENTITIES.MaintenanceCategories.apiBase),
	fetch_task_procedures: createGetRequest(ENTITIES.TaskProcedures.apiBase),
	fetch_parts: createGetRequest(ENTITIES.Parts.apiBase),
};

const requestsToDoList = computed(() =>
	Object.freeze([
		{ actionName: 'fetch_production_lines', localProp: productionLinesList, localLoadProp: productionLinesLoading },
		{ actionName: 'fetch_machines', localProp: machinesList, localLoadProp: machinesLoading },
		{ actionName: 'fetch_assets', localProp: assetsList, localLoadProp: assetsLoading },
		{ actionName: 'fetch_equipments', localProp: equipmentsList, localLoadProp: equipmentsLoading },
		{ actionName: 'fetch_teams', localProp: teamsList, localLoadProp: teamsLoading },
		{ actionName: 'fetch_users', localProp: usersList, localLoadProp: usersLoading },
		{ actionName: 'fetch_work_order_types', localProp: woTypesList, localLoadProp: woTypesLoading },
		{ actionName: 'fetch_task_procedures', localProp: taskProceduresList, localLoadProp: taskProceduresLoading },
		{ actionName: 'fetch_parts', localProp: partsList, localLoadProp: partsLoading },
	])
);

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'PartItem', targetProp: 'parts' },
		{ ref: 'DateItem', targetProp: 'period_dates' },
		{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments', removeFilePropIfNull: true },
		{ ref: 'ImgUploadBlock', targetProp: 'images', removeFilePropIfNull: true },
	])
);

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
		if (preparedData.snooze_alert?.time_period === SNOOZE_RANGE_TYPES.CUSTOM_RANGE) {
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

useRequestsList({
	methodsMap,
	requestsToDoList,
});

defineExpose({
	validateForm,
});
</script>
