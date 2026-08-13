<template>
	<div class="charts-page-operations flex wrap justify-end mcol-xs-12">
		<div v-if="isBannerTempVibe2 || v21ViewActive" class="grouped-buttons-block-wrapper">
			<div class="grouped-buttons-block">
				<div class="group-title">V2.1:</div>
				<div class="buttons-list">
					<div class="button-item">
						<el-button
							native-type="button"
							:class="['small', { 'is-active': v21ViewActive }]"
							@click="event('toggleV2_1View')"
						>
							<i class="icomoon icon-eye"></i>
						</el-button>
					</div>
				</div>
			</div>
		</div>

		<div class="grouped-buttons-block-wrapper">
			<div class="grouped-buttons-block">
				<div class="group-title">% Stats:</div>
				<div class="buttons-list">
					<div class="button-item">
						<el-button
							native-type="button"
							:class="['small', { 'is-active': statsThresholdsActive }]"
							@click="event('toggleStatsThresholds')"
						>
							<i class="icomoon icon-eye"></i>
						</el-button>
					</div>
				</div>
			</div>
		</div>

		<PDFandFFTrequestsBlock
			ref="pdfAndFftRequestsBlockRef"
			:enableFFT="enableFFT"
			:isCompare="isCompare"
			:sensorData="sensorData"
			:currentSensorType="currentSensorType"
			:sensors="sensors"
			:equipmentData="equipmentData"
			:rootFilters="filters"
			enableRpmBlock
			@event="handleEvent"
		/>

		<div class="button-item">
			<el-button
				type="primary"
				native-type="button"
				:class="['inverted report-button history-button', { active: showHistory }]"
				@click="event('toggleHistory')"
			>
				{{ `${showHistory ? tt('Hide') : tt('Show')} ${tt('history')}` }}
			</el-button>
		</div>

		<div v-if="!isCompare && !isHumiditySensor && !isBannerV2_1" class="button-item">
			<el-button
				v-if="!hideOffAlarm"
				type="primary"
				native-type="button"
				:disabled="sensorData.is_re_baseline_process"
				:loading="levelZonesSaving"
				:class="['inverted report-button primary-color bolded capitalize', { active: hasOffAlarm }]"
				@click="toggleOffAlarm"
			>
				{{ `${hasOffAlarm ? tt('Disable') : tt('Enable')} ${tt('constants.OFF_ALARM')}` }}
			</el-button>
		</div>

		<div
			v-if="!isCompare && !isHumiditySensor && !isBannerExtraVibration && !isBannerV2_1 && !isBannerM25"
			class="button-item"
		>
			<el-button-group>
				<el-button
					v-if="!isNCDEnv"
					type="primary"
					native-type="button"
					:class="['report-button inverted', { active: joinChartsBy?.prop === 'axis' }]"
					@click="event('handleJoinCharts', 'axis')"
				>
					<i class="icomoon icon-overlay"></i>
					{{ tt('Axis') }}
				</el-button>

				<el-button
					v-if="!isNCDEnv"
					type="primary"
					native-type="button"
					:class="['report-button inverted', { active: joinChartsBy?.prop === 'type' }]"
					@click="event('handleJoinCharts', 'type')"
				>
					<i class="icomoon icon-overlay"></i>
					{{ tt('Params') }}
				</el-button>

				<el-button
					v-if="splitChartsButtonEnabled"
					type="primary"
					native-type="button"
					:class="['report-button inverted', { active: splitNCDCharts }]"
					@click="event('handleSplitNCDCharts')"
				>
					<i class="icomoon icon-overlay"></i>
					{{ tt('Split') }}
				</el-button>
			</el-button-group>
		</div>

		<div
			v-if="!isCompare && !isHumiditySensor && !isBannerExtraVibration && !isNCDSensor && !isBannerV2_1 && !isBannerM25"
			class="button-item ChartsFilterBar"
		>
			<ChartsFilterBar
				:sensorParametersList="sensorParametersList[currentSensorType.isBannerCM1L ? 'banner_CM1L' : 'banner']"
				:isLoading="itemsLoading"
			/>
		</div>

		<div class="button-item chart-switcher text-right">
			<div class="relative flex">
				<el-button-group>
					<el-button
						v-for="item in metricSystemsList"
						:key="`metricSystem-${item.id}`"
						type="primary"
						native-type="button"
						class="inverted"
						:class="{ active: filters.measurement === item.id }"
						@click="switchMetricSystem(item)"
					>
						{{ item.name }}
					</el-button>
				</el-button-group>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import {
	SENSOR_PARAMETERS_TYPES,
	sensorParametersList as getSensorParametersList,
	metricSystemsList as getMetricSystemsList,
} from '@/modules/charts_factory/controllers/Sensor/enums';
import { useActionButtons } from '@/composables/mixins/useActionButtons';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useSensorsStore } from '@/stores/SensorsStore';

