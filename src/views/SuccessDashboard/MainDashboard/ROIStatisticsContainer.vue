<template>
	<div :class="['card block-item statistics-block vertical-fluid flex column', { 'adopt-chart-to-viewport': adoptToViewport }]">
		<div :class="['card-header flex align-center', { filled: standardIconBlock }]">
			<div v-if="!standardIconBlock" class="round-icon-container">
				<i class="icomoon icon-docs"></i>
			</div>
			<i v-else class="icomoon icon-money-insert"></i>
			<div class="title semi-bold uppercase">{{ tt('phrases.roi_value_creation') }}</div>
		</div>

		<div class="card-content gauge-content relative flex column fluid">
			<div :class="['content-row', { 'mt-auto': !disableTabs }]">
				<GaugeStatisticsContainer
					:plantItem="plantItem"
					:plantsList="plantsList"
					:rootFilters="equipments_statistics_filters"
					:selectedColumnsNumber="selectedColumnsNumber"
					:allPlantsRoiStatistics="allPlantsRoiStatistics"
					:showStatisticsOutsideChart="disableTabs"
					:prorateBillingCost="prorateBillingCost"
					@event="handleEvent"
				/>
			</div>

			<div v-if="disableTabs" class="content-row instances-roi-charts mt-auto relative">
				<SimpleSpinner :active="isLoading" />

				<div class="roi-statistics-list">
					<div
						v-for="item in statistics"
						:key="`roi-statistics-item-${item.instance_id}`"
						class="roi-statistics-item flex align-center"
						@click="handleLabelClick(item)"
					>
						<div v-if="!plantItem" class="plant-name">{{ getPlantName(item.plant_id) }}</div>
						<div class="item-name">{{ item.name }}</div>
						<div class="cost">{{ item.data_count }} $</div>
					</div>
				</div>
			</div>

			<div v-else class="content-row instances-roi-charts mt-auto">
				<TabsBar
					notRound
					stretch
					:activeTab="activeTab"
					:tabsList="tabsList"
					:height="25"
					:initialAutoSelect="0"
					className="like-in-browser-tabs inverted radio-container bordered x-scroll"
					buttonsClass="filled secondary"
					@switchTab="switchTab"
				/>

				<InstanceROIStatisticsContainer
					v-if="activeTab.prop === tabsList[0].prop"
					:key="tabsList[0].prop"
					class="tab-container"
					instanceIdProp="productionLineId"
					:predefinedFilters="predefinedFilters"
					:enableLabelClickEvent="enableLabelClickEvent"
					fetch_action_url="production-lines/roi"
					:selectedColumnsNumber="selectedColumnsNumber"
				/>

				<InstanceROIStatisticsContainer
					v-if="activeTab.prop === tabsList[1].prop"
					:key="tabsList[1].prop"
					class="tab-container"
					instanceIdProp="productionLineId"
					:predefinedFilters="predefinedFilters"
					:enableLabelClickEvent="enableLabelClickEvent"
					fetch_action_url="machines/roi"
					:selectedColumnsNumber="selectedColumnsNumber"
				/>

				<InstanceROIStatisticsContainer
					v-if="activeTab.prop === tabsList[2].prop"
					:key="tabsList[2].prop"
					class="tab-container"
					instanceIdProp="productionLineId"
					:predefinedFilters="predefinedFilters"
					:enableLabelClickEvent="enableLabelClickEvent"
					fetch_action_url="assets/roi"
					:selectedColumnsNumber="selectedColumnsNumber"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { findItemBy, getDateRange } from '@/helpers';
import { Lang } from '@/localization';
import { fetch_statistics } from '@/modules/charts_factory/controllers/Maintenance/api/index.js';
import { setupProblemsStatistics } from '@/modules/charts_factory/controllers/Maintenance/methods';
import { prepareFilters } from '@/modules/charts_factory/helpers';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useRoiOnePagersStore } from '@/stores/RoiOnePagersStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useTabs } from '@/composables/mixins/useTabs';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import TabsBar from '@/components/common/TabsBar.vue';
import GaugeStatisticsContainer from './GaugeStatisticsContainer.vue';
import InstanceROIStatisticsContainer from './InstanceROIStatisticsContainer.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardROIStatisticsContainer' });

const emit = defineEmits(['event']);

const props = defineProps({
	plantItem: { type: Object, default: () => ({}) },
	plantsList: { type: Array, default: null },
	predefinedFilters: { type: Object, default: () => ({}) },
	standardIconBlock: Boolean,
	enableLabelClickEvent: Boolean,
	disableTabs: Boolean,
	equipments_statistics_filters: { type: Object, default: () => ({}) },
	selectedColumnsNumber: { type: Object, default: () => ({ id: null }) },
	allPlantsRoiStatistics: { type: Object, default: null },
	prorateBillingCost: Boolean,
});

const globalStore = useGlobalStore();
const roiOnePagersStore = useRoiOnePagersStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters: roiOnePagersFilters } = storeToRefs(roiOnePagersStore);
const { changeRoute } = useNavigation();

const statistics = ref([]);
const isLoading = ref(false);

const tabsList = computed(() => [
	{ title: tt('production_lines'), prop: 'plTab' },
	{ title: tt('machines'), prop: 'machinesTab' },
	{ title: tt('assets'), prop: 'assetsTab' },
]);
const adoptToViewport = computed(() => true);

// With the tabs hidden (corporate dashboard) the chart is replaced by a plain
// list of the top production lines by ROI for the selected date range.
const fetchStatistics = async () => {
	if (!props.disableTabs) return;

	isLoading.value = true;
	try {
		const params = { ...prepareFilters(props.predefinedFilters) };
		const { value } = await fetch_statistics({ params, url: 'production-lines/roi' });
		statistics.value = setupProblemsStatistics({ data: value || [], prop: 'roi_cost' });
	} catch {
		statistics.value = [];
	} finally {
		isLoading.value = false;
	}
};

const getPlantName = (plantId) => findItemBy('id', plantId, props.plantsList || [])?.name || '';

const handleLabelClick = ({ plant_id, instance_id }) => {
	if (!plant_id || !instance_id) return;

	roiOnePagersStore.set_value(
		'filters',
		{
			...roiOnePagersFilters.value,
			page: 1,
			productionLineId: instance_id,
			daterange: getDateRange('this_year', { getDateString: true }),
		},
		{ toLocalStorage: { prop: 'roi-one-pagers_filters' } },
	);
	globalStore.set_value(
		'globalFilters',
		{ ...globalFilters.value, plantId: plant_id },
		{ toLocalStorage: { prop: 'global_filters' } },
	);
	changeRoute({ path: '/success-dashboard/roi-one-pager' });
};

const { activeTab, switchTab } = useTabs({ tabsList, initialTab: tabsList.value[0] });
const { handleEvent } = useEventHandler({}, emit);

watch(() => props.predefinedFilters, fetchStatistics, { immediate: true, deep: true });
</script>
