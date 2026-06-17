<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			class="item-edit-form content-row sensor-form"
			label-width="160px"
			:model="formData"
			:rules="rules"
			:validate-on-rule-change="false"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div class="tab-container" :class="{ 'half-width': !fromAnotherInstance && !isMobile }">
				<el-form-item :label="tt('Lube_Type')" prop="functionality_type" 
					class="content-row"
				>
					<CustomSelectV2
						v-model="formData.functionality_type"
						:optionsList="ultrasoundSensorTypes"
						:placeholder="`${tt('select')} ${tt('type')}`"
					/>
				</el-form-item>

				<el-form-item v-if="!isLubeMatrixV4" :label="tt('Data_Set')" prop="data_set">
					<CustomSelectV2
						v-model="formData.data_set"
						:class="{ showJustInfo: isLubeMatrixV3 && !isNew && !datasetChanged }"
						:disabled="isLubeMatrixV3 && !isNew && !datasetChanged"
						:optionsList="dataSets"
						:placeholder="`${tt('select')} ${tt('dataset')}`"
						:setupLabelMethod="setupDataSetLabel"
					/>
				</el-form-item>

				<el-form-item
					v-if="!fromBannerSensorForm"
					:label="tt('Location')"
					prop="location_in_equipment"
					required
				>
					<CustomInput
						v-model="formData.location_in_equipment"
						:placeholder="`${tt('enter')} ${tt('location')}`"
					/>
				</el-form-item>

				<el-form-item v-if="!fromBannerSensorForm" :label="tt('Controller')" prop="controller_id">
					<FetchByQuerySelect
						v-model="formData.controller_id"
						clearable
						enableLoadmore
						:settings="controllersSelectSettings"
						:placeholder="`${tt('select')} ${tt('controller')}`"
					/>
				</el-form-item>

				<!-- <el-form-item v-if="!fromBannerSensorForm" :label="tt('Item')" prop="equipment_id">
					<FetchByQuerySelect
						v-model="formData.equipment_id"
						clearable
						enableLoadmore
						:settings="equipmentsSelectSettings"
						:placeholder="`${tt('select')} ${tt('item')}`"
					/>
				</el-form-item> -->

				<el-form-item
					v-if="formData.lube_version !== LUBE_VERSIONS.V3"
					:label="tt('Node')"
					prop="port_number"
				>
					<CustomSelectV2
						v-model="formData.port_number"
						:optionsList="portsList"
						:placeholder="`${tt('select')} ${tt('node')}`"
					/>
				</el-form-item>

				<el-form-item
					v-if="formData.lube_version !== LUBE_VERSIONS.V3"
					:label="tt('Position')"
					prop="ultrasound_position"
					required
				>
					<CustomSelectV2
						v-model="formData.ultrasound_position"
						:optionsList="positionsList"
						:placeholder="`${tt('select')} ${tt('position')}`"
					/>
				</el-form-item>

				<el-form-item
					class="content-row"
					v-if="!fromBannerSensorForm"
					:label="tt('phrases.lube_version')"
					prop="lube_version"
				>
					<CustomSelectV2
						v-model="formData.lube_version"
						:optionsList="lubeVersions"
						:placeholder="`${tt('select')} ${tt('version')}`"
					/>
				</el-form-item>

				<el-form-item
					class="content-row"
					v-if="!fromBannerSensorForm && formData.lube_version === LUBE_VERSIONS.V3"
					:label="`${tt('Device')} ${tt('address')} id`"
					prop="device_address_id"
					required
				>
					<CustomInput v-model="formData.device_address_id" />
				</el-form-item>

				<el-form-item
					class="content-row"
					v-if="!fromBannerSensorForm && formData.lube_version === LUBE_VERSIONS.V3"
					:label="`${tt('Sensor')} Id 2`"
					prop="fft_sensor_id"
					required
				>
					<CustomInput v-model="formData.fft_sensor_id" />
				</el-form-item>

				<div v-if="!isSensorOnly" class="content-row">
					<el-form-item :label="`${tt('constants.Lube')} ${tt('Method')}`" prop="lube_method">
						<CustomSelectV2
							v-model="formData.lube_method"
							:optionsList="lubeMethods"
							:placeholder="`${tt('select')} ${tt('method')}`"
						/>
					</el-form-item>

					<div v-if="showAlarmGainBlock" class="el-form-item flex mrow align-center">
						<div class="mcol-xs-6">
							<span>{{ formulaExpression }}</span>
						</div>
						<div v-if="showGainControl" class="mcol-xs-6">
							<el-form-item class="inline-form-row" prop="gain_ultrasound_signal">
								<label class="el-form-item__label">{{ tt('phrases.gain_signal_value') }}</label>
								<CustomSelectV2
									v-model="formData.gain_ultrasound_signal"
									:optionsList="gainUltrasoundSignalList"
									labelKey="label"
									valueKey="value"
									:placeholder="`${tt('select')} ${tt('value')}`"
								/>
							</el-form-item>
						</div>
					</div>
				</div>

				<div v-if="!isSensorOnly && formData.lube_method === LUBE_METHODS.ALARM" class="form-section paint content-row">
					<div class="content-row">
						<b>{{ tt('phrases.Lube_Logic_Setup') }}</b>
					</div>
					<div class="flex mrow wrap content-row">
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.Lube_Cycles_Per_Set')" prop="lube_cycle">
							<el-input-number v-model="formData.lube_cycle" :min="0" />
						</el-form-item>
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.time_between_lube_cycles_sec')" prop="lube_cycle_dwell_time">
							<el-input-number v-model="formData.lube_cycle_dwell_time" :min="0" />
						</el-form-item>
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('Lube_Sets')" prop="lube_cycle_set">
							<el-input-number v-model="formData.lube_cycle_set" :min="0" />
						</el-form-item>
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.time_between_lube_sets_sec')" prop="lube_cycle_set_dwell_time">
							<el-input-number v-model="formData.lube_cycle_set_dwell_time" :min="0" />
						</el-form-item>
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.warm_up_time_minutes')" prop="lube_cycle_warm_up_minutes" required>
							<el-input-number v-model="formData.lube_cycle_warm_up_minutes" :min="5" :max="300" />
						</el-form-item>
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.cool_down_time_minutes')" prop="lube_cycle_cool_down_minutes" required>
							<el-input-number v-model="formData.lube_cycle_cool_down_minutes" :min="1" :max="120" />
						</el-form-item>
						<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.percentage_of_points_above_alarm')" prop="lube_cycle_percent_danger_points" required>
							<el-input-number v-model="formData.lube_cycle_percent_danger_points" :min="0" />
						</el-form-item>
					</div>
				</div>

				<div v-if="!isSensorOnly && formData.lube_method === LUBE_METHODS.FREQUENCY" class="flex mrow wrap form-section paint content-row">
					<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('Period')" prop="lube_period" required>
						<CustomSelectV2
							v-model="formData.lube_period"
							:disabled="frequencyBlockDisabled"
							:optionsList="lubePeriods"
							:placeholder="`${tt('select')} ${tt('period')}`"
						/>
					</el-form-item>
					<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('time')" prop="lube_period_time">
						<el-input-number
							v-model="formData.lube_period_time"
							:disabled="frequencyBlockDisabled"
							:min="1"
						/>
					</el-form-item>
					<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('Lube_Cycles')" prop="lube_cycle">
						<el-input-number
							v-model="formData.lube_cycle"
							:disabled="frequencyBlockDisabled"
							:min="0"
						/>
					</el-form-item>
					<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('phrases.lube_cycle_dwell_time')" prop="lube_cycle_dwell_time">
						<el-input-number
							v-model="formData.lube_cycle_dwell_time"
							:disabled="frequencyBlockDisabled"
							:min="0"
						/>
					</el-form-item>
					<el-form-item class="mcol-xs-12 mcol-md-6" :label="tt('Starting_At')" prop="lube_cycle_scheduled_start_time">
						<CustomInput
							v-model="formData.lube_cycle_scheduled_start_time"
							:disabled="frequencyBlockDisabled"
							placeholder="YYYY-MM-DD HH:mm:ss"
						/>
					</el-form-item>
				</div>
			</div>

			<FormOperationsButtons
				v-if="!fromModal && !editInModal"
				@onCancel="handleCancel"
				@onSave="handleSave"
			/>
		</el-form>

		<ItemFormPump
			v-if="showPumpForm"
			ref="pumpFormRef"
			:itemData="pumpItemData"
			:equipmentData="equipmentData"
			:isNew="isNew"
			:lubeTypesList="lubeTypesList"
			:lubeTypesLoading="commonItemsLoadings.lubeTypesLoading"
			:calculatedLubesData="calculatedLubesData"
			@event="handlePumpEvent"
		/>

		<el-form
			v-if="enableLevelZonesForm"
			ref="levelZoneFormRef"
			class="item-edit-form content-row"
			label-width="150px"
			:model="levelZoneForm"
			label-position="top"
		>
			<div class="content-row">
				<b>{{ tt('Zones') }}</b>
			</div>
			<div class="form-section paint el-form-item content-row">
				<div class="flex wrap mrow content-row">
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="`${tt('constants.Alarm')} ${tt('zone')}`" prop="alarm_zone" required>
							<el-input-number
								v-model="levelZoneForm.alarm_zone"
								:min="levelZoneForm.warning_zone"
								:precision="2"
							/>
						</el-form-item>
					</div>
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="`${tt('constants.Warning')} ${tt('zone')}`" prop="warning_zone" required>
							<el-input-number
								v-model="levelZoneForm.warning_zone"
								:max="levelZoneForm.alarm_zone"
								:precision="2"
							/>
						</el-form-item>
					</div>
				</div>
				<div class="flex wrap mrow content-row">
					<div class="mcol-xs-12 mcol-md-6">
						<el-form-item :label="tt('constants.Baseline_zone')" prop="baseline_zone" required>
							<el-input-number v-model="levelZoneForm.baseline_zone" :precision="2" />
						</el-form-item>
					</div>
				</div>
			</div>
		</el-form>
	</div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { DATASET, SENSOR_TYPES, dataSetsList } from '@/constants/global';
