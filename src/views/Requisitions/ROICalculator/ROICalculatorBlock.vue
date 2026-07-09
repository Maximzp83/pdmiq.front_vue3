<template>
	<div v-if="globalFilters.plantId" class="card overflowHidden">
		<div class="card-header filled_2">
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
										v-model="periodDateRange"
										class="no-min-width"
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
									<CustomSelectV2
										v-model="formData.users_ids"
										clearable
										multiple
										filterable
										collapse-tags
										:optionsLoading="usersLoading"
										:optionsList="techniciansUsersList"
										:placeholder="`${tt('Select')} ${tt('users')}`"
										labelKey="full_name"
									/>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3">
							<div class="el-form-item">
								<div class="label">{{ tt('WO') }}#</div>
								<div class="el-form-item__content">
									<CustomSelectV2
										v-model="formData.work_order_id"
										filterable
										clearable
										multiple
										collapse-tags
										:optionsLoading="workOrdersLoading"
										:optionsList="workOrdersList"
										:placeholder="`${tt('select')} ${tt('order')}`"
										labelKey="id"
									/>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3 self-end">
							<div class="el-form-item">
								<div class="el-form-item__content">
									<el-button
										type="success"
										native-type="button"
										class="item-action-button inverted"
										@click="handleApply"
									>
										<span class="uppercase">{{ tt('APPLY') }}</span>
									</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="step-container flex align-center">
				<div :class="['dark-overlay', { hide: calculationsStepEnabled }]"></div>
				<div class="step-number bold">
					<span>2</span>
				</div>

				<div class="mcol-xs-12 flex">
					<div class="mrow flex">
						<div>
							<div class="muted">{{ tt('phrases.Tech_Hours') }}</div>
							<div class="bold">
								{{ calculateResult.technician_hourly_rate }} $ ({{ calculateResult.tech_hours }}:00 hours)
							</div>
						</div>

						<div>
							<div class="muted">{{ tt('Running_Total') }}</div>
							<div class="bold">{{ calculateResult.running_total }} $</div>
						</div>
					</div>
				</div>
			</div>

			<div class="step-container flex align-center">
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
										v-model.number="contractorHourlyRateInput"
										:controls="false"
										class="mcol-xs-6"
										:min="0"
									/>
									<div class="mcol-xs-6 result-field">{{ contractorHourlyRateFinal }} $</div>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3">
							<div class="el-form-item">
								<div class="label">{{ tt('phrases.Contractor_Markup') }} (%)</div>
								<div class="el-form-item__content flex">
									<el-input-number
										v-model.number="contractorMarkupPercent"
										:controls="false"
										class="mcol-xs-6"
										:min="0"
										:max="100"
									/>
									<div class="mcol-xs-6 result-field">{{ contractorMarkupPercentFinal }} $</div>
								</div>
							</div>
						</div>

						<div class="mcol-xs-12 mcol-sm-3 self-end">
							<div class="el-form-item">
								<div class="el-form-item__content">
									<el-button
										type="success"
										native-type="button"
										class="item-action-button"
										@click="handleCalculate"
									>
										<span class="uppercase">{{ tt('CALCULATE') }}</span>
									</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-if="calculationsStepEnabled && calculationsReady" class="step-container flex align-center">
				<div class="step-number bold">
					<span>4</span>
				</div>

				<div class="mcol-xs-12">
					<div class="mrow flex wrap align-center">
						<div class="mcol-xs-auto final-result">
							{{ `${tt('phrases.Cost_Savings')} = ${calculateResult.total_savings}` }} $
						</div>

						<div>
							<el-button
								type="success"
								class="inverted pdf-button"
								size="small"
								native-type="button"
								:loading="exportingInProgress"
								@click="exportPDF"
							>
								<i class="icomoon icon-pdf"></i>
							</el-button>
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

<script setup>
import { computed, reactive, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { REQUISITION_STATUSES_TYPES } from '@/constants/global';
import {
	datePickerAdditionalShortcuts2,
	datePickerShortcuts,
	datePickerYearQuartersShortcuts,
} from '@/constants/date_time';
import { prepareRangeParams } from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';
import { useExportListToFile } from '@/composables/mixins/useExportListToFile';

import Datepicker from '@/components/common/Datepicker.vue';
import PageMockImg from '@/components/common/PageMockImg.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionsRoiCalculatorBlock' });

const props = defineProps({
	usersList: { type: Array, default: () => [] },
	usersLoading: Boolean,
	calculationsStepEnabled: Boolean,
});
const emit = defineEmits(['event']);

