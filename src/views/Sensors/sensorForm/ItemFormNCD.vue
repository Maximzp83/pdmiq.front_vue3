<template>
	<div class="edit-form-container">
		<el-form
			ref="itemFormRef"
			:class="['item-edit-form', 'relative', 'section-row', 'sensor-form', { 'half-width': !fromModal }]"
			label-width="170px"
			:model="formData"
			:rules="rules"
			:validate-on-rule-change="false"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<!-- <div v-if="itemId" class="custom-form-item el-form-item">
				<div class="el-form-item__label">{{ tt('Sensor') }} id</div>
				<div class="value-instead-input el-form-item__content bold">{{ itemId }}</div>
			</div> -->

			<el-form-item :label="`${tt('Sensor')} ${tt('Type')}`" prop="data_set">
				<CustomSelectV2
					v-model="formData.data_set"
					:disabled="!isNew && !itemData?.is_archived"
					:optionsList="dataSets"
					:placeholder="`${tt('select')} ${tt('dataset')}`"
					:setupLabelMethod="setupDataSetLabel"
				/>
			</el-form-item>

			<el-form-item :label="tt('Location')" prop="location_in_equipment" required>
				<CustomInput
					v-model="formData.location_in_equipment"
					:placeholder="`${tt('enter')} ${tt('location')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Controller')" prop="controller_id">
				<FetchByQuerySelect
					v-model="formData.controller_id"
					clearable
					enableLoadmore
					:disabled="!isNew && !itemData?.is_archived"
					:settings="controllersSelectSettings"
					:placeholder="`${tt('select')} ${tt('controller')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('Node')" prop="port_number">
				<CustomSelectV2
					v-model="formData.port_number"
					:disabled="!isNew && !itemData?.is_archived"
					:optionsList="portsList"
					:placeholder="`${tt('select')} ${tt('port')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('MAC_address')" prop="mac_address">
				<CustomInput
					:modelValue="formData.mac_address"
					:disabled="!isNew && !itemData?.is_archived"
					:placeholder="`${tt('example')}: 00:13:a2:00:41:f5:90:51`"
					@update:modelValue="handleMacAddressInput"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.data_set === DATASET.NCD_4_20MA"
				:label="`${tt('Linespeed')} ${tt('Node')}`"
				prop="is_linespeed_node"
			>
				<el-checkbox v-model="formData.is_linespeed_node" :true-value="1" :false-value="0" />
			</el-form-item>

			<el-form-item
				v-if="!isNew"
				:label="`${tt('Archive')} ${tt('Node')}`"
				prop="is_archived"
			>
				<el-checkbox
					v-model="formData.is_archived"
					:true-value="1"
					:false-value="0"
					@change="isArchivedChanged = true"
				/>
			</el-form-item>

			<div v-if="formData.data_set === DATASET.NCD_4_20MA" class="el-form-item">
				<el-form-item
					prop="ncd_config_sensor_boot_time_420ma"
					:label="tt('phrases.sensor_boot_time')"
					class="mcol-xs-6"
					required
				>
					<el-input-number v-model="formData.ncd_config_sensor_boot_time_420ma" />
				</el-form-item>

				<el-form-item prop="value_4ma" :label="`4mA ${tt('Value')}`" class="mcol-xs-6" required>
					<el-input-number v-model="formData.value_4ma" />
				</el-form-item>

				<el-form-item prop="value_20ma" :label="`20mA ${tt('Value')}`" class="mcol-xs-6" required>
					<el-input-number v-model="formData.value_20ma" />
				</el-form-item>

				<el-form-item :label="`${tt('Chart')} ${tt('Name')}`" prop="chart_name" required>
					<CustomInput v-model="formData.chart_name" :placeholder="`${tt('enter')} ${tt('name')}`" />
				</el-form-item>

				<el-form-item :label="tt('units')" prop="chart_unit_label" required>
					<CustomInput
						v-model="formData.chart_unit_label"
						:placeholder="`${tt('enter')} ${tt('units')}`"
					/>
				</el-form-item>

				<el-form-item :label="tt('Expression')" class="showJustInfo">
					<CustomInput :modelValue="ncd420Expression" disabled />
				</el-form-item>

				<el-form-item :label="`${tt('constants.Alarm')} ${tt('Type')}`" prop="alarm_type" required>
					<CustomSelectV2
						v-model="formData.alarm_type"
						clearable
						:optionsList="ncdAlarmTypes"
						:placeholder="`${tt('select')} ${tt('type')}`"
					/>
				</el-form-item>
			</div>

			<div v-if="formData.data_set === DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM" class="el-form-item">
				<span class="el-form-item__label">{{ tt('Expression') }}</span>
				<span class="el-form-item__content" style="margin-left: 150px; display: block;">
					{{ formulaExpression }}
				</span>
			</div>

			<el-form-item
				v-show="isPowerTypeEnabled"
				:label="`${tt('Power')} ${tt('Type')}`"
				prop="power_type"
			>
				<CustomSelectV2
					v-model="formData.power_type"
					clearable
					:optionsList="powerTypes"
					:placeholder="`${tt('select')} ${tt('type')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.data_set === DATASET.NCD_PRESSURE"
				:label="`${tt('Sensor')} ${tt('Range')}`"
				prop="pressure_range"
				required
			>
				<CustomSelectV2
					v-model="formData.pressure_range"
					clearable
					:optionsList="ncdPressureRanges"
					:placeholder="`${tt('select')} ${tt('range')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="showTempVibeAxisFields"
				:label="`${tt('Vertical')} ${tt('Axis')}`"
				prop="ncd_active_vertical_axis"
				required
			>
				<CustomSelectV2
					v-model="formData.ncd_active_vertical_axis"
					:optionsList="ncdAxis"
					:placeholder="`${tt('select')} ${tt('axis')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="showTempVibeAxisFields"
				:label="`${tt('Axial')} ${tt('Axis')}`"
				prop="ncd_active_axial_axis"
				required
			>
				<CustomSelectV2
					v-model="formData.ncd_active_axial_axis"
					:optionsList="ncdAxis"
					:placeholder="`${tt('select')} ${tt('axis')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="showTempVibeAxisFields"
				:label="tt('phrases.hide_vertical_axis_rms')"
				prop="is_hidden_ncd_active_vertical_axis"
			>
				<el-checkbox
					v-model="formData.is_hidden_ncd_active_vertical_axis"
					:true-value="1"
					:false-value="0"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.data_set === DATASET.NCD_ENVIRONMENTAL"
				:label="tt('phrases.disable_IAQ')"
				prop="is_iaq_disabled"
			>
				<el-checkbox v-model="formData.is_iaq_disabled" :true-value="1" :false-value="0" />
			</el-form-item>

			<el-form-item :label="tt('phrases.is_google_cloud_data')" prop="is_google_cloud_data">
				<el-checkbox v-model="formData.is_google_cloud_data" :true-value="1" :false-value="0" />
			</el-form-item>

			<el-form-item
				v-if="showTempVibeAxisFields"
				prop="equipment_rpm"
				:label="`${tt('constants.Motor')} ${tt('RPM')}`"
				class="mcol-xs-6"
			>
				<CustomInput v-model="formData.equipment_rpm" :placeholder="`${tt('enter')} ${tt('rpm')}`" />
			</el-form-item>

			<el-form-item
				v-if="formData.data_set === DATASET.NCD_TEMP_VIBE_CURRENT"
				prop="current_sensor_rating"
				:label="`${tt('Current')} ${tt('Sensor')} ${tt('Rating')}`"
				class="mcol-xs-6"
			>
				<CustomInput
					v-model="formData.current_sensor_rating"
					:placeholder="`${tt('enter')} ${tt('rating')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="formData.data_set === DATASET.NCD_4_20MA"
				:label="`${tt('Node')} ${tt('Type')}`"
				prop="node_type"
			>
				<CustomSelectV2
					v-model="formData.node_type"
					clearable
					:optionsList="ncdNodeTypes"
					:placeholder="`${tt('select')} ${tt('type')}`"
				/>
			</el-form-item>

			<el-form-item
				v-if="showNcdUltrasoundPosition"
				:label="tt('Position')"
				prop="ncd_ultrasound_position"
			>
				<CustomSelectV2
					v-model="formData.ncd_ultrasound_position"
					:disabled="!isNew && !itemData?.is_archived"
					:optionsList="ncdUltrasoundPositions"
					:placeholder="`${tt('select')} ${tt('position')}`"
					:setupLabelMethod="setupPositionLabel"
				/>
			</el-form-item>

			<el-form-item :label="tt('phrases.Notifications_for')" prop="sensor_default_notifications">
				<FetchByQuerySelect
					v-model="formData.sensor_default_notifications"
					clearable
					multiple
					enableLoadmore
					:settings="usersSelectSettings"
					:placeholder="`${tt('select')} ${tt('users')}`"
				/>
			</el-form-item>

			<el-form-item :label="tt('phrases.samples_to_alarm')" prop="crash_indication_threshold">
				<div class="flex">
					<el-input-number
						v-if="editAcute"
						v-model="formData.crash_indication_threshold"
						:min="1"
						:max="500"
					/>
					<div v-else class="bold value-instead-input">{{ initCrashIndicationThreshold }}</div>
					<div
						class="link underline value-instead-input toggle-link"
						@click="editAcute = !editAcute"
					>
						{{ editAcute ? tt('Cancel') : tt('Change') }}
					</div>
				</div>
				<div>{{ (editAcute ? formData.crash_indication_threshold : initCrashIndicationThreshold) * 5 }} minutes</div>
			</el-form-item>

			<el-form-item :label="tt('phrases.samples_to_settle')" prop="stable_samples">
				<div class="flex">
					<el-input-number v-if="editStableSamples" v-model="formData.stable_samples" :min="1" />
					<div v-else class="bold value-instead-input">{{ initStableSamples }}</div>
					<div
						class="link underline value-instead-input toggle-link"
						@click="editStableSamples = !editStableSamples"
					>
						{{ editStableSamples ? tt('Cancel') : tt('Change') }}
					</div>
				</div>
				<div>{{ (editStableSamples ? formData.stable_samples : initStableSamples) * 5 }} minutes</div>
			</el-form-item>

			<el-form-item
				v-if="runtimeTrackingSwitcher"
				:label="tt('phrases.Show_Run_Hours')"
				prop="is_runtime_tracking"
			>
				<el-switch v-model="formData.is_runtime_tracking" :active-value="1" :inactive-value="0" />
			</el-form-item>

			<el-form-item
				v-if="formData.is_runtime_tracking"
				:label="tt('phrases.runtime_tracking_threshold_data_value')"
				prop="runtime_tracking_threshold_data_value"
			>
				<el-input-number v-model="formData.runtime_tracking_threshold_data_value" />
			</el-form-item>

			<FormOperationsButtons
				v-if="!fromModal"
				@onCancel="handleCancel"
				@onSave="handleSave"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

