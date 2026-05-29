<template>
	<div class="edit-form-container with-paddings">
		<div
			v-if="isSDTsensor"
			:class="[
				'dialog-header-absolute-button capitalize',
				{ 'primary-color': formData.is_lube_zone_included },
			]"
			@click="formData.is_lube_zone_included = !formData.is_lube_zone_included"
		>
			{{ `${formData.is_lube_zone_included ? tt('Remove') : tt('Add')} ${tt('constants.Lubeline')}` }}
		</div>

		<div
			v-if="isNCDTempVibeSensor && parameterData?.parameterItem?.type === 'acceleration'"
			:class="[
				'dialog-header-absolute-button capitalize',
				{ 'primary-color': isOffAlarmZoneIncluded },
			]"
			@click="isOffAlarmZoneIncluded = !isOffAlarmZoneIncluded"
		>
			{{ `${isOffAlarmZoneIncluded ? tt('Remove') : tt('Add')} ${tt('constants.Off_Alarm')}` }}
		</div>

		<div v-if="parameterData" class="title article-title capitalize">
			{{ parameterTitle }}
		</div>

		<el-form
			ref="itemFormRef"
			class="item-edit-form section-row"
			label-width="210px"
			:model="formData"
			:rules="rules"
			:label-position="isMobile ? 'top' : 'left'"
		>
			<div v-if="!isOffAlarm" class="el-form-item">
				<el-form-item
					:label="isLowHighZones ? tt('phrases.High_alarm') : tt('constants.Alarm_zone')"
					prop="alarm_zone"
				>
					<el-input-number v-model="formData.alarm_zone" :min="formData.warning_zone" />
					<span v-if="isUltrasound || isSDTsensor" class="input-description">
						{{ additiveZoneValue(formData.alarm_zone) }}
					</span>
				</el-form-item>

				<el-form-item
					:label="isLowHighZones ? tt('phrases.Low_alarm') : tt('constants.Warning_zone')"
					prop="warning_zone"
				>
					<el-input-number v-model="formData.warning_zone" :min="warningZoneMin" />
					<span v-if="(isUltrasound || isSDTsensor) && !isOffAlarm" class="input-description">
						{{ additiveZoneValue(formData.warning_zone) }}
					</span>
				</el-form-item>
			</div>

			<div v-if="!isOffAlarm && (isUltrasound || isSDTsensor)" class="el-form-item">
				<el-form-item
					v-if="formData.is_lube_zone_included && sensor && (isUltrasound || isSDTsensor)"
					:label="tt('constants.Lubeline_zone')"
					prop="lube_zone"
					required
				>
					<el-input-number v-model="formData.lube_zone" :min="0" />
					<span v-if="formData.baseline_zone" class="input-description">
						{{ additiveZoneValue(formData.lube_zone) }}
					</span>
				</el-form-item>

				<el-form-item :label="tt('constants.Baseline_zone')" prop="baseline_zone">
					<el-input-number v-model="formData.baseline_zone" :min="0" />
				</el-form-item>
			</div>

			<div v-if="!isOffAlarm && enableLubeMatrixInputForBanner" class="el-form-item">
				<el-form-item :label="tt('constants.Lubeline_zone')" prop="lube_zone" required>
					<el-input-number v-model="formData.lube_zone" :min="0" />
				</el-form-item>
			</div>

			<div
				v-if="!isOffAlarm && isNCDTempVibeSensor && isOffAlarmZoneIncluded"
				class="el-form-item"
			>
				<el-form-item
					v-if="sensor"
					:label="tt('constants.off_alarm_zone')"
					prop="off_alarm_zone"
					required
				>
					<el-input-number v-model="formData.off_alarm_zone" :min="0" />
				</el-form-item>
			</div>

			<el-form-item
				v-if="isOffAlarm && !isUltrasound && !isSDTsensor"
				:label="tt('constants.off_alarm_zone')"
				prop="off_alarm_zone"
			>
				<el-input-number v-model="formData.off_alarm_zone" />
			</el-form-item>

			<el-form-item
				v-if="(parameterItem?.id === SENSOR_PARAMETERS_TYPES.TEMPERATURE || isHumiditySensor) && !isOffAlarm"
				:label="`${tt('Periods')}:`"
				prop="periods"
				class="periods-list"
			>
				<br />
				<ThresholdPeriodItem
					v-for="(item, idx) in thresholdPeriodsItemsList"
					:key="`period_item-${item.id}`"
					:ref="(el) => setSubItemRef('ThresholdPeriodItem', el, idx)"
					:item-data="item"
					:item-index="idx"
					:isMobile="isMobile"
					:isOffAlarm="isOffAlarm"
					:selectedMonths="selectedMonths"
					:isHumiditySensor="isHumiditySensor"
					@onRemove="(id) => removeFormItem(id, thresholdPeriodsItemsList)"
					@selectMonth="handleSelectMonth"
				/>

				<div class="content-row option-item-container">
					<el-button
						class="action-button create-button 1inverted"
						size="small"
						type="success"
						@click="addFormItem(thresholdPeriodsItemsList, 'p_i-')"
					>
						<i class="icomoon icon-plus"></i>
					</el-button>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

