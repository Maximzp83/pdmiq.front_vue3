<template>
	<div class="card block-item statistics-block work-order-statistics">
		<div :class="['card-header flex align-center', { filled: !roundedIcon }]">
			<div v-if="roundedIcon" class="round-icon-container">
				<i class="icomoon icon-docs"></i>
			</div>
			<i v-else class="icomoon icon-docs"></i>

			<div class="title semi-bold">{{ tt('WORK_ORDERS') }}</div>

			<TableAction
				v-if="createWOButtonFormSetup"
				class="ml-auto"
				:rowData="itemData"
				:action="createWOAction"
				@event="handleEvent"
			/>
		</div>

		<div class="card-content relative">
			<div v-if="hasStatistics && statisticsData.breakdown_total_time" class="additional-group">
				<ul>
					<li>
						<span class="label">{{ `${tt('Downtime')} ${tt('lost')}` }}</span>
						<i class="icomoon icon-dashboard"></i>
						<span class="value"><b>${{ statisticsData.downtime_total_cost }}</b></span>
					</li>
					<li>
						<span class="label">{{ tt('Downtime') }}</span>
						<i class="icomoon icon-chronic"></i>
						<span class="value">{{ downTime }}</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue';

import { getTimeDifference } from '@/helpers';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';

const { tt } = Lang;

const TableAction = defineAsyncComponent(() => import('@/components/table/TableAction.vue'));

defineOptions({
	name: 'ItemWOStatisticBlock',
});

const props = defineProps({
	predefinedFilters: { type: Object, default: () => ({}) },
	filters: { type: Object, default: () => ({}) },
	createWOButtonFormSetup: { type: Array, default: null },
	roundedIcon: Boolean,
	itemData: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['event']);

const hasStatistics = ref(false);
const chartContainerReady = ref(0);
const commonChartItemWrapper = ref(null);

const statisticsData = computed(() => {
	if (chartContainerReady.value && hasStatistics.value) {
		const resultData = commonChartItemWrapper.value?.ChartInstance?.resultData;
		const pointsData = resultData?.statistics_result?.main?.pointsData;
		if (!pointsData) return {};
		const { downtime_total_cost, breakdown_total_time } = pointsData;
		return Object.freeze({ downtime_total_cost, breakdown_total_time });
	}
	return {};
});

const downTime = computed(() => {
	const { breakdown_total_time: breakdownTotalTime } = statisticsData.value;
	if (!breakdownTotalTime) {
		return 0;
	}

	const { days, hours, minutes } = getTimeDifference({
		from: '00:00:00',
		to: breakdownTotalTime,
		timeOnly: true,
	});

	if (days) return `${days}d ${hours}h ${minutes}m`;
	if (hours) return `${hours}h ${minutes}m`;
	return `${minutes} ${tt('minutes')}`;
});

const createWOAction = computed(() =>
	Object.freeze({
		name: 'handleCreateWorkOrderButton',
		formSetup: props.createWOButtonFormSetup,
		tooltip_text: tt('phrases.Create_Work_Order'),
		className: 'create-wo-button',
		type: 'primary inverted',
		buttonContent: {
			component: {
				componentFileLoader: () => import('@/components/itemDetails/CreateWOButton.vue'),
			},
		},
	})
);

const handleChartContainerReady = ({ chartContainerReady: ready, hasStatistics: stats }) => {
	hasStatistics.value = stats;
	chartContainerReady.value = ready;
};

const { handleEvent } = useEventHandler({ handleChartContainerReady }, emit);
</script>
