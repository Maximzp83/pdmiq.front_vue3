<template>
	<div
		data-id="sensor-item"
		:class="[
			'sensor-item',
			{ 'has-problem': hasProblem },
			{ isUltrasound: isUltrasound },
			sensorsStatusClass
		]"
	>
		<div class="content-container sensor-main-block relative">
			<div class="technology-block">
				<div class="location">{{ itemData.location_in_equipment }}</div>
				<div class="bold">{{ technologyData }}</div>
			</div>

			<TableCell
				v-for="(column, columnIdx) in iconsAndButtonsSettings"
				:key="`icon-${columnIdx}`"
				class="icon-item"
				:rowData="itemData"
				:columnIdx="columnIdx"
				:column="column"
				@event="handleEvent"
			/>

			<div v-if="enableReorder" class="reorder-button can-dragging">
				<img class="can-dragging" :src="icon_drag" alt="" />
			</div>
		</div>

		<div v-if="isRuntimeTracking" class="runtime-tracking-section">
			<div class="flex align-center">
				<div>
					<span class="span-block value">{{ tt('runtime') }}:</span>
					<span class="span-block value">{{ totalRuntimeSeconds }}</span>
				</div>

				<el-button
					v-if="enableResetRuntime"
					type="primary"
					native-type="button"
					class="ml-auto item-action-button inverted small"
					@click="resetRuntime"
				>
					{{ tt('Reset') }}
				</el-button>
			</div>
			<div v-if="lastReset" class="mt-5">
				<span class="span-block label">{{ tt('last_reset') }}:</span>
				<span class="span-block">{{ lastReset }}</span>
			</div>
		</div>

		<div v-if="!currentSensorType.isManualRoute" class="alarms-block">
			<div>
				<div v-if="currentFaultsType === 'banner'" class="counters-part">
					<div class="column">
						<div v-if="showBannerWarningCounter">
							<span>{{ tt('constants.Warning') }}</span>
							<b :class="{ warning: itemData.warning_crashes_count }">
								{{ itemData.warning_crashes_count || 0 }}
							</b>
						</div>
					</div>
					<div class="column">
						<div>
							<span>{{ tt('constants.Alarm') }}</span>
							<b :class="{ alarm: itemData.alarm_crashes_count }">
								{{ bannerAlarmCount }}
							</b>
						</div>
					</div>
				</div>

				<div
					v-else-if="currentFaultsType === 'lubematrix' || currentFaultsType === 'ultrasoundSDT'"
					:class="['counters-part']"
				>
					<div>
						<span>{{ tt('constants.Alarm') }}</span>
						<b :class="{ alarm: itemData.alarm_crashes_count }">{{ itemData.alarm_crashes_count || 0 }}</b>
					</div>
					<div>
						<span>{{ tt('constants.Warning') }}</span>
						<b :class="{ warning: itemData.warning_crashes_count }">{{ itemData.warning_crashes_count || 0 }}</b>
					</div>
					<div v-if="hasLubeZone">
						<span>{{ tt('constants.lube') }}</span>
						<b :class="{ lubeline: lubesData.countExceedingLubeZone }">
							{{ lubesData.countExceedingLubeZone || 0 }}
						</b>
					</div>
					<div v-if="currentFaultsType === 'lubematrix'">
						<span>{{ tt('phrases.Issues_Detected') }}</span>
						<b :class="{ warning: issuesDetectedCount }">{{ issuesDetectedCount }}</b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Issues_Resolved') }}</span>
						<b :class="{ black: lubesData.successCyclesCount }">{{ lubesData.successCyclesCount || 0 }}</b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Lube_Delivered') }}</span>
						<b :class="{ black: lubesData.amountInjected }">
							{{ `${getRoundedValue(lubesData.amountInjected, 0, 2)}g` }}
						</b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Lube_Cycles_Auto') }}</span>
						<b :class="{ black: lubesData.autoProcessCount }">
							{{ `${lubesData.autoProcessCount || 0} ${autoAmountInjected}` }}
						</b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Unsuccessful_Autolube') }}</span>
						<b :class="{ black: lubesData.failuresCyclesCount }">{{ lubesData.failuresCyclesCount || 0 }}</b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Autolube_Alarm') }}</span>
						<b :class="{ black: lubesData.alarmsCount }">{{ lubesData.alarmsCount || 0 }}</b>
					</div>
					<div v-if="hasLubesCounters">
						<span>{{ tt('phrases.Lube_Cycles_Manual') }}</span>
						<b :class="{ black: lubesData.manualProcessCount }">
							{{ `${lubesData.manualProcessCount || 0} ${manualAmountInjected}` }}
						</b>
					</div>
				</div>
			</div>

			<div v-if="showPossibleProblems" class="faults-part">
				<b>Faults: </b>
				<span v-for="(problem, idx) in possibleProblems" :key="`problem-${problem.id || idx}`">
					{{ problem.title }}{{ idx === possibleProblems.length - 1 ? '' : ', ' }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import {
	not_wifi_icon,
	rebase_wheel,
	rebase_lines,
	sensor_broken_icon,
	lube_level_low,
	lube_level_normal,
	lube_level_empty,
	sensor_archive,
	controller_offline_icon,
	icon_drag,
	NCD_ALARM_TYPES,
	sensorClassesList,
	SENSOR_ALARM_TYPES,
	FFT_LOCK_STATUSES,
	anomaly1_icon,
} from '@/constants/global';
import { LUBE_PROCESSING_STATUSES, LUBE_CYCLE_STATUSES, ULTRASOUND_SENSOR_TYPES, LUBE_VERSIONS } from '@/constants/ultrasound';
import {
	findItemBy,
	getPassedTime,
	getRoundedValue,
	convertMsToHours,
	cleanDateString,
} from '@/helpers';
import {
	setupBatteryChargeCell,
	setupConnectionStrengthCell,
} from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensorType } from '@/composables/mixins/useSensorType';
import { useGlobalStore } from '@/stores/GlobalStore';
import TableCell from '@/components/table/TableCell.vue';

