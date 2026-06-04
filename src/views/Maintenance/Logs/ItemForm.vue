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
					<div class="flex mrow wrap inline-form-items-list inline-labels align-center">
						<el-form-item prop="" class="relative mcol-xs-4 label-to-center" :label="tt('Time')">
							<el-switch v-model="isTotalActive" />
						</el-form-item>

						<div class="mcol-xs-3 semi-bold capitalize el-form-item__label p-0">
							{{ tt('Total') }}
						</div>
					</div>

					<el-form-item v-if="isTotalActive" prop="total_time" :label="tt('Total')" required class="mt-10">
						<div class="flex mrow align-center small-input-paddings">
							<div class="mcol-xs-3 lh-16">
								<label>{{ tt('hours') }}</label>
								<CustomInput
									v-model="totalHours"
									class="mini p-0"
									className="text-center"
									placeholder="00"
									:inputCallback="(val) => validateTimeInput(val, 'hours')"
								/>
							</div>
							<div class="mcol-xs-3 lh-16">
								<label class="capitalize">{{ tt('minutes') }}</label>
								<CustomInput
									v-model="totalMinutes"
									class="mini p-0"
									className="text-center"
									placeholder="00"
									:inputCallback="(val) => validateTimeInput(val, 'minutes')"
								/>
							</div>
						</div>
					</el-form-item>

					<el-form-item v-else prop="finish_time" :label="tt('time')" required class="mt-10 small-paddings-time">
						<div class="flex mrow align-center">
							<div class="mcol-xs-3 mini">
								<el-time-picker
									v-model="formData.start_time"
									value-format="HH:mm"
									format="HH:mm"
									:placeholder="tt('start')"
								/>
							</div>

							<div class="mcol-xs-3 mini">
								<el-time-picker
									v-model="formData.finish_time"
									value-format="HH:mm"
									format="HH:mm"
									:placeholder="tt('finish')"
								/>
							</div>

							<div class="mcol-xs-6 form-item">
								<div class="semi-bold span-block el-form-item__label no-paddings">
									<b>{{ tt('phrases.Total_time') }}: </b>
								</div>
								<div class="semi-bold span-block inherit-color">{{ totalTime }}</div>
							</div>
						</div>
					</el-form-item>

					<el-form-item :label="tt('Reason')" prop="reason_type">
						<CustomSelectV2
							v-model="formData.reason_type"
							clearable
							:optionsList="maintenanceReasonTypesList"
							:placeholder="tt('none')"
						/>
					</el-form-item>

					<el-form-item v-if="formData.reason_type" :label="reasonTypeName" prop="breakdown_type">
						<CustomSelectV2
							v-model="formData.breakdown_type"
							:optionsList="breakdownTypesList"
							:placeholder="`${tt('Select')} ${tt('Type')}`"
						/>
					</el-form-item>

					<el-form-item :label="tt('phrases.Problem_Solved')" prop="is_problem_solved">
						<el-switch v-model="formData.is_problem_solved" :active-value="1" :inactive-value="0" />
					</el-form-item>

					<el-form-item :label="tt('phrases.Sanitization_of_Tools')" prop="is_sanitization_equipment">
						<el-switch v-model="formData.is_sanitization_equipment" :active-value="1" :inactive-value="0" />
					</el-form-item>

					<el-form-item :label="tt('phrases.Acknowledge_by_supervisor')" prop="is_acknowledge_by_supervisor">
						<el-switch v-model="formData.is_acknowledge_by_supervisor" :active-value="1" :inactive-value="0" />
					</el-form-item>

					<el-form-item :label="`${tt('Supervisor')} ${tt('notes')}`" prop="supervisor_notes">
						<CustomInput v-model="formData.supervisor_notes" placeholder="-" />
					</el-form-item>

					<el-form-item :label="tt('Shift')" prop="shift">
						<CustomSelectV2
							v-model="formData.shift"
							:optionsList="shiftValues"
							:placeholder="`${tt('Select')} ${tt('shift')}`"
							labelKey="label"
						/>
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
									:enableLinkToFile="!!itemId"
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
				</div>

				<div class="mcol-xs-12 mcol-sm-6">
					<div :class="['card filled no-shadow el-form-item', { 'has-error': mainInstancesError }]">
						<div class="card-content" @click="mainInstancesError = false">
							<div class="semi-bold title article-title">{{ tt('Equipment') }}</div>

							<el-form-item :label="tt('Production_Line')" prop="production_line_id">
								<CustomSelectV2
									v-model="formData.production_line_id"
									filterable
									clearable
									:optionsLoading="productionLinesLoading"
									:optionsList="productionLinesList"
									:placeholder="tt('Production_Line')"
									@focus="mainInstancesError = false"
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
									@focus="mainInstancesError = false"
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
									@focus="mainInstancesError = false"
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
									@focus="mainInstancesError = false"
								/>
							</el-form-item>
						</div>
					</div>

					<div class="alarm-color content-row" v-show="mainInstancesError">
						{{ tt('phrases.at_least_one_of_these_fields_is_required') }}
					</div>

					<el-form-item :label="tt('Task_procedure')" prop="task_procedure_id">
						<CustomSelectV2
							v-model="formData.task_procedure_id"
							filterable
							clearable
							:optionsLoading="taskProceduresLoading"
							:optionsList="taskProceduresList"
							:placeholder="tt('Task_procedure')"
						/>
					</el-form-item>
				</div>
			</div>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, reactive, ref, shallowRef, watch } from 'vue';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	BREAKDOWN_TYPES,
	MAINTENANCE_TYPES,
	breakdownTypesList as getBreakdownTypesList,
	maintenanceReasonTypesList as getMaintenanceReasonTypesList,
} from '@/constants/global';
import { required } from '@/constants/validation';
import { getTimeDifference, findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'MaintenanceLogItemForm',
});

