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
import { useEquipmentTypesCategoriesStore } from '@/stores/EquipmentTypesCategoriesStore';
import { useAuthStore } from '@/stores/AuthStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'EquipmentTypesCategoriesList',
});

const itemsTableRef = ref(null);

const equipmentTypesCategoriesStore = useEquipmentTypesCategoriesStore();
const { filters } = storeToRefs(equipmentTypesCategoriesStore);

const authStore = useAuthStore();
const equipmentTypesCategoriesEntity = ENTITIES.EquipmentTypesCategories;

const hasAccessToCreate = computed(() =>
	authStore.hasAccessTo([equipmentTypesCategoriesEntity.permissions.create])
);
const hasAccessToEdit = computed(() =>
	authStore.hasAccessTo([equipmentTypesCategoriesEntity.permissions.edit])
);
const hasAccessToDelete = computed(() =>
	authStore.hasAccessTo([equipmentTypesCategoriesEntity.permissions.delete])
);

const itemsName = computed(() => ({
	one: `${tt(equipmentTypesCategoriesEntity.itemsName.group)} ${tt(equipmentTypesCategoriesEntity.itemsName.one)}`,
	mult: `${tt(equipmentTypesCategoriesEntity.itemsName.group)} ${tt(equipmentTypesCategoriesEntity.itemsName.mult)}`,
	instanceName: equipmentTypesCategoriesEntity.itemsName.instanceName,
}));

const { itemsList, itemsLoading, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	apiRoute: equipmentTypesCategoriesEntity.apiBase,
	itemRoute: equipmentTypesCategoriesEntity.routeBase,
	itemStore: equipmentTypesCategoriesStore,
	itemFiltersName: equipmentTypesCategoriesEntity.filtersStorageKey,
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
				prop: 'name',
				label: 'Name',
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