import {
	LUBE_METHODS,
	LUBE_PERIODS,
	LUBE_VERSIONS,
	ULTRASOUND_SENSOR_TYPES,
	lubeMethodsList,
	lubePeriodsList,
	lubeVersionsList,
	ultrasoundSensorTypesList,
} from '@/constants/ultrasound';
import { required } from '@/constants/validation';
import { findItemBy, prepareSubmitData } from '@/helpers';
import { Lang } from '@/localization';
import {
	METRIC_SYSTEM_TYPES,
	SENSOR_SPECIFIC_PARAMETERS_TYPES,
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSensors } from '@/composables/useSensors';
import { useNotify } from '@/composables/useNotify';
import { useGlobalStore } from '@/stores/GlobalStore';

import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import ItemFormPump from './ItemFormPump.vue';

const { tt } = Lang;

defineOptions({
	name: 'SensorItemFormUltraSound',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
	additionalSettings: { type: Object, default: () => ({}) },
	itemsName: { type: Object, default: () => ({}) },
	equipmentData: { type: Object, default: () => ({}) },
	isNew: Boolean,
	fromBannerSensorForm: Boolean,
	isLubeMatrixV3: Boolean,
	isLubeMatrixV4: Boolean,
	parentDataSet: null,
	controllersList: { type: Array, default: () => [] },
	formulasList: { type: Array, default: () => [] },
	bearingsList: { type: Array, default: () => [] },
	lubeTypesList: { type: Array, default: () => [] },
	commonItemsLoadings: { type: Object, default: () => ({}) },
	editInModal: Boolean,
});

