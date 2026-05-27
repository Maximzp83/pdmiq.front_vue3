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
import { useBrandsStore } from '@/stores/BrandsStore';
import { useAuthStore } from '@/stores/AuthStore';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { translate } = Lang;

defineOptions({
	name: 'BrandsList',
});

const itemsTableRef = ref(null);

const brandsStore = useBrandsStore();
const { filters } = storeToRefs(brandsStore);

const authStore = useAuthStore();
const brandsEntity = ENTITIES.Brands;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([brandsEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([brandsEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([brandsEntity.permissions.delete]));

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'Brands',
	itemStore: brandsStore,
	options: {
		excludeGetParams: ['plantId'],
		tableRef: itemsTableRef,
		// editInModal: true,
		// formComponentFileLoader: () => import('@/views/Brands/ItemForm.vue'),
		// debug: true
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
				prop: 'equipments_count',
				label: 'phrases.Equipments_count',
			},
			{
				prop: 'models_count',
				label: 'phrases.Models_count',
			},
		]),
		operations: {
			actions: translate(actions, { key: 'tooltip_text' }),
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
