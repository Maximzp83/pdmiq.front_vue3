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

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_equipment_types_categories']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_equipment_types_categories']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_equipment_types_categories']));

const itemsName = computed(() => ({
	one: `${tt('Item_Types')} ${tt('Category')}`,
	mult: `${tt('Item_Types')} ${tt('Categories')}`,
	instanceName: 'equipment_types',
}));

const { itemsList, itemsLoading, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	apiRoute: '/equipments/types/options/categories',
	itemRoute: '/equipment-types-categories',
	itemStore: equipmentTypesCategoriesStore,
	itemFiltersName: 'equipment-types-categories_filters',
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