const emit = defineEmits(['submit', 'onCancel', 'event']);

const { fetchDatasetFormulas } = useSensors();
const { Notify } = useNotify();
const globalStore = useGlobalStore();

const itemFormRef = ref(null);
const pumpFormRef = ref(null);
const levelZoneFormRef = ref(null);
const formulasListLocal = ref([]);
const frequencyBlockDisabled = ref(false);
const datasetChanged = ref(false);
const calculatedLubesData = ref({});
const levelZoneForm = ref({
	metric_system_type: METRIC_SYSTEM_TYPES.METRIC,
	parameter_type: SENSOR_SPECIFIC_PARAMETERS_TYPES.DB,
	alarm_zone: 0,
	warning_zone: 0,
	baseline_zone: 0,
});

const initialFormData = {
	id: null,
	type: SENSOR_TYPES.ULTRA_SOUND,
	port_number: null,
	controller_id: null,
	equipment_id: props.equipmentData?.id || null,
	data_set: DATASET.ULTRA_SOUND_DECIBELS,
	location_in_equipment: '',
	gain_ultrasound_signal: 60,
	lube_method: LUBE_METHODS.ALARM,
	lube_period: LUBE_PERIODS.HOUR,
	lube_period_time: 1,
	lube_cycle: null,
	lube_cycle_dwell_time: null,
	lube_cycle_set: null,
	lube_cycle_set_dwell_time: null,
	lube_cycle_scheduled_start_time: '',
	bearing_id: null,
	bearing_rpm: null,
	replenishment_type: null,
	ultrasound_position: null,
	lube_cycle_warm_up_minutes: 50,
	lube_cycle_cool_down_minutes: 10,
	lube_cycle_percent_danger_points: 80,
	functionality_type: null,
	lube_version: null,
	device_address_id: '',
	fft_sensor_id: '',
	is_lube_mode: 1,
	is_archived: 0,
};
const formData = ref({ ...initialFormData });

