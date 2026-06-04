<template>
	<div class="edit-form-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
		<el-form
			ref="itemFormRef"
			:class="['item-edit-form', { showJustInfo }]"
			:model="formData"
			:rules="rules"
			label-width="150px"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<el-form-item :label="tt('Name')" prop="name">
				<CustomInput
					v-model="formData.name"
					required
					:placeholder="showJustInfo ? '-' : tt('name')"
				/>
			</el-form-item>

			<el-form-item :label="tt('plant')" prop="plant_id">
				<CustomSelectV2
					v-model="formData.plant_id"
					filterable
					:optionsLoading="plantsLoading"
					:optionsList="plantsList"
					:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('plant')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Controller')" prop="controller_id">
				<CustomSelectV2
					v-model="formData.controller_id"
					filterable
					:optionsLoading="controllersLoading"
					:optionsList="controllersList"
					:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('controller')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Production_Line')" prop="production_line_id">
				<CustomSelectV2
					v-model="formData.production_line_id"
					filterable
					:optionsLoading="productionLinesLoading"
					:optionsList="productionLinesList"
					:placeholder="tt('select')"
				/>
			</el-form-item>

			<el-form-item v-if="isIndustrialMatrix || canEdit" :label="tt('Machines')" prop="machines_ids">
				<CustomSelectV2
					v-model="formData.machines_ids"
					filterable
					multiple
					collapse-tags
					className="multiple-select"
					:optionsLoading="machinesLoading"
					:optionsList="machinesList"
					:placeholder="`${tt('Select')} ${tt('machines')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Node')" prop="order_action">
				<el-select v-model="formData.order_action" :placeholder="`${tt('Select')} ${tt('port')}`">
					<el-option
						v-for="item in portsList"
						:key="`order_action-${item}`"
						:label="item"
						:value="item"
					/>
				</el-select>
			</el-form-item>

			<el-form-item
				:label="`${tt('Process')} ${tt('image')}`"
				prop="pictures"
				class="upload-form-item"
			>
				<FileUploadBlock
					ref="fileUploadBlockRef"
					multiple
					rotate
					showDeleteButton
					:enableReorderFiles="{ appendTo: 'body', formKey: 'display_order' }"
					:pictures="itemPictures"
				/>
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

				<el-form-item
					:label="tt('work_days')"
					prop="week_work_days"
					class="mcol-xs-12 mcol-sm-9"
				>
					<CustomSelectV2
						v-model="formData.week_work_days"
						multiple
						className="multiple-select"
						:optionsList="weekDaysList"
						:placeholder="`${tt('select')} ${tt('days')}`"
					/>
				</el-form-item>

				<el-form-item
					:label="tt('work_time')"
					prop="finish_work_day"
					class="small-paddings-time mcol-xs-12 mcol-sm-9"
				>
					<div class="flex mrow">
						<div class="mcol-xs-6">
							<el-time-select
								v-model="formData.start_work_day"
								value-format="HH:mm"
								:placeholder="tt('start')"
								:picker-options="timePickerOptions"
								@blur="clearValidate(['finish_work_day'])"
								@change="handleStartTimeChange"
							/>
						</div>

						<div class="mcol-xs-6">
							<el-time-select
								v-model="formData.finish_work_day"
								:disabled="!formData.start_work_day"
								value-format="HH:mm"
								:placeholder="tt('finish')"
								:picker-options="endTimePickerOptions"
								@blur="clearValidate(['finish_work_day'])"
							/>
						</div>
					</div>
				</el-form-item>

				<el-form-item prop="production_hourly_rate" class="mcol-xs-12 mcol-sm-9">
					<template #label>
						<div class="label-slot">
							<label class="is-required">{{ tt('Run_rate') }}</label>
						</div>
					</template>

					<el-input v-model="formData.production_hourly_rate" />
				</el-form-item>

				<el-form-item prop="expected_downtime_minutes" class="mcol-xs-12 mcol-sm-9">
					<template #label>
						<div class="label-slot">
							<label class="is-required">{{ `${tt('Stop_Time')} (${tt('minutes')})` }}</label>
						</div>
					</template>

					<el-input-number v-model="formData.expected_downtime_minutes" :min="1" />
				</el-form-item>

				<el-form-item
					:label="tt('phrases.further_below_run_rate_percent')"
					prop="extremal_deviation_percent"
					class="mcol-xs-12 mcol-sm-9"
				>
					<el-input-number
						v-model="formData.extremal_deviation_percent"
						:min="0"
						:max="100"
					/>
				</el-form-item>

				<el-form-item :label="tt('Breaktime')" prop="work_breaks" class="mcol-xs-12 mcol-sm-9">
					<div class="options-container">
						<div v-if="breakTimeItemsList.length" class="content-row">
							<BreakTimeItem
								v-for="(item, idx) in breakTimeItemsList"
								ref="breakTimeItemRefs"
								:key="`break-time-item-${item.id}`"
								required
								:item-data="item"
								:item-index="idx"
								:workTime="workTimeSettings"
								:timePickerOptions="timePickerOptions"
								:hideRemove="!isIndustrialMatrix && !canDelete"
								@onRemove="(id) => removeFormItem(id, breakTimeItemsList)"
							/>
						</div>

						<div v-if="isIndustrialMatrix || canEdit" class="margin-top-row">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								@click="addFormItem(breakTimeItemsList, 'bt_i-')"
							>
								<i class="icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>

				<el-form-item
					:label="tt('phrases.extended_work_date')"
					prop="work_dates"
					class="mcol-xs-11"
				>
					<div class="options-container">
						<div v-if="workDatesItemsList.length" class="content-row">
							<WorkDateItem
								v-for="(item, idx) in workDatesItemsList"
								ref="workDateItemRefs"
								:key="`work-day-item-${item.id}`"
								required
								:item-data="item"
								:item-index="idx"
								:timePickerOptions="timePickerOptions"
								:hideRemove="!isIndustrialMatrix && !canDelete"
								@onRemove="(id) => removeFormItem(id, workDatesItemsList)"
							/>
						</div>

						<div v-if="isIndustrialMatrix || canEdit" class="margin-top-row">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								@click="addFormItem(workDatesItemsList, 'wd_i-')"
							>
								<i class="icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>

				<el-form-item :label="tt('Faults')" prop="faults" class="mcol-xs-12 mcol-sm-9">
					<div class="options-container">
						<div v-if="faultsItemsList.length" class="content-row">
							<FaultItem
								v-for="(item, idx) in faultsItemsList"
								ref="faultItemRefs"
								:key="`fault-item-${item.id}`"
								required
								:item-data="item"
								:item-index="idx"
								:hideRemove="!isIndustrialMatrix && !canDelete"
								@onRemove="(id) => removeFormItem(id, faultsItemsList)"
							/>
						</div>

						<div v-if="isIndustrialMatrix || canEdit" class="margin-top-row">
							<el-button
								class="action-button create-button"
								size="mini"
								type="success"
								@click="addFormItem(faultsItemsList, 'f_i-')"
							>
								<i class="icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>
			</div>

			<FormOperationsButtons v-if="!fromModal" @onCancel="handleCancel" @onSave="validateForm" />
		</el-form>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { required } from '@/constants/validation';