import { api_request } from '@/api/request_provider';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	DATASET,
	NCD_NODE_TYPES,
	NCD_REQUEST_STATUSES,
	SENSOR_TYPES,
	dataSetsList,
	ncdAlarmTypesList,
	ncdNodeTypesList,
	ncdPressureRangesList,
	ncdUltrasoundPositionsList,
	powerTypesList,
} from '@/constants/global';
import { required } from '@/constants/validation';
import { findItemBy, prepareSubmitData } from '@/helpers';
import { macAddressMask } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { ncdAxisList } from '@/modules/charts_factory/controllers/Sensor/enums';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSensors } from '@/composables/useSensors';
import { useNotify } from '@/composables/useNotify';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useWebSocket } from '@/composables/mixins/useWebSocket';

import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';

const { tt } = Lang;

defineOptions({
	name: 'SensorItemFormNCD',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
	additionalSettings: { type: Object, default: () => ({}) },
	itemsName: { type: Object, default: () => ({}) },
	equipmentData: { type: Object, default: () => ({}) },
	isNew: Boolean,
	controllersList: { type: Array, default: () => [] },
	formulasList: { type: Array, default: () => [] },
	commonItemsLoadings: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['submit', 'onCancel', 'event']);

const { fetchDatasetFormulas } = useSensors();
const { Notify } = useNotify();
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const { setupWebSocket, closeWebSocket } = useWebSocket();

const itemFormRef = ref(null);
const formulasListLocal = ref([]);
const editAcute = ref(false);
const editStableSamples = ref(false);
const initCrashIndicationThreshold = ref(5);
const initStableSamples = ref(10);
const isArchivedChanged = ref(false);

const initialFormData = {
	id: null,
	type: SENSOR_TYPES.NCD,
	equipment_id: props.equipmentData?.id || null,
	controller_id: null,
	port_number: null,
	mac_address: '',
	location_in_equipment: '',
	sensor_default_notifications: [],
	data_set: DATASET.NCD_ALL_IN_ONE_TEMP_VIBE,
	expression: '',
	power_type: null,
	equipment_rpm: 1800,
	current_sensor_rating: 0,
	position: null,
	crash_indication_threshold: 5,
	stable_samples: 10,
	is_archived: false,
	ncd_ultrasound_position: null,
	ncd_active_vertical_axis: 1,
	ncd_active_axial_axis: 1,
	is_hidden_ncd_active_vertical_axis: 0,
	pressure_range: null,
	is_runtime_tracking: false,
	is_google_cloud_data: 0,
	runtime_tracking_threshold_data_value: undefined,
	ncd_config_sensor_boot_time_420ma: 5,
	node_type: null,
	chart_name: '',
	chart_unit_label: '',
	value_4ma: '',
	value_20ma: '',
	alarm_type: null,
	is_iaq_disabled: false,
	is_linespeed_node: false,
	is_lube_mode: false,
};
const formData = ref({ ...initialFormData });

const rules = reactive({
	equipment_id: required,
	port_number: required,
	controller_id: required,
	data_set: required,
	power_type: null,
	current_sensor_rating: null,
	location_in_equipment: required,
});

const { currentSensorType } = useSensorType({
	currentSensorTypeData: formData,
});

const dataSets = computed(() =>
	Object.freeze(dataSetsList().filter((item) => item.controller_type === SENSOR_TYPES.NCD)),
);
const powerTypes = computed(() => Object.freeze(powerTypesList()));
const ncdAlarmTypes = computed(() => Object.freeze(ncdAlarmTypesList()));
const ncdUltrasoundPositions = computed(() => Object.freeze(ncdUltrasoundPositionsList));
const ncdAxis = computed(() => Object.freeze(ncdAxisList));
const ncdPressureRanges = computed(() => Object.freeze(ncdPressureRangesList()));
const ncdNodeTypes = computed(() => Object.freeze(ncdNodeTypesList()));
const portsList = computed(() =>
	Object.freeze(Array.from({ length: 40 }, (_, index) => ({ id: index + 1, name: index + 1 }))),
);
const finalFormulasList = computed(() =>
	props.fromModal && props.formulasList.length ? props.formulasList : formulasListLocal.value,
);
const showTempVibeAxisFields = computed(() =>
	[
		DATASET.NCD_WIRED_TEMP_VIBE,
		DATASET.NCD_TEMP_VIBE_CURRENT,
		DATASET.NCD_ALL_IN_ONE_TEMP_VIBE,
	].includes(formData.value.data_set),
);
const isPowerTypeEnabled = computed(() =>
	[
		DATASET.NCD_WIRED_TEMP_VIBE,
		DATASET.NCD_TEMP_VIBE_CURRENT,
		DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM,
		DATASET.NCD_ENVIRONMENTAL,
		DATASET.NCD_PRESSURE,
		DATASET.NCD_4_20MA,
	].includes(formData.value.data_set),
);
const showNcdUltrasoundPosition = computed(
	() =>
		formData.value.data_set === DATASET.NCD_ULTRASOUND_SDT_FULL_SPECTRUM ||
		(formData.value.data_set === DATASET.NCD_4_20MA &&
			formData.value.node_type === NCD_NODE_TYPES.POSITION_2),
);
const runtimeTrackingSwitcher = computed(() => {
	const sensorType = currentSensorType.value;
	return props.equipmentData?.plant_is_equipment_runtime_tracking &&
		(sensorType.isNCDTempVibe ||
			sensorType.isNCDWiredTempVibe ||
			sensorType.isNCDTempVibeCurr);
});
const ncd420Expression = computed(() => {
	if (formData.value.data_set !== DATASET.NCD_4_20MA) return 'm*{reg} + b';

	const { value_4ma, value_20ma, chart_unit_label } = formData.value;
	if (value_4ma !== undefined && value_20ma !== undefined && chart_unit_label !== undefined) {
		const m = (value_20ma - value_4ma) / 16;
		const b = value_4ma - m * 4;
		return `${chart_unit_label} = ${m}(mA) + ${b}`;
	}

	return 'm*{reg} + b';
});
const formulaExpression = computed(() => {
	const item = findItemBy('data_set', formData.value.data_set, finalFormulasList.value);
	return item?.expression || '';
});

const controllersSelectSettings = computed(() => ({
	fetchAction: createGetRequest(ENTITIES.Controllers.apiBase),
	fetchByIdAction: createGetByIdRequest(ENTITIES.Controllers.apiBase),
	params: {
		max: -1,
		type: SENSOR_TYPES.NCD,
		plantId: globalStore.navbarSettings?.showPlantName?.id || globalStore.globalFilters?.plantId,
	},
}));
const equipmentsSelectSettings = computed(() => ({
	fetchAction: createGetRequest(ENTITIES.Equipments.apiBase),
	fetchByIdAction: createGetByIdRequest(ENTITIES.Equipments.apiBase),
	params: { max: 100 },
}));
const usersSelectSettings = computed(() => ({
	fetchAction: createGetRequest(ENTITIES.Users.apiBase),
	fetchByIdAction: createGetByIdRequest(ENTITIES.Users.apiBase),
	params: { max: 100, forNotifiable: true },
}));

const setupDataSetLabel = (item) => `${item.label} ${item.alt_label ? `(${item.alt_label})` : ''}`;
const setupPositionLabel = (item) => `${tt('position')} ${item.id}`;

const handleMacAddressInput = (value) => {
	formData.value.mac_address = macAddressMask(value);
};

const setupEquipmentRpm = (sensor) => {
	formData.value.equipment_rpm = sensor?.equipment_rpm || 1800;

	if (props.equipmentData?.equipmentType?.name === 'Motor' && props.equipmentData?.typeOptions) {
		const rpmItem = findItemBy('is_rpm', true, props.equipmentData.typeOptions);
		if (rpmItem) {
			formData.value.equipment_rpm = rpmItem.raw_values?.[0] || 1800;
		}
	}
};

const setupEquipmentFla = (sensor) => {
	if (sensor?.current_sensor_rating || !props.equipmentData?.typeOptions) return;

	const flaItem = findItemBy('is_fla', true, props.equipmentData.typeOptions);
	if (flaItem) {
		formData.value.current_sensor_rating = flaItem.raw_values?.[0];
	}
};

const localSetupPage = (item) => {
	if (item) {
		initCrashIndicationThreshold.value =
			item.crash_indication_threshold || item.controller?.crash_indication_threshold || 5;
		initStableSamples.value = item.stable_samples || item.controller?.stable_samples || 10;
		formData.value.crash_indication_threshold = initCrashIndicationThreshold.value;
		formData.value.stable_samples = initStableSamples.value;
	}

	setupEquipmentRpm(item);
	setupEquipmentFla(item);

	if (props.equipmentData?.id) {
		formData.value.equipment_id = props.equipmentData.id;
	}
};

const localValidationHook = () => {
	if (
		formData.value.ncd_active_axial_axis &&
		formData.value.ncd_active_axial_axis === formData.value.ncd_active_vertical_axis
	) {
		Notify({
			type: 'warning',
			title: tt('Error'),
			message: tt('phrases.choose_a_different_axis'),
		});
		return false;
	}

	return true;
};

const localPrepareSubmitData = (data) => {
	const preparedData = {
		...data,
		type: SENSOR_TYPES.NCD,
	};

	if (!isPowerTypeEnabled.value) {
		delete preparedData.power_type;
	}

	if (preparedData.data_set === DATASET.NCD_TEMP_VIBE_CURRENT) {
		preparedData.current_sensor_rating = +preparedData.current_sensor_rating;
	} else {
		delete preparedData.current_sensor_rating;
	}

	if (!showNcdUltrasoundPosition.value) {
		delete preparedData.position;
		delete preparedData.ncd_ultrasound_position;
	}

	if (showTempVibeAxisFields.value) {
		preparedData.equipment_rpm = +preparedData.equipment_rpm;
	} else {
		delete preparedData.equipment_rpm;
		delete preparedData.ncd_active_vertical_axis;
		delete preparedData.ncd_active_axial_axis;
		delete preparedData.is_hidden_ncd_active_vertical_axis;
	}

	if (preparedData.data_set !== DATASET.NCD_4_20MA) {
		delete preparedData.ncd_config_sensor_boot_time_420ma;
		delete preparedData.node_type;
		delete preparedData.chart_name;
		delete preparedData.chart_unit_label;
		delete preparedData.value_4ma;
		delete preparedData.value_20ma;
		delete preparedData.alarm_type;
		delete preparedData.is_linespeed_node;
	}

	if (preparedData.data_set !== DATASET.NCD_ENVIRONMENTAL) {
		delete preparedData.is_iaq_disabled;
	}

	delete preparedData.data_set_convert_value;

	if (!editAcute.value) {
		delete preparedData.crash_indication_threshold;
	}
	if (!editStableSamples.value) {
		delete preparedData.stable_samples;
	}

	return preparedData;
};

const buildSubmitPayload = (preparedData) => {
	const sensorType = currentSensorType.value;
	const isNcdSdt =
		sensorType.isNCDSDT ||
		(sensorType.isNCDCustom_4_20 && preparedData.node_type === NCD_NODE_TYPES.POSITION_2);
	const archivationAction = isArchivedChanged.value
		? tt(preparedData.is_archived ? 'Archived' : 'Restored')
		: '';

	return {
		formData: preparedData,
		payload: { formData: preparedData },
		enableWebSocket: props.isNew || isArchivedChanged.value,
		isNCDSDT: isNcdSdt,
		successMessage: archivationAction
			? `${tt('Sensor')} ${archivationAction} ${tt('Successfully')}`
			: '',
		ncdWebSocketData: {
			enableWebSocket: props.isNew || isArchivedChanged.value,
			isNcdSdt,
			isNew: props.isNew,
			initialArchiveStatus: preparedData.is_archived,
			skipWebSocket: !!preparedData.is_google_cloud_data,
			successMessage: archivationAction
				? `${tt('Sensor')} ${archivationAction} ${tt('Successfully')}`
				: '',
		},
	};
};

const prepareFormPayload = (data) => buildSubmitPayload(prepareSubmitData(localPrepareSubmitData({
	id: itemId.value,
	...data,
})));

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

const toggleMainPreloader = (open, text = '', success) => {
	globalStore.set_global_state({
		stateProp: 'mainPreloader',
		value: open,
	});
	globalStore.set_global_state({
		stateProp: 'overlayData',
		value: open
			? { show: true, text, textStyle: { fontSize: '25px' } }
			: { show: false, text: '', onClick: () => {} },
	});

	if (!open) {
		toggleSubmitRequestResult({ isLoading: 0, success });
	}
};

const waitForNcdStatus = ({ sensorId, answer, ncdWebSocketData }) => {
	const {
		enableWebSocket,
		isNcdSdt,
		isNew: sensorIsNew,
		initialArchiveStatus,
		skipWebSocket,
		successMessage,
		failMessage,
	} = ncdWebSocketData || {};
	const savedSensor = answer?.data?.data || {};
	const shouldWait =
		enableWebSocket &&
		(isNcdSdt ? sensorIsNew || initialArchiveStatus !== savedSensor.is_archived : true) &&
		!skipWebSocket;
	const socketChannel = authStore.authUser?.uuid ? `user.${authStore.authUser.uuid}` : null;

	if (!shouldWait || !socketChannel) return Promise.resolve(answer);

	toggleMainPreloader(true, `${tt('Working')}...`);

	return new Promise((resolve, reject) => {
		setupWebSocket({
			socketName: 'ncd_status_socket',
			socketChannel,
			onError: (err) => {
				console.error('NCD socket error:', err?.message || err);
				Notify({
					type: 'warning',
					title: tt('Fail'),
					message: tt('phrases.web_socket_error'),
					duration: 0,
				});
				closeWebSocket({ socketName: 'ncd_status_socket' });
				reject(err);
			},
			onMessage: ({ data, type }) => {
				if (type !== 'ncd.command' || data?.sensor_id !== sensorId) return;

				if (data.status === NCD_REQUEST_STATUSES.SUCCESS) {
					Notify({
						type: 'success',
						title: tt('Success'),
						message: successMessage || tt('phrases.sensor_created_successfully'),
					});
					closeWebSocket({ socketName: 'ncd_status_socket' });
					resolve(answer);
				}

				if (data.status === NCD_REQUEST_STATUSES.FAIL) {
					Notify({
						type: 'warning',
						title: tt('Fail'),
						message: failMessage || tt('phrases.error_check_controller_connectivity'),
						duration: 0,
					});
					closeWebSocket({ socketName: 'ncd_status_socket' });
					reject(new Error('NCD command failed'));
				}
			},
		});
	});
};

const saveSensor = (formDataForSave, settings = {}) => {
	const method = formDataForSave?.id ? 'put' : 'post';
	const url = formDataForSave?.id ? `/sensors/${formDataForSave.id}` : '/sensors';

	return api_request[method](url, {
		data: formDataForSave,
		itemName: 'Sensor',
		notNotify: settings?.enableWebSocket,
	});
};

const localSubmit = (formPayload) => {
	const { payload, ncdWebSocketData } = formPayload || {};
	const formDataForSave = payload?.formData || formPayload?.formData || formPayload;

	toggleSubmitRequestResult({ isLoading: 1 });

	saveSensor(formDataForSave, ncdWebSocketData)
		.then((answer) => {
			const savedSensorId = answer?.data?.data?.id || formDataForSave?.id;
			if (savedSensorId) {
				itemId.value = savedSensorId;
			}

			return ncdWebSocketData
				? waitForNcdStatus({ sensorId: savedSensorId, answer, ncdWebSocketData })
				: answer;
		})
		.then((answer) => {
			toggleMainPreloader(false, '', true);
			return answer;
		})
		.catch(() => {
			toggleMainPreloader(false, '', false);
		});
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

const validateForm = async () => {
	if (!(await validateItemForm())) return false;
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
	() => formData.value.data_set,
	(id) => {
		rules.power_type = isPowerTypeEnabled.value ? required : null;
		if (!isPowerTypeEnabled.value) {
			formData.value.power_type = null;
		}

		if (id === DATASET.NCD_TEMP_VIBE_CURRENT) {
			rules.current_sensor_rating = required;
		} else {
			rules.current_sensor_rating = null;
			formData.value.current_sensor_rating = null;
		}
	},
	{ immediate: true },
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
