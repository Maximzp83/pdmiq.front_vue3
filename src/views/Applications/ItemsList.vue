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
import { useApplicationsStore } from '@/stores/ApplicationsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'ApplicationsList',
});

const itemsTableRef = ref(null);

const applicationsStore = useApplicationsStore();
const { filters } = storeToRefs(applicationsStore);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalPlantsList } = storeToRefs(globalStore);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_applications']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_applications']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_applications']));

const itemsName = computed(() => ({
	one: tt('Application'),
	mult: tt('Applications'),
	instanceName: 'applications',
}));

const { itemsList, itemsLoading, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	apiRoute: '/applications',
	itemRoute: '/applications',
	itemStore: applicationsStore,
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
			{
				prop: 'plant_id',
				label: 'Plant',
				meta: {
					getItemValue: { prop: 'name', list: globalPlantsList.value || [] },
				},
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
