<template>
	<div :class="['edit-form-container', { 'half-width': !fromModal }]">
		<el-form
			ref="itemFormRef"
			class="item-edit-form relative section-row sensor-form"
			label-width="150px"
			:model="formData"
			:rules="rules"
			:validate-on-rule-change="false"
			:label-position="isMobile ? 'top' : 'left'"
		>
				<div v-if="showDeviceDataRegisters" class="content-row info-list">
					<div class="info-item">
						<div class="div-block"><b>{{ tt('Model') }}</b>:</div>
						<div class="div-block info">{{ itemData.device_data.Model }}</div>
					</div>
					<div class="info-item">
						<div class="div-block"><b>{{ tt('Serial_Number') }}</b>:</div>
						<div class="div-block info">{{ itemData.device_data.Sn }}</div>
					</div>
					<div class="info-item">
						<div class="div-block"><b>{{ `${tt('Sensor')} ${tt('Model')}` }}</b>:</div>
						<div class="div-block info">{{ itemData.device_data.SenModel }}</div>
					</div>
					<div class="info-item">
						<div class="div-block"><b>{{ `${tt('Sensor')} ${tt('Serial_Number')}` }}</b>:</div>
						<div class="div-block info">{{ itemData.device_data.SenSn }}</div>
					</div>
					<div class="info-item">
						<div class="div-block"><b>{{ `${tt('Sensor')} ${tt('Firmware_Number')}` }}</b>:</div>
						<div class="div-block info">{{ itemData.device_data.SenFwVer_Evaluated }}</div>
					</div>
				</div>

				<div v-if="showLastLubricationExternalStats" class="content-row info-list">
					<div class="info-item">
						<div class="div-block"><b>{{ tt('phrases.shots_count_per_today') }}</b>:</div>
						<div class="div-block info">{{ itemData.last_lubrication_external_stats.shots_count_per_today }}</div>
					</div>
					<div class="info-item">
						<div class="div-block"><b>{{ tt('phrases.total_shots_count') }}</b>:</div>
						<div class="div-block info">{{ itemData.last_lubrication_external_stats.total_shots_count }}</div>
					</div>
					<div class="info-item">
						<div class="div-block"><b>{{ tt('phrases.total_successful_shots_count') }}</b>:</div>
						<div class="div-block info">{{ itemData.last_lubrication_external_stats.total_successful_shots_count }}</div>
					</div>
					<div class="info-item">
						<div class="div-block"><b>{{ tt('phrases.total_unsuccessful_shots_count') }}</b>:</div>
						<div class="div-block info">{{ itemData.last_lubrication_external_stats.total_unsuccessful_shots_count }}</div>
					</div>
				</div>

				<el-form-item :label="tt('Type')" prop="data_set" class="content-row">
					<CustomSelectV2
						v-model="formData.data_set"
						:optionsList="dataSets"
						:placeholder="`${tt('select')} ${tt('dataset')}`"
						:setupLabelMethod="setupDataSetLabel"
						@change="handleChangeDataSet"
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
						:settings="controllersSelectSettings"
						:placeholder="`${tt('select')} ${tt('controller')}`"
					/>
				</el-form-item>

				<!-- <el-form-item :label="tt('Item')" prop="equipment_id">
					<FetchByQuerySelect
						v-model="formData.equipment_id"
						clearable
						enableLoadmore
						:settings="equipmentsSelectSettings"
						:placeholder="`${tt('select')} ${tt('item')}`"
					/>
				</el-form-item> -->

				<el-form-item
					v-if="showPortNumber"
					:label="tt('Node')"
					prop="port_number"
				>
					<CustomSelectV2
						v-model="formData.port_number"
						:optionsList="portsList"
						:placeholder="`${tt('select')} ${tt('port')}`"
					/>
				</el-form-item>

				<el-form-item
					:label="tt('phrases.Notifications_for')"
					prop="sensor_default_notifications"
				>
					<FetchByQuerySelect
						v-model="formData.sensor_default_notifications"
						clearable
						multiple
						enableLoadmore
						:settings="usersSelectSettings"
						:placeholder="`${tt('select')} ${tt('users')}`"
					/>
				</el-form-item>

				<el-form-item :label="tt('phrases.Acute_samples')" prop="crash_indication_threshold">
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
				</el-form-item>

				<el-form-item :label="tt('phrases.Stable_samples')" prop="stable_samples">
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
				</el-form-item>

				<el-form-item
					:label="`${tt('Recommended')} ${tt('Work_Order')}`"
					prop="is_creating_recommended_maintenance"
					class="label_pt-0"
				>
					<div class="flex mrow align-center">
						<span class="mcol-xs-4">
							<el-switch v-model="formData.is_creating_recommended_maintenance" />
						</span>
						<span v-show="formData.is_creating_recommended_maintenance" class="mcol-xs-8">
							<span class="flex">
								<el-checkbox v-model="maintenanceWarning">Warning</el-checkbox>
								<el-checkbox v-model="maintenanceAlarm">Alarm</el-checkbox>								
							</span>
						</span>
					</div>
				</el-form-item>

				<el-form-item
					v-if="currentSensorType.isBanner"
					:label="`${tt('phrases.Model_Power')} ${tt('Type')}`"
					prop="power_type"
					required
				>
					<CustomSelectV2
						v-model="formData.power_type"
						:optionsList="bannerPowerTypes"
						:placeholder="`${tt('select')} ${tt('type')}`"
					/>
				</el-form-item>

				<el-form-item
					v-if="currentSensorType.isCustomPDM"
					:label="`${tt('Setup')} ${tt('Type')}`"
					prop="setup_type"
					required
				>
					<CustomSelectV2
						v-model="formData.setup_type"
						:optionsList="sensorCustomSetupTypes"
						:placeholder="`${tt('select')} ${tt('setup')}`"
					/>
				</el-form-item>

				<el-form-item
					v-if="currentSensorType.isBannerV2Generic"
					:label="tt('phrases.banner_v2_subtype')"
					prop="banner_v2_subtype_id"
				>
					<FetchByQuerySelect
						v-model="formData.banner_v2_subtype_id"
						clearable
						enableLoadmore
						:settings="bannerSubtypesSelectSettings"
						:placeholder="`${tt('select')} ${tt('subtype')}`"
					/>
				</el-form-item>

				<div
					v-if="currentSensorType.isBannerV2Generic && preparedSubtypeParametersList.length"
					class="el-form-item form-subitems-list content-row"
				>
					<SubTypeParameterItem
						v-for="(item, idx) in preparedSubtypeParametersList"
						:ref="(el) => setSubItemRef('SubTypeParameterItem', el, idx)"
						:key="`subtype_item-${item.id}`"
						:item-data="item"
						:item-index="idx"
						fromModal
					/>
				</div>

				<el-form-item
					v-if="currentSensorType.isBannerTempVibe2 || currentSensorType.isBannerV2_1"
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
					v-if="currentSensorType.isBannerTempVibe2 || currentSensorType.isBannerV2_1"
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
					v-if="showDeviceAddressFields"
					:label="`${tt('Device')} ${tt('address')} id`"
					prop="device_address_id"
					required
				>
					<CustomInput v-model="formData.device_address_id" />
				</el-form-item>

				<el-form-item
					v-if="showDeviceAddressFields"
					:label="`${tt('Sensor')} Id`"
					prop="fft_sensor_id"
					required
				>
					<CustomInput v-model="formData.fft_sensor_id" />
				</el-form-item>

				<el-form-item
					class="switcher"
					v-if="showRebaselineSwitch"
					:label="`${tt('Start')} ${tt('rebaseline')}`"
					prop="is_re_baseline"
				>
					<el-switch  v-model="formData.is_re_baseline" :active-value="1" :inactive-value="0" />
				</el-form-item>

				<div v-if="currentSensorType.isExtravibration" class="el-form-item">
					<div class="flex mrow content-row align-center">
						<el-form-item
							prop="equipment_rpm"
							:label="`${tt('constants.Motor')} ${tt('RPM')}`"
							class="mcol-xs-7"
						>
							<el-input v-model.number.lazy="formData.equipment_rpm" />
						</el-form-item>
						<div class="mcol-xs-2">
							<el-button
								:loading="rpmSending"
								type="primary"
								native-type="button"
								class="form-button-element"
								@click="sendRpm"
							>
								{{ tt('Send') }}
							</el-button>
						</div>
					</div>

					<div class="el-form-item content-row bold">
						{{ tt('phrases.Extra_vibration_threshold_multipliers') }}:
					</div>
					<div class="content-row mrow flex wrap threshold-multipliers-form-item">
						<div
							v-for="item in thresholdMultipliersList"
							:key="`threshold-${item.id}`"
							class="mcol-xs-6"
						>
							<label class="el-form-item__label">{{ item.key }}</label>
							<el-form-item :prop="`threshold_multipliers.${item.key}`">
								<el-input v-model.lazy="formData.threshold_multipliers[item.key]" />
							</el-form-item>
							<span>%</span>
						</div>
					</div>
				</div>

				<el-form-item
					v-if="currentSensorType.isBannerCM1L"
					:label="`CM1L ${tt('Type')}`"
					prop="data_set_converter"
					class="dataSetRadioBlock"
				>
					<el-radio-group v-model="formData.data_set_converter">
						<el-radio-button
							v-for="item in dataSetConverters"
							:key="`data_set_converter-${item.id}`"
							:disabled="item.id === DATASET_CONVERTERS.AMPS_CUSTOM_150"
							:label="item.id"
						>
							{{ item.label }}
						</el-radio-button>
					</el-radio-group>
				</el-form-item>

				<el-form-item
					v-if="showCustomConverterValue"
					:label="`${tt('Custom')} A`"
					prop="data_set_convert_value"
					required
				>
					<CustomInput v-model="formData.data_set_convert_value" :placeholder="tt('value')" />
				</el-form-item>

				<el-form-item
					v-if="runtimeTrackingSwitcher"
					:label="tt('phrases.Show_Run_Hours')"
					prop="is_runtime_tracking"
				>
					<el-switch v-model="formData.is_runtime_tracking" :active-value="1" :inactive-value="0" />
				</el-form-item>

				<el-form-item
					v-if="showRunningThresholds"
					:label="tt('phrases.Running_Threshold')"
					prop="running_thresholds"
				>
					<div class="options-container wrapperBlock">
						<div
							v-if="runningThresholdItemsList.length"
							:class="['content-row running-thresholds-list', { fluid: fromModal }]"
						>
							<RunningThresholdItem
								v-for="(item, idx) in runningThresholdItemsList"
								:ref="(el) => setSubItemRef('RunningThresholdItem', el, idx)"
								:key="`param-${item.id}`"
								:item-data="item"
								:item-index="idx"
								:isLast="idx === runningThresholdItemsList.length - 1"
								:parametersList="runningThresholdParametersList.all"
								@onRemove="(id) => removeFormItem(id, runningThresholdItemsList)"
							/>
						</div>

						<div class="margin-top-row button-row">
							<el-button
								class="action-button create-button small with-text"
								size="small"
								type="success"
								@click="addFormItem(runningThresholdItemsList, 'rt_i-')"
							>
								<span class="capitalize">{{ `${tt('add')} ${tt('Parameter')}` }}</span>
								<i class="suffix-icon icomoon icon-cross"></i>
							</el-button>
						</div>
					</div>
				</el-form-item>

				<el-form-item
					class="content-row switcher"
					v-if="showLubeMatrixButton"
					:label="`${tt('Enable')} LubeMatrix`"
					prop="is_lube_mode"
				>
					<el-switch v-model="formData.is_lube_mode" :active-value="1" :inactive-value="0" />
				</el-form-item>

				<div v-if="isLubeMatrixV4" class="content-row">
					<div class="content-row">
						<b>{{ `LubeMatrix ${tt('Setup')}` }}</b>
					</div>
					<el-form-item
						class="content-row"
						:label="tt('phrases.lube_based_device_address_id')"
						prop="lube_based_device_address_id"
						required
					>
						<CustomInput v-model="formData.lube_based_device_address_id" :placeholder="tt('address')" />
					</el-form-item>
					<el-form-item
						:label="tt('phrases.lube_based_physical_sensor_id')"
						prop="lube_based_physical_sensor_id"
						required
					>
						<CustomInput v-model="formData.lube_based_physical_sensor_id" placeholder="id" />
					</el-form-item>
					<el-form-item
						:label="tt('phrases.lube_trigger_metric_type')"
						prop="lube_trigger_metric_type"
						required
					>
						<CustomSelectV2
							v-model="formData.lube_trigger_metric_type"
							filterable
							:optionsList="runningThresholdParametersList.withThresholdsOnly"
							:placeholder="`${tt('select')} ${tt('type')}`"
						/>
					</el-form-item>
				</div>

				<ItemFormUltraSound
					v-if="isLubeMatrixV4 || isLubeMatrixV3"
					:ref="(el) => setSubItemRef('ItemFormUltraSound', el, 0)"
					class="mt-20"
					fromBannerSensorForm
					:isLubeMatrixV3="isLubeMatrixV3"
					:isLubeMatrixV4="isLubeMatrixV4"
					:fromModal="fromModal"
					:equipmentData="equipmentData"
					:itemData="itemData"
					:itemsName="itemsName"
					:isNew="isNew"
					:dataSetChanged="dataSetChanged"
					:formulasList="formulasList"
					:bearingsList="bearingsList"
					:lubeTypesList="lubeTypesList"
					:controllersList="ultrasound_controllersList"
					:commonItemsLoadings="commonItemsLoadings"
					:parentDataSet="formData.data_set"
					@event="emit('event', $event)"
				/>

				<el-form-item
					class="content-row"
					v-if="formData.is_runtime_tracking"
					:label="tt('phrases.runtime_tracking_threshold_data_value')"
					prop="runtime_tracking_threshold_data_value"
				>
					<el-input-number v-model="formData.runtime_tracking_threshold_data_value" />
				</el-form-item>

				<div v-if="showGainUltrasoundSignal" class="el-form-item flex mrow align-center">
					<div class="mcol-xs-6">
						<span>{{ formulaExpression }}</span>
					</div>
					<div class="mcol-xs-6">
						<el-form-item class="inline-form-row" prop="gain_ultrasound_signal">
							<label class="el-form-item__label">{{ tt('phrases.Gain_signal_value') }}</label>
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

				<el-form-item v-if="showGainUltrasoundSignal">
					<el-button
						type="primary"
						native-type="button"
						class="item-action-button small"
						@click="resetSensor"
					>
						<span>{{ tt('phrases.reset_sensor') }}</span>
					</el-button>
				</el-form-item>

				<el-form-item
					v-if="currentSensorType.isBannerPressure"
					:label="tt('Range')"
					prop="pressure_range"
					required
				>
					<CustomSelectV2
						v-model="formData.pressure_range"
						:optionsList="bannerPressureRanges"
						:placeholder="`${tt('select')} ${tt('range')}`"
					/>
				</el-form-item>
			<FormOperationsButtons
				v-if="!fromModal && !editInModal"
				@onCancel="handleCancel"
				@onSave="handleValidateSensorForm"
			/>
		</el-form>
	</div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ElMessageBox } from 'element-plus';

