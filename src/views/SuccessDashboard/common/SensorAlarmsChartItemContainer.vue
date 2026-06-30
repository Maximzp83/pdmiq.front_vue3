<template>
	<div class="card showHistory relative">
		<VueElementLoadingWrapper :isLoading="chartLoading" :itemsName="tt('chart')" />

		<div v-if="sensorData" class="card-header flex mrow wrap align-center">
			<div class="mcol-xs-8 mcol-sm-6 mcol-lg-8">
				<div class="flex align-center">
					<div class="semi-bold div-block">{{ chartTitle }}</div>

					<div v-if="additionalProps.showDisableChartButton" class="div-block">
						<el-button
							:class="{ active: chartIsDisabled }"
							native-type="button"
							type=""
							class="action-button disable-chart-button is-plain tertiary"
							size="small"
							@click="toggleChart"
						>
							<i :class="['icomoon', chartIsDisabled ? 'icon-eye' : 'icon-eye-slash']"></i>
						</el-button>
					</div>

					<div v-if="additionalProps.showChartSelectionButton" class="div-block">
						<el-button
							:class="{ active: enableChartSelectionFeature }"
							native-type="button"
							type=""
							class="action-button disable-chart-button is-plain tertiary"
							size="small"
							@click="toggleChartSelectionFeature"
						>
							<i :class="['icomoon', 'icon-symbol1']"></i>
						</el-button>
					</div>
				</div>
			</div>
		</div>

		<div v-show="!chartIsDisabled && (initialFetch || hasStatistics)" class="chart-container card-content">
			<ChartWrapper
				ref="chartWrapperRef"
				:chartOptions="chartOptions"
				constructorType="stockChart"
				:hcInstance="hcInstance"
			/>
		</div>

		<div
			v-if="!chartIsDisabled && additionalProps.enableDescriptionForm"
			class="card-footer special-decorated-form"
		>
			<div
				:class="[
					'chart-notes-wrapper edit-form-container',
					{ showJustInfo: additionalProps.showJustInfo },
				]"
			>
				<div v-if="notesItemsList.length" class="content-row">
					<NotesItem
						v-for="(item, idx) in notesItemsList"
						ref="notesItemRefs"
						:key="`notes_item-${item.id}`"
						:item-data="item"
						:item-index="idx"
						:isLast="idx === notesItemsList.length - 1"
						:showJustInfo="additionalProps.showJustInfo"
						@onCreate="addFormItem(notesItemsList, 'n_i-')"
						@onRemove="(id) => removeFormItem(id, notesItemsList)"
					/>
				</div>
			</div>
		</div>

		<el-dialog
			v-if="additionalProps.showChartSelectionButton && showCommentForm"
			v-model="showCommentForm"
			:title="`${selectionData?.description ? tt('EDIT') : tt('ADD')} ${tt('COMMENT')}`"
			append-to-body
			center
			class="tiny dialog-decorate-header filled-header rounded top"
		>
			<ChartCommentForm :ChartInstance="ChartInstance" />
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import stockInit from 'highcharts/modules/stock';
import boost from 'highcharts/modules/boost';
import annotations from 'highcharts/modules/annotations';
import { cloneDeep } from '@/helpers';
import { Lang } from '@/localization';
import { initHighchartsModule } from '@/helpers/charts';
import { useSubItemsList } from '@/composables/mixins/useSubItemsList';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ChartWrapper from '@/components/charts/ChartWrapper.vue';
import NotesItem from './NotesItem.vue';
import ChartCommentForm from './ChartCommentForm.vue';

defineOptions({ name: 'SuccessDashboardSensorAlarmsChartItemContainer' });