const props = defineProps(buildProps({
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
const taskProceduresList = shallowRef([]);
const productionLinesLoading = ref(false);
const machinesLoading = ref(false);
const assetsLoading = ref(false);
const equipmentsLoading = ref(false);
const taskProceduresLoading = ref(false);
const attachmentsList = shallowRef([]);
const imagesList = shallowRef([]);
const mainInstancesError = ref(false);
const isTotalActive = ref(false);
const totalHours = ref('');
const totalMinutes = ref('');

const formData = ref({
	type: MAINTENANCE_TYPES.LOG,
	plant_id: null,
	parent_id: null,
	start_time: '',
	finish_time: '',
	total_time: 0,
	reason_type: null,
	breakdown_type: 0,
	is_problem_solved: 0,
	is_sanitization_equipment: 0,
	is_acknowledge_by_supervisor: 0,
	supervisor_notes: '',
	shift: '',
	attachments: [],
	images: [],
	description: '',
	production_line_id: null,
	machine_id: null,
	asset_id: null,
	equipment_id: null,
	task_procedure_id: null,
});

const rules = {
	description: required,
};

const maintenanceReasonTypesList = computed(() => Object.freeze(getMaintenanceReasonTypesList()));
const breakdownTypesList = computed(() => Object.freeze(getBreakdownTypesList()));
const reasonTypeName = computed(() => {
	const item = findItemBy('id', formData.value.reason_type, maintenanceReasonTypesList.value);
	return item?.name || tt('none');
});
const shiftValues = Object.freeze([
	{ id: 'Day', label: 'Day' },
	{ id: 'Afternoon', label: 'Afternoon' },
	{ id: 'Night', label: 'Night' },
]);
const totalTime = computed(() => {
	const { start_time, finish_time } = formData.value;
	if (start_time && finish_time) {
		const { hours, minutes } = getTimeDifference({
			from: start_time,
			to: finish_time,
			timeOnly: true,
			nextDayWhenLessZero: true,
		});
		if (hours) return `${hours}h ${minutes}min`;
		return `${minutes} minutes`;
	}
	return 0;
});
const plantId = computed(
	() =>
		props.itemData?.plant_id ||
		props.additionalSettings?.plantId ||
		formData.value.plant_id ||
		null,
);

const methodsMap = {
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
	fetch_assets: createGetRequest(ENTITIES.Assets.apiBase),
	fetch_asset: createGetByIdRequest(ENTITIES.Assets.apiBase),
	fetch_equipments: createGetRequest(ENTITIES.Equipments.apiBase),
	fetch_equipment: createGetByIdRequest(ENTITIES.Equipments.apiBase),
	fetch_task_procedures: createGetRequest(ENTITIES.TaskProcedures.apiBase),
};

const requestsToDoList = computed(() => {
	const list = [
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
				{ getValue: () => formData.value.production_line_id, param: 'productionLineId' },
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
				{ getValue: () => formData.value.production_line_id, param: 'productionLineId' },
				{ getValue: () => formData.value.machine_id, param: 'machineId' },
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
				{ getValue: () => formData.value.production_line_id, param: 'productionLineId' },
				{ getValue: () => formData.value.machine_id, param: 'machineId' },
				{ getValue: () => formData.value.asset_id, param: 'assetId' },
			],
			localProp: equipmentsList,
			localLoadProp: equipmentsLoading,
		},
	];

	if (props.additionalSettings?.taskProcedure) {
		list.push({
			actionName: 'fetch_task_procedures',
			payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
			bindTo: [{ getValue: () => plantId.value, param: 'plantId' }],
			localProp: taskProceduresList,
			localLoadProp: taskProceduresLoading,
		});
	}

	return Object.freeze(list);
});

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'AttachmentsUploadBlock', targetProp: 'attachments', removeFilePropIfNull: true },
		{ ref: 'ImgUploadBlock', targetProp: 'images', removeFilePropIfNull: true },
	])
);