const rules = reactive({
	equipment_id: required,
	controller_id: required,
	data_set: required,
	location_in_equipment: required,
	lube_cycle: null,
	lube_cycle_dwell_time: null,
	lube_cycle_set: null,
	lube_cycle_set_dwell_time: null,
});

const dataSets = computed(() => {
	if (formData.value.lube_version === LUBE_VERSIONS.V3) {
		return Object.freeze(dataSetsList().filter((item) => item.isLubeV3));
	}

	return Object.freeze(
		dataSetsList().filter((item) => item.controller_type === SENSOR_TYPES.ULTRA_SOUND),
	);
});
const setupDataSetLabel = (item) => `${item.label} ${item.alt_label ? `(${item.alt_label})` : ''}`;
const lubeMethods = computed(() => Object.freeze(lubeMethodsList()));
const lubePeriods = computed(() => Object.freeze(lubePeriodsList()));
const lubeVersions = computed(() => Object.freeze(lubeVersionsList()));
const ultrasoundSensorTypes = computed(() => Object.freeze(ultrasoundSensorTypesList()));
const portsList = computed(() =>
	Object.freeze(Array.from({ length: 40 }, (_, index) => ({ id: index + 1, name: index + 1 }))),
);
const positionsList = computed(() =>
	Object.freeze([
		{ id: 1, name: 1 },
		{ id: 2, name: 2 },
	]),
);
const gainUltrasoundSignalList = computed(() =>
	Object.freeze([
		{ id: 1, value: 12, label: '12' },
		{ id: 2, value: 24, label: '24' },
		{ id: 3, value: 36, label: '36' },
		{ id: 4, value: 48, label: '48' },
		{ id: 5, value: 60, label: '60' },
	]),
);
const finalFormulasList = computed(() =>
	props.fromModal && props.formulasList.length ? props.formulasList : formulasListLocal.value,
);
const isSensorOnly = computed(
	() => formData.value.functionality_type === ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY,
);
const showPumpForm = computed(() => !isSensorOnly.value);
const enableLevelZonesForm = computed(
	() => props.isNew && !isSensorOnly.value && formData.value.lube_method === LUBE_METHODS.ALARM,
);
const pumpItemData = computed(() => props.itemData?.pump || {});
const isLubeMatrixV3 = computed(() => props.isLubeMatrixV3 || formData.value.lube_version === LUBE_VERSIONS.V3);
const isLubeMatrixV4 = computed(() => props.isLubeMatrixV4);
const showAlarmGainBlock = computed(
	() =>
		formData.value.lube_method === LUBE_METHODS.ALARM &&
		[
			DATASET.ULTRA_SOUND_SDT_DECIBELS,
			DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20,
			DATASET.SDT_SENSOR_FULL_SPECTRUM,
			DATASET.LUBE_MATRIX_SDT_TEMP_C,
			DATASET.LUBE_MATRIX_SDT_TEMP_F,
		].includes(formData.value.data_set),
);
const showGainControl = computed(() =>
	[DATASET.ULTRA_SOUND_SDT_DECIBELS, DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20].includes(
		formData.value.data_set,
	),
);
const formulaExpression = computed(() => {
	const item = findItemBy('data_set', formData.value.data_set, finalFormulasList.value);
	return item?.expression || '';
});