import ChartsFilterBar from '../charts/ChartsFilterBar.vue';
import PDFandFFTrequestsBlock from './PDFandFFTrequestsBlock.vue';

const { tt } = Lang;

defineOptions({
	name: 'BannerFilterBlock',
});

const props = defineProps({
	sensorData: { type: Object, default: () => ({}) },
	sensors: { type: Array, default: () => [] },
	showHistory: Boolean,
	joinChartsBy: { type: Object, default: () => ({}) },
	itemsLoading: Boolean,
	isCompare: Boolean,
	enableFFT: Boolean,
	statsThresholdsActive: Boolean,
	currentSensorType: { type: Object, required: true },
	equipmentData: { type: Object, default: null },
	v21ViewActive: Boolean,
	levelZonesSaving: Boolean,
	hasOffAlarm: Boolean,
	hideOffAlarm: Boolean,
	splitNCDCharts: Boolean,
	splitChartsButtonEnabled: Boolean,
});

const emit = defineEmits(['event']);
const { confirmHelper } = useActionButtons({ emit });
const sensorsStore = useSensorsStore();
const { statistics_filters: filters } = storeToRefs(sensorsStore);
const pdfAndFftRequestsBlockRef = ref(null);

const metricSystemsList = computed(() => Object.freeze(getMetricSystemsList()));
const sensorParametersList = computed(() =>
	Object.freeze({
		banner_CM1L: getSensorParametersList(),
		banner: getSensorParametersList().filter(
			(parameter) => parameter.id !== SENSOR_PARAMETERS_TYPES.AMPS,
		),
	}),
);
const isBannerTempVibe2 = computed(() => props.currentSensorType.isBannerTempVibe2);
const isHumiditySensor = computed(() => props.currentSensorType.isHumiditySensor);
const isBannerV2_1 = computed(() => props.currentSensorType.isBannerV2_1);
const isBannerM25 = computed(() => props.currentSensorType.isBannerM25);
const isBannerExtraVibration = computed(() => props.currentSensorType.isBannerExtraVibration);
const isNCDEnv = computed(() => props.currentSensorType.isNCDEnv);
const isNCDSensor = computed(() =>
	props.currentSensorType.isNCDTempVibe ||
	props.currentSensorType.isNCDWiredTempVibe ||
	props.currentSensorType.isNCDTempVibeCurr,
);
const offAlarmParameterIds = Object.freeze([
	SENSOR_PARAMETERS_TYPES.Z_AXIS_ACCELERATION,
	SENSOR_PARAMETERS_TYPES.X_AXIS_ACCELERATION,
]);

const event = (name, data) => {
	emit('event', {
		eventName: name,
		data,
		onward: true,
	});
};
const switchMetricSystem = ({ id }) => {
	sensorsStore.set_statistics_filters({ ...filters.value, measurement: id });
};
const toggleOffAlarm = () => {
	if (!props.hasOffAlarm) {
		event('toggleOffAlarm', offAlarmParameterIds);
		return;
	}

	confirmHelper({
		message: `${tt('phrases.Do_you_really_want_to')} ${tt('phrases.disable_off_alarm')}? ${tt('Continue')}?`,
		confirmButtonText: tt('Confirm'),
	})
		.then(() => event('toggleOffAlarm', false))
		.catch(() => {});
};
const handleUnlockFFT = (payload) => {
	pdfAndFftRequestsBlockRef.value?.handleUnlockFFT?.(payload);
};

const { handleEvent } = useEventHandler({}, emit);

defineExpose({
	handleUnlockFFT,
});
</script>