const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const { calculateRequisitionsRoi } = usePlantRequisitions();
const { exportingInProgress, handleExportItem } = useExportListToFile({
	prepareFilters: (filters) => prepareFilters(filters),
});

const fetchWorkOrders = createGetRequest('/plants/work-orders');
const workOrdersList = shallowRef([]);
const workOrdersLoading = ref(false);
const periodDateRange = ref([]);
const calculationsLoading = ref(false);
const calculationsReady = ref(false);
const contractorHourlyRateInput = ref(0);
const contractorMarkupPercent = ref(0);
const formData = reactive({
	users_ids: [],
	work_order_id: null,
});
const calculateResult = reactive({
	running_total: 0,
	technician_hourly_rate: 0,
	contractor_hourly_rate: 0,
	total_savings: 0,
	tech_hours: 0,
});

const pickerOptions = computed(() =>
	Object.freeze({
		shortcuts: [
			...datePickerShortcuts(),
			...datePickerYearQuartersShortcuts(),
			...datePickerAdditionalShortcuts2(),
		],
	}),
);
const techniciansUsersList = computed(() =>
	props.usersList.filter((user) => user && user.role && user.role.is_technic),
);
const contractorMarkupPercentFinal = computed(() =>
	calculateResult.running_total + calculateResult.running_total * (contractorMarkupPercent.value / 100),
);
const contractorHourlyRateFinal = computed(() =>
	contractorHourlyRateInput.value * calculateResult.tech_hours,
);

const prepareFilters = (filters) => {
	let newFilters = { ...filters };

	if (newFilters.daterange?.length) {
		newFilters = {
			...newFilters,
			...prepareRangeParams(newFilters.daterange),
		};
	}

	delete newFilters.daterange;
	delete newFilters.items_active_grid_type;

	return newFilters;
};

const setupResult = ({ value } = {}) => {
	const nextValue = value || {};
	Object.assign(calculateResult, {
		...nextValue,
		tech_hours: nextValue.tech_hours || calculateResult.tech_hours,
	});
};

const handleGetCalculations = (filters) => {
	const preparedFilters = { ...filters };
	if (!preparedFilters.id) {
		delete preparedFilters.id;
	}

	calculationsLoading.value = true;
	return calculateRequisitionsRoi(prepareFilters(preparedFilters))
		.then(setupResult)
		.finally(() => {
			calculationsLoading.value = false;
		});
};

const handleApply = () => {
	contractorHourlyRateInput.value = 0;
	contractorMarkupPercent.value = 0;

	const filters = {
		daterange: periodDateRange.value,
		technicians: formData.users_ids,
		id: formData.work_order_id,
		status: REQUISITION_STATUSES_TYPES.COMPLETED,
		plantId: globalFilters.value.plantId,
		max: -1,
	};

	emit('event', 'applyFilters', filters);
	calculationsReady.value = false;
	handleGetCalculations(filters);
};

const handleCalculate = () => {
	const filters = {
		daterange: periodDateRange.value,
		technicians: formData.users_ids,
		id: formData.work_order_id,
		contractor_hourly_rate: contractorHourlyRateInput.value,
		contractor_markup_percent: contractorMarkupPercent.value,
		plantId: globalFilters.value.plantId,
	};

	handleGetCalculations(filters);
	calculationsReady.value = true;
};

const exportPDF = () => {
	const filters = {
		daterange: periodDateRange.value,
		technicians: formData.users_ids,
		id: formData.work_order_id,
		status: REQUISITION_STATUSES_TYPES.COMPLETED,
		contractor_hourly_rate: contractorHourlyRateInput.value,
		contractor_markup_percent: contractorMarkupPercent.value,
		format: 'pdf',
		plantId: globalFilters.value.plantId,
		max: -1,
	};

	if (!filters.id) {
		delete filters.id;
	}

	handleExportItem({ url: 'plants/work-orders/roi', filters });
};

const loadWorkOrders = (plantId) => {
	if (!plantId) {
		workOrdersList.value = [];
		return;
	}

	workOrdersLoading.value = true;
	fetchWorkOrders({
		params: {
			max: -1,
			status: REQUISITION_STATUSES_TYPES.COMPLETED,
			plantId,
		},
	})
		.then(({ value }) => {
			workOrdersList.value = value || [];
		})
		.finally(() => {
			workOrdersLoading.value = false;
		});
};

watch(() => globalFilters.value.plantId, loadWorkOrders, { immediate: true });
watch(techniciansUsersList, (newList) => {
	const availableIds = newList.map((user) => user.id);
	formData.users_ids = formData.users_ids.filter((id) => availableIds.includes(id));
});
</script>