const controllersSelectSettings = computed(() => ({
	fetchAction: createGetRequest(ENTITIES.Controllers.apiBase),
	fetchByIdAction: createGetByIdRequest(ENTITIES.Controllers.apiBase),
	params: {
		max: -1,
		type: SENSOR_TYPES.ULTRA_SOUND,
		plantId: globalStore.navbarSettings?.showPlantName?.id || globalStore.globalFilters?.plantId,
	},
}));
const equipmentsSelectSettings = computed(() => ({
	fetchAction: createGetRequest(ENTITIES.Equipments.apiBase),
	fetchByIdAction: createGetByIdRequest(ENTITIES.Equipments.apiBase),
	params: { max: 100 },
}));

const validateDataSet = () => {
	if (!isLubeMatrixV3.value) return true;

	const hasDataSet = dataSets.value.some((item) => item.id === formData.value.data_set);
	if (!hasDataSet) {
		datasetChanged.value = true;
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('Wrong data set'),
		});
		return false;
	}

	return true;
};

const generateIdInRange = (min, max) => {
	const now = Date.now();
	const perf = Math.floor(performance.now());
	return ((now + perf) % (max - min + 1)) + min;
};

const handlePumpEvent = ({ eventName, data } = {}) => {
	if (eventName !== 'calculateLubeParams') return;

	api_request.post('/ultrasound/lubes/params', {
		data,
		notNotify: true,
	})
		.then(({ value }) => {
			calculatedLubesData.value = value || {};
		});
};

const localSetupPage = (item) => {
	if (isLubeMatrixV3.value || isLubeMatrixV4.value) {
		formData.value.lube_version = LUBE_VERSIONS.V3;
	}

	if (item?.lube_method === LUBE_METHODS.FREQUENCY && item.lube_cycle_dwell_time) {
		formData.value.lube_cycle_dwell_time = item.lube_cycle_dwell_time / 60;
	}

	if (item?.pump?.position) {
		formData.value.ultrasound_position = item.pump.position;
	}

	if (props.equipmentData?.id) {
		formData.value.equipment_id = props.equipmentData.id;
	}

	if (!formData.value.lube_method) {
		formData.value.lube_method = LUBE_METHODS.ALARM;
	}

	frequencyBlockDisabled.value =
		!props.isNew && formData.value.lube_method === LUBE_METHODS.FREQUENCY;
	formData.value.is_lube_mode = 1;
};

const localValidationHook = () => {
	if (!validateDataSet()) return false;

	if (showPumpForm.value && !pumpFormRef.value?.validateItemForm?.()) {
		return false;
	}

	if (enableLevelZonesForm.value && levelZoneForm.value.alarm_zone < levelZoneForm.value.warning_zone) {
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('Alarm_zone_should_be_higher_than_Warning_zone'),
		});
		return false;
	}

	if (formData.value.lube_method === LUBE_METHODS.FREQUENCY && !formData.value.lube_cycle_scheduled_start_time) {
		Notify({
			type: 'warning',
			title: tt('phrases.form_isnt_ready'),
			message: tt('phrases.Scheduled_start_date_and_time_required'),
		});
		return false;
	}

	return true;
};