import { api_request } from '@/api/request_provider';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import {
	DATASET,
	DATASET_CONVERTERS,
	SENSOR_TYPES,
	bannerPowerTypesList,
	bannerPressureRangesList,
	dataSetConvertersList,
	dataSetsList,
	sensorCustomSetupTypesList,
} from '@/constants/global';
import { ADJUSTMENT_ACTIONS_TYPES, LUBE_VERSIONS } from '@/constants/ultrasound';
import { required } from '@/constants/validation';
import { findItemBy, prepareSubmitData, removeDuplicatesObjectsArray } from '@/helpers';
import { Lang } from '@/localization';
import { chartsListsConfig } from '@/modules/charts_factory/controllers/Sensor/chartsListsConfig';
import { ncdAxisList } from '@/modules/charts_factory/controllers/Sensor/enums';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useSubItem } from '@/composables/mixins/useSubItem';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import { useSensors } from '@/composables/useSensors';
import { useNotify } from '@/composables/useNotify';
import { useGlobalStore } from '@/stores/GlobalStore';

import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';
import FormOperationsButtons from '@/components/form/FormOperationsButtons.vue';
import RunningThresholdItem from './RunningThresholdItem.vue';
import SubTypeParameterItem from './SubTypeParameterItem.vue';
import ItemFormUltraSound from './ItemFormUltraSound.vue';

