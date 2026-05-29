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
							icon="icomoon icon-eye"
							@click="event('toggleV2_1View')"
						/>
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
							icon="icomoon icon-eye"
							@click="event('toggleStatsThresholds')"
						/>
					</div>
				</div>
			</div>
		</div>

		<PDFandFFTrequestsBlock
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
				@click="event('toggleOffAlarm')"
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
					icon="icomoon icon-overlay"
					@click="event('handleJoinCharts', 'axis')"
				>
					{{ tt('Axis') }}
				</el-button>

				<el-button
					v-if="!isNCDEnv"
					type="primary"
					native-type="button"
					:class="['report-button inverted', { active: joinChartsBy?.prop === 'type' }]"
					icon="icomoon icon-overlay"
					@click="event('handleJoinCharts', 'type')"
				>
					{{ tt('Params') }}
				</el-button>

				<el-button
					v-if="splitChartsButtonEnabled"
					type="primary"
					native-type="button"
					:class="['report-button inverted', { active: splitNCDCharts }]"
					icon="icomoon icon-overlay"
					@click="event('handleSplitNCDCharts')"
				>
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
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import {
	sensorParametersList as getSensorParametersList,
	metricSystemsList as getMetricSystemsList,
} from '@/modules/charts_factory/controllers/Sensor/enums';
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
const sensorsStore = useSensorsStore();
const { statistics_filters: filters } = storeToRefs(sensorsStore);

const metricSystemsList = computed(() => Object.freeze(getMetricSystemsList()));
const sensorParametersList = computed(() => Object.freeze(getSensorParametersList()));
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

const { handleEvent } = useEventHandler({}, emit);
</script>
