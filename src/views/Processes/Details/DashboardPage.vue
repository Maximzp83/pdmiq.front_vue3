<template>
	<div class="dashboard-page-container view-content-card card">
		<div class="card-header">
			<div class="flex mrow wrap align-center relative">
				<div class="mcol-xs-12 mcol-sm-4 fluid meta-block">
					<div class="meta-item selected-daterange">
						<i class="icomoon icon-calendar" />
						<span class="text" v-text="selectedDateRange"></span>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-auto ml-auto">
					<Datepicker
						setupDaterangeFilter
						enableShortcuts
						:value="statisticsFilters.daterange"
						type="daterange"
						@input="setStatisticsFilters"
					/>
				</div>
			</div>
		</div>

		<div class="card-content">
			<div class="section-row chart-wrapper">
				<div class="charts-data-container">
					<div class="charts-list content-row">
						<CommonChartItemWrapper
							ref="commonChartItemWrapperRef"
							chartFactoryContainerName="OEEChartFactoryContainer"
							chartFactoryName="OEEChart"
							configsKey="OEEChartsListsConfig"
							chartKey="oee_proccess"
							:rootFilters="statisticsFilters"
							:additionalProps="chartItemProps"
							:chartComponentFileLoader="() => import('./ChartItemContainer.vue')"
							@event="handleEvent"
						/>
					</div>
				</div>
			</div>
		</div>

		<el-dialog
			v-model="showEditEventLog"
			center
			title="EVENT LOG"
			append-to-body
			class="small"
		>
			<EventLogForm
				v-if="showEditEventLog"
				showSubmitButtons
				:itemData="eventLogData"
				:processDataProp="processData"
				@closeDialog="showEditEventLog = false"
				@successSubmit="successEventLog"
			/>
		</el-dialog>

		<el-dialog
			v-model="showEditBreakTime"
			center
			title="CHANGE BREAK TIME"
			append-to-body
			class="small"
		>
			<EditBreakTimeForm
				v-if="showEditBreakTime"
				showSubmitButtons
				:itemData="breakTimeData"
				:processData="processData"
				:visible="showEditBreakTime"
				@closeDialog="showEditBreakTime = false"
				@successSubmit="successBreakTime"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref, toRaw } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { getYmdDateString, decomposeDate } from '@/helpers';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useProcessesStore } from '@/stores/ProcessesStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import Datepicker from '@/components/common/Datepicker.vue';
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';
import EventLogForm from './EventLogForm.vue';
import EditBreakTimeForm from './EditBreakTimeForm.vue';

const { tt } = Lang;

defineOptions({ name: 'ProcessDashboard' });

const props = defineProps({
	processData: { type: Object, default: () => ({}) },
});

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const processesStore = useProcessesStore();
const { statistics_filters: statisticsFilters } = storeToRefs(processesStore);

const commonChartItemWrapperRef = ref(null);
const hasStatistics = ref(false);
const chartContainerReady = ref(0);
const showEditEventLog = ref(false);
const showEditBreakTime = ref(false);
const eventLogData = ref(null);
const breakTimeData = ref(null);

const selectedDateRange = computed(() => {
	const { daterange } = statisticsFilters.value || {};
	if (!daterange?.length) return '';

	return `${getYmdDateString({
		obj: decomposeDate(daterange[0]),
		format: 'localeStr',
	})} - ${getYmdDateString({
		obj: decomposeDate(daterange[1]),
		format: 'localeStr',
	})}`;
});
const cloneArray = (value) => {
	if (!Array.isArray(value)) return [];

	return value.map((item) => {
		if (!item || typeof item !== 'object') return item;
		return { ...toRaw(item) };
	});
};
const plainProcessData = computed(() => {
	const rawProcessData = toRaw(props.processData || {});
	return {
		...rawProcessData,
		pictures: cloneArray(rawProcessData.pictures),
		week_work_days: cloneArray(rawProcessData.week_work_days),
		machines_ids: cloneArray(rawProcessData.machines_ids),
		faults: cloneArray(rawProcessData.faults),
		work_breaks: cloneArray(rawProcessData.work_breaks),
		work_dates: cloneArray(rawProcessData.work_dates),
		conveyor_processes: cloneArray(rawProcessData.conveyor_processes),
	};
});
const chartItemProps = computed(() => Object.freeze({
	hasAccessTo: authStore.hasAccessTo,
	processData: plainProcessData.value,
	disableContainerPreloader: true,
	chartInstanceContainerPayload: {
		processData: plainProcessData.value,
		breakSerieByDay: true,
	},
}));

const setStatisticsFilters = (range) => {
	processesStore.set_value('statistics_filters', {
		...statisticsFilters.value,
		daterange: range,
		daterange_setted_at: Date.now(),
	}, {
		toLocalStorage: { prop: 'processes_statistics_filters' },
	});
};
const handleChartContainerReady = ({ chartContainerReady: ready, hasStatistics: hasStats }) => {
	hasStatistics.value = hasStats;
	chartContainerReady.value = ready;
};
const handleDowntimeClick = (payload = {}) => {
	if (!authStore.hasAccessTo(['edit_oee'])) return;

	eventLogData.value = payload.payload || payload;
	showEditEventLog.value = true;
};
const handlePlotBandsClick = ({ work_break: workBreak } = {}) => {
	breakTimeData.value = workBreak;
	showEditBreakTime.value = true;
};
const cloneProcessDataForModal = () => {
	return plainProcessData.value;
};
const editProcess = () => {
	globalStore.show_edit_modal({
		show: true,
		instanceData: cloneProcessDataForModal(props.processData),
		instanceName: 'Processes',
		itemName: 'Process',
		formComponentFileLoader: () => import('../ItemForm.vue'),
		successSubmitCallback: processSubmit,
	});
};
const reloadChart = () => {
	commonChartItemWrapperRef.value?.ChartInstanceContainer?.reloadChart?.();
};
const successEventLog = () => {
	showEditEventLog.value = false;
	reloadChart();
};
const successBreakTime = () => {
	showEditBreakTime.value = false;
	reloadChart();
};
const processSubmit = () => {
	reloadChart();
	globalStore.show_edit_modal({ show: false });
};

const { handleEvent } = useEventHandler({
	handleChartContainerReady,
	handleDowntimeClick,
	handlePlotBandsClick,
	editProcess,
});
</script>