const { tt } = Lang;

defineOptions({
	name: 'SensorItemForm',
});

const props = defineProps({
	itemData: { type: Object, default: null },
	fromModal: Boolean,
	fromAnotherInstance: Boolean,
	additionalSettings: { type: Object, default: () => ({}) },
	itemsName: { type: Object, default: () => ({}) },
	equipmentData: { type: Object, default: () => ({}) },
	isNew: Boolean,
	ignoreLocalSubmit: Boolean,
	editInModal: Boolean,
	commonItemsLoadings: { type: Object, default: () => ({}) },
	controllersList: { type: Array, default: () => [] },
	bannerSubtypesList: { type: Array, default: () => [] },
	formulasList: { type: Array, default: () => [] },
	ultrasound_controllersList: { type: Array, default: () => [] },
	lubeTypesList: { type: Array, default: () => [] },
	bearingsList: { type: Array, default: () => [] },
});

const emit = defineEmits(['submit', 'onCancel', 'event']);

const { fetchDatasetFormulas, sendRpm: sendSensorRpm, gainAdjustment } = useSensors();
const { Notify } = useNotify();
const globalStore = useGlobalStore();

const itemFormRef = ref(null);
const refsMap = ref({});
const formulasListLocal = ref([]);
const rpmSending = ref(false);
const editAcute = ref(false);
const initCrashIndicationThreshold = ref(5);
const editStableSamples = ref(false);
const initStableSamples = ref(10);
const maintenanceAlarm = ref(false);
const maintenanceWarning = ref(false);
const runningThresholdItemsList = ref([]);
const isInitialSetup = ref(true);
const dataSetChanged = ref(false);

