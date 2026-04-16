<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="!hasAccessToCreate"
						:hideDelete="!hasAccessToDelete"
						@event="handleEvent"
					/>

					<CustomDataListTable
						ref="itemsTableRef"
						:disableSelection="!hasAccessToDelete"
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
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { ENTITIES } from '@/config/entities';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { usePartsStore } from '@/stores/PartsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'PartsList',
});

const itemsTableRef = ref(null);

const partsStore = usePartsStore();
const { filters } = storeToRefs(partsStore);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalPlantsList } = storeToRefs(globalStore);
const partsEntity = ENTITIES.Parts;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([partsEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([partsEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([partsEntity.permissions.delete]));

const itemsName = computed(() => ({
	one: tt(partsEntity.itemsName.one),
	mult: tt(partsEntity.itemsName.mult),
	instanceName: partsEntity.itemsName.instanceName,
}));

const { itemsList, itemsLoading, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	apiRoute: partsEntity.apiBase,
	itemRoute: partsEntity.routeBase,
	itemStore: partsStore,
	itemFiltersName: partsEntity.filtersStorageKey,
	itemsName,
	options: {
		tableRef: itemsTableRef,
	},
});

const tableSettings = computed(() => {
	const actions = [];

	if (hasAccessToEdit.value) {
		actions.push(standardTableOperations.edit);
	}
	if (hasAccessToDelete.value) {
		actions.push(standardTableOperations.delete);
	}

	return {
		columns: translate([
			{
				prop: 'part_number',
				label: 'Part_number',
				sortable: true,
			},
			{
				prop: 'plant_id',
				label: 'Plant',
				min_width: 120,
				meta: {
					getItemValue: { prop: 'name', list: globalPlantsList.value || [] },
				},
			},
			{
				prop: 'type',
				label: 'Type',
				sortable: true,
			},
			{
				prop: 'description',
				label: 'Description',
				min_width: 170,
			},
			{
				prop: 'price',
				label: 'Price',
				width: 80,
				sortable: true,
			},
			{
				prop: 'stock_quantity',
				label: 'Stock_Quantity',
				width: 90,
				sortable: true,
			},
		]),
		operations: {
			actions: translate(actions, { key: 'tooltip_text' }),
		},
		activeSortingFilters: {
			orderByColumn: filters.value?.orderByColumn,
			orderByMethod: filters.value?.orderByMethod,
		},
	};
});

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
};

const { handleEvent } = useEventHandler(methodsMap);
</script>
