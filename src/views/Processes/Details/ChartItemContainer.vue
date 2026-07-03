<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="chartLoading"
			:itemsName="tt('chart')"
		/>

		<div class="chart-operations-block flex align-center">
			<div class="counters-wrapper">
				<div class="capacity-counters-wrapper colored-counters content-row">
					<div class="capacity-counters flex mrow">
						<div class="capacity-item">
							<span class="label">{{ tt('phrases.Maximum_capacity') }}</span>
							<span class="value max">{{ capacity.max }}</span>
						</div>
						<div class="capacity-item">
							<span class="label">{{ tt('phrases.Realistic_capacity') }}</span>
							<span class="value real">{{ capacity.real }}</span>
						</div>
						<div class="capacity-item">
							<span class="label">{{ tt('Running_total') }}</span>
							<span class="value actual">{{ otherStatistics.actual_capacity }}</span>
						</div>
					</div>
				</div>

				<div class="block-item flex content-row">
					<div
						v-if="otherStatistics.totalDowntimes"
						class="span-block downtimes-counters"
					>
						<span class="label semi-bold">{{ tt('phrases.accumulative_downtime') }}</span>
						<span class="value">{{ otherStatistics.totalDowntimes.total_count_hours }}</span>
						<span class="label">h</span>
						<span class="value">{{ otherStatistics.totalDowntimes.total_count_minutes }}</span>
						<span class="label">m</span>
						<span class="value">{{ otherStatistics.totalDowntimes.total_count_seconds }}</span>
						<span class="label">s</span>
					</div>

					<div class="span-block downtimes-counters">
						<span class="label semi-bold">{{ tt('phrases.Loss_count') }}</span>
						<span class="value">{{ otherStatistics.loss_count }}</span>
					</div>
				</div>

				<div class="block-item content-row">
					<div class="flex mrow align-center">
						<div class="label semi-bold mcol-xs-2">
							{{ tt('phrases.Group_data_by') }}:
						</div>

						<CustomSelectV2
							class="mcol-xs-3"
							:optionsList="groupByTimerangeList"
							:placeholder="`${tt('Select')} ${tt('timerange')}`"
							:modelValue="groupByTimeValue"
							@update:modelValue="(val) => ChartInstance.handleChangeGroupByTime(val)"
						/>
					</div>
				</div>
			</div>

			<div class="span-block ml-auto">
				<el-button
					v-if="authStore.hasAccessTo(['edit_oee'])"
					class="action-button edit-button"
					size="small"
					type="success"
					@click="() => handleChartOperation('editProcess')"
				>
					<i class="icomoon icon-pencil"></i>
				</el-button>
			</div>
		</div>

		<div
			v-show="initialFetch || hasStatistics"
			class="chart-container card-content"
		>
			<ChartWrapper :chartOptions="chartOptions" />
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, watch, ref } from 'vue';

import { Lang } from '@/localization';
import { isTodayRange } from '@/helpers';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useWebSocket } from '@/composables/mixins/useWebSocket';

import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ChartWrapper from '@/components/charts/ChartWrapper.vue';

const { tt } = Lang;

defineOptions({ name: 'ProcessChartItemContainer' });

