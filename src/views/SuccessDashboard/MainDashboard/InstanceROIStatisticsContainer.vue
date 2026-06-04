<template>
	<div class="card block-item statistics-block">
		<div
			:class="[
				'card-content relative chart-height-auto instance-roi-chart',
				{ 'label-click-enabled': enableLabelClickEvent },
				`columnsNumber-${selectedColumnsNumber.id}`,
			]"
		>
			<CommonChartItemWrapper
				chartFactoryContainerName="MaintenanceChartFactoryContainer"
				chartFactoryName="SuccessDashboardProblemsChart"
				configsKey="maintenanceChartListsConfig"
				chartKey="main"
				:rootFilters="filters"
				:predefinedFilters="predefinedFilters"
				:additionalProps="chartProps"
				:buildChartsPayloadProps="buildChartsPayload"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { getDateRange } from '@/helpers';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useRoiOnePagersStore } from '@/stores/RoiOnePagersStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';

import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

defineOptions({ name: 'SuccessDashboardInstanceROIStatisticsContainer' });

const props = defineProps({
	predefinedFilters: { type: Object, default: () => ({}) },
	filters: { type: Object, default: () => ({}) },
	fetch_action_url: String,
	instanceIdProp: String,
	enableLabelClickEvent: Boolean,
	selectedColumnsNumber: { type: Object, default: () => ({ id: null }) },
});

const globalStore = useGlobalStore();
const roiOnePagersStore = useRoiOnePagersStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters: roiOnePagersFilters } = storeToRefs(roiOnePagersStore);
const { changeRoute } = useNavigation();

const chartProps = computed(() =>
	Object.freeze({
		useSimpleSpinnerAsPreloader: true,
		nodataMock: true,
		chartInstanceContainerPayload: {
			fetch_action_url: props.fetch_action_url,
			setupProblemsStatisticsSettings: {
				prop: 'roi_cost',
			},
		},
		chartPointsEventsList: {
			serieClick: { name: 'click', event: (event) => serieClick(event) },
		},
	}),
);
const buildChartsPayload = computed(() =>
	Object.freeze({
		selectedColumnsNumber: props.selectedColumnsNumber?.id,
	}),
);
const plantId = computed(() => props.predefinedFilters?.plantId);

const serieClick = ({ point }) => {
	if (!plantId.value || !props.instanceIdProp) return;
	const instanceId = point?.options?.instance_id;
	if (!instanceId) return;

	const daterange = getDateRange('this_year', { getDateString: true });
	roiOnePagersStore.set_value(
		'filters',
		{
			...roiOnePagersFilters.value,
			page: 1,
			[props.instanceIdProp]: instanceId,
			daterange,
		},
		{ toLocalStorage: { prop: 'roi-one-pagers_filters' } },
	);
	globalStore.set_value(
		'globalFilters',
		{ ...globalFilters.value, plantId: plantId.value },
		{ toLocalStorage: { prop: 'global_filters' } },
	);
	changeRoute({ path: '/success-dashboard/roi-one-pager' });
};

const { handleEvent } = useEventHandler({
	handleChartContainerReady: () => {},
	chartLoadEvent: () => {},
});
</script>