const initialFormData = {
	id: null,
	type: SENSOR_TYPES.BANNER,
	equipment_id: props.equipmentData?.id || null,
	controller_id: null,
	port_number: null,
	location_in_equipment: '',
	sensor_default_notifications: [],
	crash_indication_threshold: 5,
	stable_samples: 10,
	data_set: DATASET.TEMP_VIBE,
	data_set_converter: null,
	data_set_convert_value: '',
	setup_type: null,
	equipment_rpm: 0,
	threshold_multipliers: {
		'1x': '',
		'2x': '',
		'3x': '',
		'4x': '',
		'5x': '',
		'6x': '',
		'7x': '',
		'8x': '',
		'9x': '',
		'10x': '',
	},
	is_re_baseline: false,
	is_creating_recommended_maintenance: false,
	alarms_types_maintenance: [],
	gain_ultrasound_signal: 60,
	power_type: null,
	is_runtime_tracking: false,
	pressure_range: null,
	runtime_tracking_threshold_data_value: 0,
	device_address_id: '',
	fft_sensor_id: '',
	ncd_active_vertical_axis: null,
	ncd_active_axial_axis: null,
	banner_v2_subtype_id: null,
	banner_v2_subtype_parameters: [],
	running_thresholds: [],
	is_lube_mode: false,
	lube_based_device_address_id: '',
	lube_based_physical_sensor_id: '',
	lube_trigger_metric_type: null,
	is_archived: 0,
};
const formData = ref({ ...initialFormData });

