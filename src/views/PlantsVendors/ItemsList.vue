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
import { LANGUAGE_TYPES } from '@/localization/utils';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { usePlantsVendorsStore } from '@/stores/PlantsVendorsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'PlantsVendorsList',
});

const itemsTableRef = ref(null);

const plantsVendorsStore = usePlantsVendorsStore();
const { filters } = storeToRefs(plantsVendorsStore);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalPlantsList } = storeToRefs(globalStore);
const plantsVendorsEntity = ENTITIES.PlantsVendors;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([plantsVendorsEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([plantsVendorsEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([plantsVendorsEntity.permissions.delete]));

const itemsName = computed(() => {
	const prefix =
		Lang.currentLangId === LANGUAGE_TYPES.ENGLISH
			? plantsVendorsEntity.itemsName.englishPrefix
			: '';

	return {
		one: `${prefix}${tt(plantsVendorsEntity.itemsName.one)}`,
		mult: `${prefix}${tt(plantsVendorsEntity.itemsName.mult)}`,
		instanceName: plantsVendorsEntity.itemsName.instanceName,
	};
});

const { itemsList, itemsLoading, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'PlantsVendors',
	itemStore: plantsVendorsStore,
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
				min_width: 130,
			},
			{
				prop: 'plant_id',
				label: 'Plant',
				min_width: 130,
				meta: {
					getItemValue: { prop: 'name', list: globalPlantsList.value || [] },
				},
			},
			{
				prop: 'contact_name',
				label: 'Contact_name',
				sortable: true,
				min_width: 110,
			},
			{ prop: 'email', label: 'Email', sortable: true, min_width: 150 },
			{ prop: 'phone_number', label: 'Phone', width: 135 },
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
