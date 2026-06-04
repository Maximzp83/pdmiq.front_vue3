<template>
	<div class="flex mrow wrap view-list-wrapper">
		<div class="mcol-xs-12 mcol-sm-8">
			<div class="card overflowHidden vertical-fluid">
				<div class="card-header filled_2">
					<div class="title semi-bold uppercase">{{ tt('BREAKDOWN_MACHINES') }}</div>
				</div>

				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:perPageItems="perPageItems"
						hideCreate
						hideDelete
						@event="handleEvent"
					>
						<div class="filter-item text-right">
							<Datepicker
								setupDaterangeFilter
								enableShortcuts
								:value="filters.daterange"
								type="daterange"
								@input="(range) => setFilters({ daterange: range, daterange_setted_at: Date.now() })"
							/>
						</div>
					</Filterbar>

					<CustomDataListTable
						ref="itemsTableRef"
						disableSelection
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
						@event="handleEvent"
					/>

					<PaginationContainer
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
						@setFilters="setFilters"
					/>
				</div>
			</div>
		</div>

		<div class="mcol-xs-12 mcol-sm-4">
			<div class="card overflowHidden statistic-block vertical-fluid maintenance-logs-chart">
				<div class="card-header filled_2">
					<div class="title semi-bold">{{ tt('phrases.top_5_breakdowns') }}</div>
				</div>

				<div class="card-content relative">
					<SimpleSpinner :active="itemsLoading" />

					<CommonChartItemWrapper
						ref="chartWrapperRef"
						chartFactoryContainerName="MaintenanceChartFactoryContainer"
						chartFactoryName="BreakdownMachinesChart"
						configsKey="maintenanceChartListsConfig"
						chartKey="main"
						:rootStatisticsData="statisticsData"
						:additionalProps="chartProps"
					>
						<template #custom_mock>
							<div class="text-center">
								{{ tt('phrases.Has_not_Statistics_for_this_range') }}...
							</div>
						</template>
					</CommonChartItemWrapper>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { getDateRange } from '@/helpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useMaintenanceStore } from '@/stores/MaintenanceStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import Filterbar from '@/components/common/Filterbar.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';

const { tt } = Lang;

defineOptions({
	name: 'BreakdownMachinesList',
});

defineProps({
	perPageItems: { type: Array, default: () => [] },
});

const globalStore = useGlobalStore();
const maintenanceStore = useMaintenanceStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters_breakdown: filters } = storeToRefs(maintenanceStore);
const itemsTableRef = ref(null);
const chartWrapperRef = ref(null);

const itemsNameRef = computed(() =>
	Object.freeze({
		one: tt('Machine'),
		mult: tt('Machines'),
		instanceName: 'maintenance',
	})
);

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	fetchItems,
	refetchItemsList,
	setFilters,
} = useItemsData({
	entityKey: 'MaintenanceLogs',
	itemStore: maintenanceStore,
	itemsName: itemsNameRef,
	itemFiltersName: 'maintenance_logs_breakdown_filters',
	options: {
		manual: true,
		filtersStateProp: 'filters_breakdown',
		tableRef: itemsTableRef,
		predefinedFilters: {
			totalBreakdown: 1,
			machineList: 1,
		},
		localPrepareFilters: (preparedFilters) => ({
			...preparedFilters,
			plantId: globalFilters.value?.plantId,
		}),
	},
});

const tableSettings = computed(() =>
	Object.freeze({
		rowIdKey: 'machine_id',
		columns: Lang.translate([
			{ prop: 'machine.name', label: 'phrases.Machine_Name' },
			{ prop: 'breakdown_total_time', label: 'phrases.Total_time', width: 120 },
		]),
	})
);

const chartProps = Object.freeze({
	customMock: true,
	disablePreloader: true,
});

const statisticsData = computed(() => {
	if (!itemsList.value.length) return [];

	return itemsList.value.slice(0, 5).map((item) => {
		const timeArray = `${item.breakdown_total_time || '0d 0h 0m'}`.split(' ');
		const days = Number(timeArray[0]?.split('d')[0]) || 0;
		const hours = Number(timeArray[1]?.split('h')[0]) || 0;
		const minutes = Number(timeArray[2]?.split('m')[0]) || 0;

		return {
			name: item.machine?.name || '',
			value: days * 24 + hours + minutes / 60,
		};
	});
});

onBeforeMount(() => {
	if (filters.value?.daterange?.length) {
		refetchItemsList();
		return;
	}

	const daterange = getDateRange('this_month', { getDateString: true });
	setFilters({ daterange }, { preventResetPage: true });
	fetchItems({
		...globalFilters.value,
		...filters.value,
		daterange,
	});
});

const { handleEvent } = useEventHandler({ setFilters });
</script>
