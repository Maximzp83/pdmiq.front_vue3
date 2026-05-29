<template>
	<div class="card overflowHidden statistic-block vertical-fluid maintenance-logs-chart">
		<div class="card-content">
			<CustomDataListTable
				ref="itemsTableRef"
				:itemsLoading="itemsLoading"
				:tableData="itemsList"
				:tableSettings="tableSettings"
				:itemsName="itemsName"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { MAINTENANCE_TYPES } from '@/constants/global';
import { Lang } from '@/localization';
import { useMaintenanceStore } from '@/stores/MaintenanceStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';

defineOptions({
	name: 'BreakdownMachinesList',
});

const maintenanceStore = useMaintenanceStore();
const { filters_breakdown: filters } = storeToRefs(maintenanceStore);
const itemsTableRef = ref(null);

const {
	itemsList,
	itemsLoading,
	itemsName,
	setFilters,
} = useItemsData({
	entityKey: 'MaintenanceLogs',
	itemStore: maintenanceStore,
	options: {
		filtersStateProp: 'filters_breakdown',
		tableRef: itemsTableRef,
		predefinedFilters: {
			type: MAINTENANCE_TYPES.LOG,
			orderByColumn: 'total_time',
			orderByMethod: 'desc',
		},
	},
});

const tableSettings = computed(() =>
	Object.freeze({
		columns: Lang.translate([
			{ label: 'Machine', prop: 'machine.name', min_width: 120 },
			{ label: 'Asset', prop: 'asset.name', min_width: 120 },
			{ label: 'Item', prop: 'equipment.name', min_width: 120 },
			{ label: 'Time', prop: 'total_time', width: 90 },
		]),
		operations: { actions: [] },
	})
);

const { handleEvent } = useEventHandler({ setFilters });
</script>
