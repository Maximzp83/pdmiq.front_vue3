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
					@event="handleEvent"
				/>
			</div>

			<div v-if="!disableTabs" class="content-row instances-roi-charts mt-auto">
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
import { computed } from 'vue';
import { Lang } from '@/localization';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useTabs } from '@/composables/mixins/useTabs';
import TabsBar from '@/components/common/TabsBar.vue';
import GaugeStatisticsContainer from './GaugeStatisticsContainer.vue';
import InstanceROIStatisticsContainer from './InstanceROIStatisticsContainer.vue';

const { tt } = Lang;

defineOptions({ name: 'SuccessDashboardROIStatisticsContainer' });

const emit = defineEmits(['event']);

defineProps({
	plantItem: { type: Object, default: () => ({}) },
	plantsList: { type: Array, default: null },
	predefinedFilters: { type: Object, default: () => ({}) },
	standardIconBlock: Boolean,
	enableLabelClickEvent: Boolean,
	disableTabs: Boolean,
	equipments_statistics_filters: { type: Object, default: () => ({}) },
	selectedColumnsNumber: { type: Object, default: () => ({ id: null }) },
	allPlantsRoiStatistics: { type: Object, default: null },
});

const tabsList = computed(() => [
	{ title: tt('production_lines'), prop: 'plTab' },
	{ title: tt('machines'), prop: 'machinesTab' },
	{ title: tt('assets'), prop: 'assetsTab' },
]);
const adoptToViewport = computed(() => true);
const { activeTab, switchTab } = useTabs({ tabsList, initialTab: tabsList.value[0] });
const { handleEvent } = useEventHandler({}, emit);
</script>