const props = defineProps({
	ChartInstance: { type: Object, required: true },
	rootFilters: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { setupWebSocket, closeWebSocket } = useWebSocket();

const chartIsInit = ref(false);
const chartOptionsUpdate = ref(0);
const chartLoading = ref(false);
const chartRendering = ref(false);
const initialFetch = ref(true);
const hasStatistics = ref(false);
const statisticsResponsesReady = ref(false);
const groupByTimeValue = ref(0);
const stateSocketReady = ref(false);

const processData = computed(() => props.additionalProps.processData || {});
const chartOptions = computed(() =>
	chartOptionsUpdate.value ? Object.freeze(props.ChartInstance.getChartOptions()) : null,
);
const capacity = computed(() => Object.freeze({
	max: processData.value?.max_capacity || 0,
	real: processData.value?.real_capacity || 0,
}));
const otherStatistics = computed(() => {
	if (chartOptionsUpdate.value && props.ChartInstance.fetched_statistics_data) {
		return Object.freeze({
			totalDowntimes: props.ChartInstance.fetched_statistics_data.totalDowntimes,
			actual_capacity: props.ChartInstance.fetched_statistics_data.actual_capacity,
			loss_count: props.ChartInstance.fetched_statistics_data.loss_count,
		});
	}

	return Object.freeze({
		totalDowntimes: null,
		actual_capacity: 0,
		loss_count: 0,
	});
});
const socketChannel = computed(() =>
	processData.value?.uuid ? `oee.process.${processData.value.uuid}` : null,
);
const groupByTimerangeList = Object.freeze([
	{ id: 3600000, name: '1 hour', value: 3600000 },
	{ id: 1800000, name: '30 mins', value: 1800000 },
	{ id: 900000, name: '15 mins', value: 900000 },
	{ id: 300000, name: '5 mins', value: 300000 },
	{ id: 60000, name: '1 min', value: 60000 },
]);
const chartInstanceEventsList = computed(() => Object.freeze({
	isLoading: (value) => { chartLoading.value = value; },
	isRendering: (value) => { chartRendering.value = value; },
	isInitiated: () => { chartIsInit.value = true; },
	statisticsResponsesReady: handleStatisticsResponsesReady,
	hasStatistics: (value) => { hasStatistics.value = value; },
	chartOptionsReady: () => { chartOptionsUpdate.value += 1; },
	chartOptionsUpdate: () => { chartOptionsUpdate.value += 1; },
	groupByTimeValue: (value) => { groupByTimeValue.value = value; },
	plotBandsClickEvent: handlePlotBandsClick,
}));
const chartPointsEventsList = computed(() => Object.freeze({
	downtimeClickEvent: {
		name: 'click',
		event: (event) => handleDowntimeClick(event),
	},
}));

function handleDowntimeClick({ point } = {}, chartId) {
	if (!point?.options) return;

	emit('event', {
		eventName: 'handleDowntimeClick',
		data: { ...point.options, chartId },
		onward: true,
	});
}
function handlePlotBandsClick(payload) {
	emit('event', {
		eventName: 'handlePlotBandsClick',
		data: payload,
		onward: true,
	});
}
function fetchChartData(filters = {}, settings = {}) {
	props.ChartInstance.fetchChartData(filters, settings);
}
function handleStatisticsResponsesReady(ready) {
	statisticsResponsesReady.value = ready;
	if (ready) initialFetch.value = false;
}
function handleChartOperation(actionName, data) {
	emit('event', {
		eventName: actionName,
		data,
		onward: true,
	});
}
function stateSocketCallback(response = {}) {
	props.ChartInstance.handleCountersLiveUpdate(response);
}
function setupSocket() {
	if (!socketChannel.value) return;

	if (props.rootFilters.daterange && isTodayRange(props.rootFilters.daterange)) {
		setupWebSocket({
			socketName: 'state_socket',
			socketReadyRef: stateSocketReady,
			socketChannel: socketChannel.value,
			onMessage: (answer) => stateSocketCallback(answer),
		});
	} else {
		closeWebSocket({ socketName: 'state_socket' });
	}
}

watch(
	() => props.rootFilters,
	(filters) => {
		fetchChartData(filters);
		setupSocket();
	},
	{ deep: true },
);

watch(
	() => globalStore.isSidebarCollapse,
	() => {
		setTimeout(() => {
			props.ChartInstance.ChartAPI?.reflow?.();
		}, 350);
	},
);

setupSocket();
props.ChartInstance.injectProps('events', chartInstanceEventsList.value);
props.ChartInstance.setValue('groupByTimeValue', groupByTimerangeList[0].value);
props.ChartInstance.setValue('seriesEvents', chartPointsEventsList.value);
fetchChartData(props.rootFilters);

onBeforeUnmount(() => {
	closeWebSocket({ socketName: 'state_socket' });
});
</script>