const rules = reactive({
	port_number: required,
	controller_id: required,
	data_set: required,
	data_set_converter: null,
	data_set_convert_value: null,
	gain_ultrasound_signal: null,
	equipment_rpm: null,
});

const { currentSensorType, currentChartSettingsKey } = useSensorType({
	currentSensorTypeData: formData,
});
const {
	addFormItem,
	removeFormItem,
	setupFormSubItemsList,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
} = useSubItemsList({
	formData,
	refsMap,
});

const dataSets = computed(() =>
	Object.freeze(dataSetsList().filter(
		(item) =>
			item.controller_type === SENSOR_TYPES.BANNER ||
			item.id === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
			item.id === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20 ||
			item.id === DATASET.SDT_SENSOR_FULL_SPECTRUM ||
			item.id === DATASET.LUBEMATRIX_V3,
	)),
);
const setupDataSetLabel = (item) => `${item.label} ${item.alt_label ? `(${item.alt_label})` : ''}`;
const handleChangeDataSet = () => {
	dataSetChanged.value = true;
};
const dataSetConverters = computed(() =>
	Object.freeze(dataSetConvertersList.filter((item) => {
		if (props.isNew) return item.id !== DATASET_CONVERTERS.AMPS_CUSTOM_150;
		if (item.id === DATASET_CONVERTERS.AMPS_CUSTOM_150) {
			return props.itemData?.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_150;
		}
		return true;
	})),
);
const bannerPowerTypes = computed(() => Object.freeze(bannerPowerTypesList()));
const bannerPressureRanges = computed(() => Object.freeze(bannerPressureRangesList()));
const sensorCustomSetupTypes = computed(() => Object.freeze(Lang.translate(sensorCustomSetupTypesList)));
const ncdAxis = computed(() => Object.freeze(ncdAxisList));
const portsList = computed(() =>
	Object.freeze(Array.from({ length: 40 }, (_, index) => ({ id: index + 1, name: index + 1 }))),
);
const thresholdMultipliersList = computed(() =>
	Object.freeze(Array.from({ length: 10 }, (_, index) => ({
		id: index + 1,
		key: `${index + 1}x`,
	}))),
);
const gainUltrasoundSignalList = computed(() =>
	Object.freeze([
		{ id: 10, value: 0, label: '0' },
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
const isLubeMatrixV3 = computed(
	() => formData.value.data_set === DATASET.LUBEMATRIX_V3 && !!formData.value.is_lube_mode,
);
const showLubeMatrixButton = computed(
	() =>
		formData.value.data_set === DATASET.BANNER_TEMP_VIBE_V2_1 ||
		formData.value.data_set === DATASET.BANNER_M25,
);
const isLubeMatrixV4 = computed(() => showLubeMatrixButton.value && !!formData.value.is_lube_mode);
const showPortNumber = computed(() => {
	const sensorType = currentSensorType.value;
	return !isLubeMatrixV3.value &&
		!sensorType.isBannerTempVibe2 &&
		!sensorType.isBannerV2Generic &&
		!sensorType.isBannerV2_1 &&
		!sensorType.isBannerM25;
});
const showDeviceAddressFields = computed(() => {
	const sensorType = currentSensorType.value;
	return isLubeMatrixV3.value ||
		sensorType.isBannerTempVibe2 ||
		sensorType.isBannerV2Generic ||
		sensorType.isBannerV2_1 ||
		sensorType.isBannerM25;
});
const showRebaselineSwitch = computed(() => {
	const sensorType = currentSensorType.value;
	return props.isNew &&
		!sensorType.isCustomPDM &&
		(sensorType.isBanner || sensorType.isBannerExtraVibration || sensorType.isBannerCM1L);
});
const runtimeTrackingSwitcher = computed(() => {
	const sensorType = currentSensorType.value;
	return props.equipmentData?.plant_is_equipment_runtime_tracking &&
		(sensorType.isBannerCM1L ||
			sensorType.isBanner ||
			sensorType.isBannerTempVibe2 ||
			sensorType.isBannerV2Generic);
});
const showRunningThresholds = computed(() => {
	const sensorType = currentSensorType.value;
	return sensorType.isBanner ||
		sensorType.isBannerCM1L ||
		sensorType.isBannerTempVibe2 ||
		sensorType.isBannerV2_1 ||
		sensorType.isBannerM25;
});
const showGainUltrasoundSignal = computed(
	() =>
		formData.value.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS ||
		formData.value.data_set === DATASET.ULTRA_SOUND_SDT_DECIBELS_4_20,
);
const showCustomConverterValue = computed(
	() =>
		formData.value.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_20 ||
		formData.value.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_150,
);
const showDeviceDataRegisters = computed(() => {
	const sensorType = currentSensorType.value;
	return props.itemData?.device_data &&
		(sensorType.isBannerTempVibe2 ||
			sensorType.isBannerV2_1 ||
			sensorType.isBannerV2Generic ||
			formData.value.is_lube_mode ||
			sensorType.isBannerM25 ||
			isLubeMatrixV3.value);
});
const showLastLubricationExternalStats = computed(
	() =>
		props.itemData &&
		(formData.value.is_lube_mode || isLubeMatrixV3.value) &&
		props.itemData.last_lubrication_external_stats,
);
const formulaExpression = computed(() => {
	const item = findItemBy('data_set', formData.value.data_set, finalFormulasList.value);
	return item?.expression || '';
});
const selectedSubtype = computed(() => {
	const selectedId = formData.value.banner_v2_subtype_id;
	if (!selectedId || !props.bannerSubtypesList.length) return null;
	return findItemBy('id', selectedId, props.bannerSubtypesList);
});
const preparedSubtypeParametersList = computed(() => {
	const parameters = selectedSubtype.value?.parameters || [];
	const customizable = parameters.filter((item) => item.is_customizable);

	if (!customizable.length) return [];

	return customizable.map((item) => {
		const subItem = props.itemData?.bannerV2SubtypeParameters?.find(
			(parameter) => parameter.parent_id === item.id,
		);

		if (subItem) {
			return {
				id: item.id,
				name: subItem.name,
				units: item.units,
				formula: subItem.formula,
				graph_type: subItem.graph_type,
				title: `${subItem.name}: ${item.formula} ${item.units}`,
				is_line_speed: subItem.is_line_speed,
				is_signed: subItem.is_signed,
			};
		}

		return {
			id: item.id,
			title: `${item.name}: ${item.formula} ${item.units}`,
			name: item.name,
			units: item.units,
			graph_type: item.graph_type,
			formula: item.formula,
		};
	});
});
const runningThresholdParametersList = computed(() => {
	const sensorType = currentSensorType.value;
	const chartSettingsKey = currentChartSettingsKey.value;

	if (!showRunningThresholds.value || !chartSettingsKey) {
		return Object.freeze({ all: [], withThresholdsOnly: [] });
	}

	const configsList = chartsListsConfig(chartSettingsKey);
	if (!configsList) {
		return Object.freeze({ all: [], withThresholdsOnly: [] });
	}

	let result = [];
	let resultWithThresholdsOnly = [];
	configsList.forEach((item) => {
		result = result.concat(item.requestsList);
		if (item.transformator_settings?.specification?.setupPlotlinesData !== false) {
			resultWithThresholdsOnly = resultWithThresholdsOnly.concat(item.requestsList[0]);
		}
	});

	return Object.freeze({
		all: Object.freeze(removeDuplicatesObjectsArray(result, 'id')),
		withThresholdsOnly: Object.freeze(removeDuplicatesObjectsArray(resultWithThresholdsOnly, 'id')),
		sensorType,
	});
});

const controllersSelectSettings = computed(() => ({
	fetchAction: createGetRequest(ENTITIES.Controllers.apiBase),
	fetchByIdAction: createGetByIdRequest(ENTITIES.Controllers.apiBase),
	params: {
		max: -1,
		type: SENSOR_TYPES.BANNER,
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
const bannerSubtypesSelectSettings = computed(() => ({
	fetchAction: createGetRequest(ENTITIES.BannerV2Subtypes.apiBase),
	fetchByIdAction: createGetByIdRequest(ENTITIES.BannerV2Subtypes.apiBase),
	params: { max: 100 },
}));
const subItemsSettings = computed(() =>
	Object.freeze([
		{ ref: 'SubTypeParameterItem', targetProp: 'banner_v2_subtype_parameters' },
		{ ref: 'RunningThresholdItem', targetProp: 'running_thresholds' },
		{ ref: 'ItemFormUltraSound', targetProp: 'ultrasound_formData' },
	]),
);

const setupEquipmentRpm = (item) => {
	if (item?.equipment_rpm) {
		formData.value.equipment_rpm = +item.equipment_rpm;
		return;
	}

	for (const option of props.equipmentData?.typeOptions || []) {
		if (option.is_rpm && option.raw_values?.length) {
			formData.value.equipment_rpm = +option.raw_values[0];
			break;
		}
	}
};

const localSetupPageActions = (item) => {
	isInitialSetup.value = true;
	initCrashIndicationThreshold.value = item?.crash_indication_threshold || 5;
	initStableSamples.value = item?.stable_samples || 10;
	formData.value.crash_indication_threshold = initCrashIndicationThreshold.value;
	formData.value.stable_samples = initStableSamples.value;

	if (item?.data_set === DATASET.EXTRA_VIBRATION) {
		const thresholdMultipliers = item.equipment?.equipmentType?.threshold_multipliers || {};
		Object.keys(thresholdMultipliers).forEach((key) => {
			formData.value.threshold_multipliers[key] = thresholdMultipliers[key];
		});
	}

	formData.value.is_creating_recommended_maintenance =
		item?.is_creating_recommended_maintenance || false;
	maintenanceWarning.value = false;
	maintenanceAlarm.value = false;
	(item?.alarms_types_maintenance || []).forEach((type) => {
		if (+type === 1) maintenanceWarning.value = true;
		if (+type === 2) maintenanceAlarm.value = true;
	});

	if (item?.lube_version === LUBE_VERSIONS.V3) {
		formData.value.type = SENSOR_TYPES.BANNER;
		if (item.is_lube_mode && !isLubeMatrixV4.value) {
			formData.value.data_set = DATASET.LUBEMATRIX_V3;
		}
	}

	runningThresholdItemsList.value = setupFormSubItemsList(item?.running_thresholds, 'rt_i');

	if (props.equipmentData?.id) {
		formData.value.equipment_id = props.equipmentData.id;
	}

	setTimeout(() => {
		isInitialSetup.value = false;
	}, 0);
};

const localPrepareSubmitData = (data) => {
	const preparedData = {
		...data,
		type: SENSOR_TYPES.BANNER,
		alarms_types_maintenance: [],
	};
	const sensorType = currentSensorType.value;

	if (showGainUltrasoundSignal.value) {
		preparedData.data_set_converter = DATASET.ULTRA_SOUND_SDT_DECIBELS;
	}

	if (sensorType.isExtravibration) {
		const hasEmptyThreshold = !Object.values(preparedData.threshold_multipliers || {}).every(Boolean);
		if (hasEmptyThreshold) {
			Notify({
				type: 'warning',
				title: tt('phrases.form_isnt_ready'),
				message: tt('phrases.all_threshold_multipliers_fields_should_have_values'),
			});
			return null;
		}
	} else {
		delete preparedData.threshold_multipliers;
		delete preparedData.equipment_rpm;
	}

	if (!sensorType.isBanner) delete preparedData.power_type;
	if (!props.isNew || !sensorType.isExtravibration) delete preparedData.is_re_baseline;
	if (!sensorType.isBannerPressure) delete preparedData.pressure_range;
	if (!sensorType.isBannerTempVibe2 && !sensorType.isBannerV2_1) {
		delete preparedData.ncd_active_vertical_axis;
		delete preparedData.ncd_active_axial_axis;
	}

	if (preparedData.is_creating_recommended_maintenance) {
		if (maintenanceWarning.value) preparedData.alarms_types_maintenance.push(1);
		if (maintenanceAlarm.value) preparedData.alarms_types_maintenance.push(2);
	}

	if (showDeviceAddressFields.value) {
		delete preparedData.port_number;
	} else {
		delete preparedData.device_address_id;
		delete preparedData.fft_sensor_id;
	}

	if (!sensorType.isBannerV2Generic) {
		delete preparedData.banner_v2_subtype_id;
		delete preparedData.banner_v2_subtype_parameters;
	}

	if (!isLubeMatrixV4.value) {
		delete preparedData.lube_based_device_address_id;
		delete preparedData.lube_based_physical_sensor_id;
		delete preparedData.lube_trigger_metric_type;
	}

	return preparedData;
};

const buildSubmitPayload = (preparedData) => {
	if (isLubeMatrixV3.value || isLubeMatrixV4.value) {
		const ultrasoundFormData = preparedData.ultrasound_formData || {};
		const nextData = {
			...preparedData,
			...(ultrasoundFormData.formData || {}),
		};

		delete nextData.ultrasound_formData;

		return {
			formData: nextData,
			pumpFormData: ultrasoundFormData.pumpFormData || null,
			levelZonesFormData: ultrasoundFormData.levelZonesFormData || null,
		};
	}

	return preparedData;
};

const localGetFormData = (data) => {
	const preparedData = prepareSubmitData(localPrepareSubmitData({
		id: itemId.value,
		...data,
	}));

	if (!preparedData) return null;

	return buildSubmitPayload(preparedData);
};

const toggleSubmitRequestResult = (settings = {}) => {
	const { fromSensorsList, isLoading, success } = settings;

	if (fromSensorsList) {
		emit('event', { eventName: 'toggleSaving', data: !!isLoading, onward: true });

		if (!isLoading && success) {
			emit('event', {
				eventName: 'successModalSubmit',
				data: {},
				onward: true,
			});
		}
		return;
	}

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

const localSubmit = (payloadData, options = {}) => {
	if (!payloadData || props.ignoreLocalSubmit) return;

	const { fromSensorsList } = options;
	const sensorType = payloadData.sensorType || (payloadData?.formData ? 'ultrasound' : 'banner');
	const payload = payloadData.payload || payloadData;
	const formDataForSave = payload.formData || payload;

	if (sensorType === 'ultrasound') {
		const ItemFormUltraSoundInstance = refsMap.value.ItemFormUltraSound?.[0];
		ItemFormUltraSoundInstance?.localSubmit?.(payload);
		return;
	}

	/*if (process.env.NODE_ENV === 'development') {
		console.log('sensorSave banner', formDataForSave);
		return;
	}*/

	toggleSubmitRequestResult({ fromSensorsList, isLoading: 1 });

	saveSensor(formDataForSave)
		.then(({ data }) => {
			itemId.value = data?.data?.id || itemId.value;
			toggleSubmitRequestResult({ fromSensorsList, isLoading: 0, success: 1 });
		})
		.catch(() => {
			toggleSubmitRequestResult({ fromSensorsList, isLoading: 0, success: 0 });
		});
};

const toggleSpinner = (val) => {
	emit('event', { eventName: 'toggleSpinner', data: val });
};

const handleFormSubmitFinish = (payload) => {
	emit('event', { eventName: 'handleFormSubmitFinish', data: payload });
};

const sendRpm = () => {
	if (!props.itemData?.id) return;

	rpmSending.value = true;
	sendSensorRpm({ sensorId: props.itemData.id })
		.finally(() => {
			rpmSending.value = false;
		});
};

const resetSensor = () => {
	if (!props.itemData?.id) return;

	ElMessageBox.confirm(
		`${tt('phrases.Do_you_really_want_to')} ${tt('Reset_sensor')}?`,
		tt('Confirm'),
		{ type: 'warning' },
	)
		.then(() =>
			gainAdjustment({
				sensorId: props.itemData.id,
				data: { action: ADJUSTMENT_ACTIONS_TYPES.RESET },
			}),
		)
		.catch(() => {});
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
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	localSetupPageActions,
	localGetFormData,
	localSubmit,
	emit,
});

const handleValidateSensorForm = async () => {
	if (await validateItemForm()) {
		submitItemForm({fromSensorsList:true});
	}
};

const handleCancel = () => {
	emit('onCancel');
};

watch(
	() => formData.value.data_set,
	(id) => {
		rules.data_set_converter = id === DATASET.CM1L ? required : null;
		rules.data_set_convert_value = id === DATASET.CM1L ? required : null;
		rules.gain_ultrasound_signal = showGainUltrasoundSignal.value ? required : null;
		rules.equipment_rpm = id === DATASET.EXTRA_VIBRATION ? required : null;

		if (id !== DATASET.CM1L) {
			formData.value.data_set_converter = null;
			formData.value.data_set_convert_value = '';
		}

		if (id === DATASET.EXTRA_VIBRATION) {
			setupEquipmentRpm(props.itemData);
		}

		if (!isInitialSetup.value) {
			formData.value.is_lube_mode = id === DATASET.LUBEMATRIX_V3;
			runningThresholdItemsList.value = [];
		}
	},
);

watch(
	() => formData.value.data_set_converter,
	(id) => {
		if (id !== DATASET_CONVERTERS.AMPS_CUSTOM_20) return;
		rules.data_set_convert_value = required;

		if (finalFormulasList.value.length && !formData.value.data_set_convert_value) {
			const formula = findItemBy('data_set', DATASET.CM1L, finalFormulasList.value);
			formData.value.data_set_convert_value = formula?.expression || '';
		}
	},
);

watch(
	finalFormulasList,
	(list) => {
		if (
			list.length &&
			formData.value.data_set_converter === DATASET_CONVERTERS.AMPS_CUSTOM_20 &&
			!formData.value.data_set_convert_value
		) {
			const formula = findItemBy('data_set', DATASET.CM1L, list);
			formData.value.data_set_convert_value = formula?.expression || '';
		}
	},
);

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
		isInitialSetup.value = true;
		setupPage(item);
	},
);

if (!props.fromModal || !props.formulasList.length) {
	fetchDatasetFormulas({ params: { max: -1 } }).then((response) => {
		formulasListLocal.value = response?.data?.data || response?.data || response || [];
	});
}

defineExpose({
	validateItemForm,
	submitItemForm,
	getFormData,
});
</script>