const localPrepareSubmitData = (data) => {
	const preparedData = {
		...data,
		type: SENSOR_TYPES.ULTRA_SOUND,
	};

	if (preparedData.lube_method !== LUBE_METHODS.ALARM) {
		delete preparedData.lube_cycle_set;
		delete preparedData.lube_cycle_set_dwell_time;
		delete preparedData.data_set_convert_value;
		delete preparedData.lube_cycle_warm_up_minutes;
		delete preparedData.lube_cycle_cool_down_minutes;
		delete preparedData.lube_cycle_percent_danger_points;
	}

	if (!showGainControl.value) {
		delete preparedData.gain_ultrasound_signal;
	}

	if (preparedData.lube_method !== LUBE_METHODS.FREQUENCY) {
		delete preparedData.lube_period;
		delete preparedData.lube_period_time;
		delete preparedData.lube_cycle_scheduled_start_time;
	} else if (preparedData.lube_cycle_dwell_time) {
		preparedData.lube_cycle_dwell_time = preparedData.lube_cycle_dwell_time * 60;
	}

	if (isSensorOnly.value) {
		[
			'gain_ultrasound_signal',
			'lube_method',
			'lube_period',
			'lube_period_time',
			'lube_cycle',
			'lube_cycle_dwell_time',
			'lube_cycle_set',
			'lube_cycle_set_dwell_time',
			'lube_cycle_scheduled_start_time',
			'bearing_id',
			'bearing_rpm',
			'replenishment_type',
			'lube_cycle_warm_up_minutes',
			'lube_cycle_cool_down_minutes',
			'lube_cycle_percent_danger_points',
		].forEach((key) => delete preparedData[key]);
	}

	if (!props.fromBannerSensorForm && preparedData.lube_version === LUBE_VERSIONS.V3) {
		if (!preparedData.ultrasound_position) {
			preparedData.ultrasound_position = generateIdInRange(1, 2);
		}
		if (!preparedData.port_number) {
			preparedData.port_number = generateIdInRange(0, 40);
		}
	} else {
		delete preparedData.device_address_id;
		delete preparedData.fft_sensor_id;
	}

	if (props.fromBannerSensorForm) {
		delete preparedData.location_in_equipment;
		delete preparedData.controller_id;
		if (isLubeMatrixV4.value) {
			preparedData.data_set = props.parentDataSet;
		}
	}

	if (preparedData.lube_version === LUBE_VERSIONS.V3) {
		delete preparedData.ultrasound_position;
		delete preparedData.port_number;
	}

	return preparedData;
};

const buildSubmitPayload = (preparedData) => {
	const pumpFormData = showPumpForm.value ? pumpFormRef.value?.getFormData?.() : null;
	const levelZonesFormData = enableLevelZonesForm.value ? { ...levelZoneForm.value } : null;

	if (pumpFormData) {
		pumpFormData.position = preparedData.lube_version === LUBE_VERSIONS.V3
			? 0
			: preparedData.ultrasound_position;
	}

	return pumpFormData || levelZonesFormData
		? { formData: preparedData, pumpFormData, levelZonesFormData }
		: { formData: preparedData };
};

const prepareFormPayload = (data) => {
	const preparedData = prepareSubmitData(localPrepareSubmitData({
		id: itemId.value,
		...data,
	}));
	return buildSubmitPayload(preparedData);
};

const toggleSubmitRequestResult = (settings = {}) => {
	const { isLoading, success } = settings;

	if (isLoading) {
		emit('event', { eventName: 'toggleSpinner', data: true });
		return;
	}

	emit('event', {
		eventName: 'handleFormSubmitFinish',
		data: { isLoading, success },
	});
};

const saveSensor = (formDataForSave) => {
	const method = formDataForSave?.id ? 'put' : 'post';
	const url = formDataForSave?.id ? `/sensors/${formDataForSave.id}` : '/sensors';

	return api_request[method](url, {
		data: formDataForSave,
		itemName: 'Sensor',
	});
};

