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
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useStoreRoomsStore } from '@/stores/StoreRoomsStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate } = Lang;

defineOptions({
	name: 'StoreRoomsItemsList',
});

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const storeRoomsStore = useStoreRoomsStore();
const { filters } = storeToRefs(storeRoomsStore);
const { globalPlantsList } = storeToRefs(globalStore);
const { changeRoute } = useNavigation();

const itemsTableRef = ref(null);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_storerooms']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_storerooms']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_storerooms']));
const hasAccessToView = computed(() => authStore.hasAccessTo(['view_storerooms']));

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
	entityKey: 'StoreRooms',
	itemStore: storeRoomsStore,
	options: {
		tableRef: itemsTableRef,
	},
});

const tableSettings = computed(() => {
	const actions = [];

	if (hasAccessToView.value) {
		actions.push({
			name: 'handleShowBrandModels',
			type: 'success',
			icon: 'icomoon icon-eye',
			tooltip_text: 'Storerooms',
		});
	}
	if (hasAccessToEdit.value) {
		actions.push(standardTableOperations.edit);
	}
	if (hasAccessToDelete.value) {
		actions.push(standardTableOperations.delete);
	}

	return Object.freeze({
		columns: translate([
			{ prop: 'name', label: 'Name', sortable: true },
			{
				prop: 'plant_id',
				label: 'Plant',
				meta: {
					getItemValue: { prop: 'name', list: globalPlantsList.value },
				},
			},
		]),
		operations: {
			actions: translate(actions, { key: 'tooltip_text' }),
		},
	});
});

const handleShowBrandModels = ({ row }) => {
	changeRoute({ path: `/store-rooms/${row.id}/items` });
};

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
	handleShowBrandModels,
});
</script>
