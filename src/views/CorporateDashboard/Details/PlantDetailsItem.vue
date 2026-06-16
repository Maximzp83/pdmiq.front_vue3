<template>
	<div class="column-item">
		<div v-if="plantItem" class="card-header filled_2">
			<div class="section-title semi-bold">{{ plantItem.name }}</div>
			<div v-if="atService" class="in-service-label">
				{{ `${atService} ${tt('in_service')}` }}
			</div>
		</div>
		<div class="card-content">
			<div class="plant-details details-page main-instance-item">
				<div class="mrow flex wrap big-padding">
					<div :class="[selectedColumnsNumber.id > 1 ? 'mcol-xs-12' : 'mcol-lg-6']">
						<div class="mrow">
							<div class="pdm-statistics-wrapper mcol-xs-12">
								<ItemPDMsStatisticBlock
									:title="tt('phrases.overall_asset_health')"
									:filters="filters"
									:predefinedFilters="predefinedFilters"
									:selectedColumnsNumber="selectedColumnsNumber"
								/>
							</div>
							<div class="mcol-xs-12 counters-wrapper">
								<Counters
									standardIconBlock
									disableViewAll
									:plantId="plantItem ? plantItem.id : null"
									:companyId="companyId"
								/>
							</div>
						</div>
					</div>

					<div :class="[selectedColumnsNumber.id > 1 ? 'mcol-xs-12' : 'mcol-lg-6', 'roi-charts-wrapper']">
						<ROIStatisticsContainer
							:plantItem="plantItem"
							:predefinedFilters="predefinedFilters"
							:switchTabTo="{ key: 'prop', value: 'plTab' }"
							disableTabs
							standardIconBlock
							:selectedColumnsNumber="selectedColumnsNumber"
							:allPlantsRoiStatistics="allPlantsRoiStatistics"
							@event="handleEvent"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, nextTick, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { getPassedTime } from '@/helpers';
import { Lang } from '@/localization';
import { usePlantsStore } from '@/stores/PlantsStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import ItemPDMsStatisticBlock from '@/components/itemDetails/ItemPDMsStatisticBlock.vue';
import Counters from '@/views/Plants/Details/Counters.vue';
import ROIStatisticsContainer from '@/views/SuccessDashboard/MainDashboard/ROIStatisticsContainer.vue';

const { tt } = Lang;

defineOptions({ name: 'CorporateDashboardPlantDetailsItem' });

const props = defineProps({
	companyId: { type: [Number, String], default: null },
	plantItem: { type: Object, default: null },
	plantsList: { type: Array, default: () => [] },
	propsFilters: { type: Object, default: null },
	selectedColumnsNumber: { type: Object, default: () => ({}) },
	isLastItem: Boolean,
	allPlantsRoiStatistics: { type: Object, default: null },
});

const emit = defineEmits(['event', 'onLastItemMounted']);

const plantsStore = usePlantsStore();
const { statistics_filters: filters } = storeToRefs(plantsStore);

const atService = computed(() => {
	if (!props.plantItem?.joined_at) return null;
	return getPassedTime(Date.now(), props.plantItem.joined_at);
});
const predefinedFilters = computed(() => {
	const resultFilters = {
		plantId: props.plantItem?.id,
		daterange: filters.value?.daterange,
	};

	if (props.propsFilters) {
		return Object.freeze({ ...resultFilters, ...props.propsFilters });
	}

	return Object.freeze(resultFilters);
});

const emitLastItemMounted = () => {
	if (!props.isLastItem) return;
	nextTick(() => emit('onLastItemMounted'));
};

const { handleEvent } = useEventHandler({}, emit);

watch(
	() => props.selectedColumnsNumber,
	() => emitLastItemMounted(),
);

onMounted(emitLastItemMounted);
</script>
