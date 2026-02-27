<template>
	<div
		:class="[
			'card block-item statistics-block pdmPie-statistics-wrapper',
			{ 'is-spanish': Lang.currentLangId === LANGUAGE_TYPES.SPANISH },
			{ legendEnabled }
		]"
	>
		<div class="card-header filled flex align-center">
			<i class="icomoon icon-chart3"></i>

			<div class="title semi-bold uppercase div-block" v-text="title || tt('STATISTICS')"></div>

			<span
				v-if="chartLegendEvents.length"
				class="div-block semi-bold link info-color"
				@click="handleShowAll"
			>
				{{ tt('phrases.Show_All') }}
			</span>
		</div>

		<div :class="['card-content relative', `columnsNumber-${selectedColumnsNumber.id}`]">
			<CommonChartItemWrapper
				ref="commonChartItemWrapper"
				@event="handleEvent"
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="PDMStatisticsPieChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:rootFilters="filters"
				:predefinedFilters="predefinedFilters"
				:additionalProps="chartProps"
				:buildChartsPayloadProps="buildChartsPayload"
			/>

			<div
				v-if="resultStatistics"
				v-show="legendEnabled"
				class="chart-statistic-legend-part relative"
			>
				<div v-for="item in resultStatistics.base" :key="`legend-${item.name}`">
					<span class="semi-bold">{{ item.y }}</span>
					<span v-if="item.y">({{ Math.round((item.y / resultStatistics.total) * 100) }}%)</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { LANGUAGE_TYPES } from '@/localization/utils';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

const { tt } = Lang;

const props = defineProps({
	predefinedFilters: { type: Object, default: () => ({}) },
	filters: { type: Object, default: () => ({}) },
	chartLegendEvents: { type: Array, default: () => [] },
	title: { type: String, default: '' },
	selectedColumnsNumber: { type: Object, default: () => ({ id: null }) },
});

const emit = defineEmits(['event']);

const hasStatistics = ref(false);
const chartContainerReady = ref(0);
const commonChartItemWrapper = ref(null);

const globalStore = useGlobalStore();
const { printHTMLWindowIsOpen } = storeToRefs(globalStore);

const chartProps = computed(() =>
	Object.freeze({
		useSimpleSpinnerAsPreloader: true,
		chartSpecificEvents: props.chartLegendEvents,
	})
);

const buildChartsPayload = computed(() =>
	Object.freeze({
		selectedColumnsNumber: props.selectedColumnsNumber.id,
	})
);

const resultStatistics = computed(() => {
	if (!chartContainerReady.value || !commonChartItemWrapper.value?.ChartInstance) {
		return null;
	}
	return commonChartItemWrapper.value.ChartInstance.resultData?.statistics_result?.main?.pointsData || null;
});

const legendEnabled = computed(
	() => props.selectedColumnsNumber.id == null || props.selectedColumnsNumber.id < 2
);

const handleChartContainerReady = ({ chartContainerReady: ready, hasStatistics: stats }) => {
	hasStatistics.value = stats;
	chartContainerReady.value = ready;
};

const handleShowAll = () => {
	emit('event', { eventName: 'showItemsWithSensors' });
};

const callChartMethod = (method, data) => {
	if (commonChartItemWrapper.value?.callChartMethod) {
		commonChartItemWrapper.value.callChartMethod(method, data);
	}
};

const methodsMap = { handleChartContainerReady };
const { handleEvent } = useEventHandler(methodsMap, emit);

watch(
	() => props.selectedColumnsNumber,
	(val) => {
		callChartMethod('handleColumnsNumberChange', { val: val?.id });
	},
	{ deep: true }
);

watch(
	() => printHTMLWindowIsOpen.value,
	(isOpen) => {
		callChartMethod('handleColumnsNumberChange', {
			val: props.selectedColumnsNumber.id,
			isPrintOpen: isOpen,
		});
	}
);
</script>
