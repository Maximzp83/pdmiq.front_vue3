<template>
	<div :class="['view-content-card corporate-for-print-container', { printHTMLWindowIsOpen }]">
		<VueElementLoadingWrapper :isLoading="plantsLoading" :itemsName="itemsName.mult" />

		<div class="section-row 1break-page-block">
			<div class="card content-row main-title flex align-center">
				<div class="card-content common-title semi-bold">
					{{ `${companyData.name} - ${tt('overall_Program_Review')}` }}
				</div>

				<div class="logo-img ml-auto">
					<img :src="main_logo" alt="logo" />
				</div>
			</div>

			<PlantDetailsItem
				v-if="plantsList.length"
				class="content-row"
				:companyId="companyId"
				:plantsList="plantsList"
				:propsFilters="predefinedFiltersForAllPlants"
				:allPlantsRoiStatistics="allPlantsRoiStatistics"
			/>

			<div v-else class="card">
				<div class="card-content common-title text-center">
					This Company does not contain plants...
				</div>
			</div>
		</div>

		<div class="section-row content-row flex align-center columns-selector">
			<div class="common-title semi-bold capitalize">
				{{ `${tt('Plant')} ${tt('Summaries')} ${tt('view')}` }}
			</div>
			<div class="mcol-xs-3 mcol-sm-2 filter-item perPage-item ml-auto">
				<CustomSelectV2
					v-model="columnsNumber"
					:optionsLoading="plantsLoading"
					:optionsList="columnsNumberList"
				/>
			</div>
		</div>

		<div class="content-row flex mrow wrap columns-list">
			<div
				v-for="(plantItem, idx) in plantsList"
				:key="`plant-${plantItem.id}`"
				:class="[
					`mcol-xs-${selectedColumnsNumber.classPostfix}`,
					{ 'break-page-block': setBreakPageFor(idx, selectedColumnsNumber.id) },
					`columnsNumber-${selectedColumnsNumber.id}`,
				]"
			>
				<PlantDetailsItem
					class="card column-item"
					:plantItem="plantItem"
					:selectedColumnsNumber="selectedColumnsNumber"
					:isLastItem="idx === plantsList.length - 1"
					@event="handleEvent"
					@onLastItemMounted="handleLastItemMounted"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { main_logo } from '@/constants/global';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { usePlantsStore } from '@/stores/PlantsStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import PlantDetailsItem from './PlantDetailsItem.vue';

const { tt } = Lang;

defineOptions({ name: 'CorporateMain' });

const props = defineProps({
	companyId: { type: [Number, String], default: null },
	companyData: { type: Object, required: true },
	plantsList: { type: Array, default: () => [] },
	plantsLoading: { type: Boolean, default: false },
});

const globalStore = useGlobalStore();
const plantsStore = usePlantsStore();
const { printHTMLWindowIsOpen } = storeToRefs(globalStore);
const { statistics_filters: filters } = storeToRefs(plantsStore);

const columnsNumber = ref(1);
const plantRoiStatisticsMap = ref({});
const allPlantsRoiStatistics = computed(() =>
	Object.values(plantRoiStatisticsMap.value).reduce(
		(acc, item) => ({
			currentValue: acc.currentValue + (item.currentValue || 0),
			redArea: acc.redArea + (item.redArea || 0),
		}),
		{ currentValue: 0, redArea: 0 },
	),
);

const itemsName = computed(() =>
	Object.freeze({
		one: tt('Plant'),
		mult: tt('Plants'),
	}),
);
const predefinedFiltersForAllPlants = computed(() =>
	Object.freeze({
		plantId: null,
		plantIds: props.plantsList.map((item) => item.id),
		daterange: filters.value?.daterange,
	}),
);
const columnsNumberList = computed(() =>
	Object.freeze([
		{ id: 1, label: '1', classPostfix: '12' },
		{ id: 2, label: '2', classPostfix: '6' },
		{ id: 3, label: '3', classPostfix: '4' },
		{ id: 4, label: '4', classPostfix: '3' },
		{ id: 5, label: '5', classPostfix: '20' },
	]),
);
const selectedColumnsNumber = computed(
	() => columnsNumberList.value.find((item) => item.id === columnsNumber.value) || columnsNumberList.value[0],
);

const setBreakPageFor = (idx, columnsNum) => {
	if (columnsNum === 1) return idx % 2 === 0;
	return idx % columnsNum === 0;
};

const handleLastItemMounted = () => {
	if (selectedColumnsNumber.value.id <= 1) return;

	nextTick(() => {
		const columns = document.querySelectorAll('.corporate-dashboard .columns-list > div');
		const rowsHeight = {};
		let row = 0;

		columns.forEach((column) => {
			if (column.classList.contains('break-page-block')) {
				row += 1;
				rowsHeight[row] = 0;
			}

			const block = column.querySelector('.column-item .roi-charts-wrapper');
			if (!block) return;

			block.setAttribute('rowIdx', row);
			if (rowsHeight[row] < block.offsetHeight) {
				rowsHeight[row] = block.offsetHeight;
			}
		});

		columns.forEach((column) => {
			const block = column.querySelector('.column-item .roi-charts-wrapper');
			if (!block) return;

			const rowIdx = block.getAttribute('rowIdx');
			const height = rowsHeight[rowIdx];
			// minHeight, not height: the ROI list under the gauge is fetched
			// asynchronously, so this runs before it arrives and the measured row
			// height is too short for the final content. A hard height would clip
			// the list; a floor still aligns the cards across the row.
			if (height) block.style.minHeight = `${height}px`;
		});
	});
};

const plantRoiStatisticsReady = (data = {}) => {
	if (data.plantId == null) return;

	plantRoiStatisticsMap.value = {
		...plantRoiStatisticsMap.value,
		[data.plantId]: { currentValue: data.currentValue || 0, redArea: data.redArea || 0 },
	};
};

const { handleEvent } = useEventHandler({ plantRoiStatisticsReady });

watch(
	() => props.companyId,
	() => {
		plantRoiStatisticsMap.value = {};
	},
);
</script>