const props = defineProps({
	ChartInstance: { type: Object, required: true },
	rootFilters: { type: Object, default: () => ({}) },
	additionalProps: { type: Object, default: () => ({}) },
	sensorData: { type: Object, required: true },
	currentSensorType: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const { tt } = Lang;

const chartIsDisabled = ref(false);
const chartIsInit = ref(false);
const chartOptionsUpdate = ref(0);
const chartLoading = ref(false);
const chartRendering = ref(false);
const initialFetch = ref(true);
const hasStatistics = ref(false);
const statisticsResponsesReady = ref(false);
const showCommentForm = ref(false);
const enableChartSelectionFeature = ref(false);
const notesItemsList = ref([]);
const notesItemRefs = ref([]);

const { setupFormSubItemsList, addFormItem, removeFormItem } = useSubItemsList();

const chartOptions = computed(() => chartOptionsUpdate.value ? Object.freeze(props.ChartInstance.getChartOptions()) : null);
const chartTitle = computed(() => props.ChartInstance.chartTitle);
const graphItem = computed(() => props.ChartInstance.graphItem);
const selectionData = computed(() => showCommentForm.value ? Object.freeze(props.ChartInstance.selectionData || {}) : null);
const hcInstance = computed(() => {
	initHighchartsModule(highchartsMore, Highcharts);
	initHighchartsModule(stockInit, Highcharts);
	initHighchartsModule(boost, Highcharts);
	initHighchartsModule(annotations, Highcharts);
	return Highcharts;
});

const toggleChart = () => {
	props.ChartInstance.toggleChart();
};
const handleIsRemoveChart = () => {
	toggleChart();
};
const fetchChartData = (filters = {}, settings = {}) => {
	props.ChartInstance.fetchChartData(filters, settings);
};
const handleStatisticsResponsesReady = (ready) => {
	statisticsResponsesReady.value = ready;
	if (ready) {
		initialFetch.value = false;
	}
};
const handleChartOptionsReady = () => {
	chartOptionsUpdate.value += 1;
};
const toggleChartSelectionFeature = () => {
	enableChartSelectionFeature.value = !enableChartSelectionFeature.value;
	props.ChartInstance.injectProps(
		'options',
		{
			chart: { zoomType: enableChartSelectionFeature.value ? 'x' : null },
		},
		{ emitChartOptionsUpdate: true },
	);
};
const setupNotesItems = (item) => {
	const { enableDescriptionForm, showJustInfo } = props.additionalProps;
	if (!enableDescriptionForm) return;

	notesItemsList.value = setupFormSubItemsList(item?.notes || [], 'n_i');

	if (!showJustInfo && !notesItemsList.value.length) {
		addFormItem(notesItemsList, 'n_i-');
	}
};
const handleValidateNotesItems = () => notesItemRefs.value.map((item) => item.getFormData());
const getFormData = () => props.ChartInstance.getFormData();
const setupInitialChartState = () => {
	if (graphItem.value) {
		setupNotesItems(graphItem.value);
		props.ChartInstance.setValue('chartIsDisabled', graphItem.value.is_hidden);
	}

	props.ChartInstance.injectProps('events', chartInstanceEventsList.value);

	if (!chartIsDisabled.value) {
		fetchChartData();
	}
};
const chartInstanceEventsList = computed(() =>
	Object.freeze({
		chartIsDisabled: (value) => { chartIsDisabled.value = value; },
		isRemoveChart: handleIsRemoveChart,
		showCommentForm: (value) => { showCommentForm.value = value; },
		isLoading: (value) => { chartLoading.value = value; },
		isRendering: (value) => { chartRendering.value = value; },
		isInitiated: () => { chartIsInit.value = true; },
		statisticsResponsesReady: handleStatisticsResponsesReady,
		hasStatistics: (value) => { hasStatistics.value = value; },
		chartOptionsReady: handleChartOptionsReady,
		chartOptionsUpdate: handleChartOptionsReady,
		chartLoadEvent: () => {},
		handleValidateNotesItems,
	}),
);

watch(
	() => cloneDeep(props.rootFilters),
	(filters) => {
		props.ChartInstance.setFilters(filters, {
			refetchData: !chartIsDisabled.value,
		});
	},
);

watch(chartIsDisabled, (isHidden) => {
	if (!isHidden && (!chartIsInit.value || !hasStatistics.value)) {
		fetchChartData();
	}
});

onMounted(setupInitialChartState);

defineExpose({ getFormData });
</script>