const { tt } = Lang;

defineOptions({ name: 'EquipmentCardSensorItem' });

const props = defineProps({
	itemData: { type: Object, required: true },
	enableReorder: Boolean,
	enableResetRuntime: Boolean,
});
const emit = defineEmits(['event']);

const globalStore = useGlobalStore();
const { compareList } = storeToRefs(globalStore);
const { currentSensorType } = useSensorType({ currentSensorTypeData: computed(() => props.itemData) });

const lubesData = computed(() => props.itemData?.lubes || {});
const possibleProblems = computed(() => props.itemData?.possibleProblems || props.itemData?.possible_problems || []);
const isLubeMatrixV3 = computed(() => props.itemData?.lube_version === LUBE_VERSIONS.V3);
const isSensorOnly = computed(() => props.itemData?.functionality_type === ULTRASOUND_SENSOR_TYPES.SENSOR_ONLY);
const isUltrasound = computed(() => Boolean(currentSensorType.value?.isUltrasound || props.itemData?.is_ultrasound));
const isNCDSensor = computed(() => {
	const sensorType = currentSensorType.value || {};
	return Boolean(
		sensorType.isNCDTempVibe ||
			sensorType.isNCDWiredTempVibe ||
			sensorType.isNCDTempVibeCurr ||
			sensorType.isNCDSDT ||
			sensorType.isNCDEnv ||
			sensorType.isNCDPressure ||
			sensorType.isNCDCustom_4_20
	);
});
const lubeBlocked = computed(() => {
	const sensorType = currentSensorType.value || {};
	return Boolean(
		props.itemData &&
			(sensorType.isUltrasound || isLubeMatrixV3.value) &&
			(
				props.itemData.lube_cycle_status === LUBE_CYCLE_STATUSES.BLOCKED ||
				props.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.UNSUCCESSFUL ||
				props.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.LUBRICANT_FULL_SPENT ||
				props.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.BLOCKED ||
				props.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.LOSS_CONNECTION ||
				props.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.NO_COMMAND_RESPONSE ||
				props.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.UNKNOWN ||
				props.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.NO_LUBRICATION_STATUS_RESPONSE ||
				props.itemData.lube_shot_status === LUBE_PROCESSING_STATUSES.NO_START_LUBRICATION_COMMAND_RESPONSE
			)
	);
});
const hasProblem = computed(() => lubeBlocked.value);
const currentFaultsType = computed(() => {
	const sensorType = currentSensorType.value || {};
	if (sensorType.isUltrasound || isLubeMatrixV3.value) return 'lubematrix';
	if (sensorType.isSDTsensor || sensorType.isNCDSDT) return 'ultrasoundSDT';
	return 'banner';
});
const hasLubesCounters = computed(() => !isSensorOnly.value && (isUltrasound.value || isLubeMatrixV3.value));
const hasLubeZone = computed(() => {
	const sensorType = currentSensorType.value || {};
	if ((isLubeMatrixV3.value || isUltrasound.value) && !isSensorOnly.value) return true;
	if (sensorType.isSDTsensor || sensorType.isNCDSDT) {
		return (
			lubesData.value.countExceedingLubeZone !== undefined &&
			props.itemData?.levelZones?.some((zone) => zone.is_lube_zone_included)
		);
	}
	return false;
});
const fftLocked = computed(() => Boolean(
	props.itemData?.last_fft_lock && props.itemData.last_fft_lock.status !== FFT_LOCK_STATUSES.UNLOCKED
));
const lubeShotsLeft = computed(() => {
	if (props.itemData?.pump && hasLubesCounters.value) {
		const { lube_cycle_max_count, lube_cycle_spent_count, lube_cycle_warning_count } = props.itemData.pump;
		const left = lube_cycle_max_count - lube_cycle_spent_count;
		return { left, className: left > lube_cycle_warning_count ? 'success' : 'warning' };
	}
	return null;
});
const inCompareList = computed(() => compareList.value.some((id) => id === props.itemData.id));
const issuesDetectedCount = computed(() => {
	const data = lubesData.value;
	if (!data) return '';
	return (data.processCyclesCount || 0) + (data.successCyclesCount || 0) + (data.failuresCyclesCount || 0);
});
const autoAmountInjected = computed(() =>
	lubesData.value?.autoAmountInjected ? `(${getRoundedValue(lubesData.value.autoAmountInjected, 0, 2)}g)` : ''
);
const manualAmountInjected = computed(() =>
	lubesData.value?.manualAmountInjected ? `(${getRoundedValue(lubesData.value.manualAmountInjected, 0, 2)}g)` : ''
);
const isRuntimeTracking = computed(() => props.itemData?.is_runtime_tracking);
const totalRuntimeSeconds = computed(() => {
	if (!isRuntimeTracking.value) return '';
	const runtimeSeconds = props.itemData?.total_runtime_seconds;
	if (!runtimeSeconds) return '0:0';
	let { total_hours, total_mins } = convertMsToHours(runtimeSeconds * 1000);
	total_mins = `${total_mins}`;
	const mins = total_mins !== '0' && total_mins.length === 1 ? `0${total_mins}` : total_mins;
	return `${total_hours}:${mins}`;
});
const lastReset = computed(() => {
	if (!isRuntimeTracking.value) return '';
	const { lastRuntimeTracker, runtime_tracking_installed_at } = props.itemData;
	if (lastRuntimeTracker) {
		const { total_hours, total_mins } = convertMsToHours(lastRuntimeTracker.total_runtime_seconds * 1000);
		return `${total_hours}:${total_mins} at ${cleanDateString(lastRuntimeTracker.created_at)}`;
	}
	return `0:0 at ${cleanDateString(runtime_tracking_installed_at)}`;
});
const showBannerWarningCounter = computed(() => {
	const sensorType = currentSensorType.value || {};
	return !(
		sensorType.isHumiditySensor ||
		sensorType.isNCDPressure ||
		sensorType.isBannerPressure ||
		(sensorType.isNCDCustom_4_20 && props.itemData.alarm_type === NCD_ALARM_TYPES.LOW_HIGH_ALARM)
	);
});
const bannerAlarmCount = computed(() => {
	const alarmCount = props.itemData.alarm_crashes_count || 0;
	const warningCount = props.itemData.warning_crashes_count || 0;
	return currentSensorType.value?.isHumiditySensor ? alarmCount + warningCount : alarmCount;
});
const showPossibleProblems = computed(() => {
	const sensorType = currentSensorType.value || {};
	return Boolean(
		possibleProblems.value.length &&
			!sensorType.isUltrasound &&
			!sensorType.isSDTsensor &&
			!sensorType.isNCDSDT &&
			!sensorType.isHumiditySensor
	);
});
const rebaselineBlock = computed(() => `
	<span class="rebase-wheel animate">
		<img src="${rebase_wheel}" />
	</span>
	<span class="rebase-lines">
		<img src="${rebase_lines}" />
	</span>
`);
const lubeImg = computed(() => {
	if (props.itemData?.is_lubricator_empty) return lube_level_empty;
	if (props.itemData?.is_lube_low_level) return lube_level_low;
	return lube_level_normal;
});
const technologyData = computed(() => {
	const sensorType = currentSensorType.value || {};
	const itemData = props.itemData || {};
	if (sensorType.isBannerV2Generic && itemData.bannerV2Subtype) {
		if (itemData.bannerV2Subtype.sensor_class) {
			const sensorClass = findItemBy('id', itemData.bannerV2Subtype.sensor_class, sensorClassesList());
			return sensorClass ? sensorClass.name : '';
		}
		return (itemData.bannerV2Subtype.parameters || []).map((param) => param.name).join(', ');
	}
	if (sensorType.isBannerV2_1 || sensorType.isBannerM25) {
		return itemData.is_lube_mode ? tt('technology.ultrasound_vibration_temperature') : sensorType.group_technology;
	}
	if (sensorType.isUltrasound || isLubeMatrixV3.value) {
		return isSensorOnly.value ? tt('constants.Ultrasound') : sensorType.group_technology;
	}
	return sensorType.group_technology || itemData.technology_name || itemData.sensor_type_name || itemData.name || '';
});
const sensorsStatusClass = computed(() => {
	const alerts = props.itemData?.current_metric_issue_alerts || [];
	if (alerts.some((alert) => alert.alert_type === SENSOR_ALARM_TYPES.ALARM)) return 'alarm';
	if (alerts.some((alert) => alert.alert_type === SENSOR_ALARM_TYPES.WARNING)) return 'warning';
	return '';
});
const iconsAndButtonsSettings = computed(() =>
	Object.freeze([
		{
			show_anyway: true,
			meta: {
				additionalActions: [
					{
						linkSettings: {
							linkRoute: 'ncd/:lastCompletedAutoFFTRequest.sensor_id/fft/:lastCompletedAutoFFTRequest.id',
						},
						tooltip_text: `${tt('phrases.Automatic_FFTs_Generated')}: ${
							props.itemData.completed_auto_fft_requests_count || 0
						}`,
						target: '_blank',
						useHref: true,
						tool_tip_class: 'width-auto',
						conditionSettings: {
							conditions: [{ prop: 'lastCompletedAutoFFTRequest', method: 'notEmpty' }],
						},
						buttonContent: {
							component: { componentFileLoader: () => import('@/views/Sensors/SensorFFTRequestButton.vue') },
						},
					},
				],
			},
		},
		{
			prop: 'battery_voltage',
			conditionSettings: {
				conditions: [
					{ data_value: isNCDSensor.value, control_value: true },
					{ data_value: props.itemData.is_archived, control_value: false },
				],
			},
			meta: {
				cell_class: 'text-center icon-padding',
				prepareValue: { localMethod: setupBatteryChargeCell },
			},
		},
		{
			conditionSettings: {
				conditions: [
					{ data_value: isNCDSensor.value, control_value: true },
					{ data_value: props.itemData.is_archived, control_value: true },
				],
			},
			meta: { img: { src: sensor_archive }, cell_class: 'no-signal-icon' },
		},
		{
			prop: 'rssi',
			conditionSettings: {
				conditions: [
					{ data_value: isNCDSensor.value, control_value: true },
					{ prop: 'controller.is_inactive', control_value: false },
					{ prop: 'is_inactive', control_value: false },
					{ data_value: props.itemData.is_archived, control_value: false },
				],
			},
			meta: {
				cell_class: 'text-center icon-padding',
				prepareValue: {
					localMethod: setupConnectionStrengthCell,
					useAllInstanceData: true,
				},
			},
		},
		{
			conditionSettings: {
				conditions: [
					{ data_value: isNCDSensor.value, control_value: true },
					{ data_value: props.itemData.is_archived, control_value: false },
					{ data_value: props.itemData.controller?.is_inactive, control_value: true },
				],
			},
			meta: { img: { src: controller_offline_icon }, cell_class: 'no-signal-icon' },
		},
		{
			conditionSettings: {
				checkMethod: 'some',
				conditions: [
					{
						data_value: isNCDSensor.value,
						control_value: true,
						next_conditions: [
							{ data_value: props.itemData.is_archived, control_value: false },
							{ prop: 'controller.is_inactive', control_value: false },
							{ prop: 'is_inactive', control_value: true },
						],
					},
					{
						data_value: isNCDSensor.value,
						control_value: true,
						method: '!=',
						next_conditions: [{ prop: 'is_inactive', control_value: true }],
					},
				],
			},
			meta: { img: { src: not_wifi_icon }, cell_class: 'no-signal-icon' },
		},
		{
			conditionSettings: {
				conditions: [{ prop: 'has_anomaly', control_value: true }],
			},
			meta: { img: { src: sensor_broken_icon } },
		},
		{
			conditionSettings: {
				conditions: [{ prop: 'is_re_baseline_process', control_value: true }],
			},
			meta: {
				htmlBlock: {
					html: rebaselineBlock.value,
					className: 'relative rebase-line-icon',
				},
			},
		},
		{
			conditionSettings: {
				conditions: [
					{ data_value: currentSensorType.value?.isUltrasound, control_value: true },
					{ prop: 'lube_cycle_high_speed', control_value: true },
				],
			},
			meta: { icon: 'icomoon icon-high-speed' },
		},
		{
			show_anyway: true,
			meta: {
				additionalActions: [
					{
						name: '',
						tooltip_text: tt('aliases.anomaly1'),
						img: anomaly1_icon,
						conditionSettings: {
							conditions: [{ data_value: props.itemData.is_flat_metric_data_anomaly_now, control_value: true }],
						},
					},
					{
						name: 'handleUnlockFFT',
						tooltip_text: tt('phrases.unlock_fft'),
						icon: 'icomoon icon-stop',
						containerClassName: 'lube-blocked-container',
						className: 'el-button--primary inverted',
						conditionSettings: {
							conditions: [
								{ data_value: fftLocked.value, control_value: true },
								{ data_value: isSensorOnly.value, control_value: false },
							],
						},
						prefixContent: {
							html: `<span class="time">${getPassedTime(
								Date.now(),
								props.itemData.last_fft_lock && props.itemData.last_fft_lock.created_at
							)}</span>`,
						},
					},
					{
						name: 'unblockLube',
						tooltip_text: tt('phrases.Reset_lube'),
						icon: 'icomoon icon-stop',
						containerClassName: 'lube-blocked-container',
						className: 'el-button--primary inverted',
						conditionSettings: {
							conditions: [
								{ data_value: lubeBlocked.value, control_value: true },
								{ data_value: isSensorOnly.value, control_value: false },
							],
						},
						prefixContent: {
							html: `<span class="time">${getPassedTime(
								Date.now(),
								props.itemData.lube_cycle_updated_at || props.itemData.lube_shot_updated_at
							)}</span>`,
						},
					},
					{
						name: 'unblockLube',
						tooltip_text: props.itemData.is_lubricator_empty
							? tt('phrases.Luber_empty')
							: tt('phrases.Reset_grease_pack'),
						img: lubeImg.value,
						containerClassName: 'lube-level-container',
						className: 'el-button--primary inverted',
						conditionSettings: {
							conditions: [
								{ data_value: hasLubesCounters.value, control_value: true },
								{ data_value: isSensorOnly.value, control_value: false },
							],
						},
						prefixContent: {
							html: lubeShotsLeft.value && !props.itemData.is_lubricator_empty
								? `<span class="shots-count pointer ${lubeShotsLeft.value.className}">${lubeShotsLeft.value.left}</span>`
								: null,
							action: { actionName: 'handleChangeShotsCount' },
						},
					},
					{
						linkSettings: {
							linkRoute: currentSensorType.value?.isManualRoute
								? `equipments/${props.itemData.equipment_id}/details/manual-route`
								: `equipments/${props.itemData.equipment_id}/details/pdm/${props.itemData.id}`,
						},
						tooltip_text: tt('phrases.Sensor_Statistics'),
						icon: 'icomoon icon-chart3',
					},
					{
						name: 'compareClick',
						tooltip_text: tt('phrases.Add_to_compare_list'),
						icon: 'icomoon icon-compare',
						conditionSettings: {
							conditions: [
								{
									data_value: Boolean(currentSensorType.value?.isManualRoute),
									control_value: false,
								},
							],
						},
						className: inCompareList.value
							? 'el-button--primary inverted active'
							: 'el-button--primary inverted',
					},
				],
			},
		},
	]),
);

const { handleEvent } = useEventHandler({}, emit);

const resetRuntime = () => {
	emit('event', {
		eventName: 'resetSensorRuntime',
		data: props.itemData.id,
		onward: true,
	});
};
</script>