import { sortArrayByKeyNumber } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import FileUploadBlock from '@/components/form/uploadBlock/FileUploadBlock.vue';
import BreakTimeItem from './BreakTimeItem.vue';
import FaultItem from './FaultItem.vue';
import WorkDateItem from './WorkDateItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'ProcessesItemForm',
});

const props = defineProps(buildProps());

const emit = defineEmits(['submit', 'onCancel', 'event']);
const plantsEntity = ENTITIES.Plants;
const controllersEntity = ENTITIES.Controllers;
const machinesEntity = ENTITIES.Machines;
const productionLinesEntity = ENTITIES.ProductionLines;

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);

const itemFormRef = ref(null);
const fileUploadBlockRef = ref(null);
const breakTimeItemRefs = ref([]);
const faultItemRefs = ref([]);
const workDateItemRefs = ref([]);

const plantsLoading = ref(false);
const plantsList = shallowRef([]);
const machinesLoading = ref(false);
const machinesList = shallowRef([]);
const controllersLoading = ref(false);
const controllersList = shallowRef([]);
const productionLinesLoading = ref(false);
const productionLinesList = shallowRef([]);

const faultsItemsList = ref([]);
const breakTimeItemsList = ref([]);
const workDatesItemsList = ref([]);

const formData = ref({
	name: '',
	plant_id: null,
	controller_id: null,
	order_action: 0,
	machines_ids: [],
	production_line_id: null,
	max_capacity: 0,
	start_work_day: '',
	finish_work_day: '',
	faults: [],
	work_breaks: [],
	week_work_days: [],
	work_dates: [],
	conveyor_processes: [],
	production_hourly_rate: null,
	expected_downtime_minutes: 1,
	extremal_deviation_percent: 20,
	pictures: [],
});

const canEdit = computed(() => authStore.hasAccessTo(['edit_oee']));
const canDelete = computed(() => authStore.hasAccessTo(['delete_oee']));
const isIndustrialMatrix = computed(() => !!authStore.isIndustrialMatrix);
const showJustInfo = computed(() => !isIndustrialMatrix.value && !canEdit.value);