const savePump = ({ pumpFormData, sensorId }) => {
	const method = pumpFormData.id ? 'put' : 'post';
	const url = pumpFormData.id ? `/ultrasound/pumps/${pumpFormData.id}` : '/ultrasound/pumps';

	return api_request[method](url, {
		data: {
			...pumpFormData,
			sensor_id: sensorId,
		},
		itemName: 'Pump',
	});
};

const saveLevelZone = ({ levelZonesFormData, sensorId }) =>
	api_request.post(`/sensors/jobs/${sensorId}/level-zones`, {
		data: levelZonesFormData,
		itemName: 'Zones',
	});

const sensorSave = (payloadData) => {
	if (!payloadData) return;

	const { formData: formDataForSave, pumpFormData, levelZonesFormData } = payloadData;
	let successCounter = 0;
	const responseQuantity = 1 + (pumpFormData ? 1 : 0) + (levelZonesFormData ? 1 : 0);

	if (formDataForSave.lube_version !== LUBE_VERSIONS.V3) {
		formDataForSave.ultrasound_position = pumpFormData ? +pumpFormData.position : null;
	} else {
		delete formDataForSave.ultrasound_position;
		if (pumpFormData) pumpFormData.position = 0;
		delete formDataForSave.port_number;
	}

	toggleSubmitRequestResult({ isLoading: 1 });

	saveSensor(formDataForSave)
		.then((answer) => {
			successCounter++;
			const savedSensorId = answer?.data?.data?.id || formDataForSave.id;
			itemId.value = savedSensorId;

			if (pumpFormData) {
				savePump({ pumpFormData, sensorId: savedSensorId })
					.then(() => {
						successCounter++;
						if (successCounter === responseQuantity) {
							toggleSubmitRequestResult({ isLoading: 0, success: 1 });
						}
					})
					.catch(() => {
						toggleSubmitRequestResult({ isLoading: 0, success: 0 });
					});
			}

			if (levelZonesFormData) {
				saveLevelZone({ levelZonesFormData, sensorId: savedSensorId })
					.then(() => {
						successCounter++;
						if (successCounter === responseQuantity) {
							toggleSubmitRequestResult({ isLoading: 0, success: 1 });
						}
					})
					.catch(() => {
						toggleSubmitRequestResult({ isLoading: 0, success: 0 });
					});
			}

			if (!pumpFormData && !levelZonesFormData) {
				toggleSubmitRequestResult({ isLoading: 0, success: 1 });
			}
		})
		.catch(() => {
			toggleSubmitRequestResult({ isLoading: 0, success: 0 });
		});
};

const localSubmit = (payloadData) => {
	sensorSave(payloadData);
};

const {
	isMobile,
	itemId,
	setupPage,
	validateItemForm,
	getFormData,
	submitItemForm,
} = useSubItem({
	itemData: computed(() => props.itemData),
	formData,
	itemFormRef,
	localSetupPageActions: localSetupPage,
	localValidationHook,
	localGetFormData: prepareFormPayload,
	localSubmit,
	emit,
});

const validateForm = () => {
	if (!validateItemForm()) return false;
	submitItemForm();
	return true;
};

const handleSave = () => {
	validateForm();
};

const handleCancel = () => {
	emit('onCancel');
};

watch(
	() => props.equipmentData?.id,
	(equipmentId) => {
		if (equipmentId) {
			formData.value.equipment_id = equipmentId;
		}
	},
	{ immediate: true },
);

watch(
	() => props.itemData,
	(item) => {
		setupPage(item);
	},
);

watch(
	() => formData.value.lube_method,
	(lubeMethod, oldLubeMethod) => {
		if (itemId.value && oldLubeMethod && lubeMethod !== oldLubeMethod) {
			emit('event', { eventName: 'frequencySettingsChanged', data: true });
		}
	},
);

if (!props.fromModal || !props.formulasList.length) {
	fetchDatasetFormulas({ params: { max: -1 } }).then((response) => {
		formulasListLocal.value = response?.data?.data || response?.data || response || [];
	});
}

defineExpose({
	validateForm,
	validateItemForm,
	submitItemForm,
	getFormData,
	localSubmit,
});
</script>
