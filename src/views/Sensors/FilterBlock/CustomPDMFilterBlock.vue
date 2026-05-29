<template>
	<div class="charts-page-operations popover-content flex wrap justify-end triangle pos-top mcol-xs-12">
		<div v-if="enableStatsBlock" class="grouped-buttons-block-wrapper">
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
			v-if="enablePDFButton"
			:sensorData="sensorData"
			:equipmentData="equipmentData"
			:enableFFT="enableFFT"
			:currentSensorType="currentSensorType"
			enableRpmBlock
		/>

		<div class="button-item history-button">
			<el-button
				type="primary"
				native-type="button"
				:class="['inverted report-button', { active: showHistory }]"
				@click="event('toggleHistory')"
			>
				{{ `${showHistory ? tt('Hide') : tt('Show')} ${tt('history')}` }}
			</el-button>
		</div>

		<div v-if="enableChartFilters" class="button-item ChartsFilterBar">
			<ChartsFilterBar
				:isLoading="itemsLoading"
				:sensorParametersList="sensorParametersListVFDPressureRPMAmps"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { sensorParametersListVFDPressureRPMAmps as getSensorParametersListVFDPressureRPMAmps } from '@/modules/charts_factory/controllers/Sensor/enums';
import { useSensorsStore } from '@/stores/SensorsStore';

import ChartsFilterBar from '../charts/ChartsFilterBar.vue';
import PDFandFFTrequestsBlock from './PDFandFFTrequestsBlock.vue';

const { tt } = Lang;

defineOptions({
	name: 'CustomPDMFilterBlock',
});

defineProps({
	sensorData: { type: Object, default: () => ({}) },
	statisticsDataList: { type: Object, default: () => ({}) },
	sensorLoading: Boolean,
	showHistory: Boolean,
	joinChartsBy: { type: Object, default: () => ({}) },
	someChartLoading: Boolean,
	itemsLoading: Boolean,
	chartOperationsPopoverShow: Boolean,
	isCompare: Boolean,
	enableFFT: Boolean,
	enableStatsBlock: Boolean,
	statsThresholdsActive: Boolean,
	currentSensorType: { type: Object, required: true },
	enablePDFButton: { type: Boolean, default: true },
	enableChartFilters: { type: Boolean, default: true },
	equipmentData: { type: Object, default: null },
});

const emit = defineEmits(['event']);
const sensorsStore = useSensorsStore();
storeToRefs(sensorsStore);
const sensorParametersListVFDPressureRPMAmps = computed(() =>
	Object.freeze(getSensorParametersListVFDPressureRPMAmps()),
);

const event = (name, data) => {
	emit('event', {
		eventName: name,
		data,
		onward: true,
	});
};
</script>