import { required } from '@/constants/validation';
import { NCD_ALARM_TYPES } from '@/constants/global';
import {
	SENSOR_SPECIFIC_PARAMETERS_TYPES,
	SENSOR_PARAMETERS_TYPES,
	METRIC_SYSTEM_TYPES,
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { getZoneValue } from '@/modules/charts_factory/controllers/Sensor/methods';
import { findItemBy } from '@/helpers';
import { Lang } from '@/localization';
import { useItemForm } from '@/composables/mixins/useItemForm';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';

import ThresholdPeriodItem from './ThresholdPeriodItem.vue';

const { tt } = Lang;

defineOptions({
	name: 'LevelZoneForm',
});

const props = defineProps({
	sensor: { type: Object, default: () => ({}) },
	parameterData: { type: Object, default: () => ({}) },
	metric_system_type: Number,
	currentSensorType: { type: Object, default: () => ({}) },
	isNCDTempVibeSensor: Boolean,
	isOffAlarm: Boolean,
});

const emit = defineEmits(['submit']);

const itemFormRef = ref(null);
const refsMap = reactive({});
const thresholdPeriodsItemsList = ref([]);
const selectedMonths = ref([]);
const isOffAlarmZoneIncluded = ref(false);
const isMobile = ref(document.documentElement.clientWidth < 992);
const formData = ref({
	metric_system_type: METRIC_SYSTEM_TYPES.METRIC,
	parameter_type: SENSOR_SPECIFIC_PARAMETERS_TYPES.DB,
	baseline_zone: 0,
	warning_zone: 0,
	alarm_zone: 0,
	lube_zone: 0,
	is_lube_zone_included: false,
	off_alarm_zone: 0,
	periods: [],
});

const rules = reactive({
	warning_zone: required,
	alarm_zone: required,
	off_alarm_zone: null,
});

const subItemsSettings = computed(() =>
	Object.freeze([{ ref: 'ThresholdPeriodItem', targetProp: 'periods' }]),
);

const parameterItem = computed(() => props.parameterData?.parameterItem || {});
const parameterType = computed(() => parameterItem.value?.id);
const isSDTsensor = computed(() => props.currentSensorType?.isSDTsensor || props.currentSensorType?.isNCDSDT);
const isUltrasound = computed(() => props.currentSensorType?.isUltrasound);
const isLubeModeOnForBanner = computed(() => !isUltrasound.value && props.sensor?.is_lube_mode);
const enableLubeMatrixInputForBanner = computed(
	() => isLubeModeOnForBanner.value && props.sensor?.lube_trigger_metric_type === parameterType.value,
);
const isHumiditySensor = computed(() => props.currentSensorType?.isHumiditySensor || props.currentSensorType?.isNCDEnv);
const isLowHighZones = computed(() => {
	const currentSensorType = props.currentSensorType || {};
	const { bannerV2Subtype } = props.sensor || {};

	if (currentSensorType.isBannerV2Generic && bannerV2Subtype) {
		const currentSubTypeParam = findItemBy(
			'node_parameter',
			parameterItem.value.id,
			bannerV2Subtype.parameters || [],
		);
		if (currentSubTypeParam) {
			return currentSubTypeParam.alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM;
		}
	}

	return (
		currentSensorType.isHumiditySensor ||
		currentSensorType.isNCDEnv ||
		currentSensorType.isNCDPressure ||
		currentSensorType.isBannerPressure ||
		(currentSensorType.isNCDCustom_4_20 && props.sensor?.alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM)
	);
});

const parameterTitle = computed(() => {
	if (props.parameterData?.chartTitle) return props.parameterData.chartTitle;

	if (parameterItem.value?.id) {
		if (
			isHumiditySensor.value &&
			parameterItem.value.id === SENSOR_PARAMETERS_TYPES.Z_AXIS_VELOCITY
		) {
			return tt('constants.Humidity');
		}
		if (
			isSDTsensor.value &&
			parameterItem.value.id === SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION
		) {
			return tt('constants.DB_Level');
		}
		return parameterItem.value.name;
	}

	return '';
});

const warningZoneMin = computed(() => {
	if (parameterItem.value?.type === 'temperature' || parameterItem.value?.type === undefined) {
		return -273;
	}
	return 0;
});

const zonesDataKeys = Object.freeze([
	'baseline_zone',
	'warning_zone',
	'alarm_zone',
	'lube_zone',
	'off_alarm_zone',
]);

const {
	setupFormSubItemsList,
	addFormItem,
	removeFormItem,
	setSubItemRef,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
} = useSubItemsList({ formData, refsMap });

const additiveZoneValue = (value) =>
	parseFloat((Number(value) + Number(formData.value.baseline_zone)).toFixed(3));

const handleSelectMonth = () => {
	let newMonths = [];
	(refsMap.ThresholdPeriodItem || []).filter(Boolean).forEach((item) => {
		newMonths = newMonths.concat(item.formData?.months || item.formData?.value?.months || []);
	});
	selectedMonths.value = newMonths;
};

const localSetupPage = () => {
	rules.baseline_zone = isUltrasound.value || isSDTsensor.value ? required : null;
	rules.off_alarm_zone = props.isOffAlarm ? required : null;

	formData.value.metric_system_type = props.metric_system_type || METRIC_SYSTEM_TYPES.METRIC;
	formData.value.parameter_type = parameterItem.value.id || SENSOR_SPECIFIC_PARAMETERS_TYPES.DB;

	if (isUltrasound.value) {
		formData.value.parameter_type = SENSOR_SPECIFIC_PARAMETERS_TYPES.DB;
	}

	const { levelZones, levelZoneData } = props.parameterData || {};
	if (levelZoneData || levelZones?.length) {
		let actualLevelZoneData = levelZoneData;
		if (!actualLevelZoneData) {
			actualLevelZoneData = findItemBy('parameter_type', formData.value.parameter_type, levelZones);
		}

		if (actualLevelZoneData) {
			thresholdPeriodsItemsList.value = setupFormSubItemsList(actualLevelZoneData.periods, 'p_i');
			zonesDataKeys.forEach((key) => {
				formData.value[key] = getZoneValue(key, {
					zonesData: actualLevelZoneData,
					isOffAlarm: props.isOffAlarm,
					currentSensorType: props.currentSensorType,
				});
			});
			formData.value.is_lube_zone_included = actualLevelZoneData.is_lube_zone_included;
		}
	}

	if (isUltrasound.value || enableLubeMatrixInputForBanner.value) {
		formData.value.is_lube_zone_included = true;
	}
};

const localValidationHook = () => {
	if (formData.value.alarm_zone < formData.value.warning_zone) {
		return false;
	}
	return true;
};

const localPrepareSubmitData = (data) => {
	const newData = { ...data };
	Object.keys(newData).forEach((prop) => {
		if (!newData[prop] && newData[prop] !== 0) {
			delete newData[prop];
		}
	});

	if (isUltrasound.value || isSDTsensor.value) {
		delete newData.off_alarm_zone;
	}

	if (!data.is_lube_zone_included) {
		newData.lube_zone = 0;
	}

	return newData;
};

const localSubmit = (preparedData) => {
	emit('submit', preparedData);
};

const { validateForm } = useItemForm({
	formData,
	initialFormData: formData.value,
	formRef: itemFormRef,
	localSetupPage,
	subItemsSettings,
	validateSubItemsForm,
	collectDataFromSubItems,
	resetFormDataBySubItems,
	localValidationHook,
	localPrepareSubmitData,
	localSubmit,
	emit,
});

defineExpose({
	validateForm,
});
</script>