const rules = Object.freeze({
	name: required,
	plant_id: required,
	controller_id: required,
	production_line_id: required,
	start_work_day: required,
	finish_work_day: required,
});

const weekDaysList = computed(() =>
	Object.freeze([
		{ id: 0, name: 'Sunday' },
		{ id: 1, name: 'Monday' },
		{ id: 2, name: 'Tuesday' },
		{ id: 3, name: 'Wednesday' },
		{ id: 4, name: 'Thursday' },
		{ id: 5, name: 'Friday' },
		{ id: 6, name: 'Saturday' },
	]),
);

const portsList = computed(() => Object.freeze(Array.from({ length: 41 }, (_, index) => index)));

const timePickerOptions = computed(() =>
	Object.freeze({
		start: '00:00',
		step: '00:15',
		end: '23:45',
	}),
);

const endTimePickerOptions = computed(() => ({
	...timePickerOptions.value,
	minTime: formData.value.start_work_day,
}));

const workTimeSettings = computed(() => ({
	start_work_day: formData.value.start_work_day,
	finish_work_day: formData.value.finish_work_day,
}));

const itemPictures = computed(() => {
	if (props.itemData?.pictures?.length) {
		return sortArrayByKeyNumber(props.itemData.pictures, 'display_order');
	}
	return [];
});

const refsMap = computed(() => ({
	BreakTimeItem: breakTimeItemRefs.value,
	FaultItem: faultItemRefs.value,
	WorkDateItem: workDateItemRefs.value,
	FileUploadBlock: fileUploadBlockRef.value,
}));

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	validateSubItemsForm,
	resetFormDataBySubItems,
	collectDataFromSubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'BreakTimeItem', targetProp: 'work_breaks' },
		{ ref: 'FaultItem', targetProp: 'faults' },
		{ ref: 'WorkDateItem', targetProp: 'work_dates' },
		{ ref: 'FileUploadBlock', targetProp: 'pictures' },
	]),
);

const uploadSettings = computed(() =>
	Object.freeze([
		{ fileProp: 'pictures', multiple: true },
	]),
);

const requestsToDoList = computed(() => {
	const list = [
		{
			action: methodsMap.fetch_plants,
			localProp: plantsList,
			localLoadProp: plantsLoading,
		},
		{
			action: methodsMap.fetch_production_lines,
			localProp: productionLinesList,
			localLoadProp: productionLinesLoading,
			bindTo: [
				{
					param: 'plantId',
					getValue: () => formData.value.plant_id,
				},
			],
		},
		{
			action: methodsMap.fetch_controllers,
			localProp: controllersList,
			localLoadProp: controllersLoading,
			bindTo: [
				{
					param: 'plantId',
					getValue: () => formData.value.plant_id,
					alternateGetValue: () => globalFilters.value.plantId,
					cleanKey: 'controller_id',
				},
			],
		},
	];

	if (isIndustrialMatrix.value || canEdit.value) {
		list.push({
			action: methodsMap.fetch_machines,
			localProp: machinesList,
			localLoadProp: machinesLoading,
			bindTo: [
				{
					param: 'plantId',
					getValue: () => formData.value.plant_id,
					alternateGetValue: () => globalFilters.value.plantId,
					cleanKey: 'machines_ids',
				},
				{
					param: 'productionLineId',
					getValue: () => formData.value.production_line_id,
					cleanKey: 'machines_ids',
				},
			],
		});
	}

	return Object.freeze(list);
});

const methodsMap = {
	fetch_plants: createGetRequest(plantsEntity.apiBase),
	fetch_controllers: createGetRequest(controllersEntity.apiBase),
	fetch_machines: createGetRequest(machinesEntity.apiBase),
	fetch_production_lines: createGetRequest(productionLinesEntity.apiBase),
};

const handleStartTimeChange = () => {
	formData.value.finish_work_day = '';
};

const localSetupPage = (itemData) => {
	if (itemData) {
		faultsItemsList.value = setupFormSubItemsList(itemData.faults || [], 'f_i');
		breakTimeItemsList.value = setupFormSubItemsList(itemData.work_breaks || [], 'bt_i');
		workDatesItemsList.value = setupFormSubItemsList(itemData.work_dates || [], 'wd_i');
		return;
	}

	faultsItemsList.value = [];
	breakTimeItemsList.value = [];
	workDatesItemsList.value = [];

	if (globalFilters.value.plantId) {
		formData.value.plant_id = globalFilters.value.plantId;
	}
};

const { isMobile, validateForm, handleCancel, clearValidate } = useItemForm({
	entityKey: 'Processes',
	itemData: computed(() => props.itemData),
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	editModal: props.editModal,
	localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	uploadSettings: uploadSettings.value,
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