const validateTimeInput = (time, prop) => {
	if (Number.isNaN(Number(time))) {
		time = `${time}`.slice(0, -1);
	}
	if (prop === 'minutes' && Number(time) > 59) time = '59';
	if (time && `${time}`.length === 1) return `0${time}`;
	if (time && `${time}`.length > 2 && `${time}`[0] === '0') return `${time}`.slice(1);
	return time;
};

const calcTotalSec = (hours, minutes) => Number(hours || 0) * 3600 + Number(minutes || 0) * 60;

const localSetupPage = (item) => {
	formData.value.plant_id = props.additionalSettings?.plantId || item?.plant_id || formData.value.plant_id;

	if (item) {
		attachmentsList.value = item.attachments || [];
		imagesList.value = item.images || [];
		if (!item.start_time && !item.finish_time) {
			isTotalActive.value = true;
		}
		if (item.total_time) {
			totalHours.value = Math.floor(item.total_time / 3600);
			totalMinutes.value = Math.round((item.total_time % 3600) / 60);
		}
		return;
	}

	const { productionLineId, machineId, assetId, equipmentId, parent_id } = props.additionalSettings || {};
	formData.value = {
		...formData.value,
		parent_id: parent_id || null,
		production_line_id: productionLineId || null,
		machine_id: machineId || null,
		asset_id: assetId || null,
		equipment_id: equipmentId || null,
	};
};

const localValidationHook = () => {
	const hasMainInstance = [
		'production_line_id',
		'machine_id',
		'asset_id',
		'equipment_id',
	].some((prop) => !!formData.value[prop]);

	mainInstancesError.value = !hasMainInstance;
	if (!hasMainInstance) return false;

	if (!isTotalActive.value && formData.value.start_time && formData.value.finish_time) {
		const { minutes_total } = getTimeDifference({
			from: formData.value.start_time,
			to: formData.value.finish_time,
			timeOnly: true,
			nextDayWhenLessZero: true,
		});
		if (minutes_total < 15) return false;
	}

	return !(formData.value.reason_type && !formData.value.breakdown_type);
};

const localPrepareSubmitData = (data) => {
	const preparedData = {
		...data,
		type: MAINTENANCE_TYPES.LOG,
	};

	if (!preparedData.reason_type) {
		delete preparedData.breakdown_type;
	}

	if (isTotalActive.value) {
		delete preparedData.start_time;
		delete preparedData.finish_time;
		preparedData.total_time = calcTotalSec(totalHours.value, totalMinutes.value);
	} else {
		delete preparedData.total_time;
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
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const { isMobile, itemId, validateForm, handleCancel, clearValidate } = useItemForm({
	entityKey: 'MaintenanceLogs',
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

watch(isTotalActive, () => {
	clearValidate(['finish_time']);
});
</script>
