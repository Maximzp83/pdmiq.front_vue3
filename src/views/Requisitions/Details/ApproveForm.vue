<template>
	<div :class="['edit-form-container maintenance-form', { 'work-order-details-item card content-row': !fromModal }]">
		<SimpleSpinner :active="processing" />

		<div v-if="!fromModal" class="card-header filled_2 flex">
			<div class="semi-bold uppercase">{{ title }}</div>
		</div>

		<div :class="['card-content', { 'flex wrap top': !fromModal }]">
			<div v-if="!fromModal" class="header-block flex align-center">
				<div class="step-number bold span-block">
					<span>{{ progress }}</span>
				</div>
			</div>

			<el-form
				ref="itemFormRef"
				:class="['item-edit-form relative section-row mcol-xs-12', { 'showJustInfo bolded-values': showJustInfo }]"
				label-width="150px"
				:model="formData"
				:rules="rules"
				:label-position="isMobile || fromModal ? 'top' : 'left'"
			>
				<div class="flex mrow wrap">
					<div class="mcol-xs-12 mcol-sm-6">
						<el-form-item :label="tt('Work_Station')" prop="work_station_id">
							<CustomSelectV2
								v-if="!showJustInfo"
								v-model="formData.work_station_id"
								filterable
								clearable
								:optionsLoading="workStationsLoading"
								:optionsList="workStationsList"
								:placeholder="`${tt('Select')} ${tt('station')}`"
							/>
							<div v-else class="semi-bold">
								{{ itemData?.workStation?.name || '-' }}
							</div>
						</el-form-item>

						<el-form-item :label="tt('phrases.estimated_start_date')" prop="estimated_started_at">
							<Datepicker
								v-model="formData.estimated_started_at"
								className=" "
								:disabled="showJustInfo"
								:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('date')}`"
							/>
						</el-form-item>

						<el-form-item :label="tt('phrases.estimated_completion_date')" prop="estimated_finished_at">
							<Datepicker
								v-model="formData.estimated_finished_at"
								className=" "
								:disabled="showJustInfo"
								:placeholder="showJustInfo ? '-' : `${tt('Select')} ${tt('date')}`"
							/>
						</el-form-item>

						<el-form-item label="PO #" prop="po_number">
							<CustomInput
								v-model="formData.po_number"
								:disabled="showJustInfo"
								:placeholder="showJustInfo ? '-' : tt('text')"
							/>
						</el-form-item>

						<el-form-item v-if="fromModal" :label="tt('Price')" required prop="actual_cost">
							<div class="flex align-center">
								<el-input-number
									v-show="editActualCost"
									v-model="formData.actual_cost"
									:precision="2"
									:min="0"
								/>
								<div v-show="!editActualCost" class="bold value-instead-input">
									${{ formData.actual_cost }}
								</div>
								<div
									class="link underline value-instead-input toggle-link"
									@click="editActualCost = !editActualCost"
								>
									{{ editActualCost ? 'Close' : 'Edit' }}
								</div>
							</div>
						</el-form-item>
					</div>

					<div class="mcol-xs-12 mcol-sm-6">
						<el-form-item :label="tt('Technicians')" prop="technicians_ids">
							<CustomSelectV2
								v-if="!showJustInfo"
								v-model="formData.technicians_ids"
								filterable
								multiple
								labelKey="full_name"
								:optionsLoading="usersLoading"
								:optionsList="usersList"
								:placeholder="`${tt('select')} ${tt('technician')}`"
							/>
						</el-form-item>

						<el-form-item :label="tt('Hours')" prop="actual_time" required class="mcol-xs-7">
							<div v-if="!showJustInfo" class="flex mrow">
								<CustomInput
									v-model="actualHours"
									placeholder="00"
									@input="handleTimeInput"
								/>
								<div>:</div>
								<CustomInput
									v-model="actualMinutes"
									placeholder="00"
									@input="handleTimeInput"
								/>
							</div>
							<div v-else class="semi-bold">{{ formData.actual_time }}</div>
						</el-form-item>

						<el-form-item :label="tt('phrases.DT_per_Hour')" prop="downtime_cost_per_hour">
							<el-input-number
								v-if="!showJustInfo"
								v-model.number="formData.downtime_cost_per_hour"
								:controls="false"
								:min="0"
								class="mcol-xs-12"
							/>
							<div v-else class="semi-bold">
								{{
									itemData?.downtime_cost_per_hour || itemData?.downtime_cost_per_hour === 0
										? itemData.downtime_cost_per_hour
										: '-'
								}}
							</div>
						</el-form-item>

						<el-form-item :label="tt('phrases.Hours_Saved_or_Lead_Time')" prop="hours_saved">
							<el-input-number
								v-if="!showJustInfo"
								v-model.number="formData.hours_saved"
								:controls="false"
								:min="0"
								class="mcol-xs-12"
							/>
							<div v-else class="semi-bold">
								{{
									itemData?.hours_saved || itemData?.hours_saved === 0
										? itemData.hours_saved
										: '-'
								}}
							</div>
						</el-form-item>

						<el-form-item :label="tt('phrases.Contractor_Quote')" prop="contractor_quote">
							<el-input-number
								v-if="!showJustInfo"
								v-model.number="formData.contractor_quote"
								:controls="false"
								:min="0"
								class="mcol-xs-12"
							/>
							<div v-else class="semi-bold">
								{{
									itemData?.contractor_quote || itemData?.contractor_quote === 0
										? itemData.contractor_quote
										: '-'
								}}
							</div>
						</el-form-item>

						<el-form-item v-show="fromModal" :label="tt('Materials')" prop="proposed_materials">
							<div class="inline-form-items-list inline-labels">
								<div class="content-row">
									<MaterialItem
										v-for="(item, idx) in materialsItemsList"
										:key="`material-item-${item.id}`"
										:ref="(el) => setSubItemRef('MaterialItem', el, idx)"
										fromModal
										:itemData="item"
										:itemIndex="idx"
										:isLast="materialsItemsList.length === idx + 1"
										@onCreate="addFormItem(materialsItemsList, 'm_i-')"
										@onRemove="(id) => removeFormItem(id, materialsItemsList)"
										@calcActualPrice="calcActualPrice"
									/>
								</div>
							</div>
						</el-form-item>

						<el-form-item
							:label="`${tt('Additional')} ${tt('phrases.Work_Order_Details')}`"
							prop="fab_shop_manager_notes"
							required
						>
							<el-input
								v-if="!showJustInfo"
								v-model="formData.fab_shop_manager_notes"
								type="textarea"
								rows="5"
							/>
							<div v-else class="semi-bold">
								{{ itemData?.fab_shop_manager_notes || '-' }}
							</div>
						</el-form-item>
					</div>
				</div>

				<div v-if="!fromModal" class="el-form-item form-info-block">
					<div class="mrow flex wrap">
						<div class="mcol-xs-12 mcol-sm-6">
							<div class="card inverted">
								<div class="card-header">
									<div class="title semi-bold">{{ tt('Fab_Shop_Budget') }}</div>
								</div>

								<div class="card-content main filled">
									<ul class="dots-in-text">
										<li v-for="item in itemData?.proposedMaterials || []" :key="`pm-${item.id}`">
											<span class="label">{{ item.name }}</span>
											<span class="value">${{ item.price }}</span>
										</li>
									</ul>
								</div>

								<div class="card-content filled">
									<ul class="dots-in-text bold">
										<li>
											<span class="label">{{ tt('Technicians') }}</span>
											<span class="value">${{ techniciansCost }}</span>
										</li>
									</ul>
								</div>

								<div v-if="isFabManager" class="card-content with-form">
									<el-form-item :label="tt('fab_shop_budget')" class="flex align-center space-between">
										<el-input-number v-model="formData.actual_cost" :precision="2" :min="0" />
									</el-form-item>
								</div>

								<div v-else class="card-content filled">
									<ul class="dots-in-text bold">
										<li>
											<span class="label">{{ tt('Fab_Shop_Budget') }}</span>
											<span class="value">${{ itemData?.actual_cost }}</span>
										</li>
									</ul>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-6">
							<div class="card">
								<div class="card-header filled">
									<div class="title semi-bold">{{ tt('Running_Total') }}</div>
								</div>

								<div v-if="!showJustInfo" class="card-content main with-form">
									<el-form-item label="" prop="actual_materials" class="without-margin">
										<div class="inline-form-items-list">
											<div class="content-row">
												<div class="el-form flex mrow relative content-row">
													<div class="el-form-item mini mcol-xs-5">
														<div class="el-form-item__content">{{ tt('Materials') }}</div>
													</div>
													<div class="el-form-item mini mcol-xs-5">
														<div class="el-form-item__content">{{ tt('cost') }}</div>
													</div>
												</div>

												<MaterialItem
													v-for="(item, idx) in actualMaterialsItemsList"
													:key="`actual-material-item-${item.id}`"
													:ref="(el) => setSubItemRef('ActualMaterialItem', el, idx)"
													:itemData="item"
													:itemIndex="idx"
													:isLast="actualMaterialsItemsList.length === idx + 1"
													targetPropName="actual_materials"
													@onCreate="addFormItem(actualMaterialsItemsList, 'am_i-')"
													@onRemove="(id) => removeFormItem(id, actualMaterialsItemsList)"
													@calcActualPrice="calcActualPrice"
												/>

												<div class="el-form flex mrow relative content-row">
													<div class="el-form-item mini mcol-xs-5">
														<div class="el-form-item__content">{{ tt('Technicians') }}</div>
													</div>
													<div class="el-form-item mini mcol-xs-5">
														<div class="el-form-item__content semi-bold">
															{{ itemData?.execution_technicians_cost }}$
														</div>
													</div>
												</div>
											</div>
										</div>
									</el-form-item>
								</div>

								<div v-else class="card-content main">
									<ul class="dots-in-text">
										<li v-for="item in itemData?.actualMaterials || []" :key="`actual-material-${item.id}`">
											<span class="label">{{ item.name }}</span>
											<span class="value">${{ item.price }}</span>
										</li>
									</ul>
								</div>

								<div v-if="showJustInfo" class="card-content">
									<ul class="dots-in-text bold">
										<li>
											<span class="label capitalize">{{ tt('Technicians') }}</span>
											<span class="value">${{ executionTechniciansCost }}</span>
										</li>
									</ul>
								</div>

								<div class="card-content">
									<ul class="dots-in-text bold">
										<li>
											<span class="label">{{ tt('Running_Total') }}</span>
											<span class="value">{{ itemData?.execution_cost }}$</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div v-if="!showJustInfo || isFabManager" :class="[{ 'dialog-decorate-footer': fromModal }, 'no-left-margin']">
					<el-form-item class="FormOperationsButtons">
						<el-button class="item-action-button" native-type="button" @click="handleReset">
							<span class="uppercase">{{ tt('RESET') }}</span>
						</el-button>

						<el-button type="primary" class="item-action-button" native-type="button" @click="validateForm">
							<span class="uppercase">{{ tt('SAVE') }}</span>
						</el-button>
					</el-form-item>
				</div>

				<div v-else-if="actionButtons.length" class="FormOperationsButtons">
					<el-button
						v-for="item in actionButtons"
						:key="`button-${item.id}`"
						type="primary"
						:class="['item-action-button pointer-events-all', item.className]"
						native-type="button"
						@click="$emit('event', item.event, item.args)"
					>
						<span>{{ item.text }}</span>
					</el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef, watch } from 'vue';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { USER_ROLES_TYPES } from '@/constants/global';
import { convertTimeToNumberValue, findItemBy, formatTime } from '@/helpers';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';
import { useItemForm, buildProps } from '@/composables/mixins/useItemForm';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import MaterialItem from './MaterialItem.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionApproveForm' });

const props = defineProps(buildProps({
	progress: Number,
	title: String,
	showJustInfo: Boolean,
	actionButtons: { type: Array, default: () => [] },
	isConcluded: Boolean,
	isCompleted: Boolean,
	isFabManager: Boolean,
}));
const emit = defineEmits(['submit', 'onCancel', 'event']);

const authStore = useAuthStore();
const { approveRequisition } = usePlantRequisitions();

const itemFormRef = ref(null);
const refsMap = ref({});
const workStationsList = shallowRef([]);
const workStationsLoading = ref(false);
const usersList = shallowRef([]);
const usersLoading = ref(false);
const processing = ref(false);
const editActualCost = ref(false);
const actualHours = ref('');
const actualMinutes = ref('');
const materialsItemsList = shallowRef([]);
const actualMaterialsItemsList = shallowRef([]);
const formData = ref({
	work_station_id: null,
	technicians_ids: [],
	actual_time: '',
	fab_shop_manager_notes: '',
	actual_cost: 0,
	actual_materials: [],
	proposed_materials: [],
	execution_cost: 0,
	estimated_started_at: '',
	estimated_finished_at: '',
	po_number: '',
	downtime_cost_per_hour: 0,
	hours_saved: 0,
	contractor_quote: 0,
});

const itemData = computed(() => props.itemData || {});
const methodsMap = {
	fetch_work_stations: createGetRequest('/plants/work-stations'),
	fetch_users: createGetRequest(ENTITIES.Users.apiBase),
};
const requestsToDoList = computed(() => {
	if (props.showJustInfo) return Object.freeze([]);
	return Object.freeze([
		{
			action: methodsMap.fetch_work_stations,
			payload: { params: { plantId: authStore.authUser?.plant_id } },
			localProp: workStationsList,
			localLoadProp: workStationsLoading,
		},
		{
			action: methodsMap.fetch_users,
			payload: {
				params: {
					type: USER_ROLES_TYPES.CUSTOMER,
					plantId: itemData.value.fabrication_plant_id,
				},
			},
			localProp: usersList,
			localLoadProp: usersLoading,
		},
	]);
});
const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'MaterialItem', targetProp: 'proposed_materials' },
		{ ref: 'ActualMaterialItem', targetProp: 'actual_materials' },
	]),
);
const selectedTechnicians = computed(() => {
	if (itemData.value.technicalProcesses?.length) {
		return itemData.value.technicalProcesses.map((item) => item.technician).filter(Boolean);
	}

	if (formData.value.technicians_ids?.length && usersList.value.length) {
		return formData.value.technicians_ids
			.map((id) => findItemBy('id', id, usersList.value))
			.filter(Boolean);
	}

	return null;
});
const techniciansCost = computed(() =>
	convertTimeToNumberValue(`${actualHours.value || '00'}:${actualMinutes.value || '00'}`) * 35,
);
const executionTechniciansCost = computed(() => {
	if (!itemData.value.technicalProcesses?.length || !selectedTechnicians.value) return 0;
	return itemData.value.technicalProcesses.reduce((sum, item) => sum + Number(item.total_cost || 0), 0);
});
const hasNumericValue = (value) => value !== null && value !== '' && typeof value !== 'undefined';
const validateDowntimeCostPair = (rule, value, callback) => {
	const hasDtHour = hasNumericValue(formData.value.downtime_cost_per_hour);
	const hasHoursSaved = hasNumericValue(formData.value.hours_saved);
	if (hasDtHour !== hasHoursSaved) {
		callback(new Error(tt('aliases.dt_cost_req_togr')));
		return;
	}
	callback();
};
const rules = computed(() =>
	Object.freeze({
		downtime_cost_per_hour: [
			{
				validator: validateDowntimeCostPair,
				trigger: ['blur', 'change'],
			},
		],
		hours_saved: [
			{
				validator: validateDowntimeCostPair,
				trigger: ['blur', 'change'],
			},
		],
	}),
);

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

const normalizeTimePart = (value) => {
	if (!value) return '';
	const normalized = `${value}`.replace(/\D/g, '').slice(0, 2);
	return normalized.length < 2 ? `0${normalized}` : normalized;
};

const handleTimeInput = () => {
	actualHours.value = normalizeTimePart(actualHours.value);
	actualMinutes.value = normalizeTimePart(actualMinutes.value);
	calcActualPrice();
};

const calcActualPrice = () => {
	setTimeout(() => {
		const refName = props.fromModal ? 'MaterialItem' : 'ActualMaterialItem';
		const costProp = props.fromModal ? 'actual_cost' : 'execution_cost';
		let cost = 0;

		(refsMap.value[refName] || []).filter(Boolean).forEach((item) => {
			cost += Number(item.getFormData?.().price || 0);
		});

		if (refName === 'MaterialItem') {
			cost += techniciansCost.value;
		}

		formData.value[costProp] = cost;
	}, 10);
};

const localSetupPage = (data) => {
	if (data?.actual_time) {
		formData.value.actual_time = formatTime(data.actual_time, 'H:m');
		const [hours = '', minutes = ''] = formData.value.actual_time.split(':');
		actualHours.value = hours;
		actualMinutes.value = minutes;
	}

	materialsItemsList.value = data?.proposedMaterials?.length
		? setupFormSubItemsList(data.proposedMaterials, 'm_i')
		: [];
	if (!materialsItemsList.value.length) {
		addFormItem(materialsItemsList, 'm_i-');
	}

	actualMaterialsItemsList.value = data?.actualMaterials?.length
		? setupFormSubItemsList(data.actualMaterials, 'am_i')
		: [];
	if (!actualMaterialsItemsList.value.length) {
		addFormItem(actualMaterialsItemsList, 'am_i-');
	}
};

const localPrepareSubmitData = (data) => {
	const preparedData = { ...data };
	if (!preparedData.proposed_materials?.some((item) => item?.price && item?.name)) {
		preparedData.proposed_materials = [];
	}
	if (!preparedData.actual_materials?.some((item) => item?.price && item?.name)) {
		preparedData.actual_materials = [];
	}
	preparedData.actual_time = `${actualHours.value || '00'}:${actualMinutes.value || '00'}`;
	return preparedData;
};

const localSubmit = (data) => {
	const payload = {
		itemId: itemData.value.id,
		data,
	};

	processing.value = true;
	return approveRequisition(payload)
		.then(() => {
			emit('event', 'reloadPage');
			emit('event', 'successModalSubmit');
		})
		.finally(() => {
			processing.value = false;
		});
};

const handleReset = () => emit('event', 'handleReset');

const { isMobile, validateForm } = useItemForm({
	itemData,
	formData,
	formRef: itemFormRef,
	fromModal: props.fromModal,
	localSetupPage,
	localPrepareSubmitData,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localSubmit,
	emit,
});

useRequestsList({
	methodsMap,
	requestsToDoList,
});

watch(selectedTechnicians, calcActualPrice);

defineExpose({ validateForm });
</script>
