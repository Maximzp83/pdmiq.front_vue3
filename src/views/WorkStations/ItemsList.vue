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
						searchbarClass="ml-auto"
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
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { usePlantWorkStationsStore } from '@/stores/PlantWorkStationsStore';

import Filterbar from '@/components/common/Filterbar.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';

const { translate } = Lang;

defineOptions({
	name: 'WorkStationsList',
});

const itemsTableRef = ref(null);
const workStationsStore = usePlantWorkStationsStore();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { filters } = storeToRefs(workStationsStore);
const workStationsEntity = ENTITIES.WorkStations;

const hasAccessToCreate = computed(() =>
	authStore.hasAccessTo([workStationsEntity.permissions.create]),
);
const hasAccessToEdit = computed(() =>
	authStore.hasAccessTo([workStationsEntity.permissions.edit]),
);
const hasAccessToDelete = computed(() =>
	authStore.hasAccessTo([workStationsEntity.permissions.delete]),
);
const plantsList = computed(() => globalStore.globalPlantsList || []);

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
} = useItemsData({
	entityKey: 'WorkStations',
	itemStore: workStationsStore,
	options: {
		tableRef: itemsTableRef,
		editInModal: true,
		formComponentFileLoader: () => import('./ItemForm.vue'),
		successSubmitOptions: {
			refetchItemsList: true,
			closeModal: true,
		},
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

	return Object.freeze({
		columns: translate([
			{
				prop: 'name',
				label: 'Name',
				min_width: 120,
				sortable: true,
			},
			{
				prop: 'plant_id',
				label: 'Plant',
				min_width: 120,
				meta: {
					getItemValue: {
						prop: 'name',
						list: plantsList.value,
					},
				},
			},
		]),
		operations: {
			actions: translate(actions, { key: 'tooltip_text' }),
		},
	});
});

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
});
</script>
