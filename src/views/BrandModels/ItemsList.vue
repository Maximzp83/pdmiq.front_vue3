<template>
	<div class="view-wrapper view-list-wrapper brand-models-list">
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
					>
						<div class="filter-item mcol-xs-12 mcol-sm-4 relative">
							<FetchByQuerySelect
								clearable
								enableLoadmore
								:value="filters?.brandId"
								:optionsLoading="brandsLoading"
								:optionsList="brandsList"
								:settings="brandQueryOptions"
								:placeholder="`${tt('Select')} ${tt('brand')}`"
								@change="(id) => setFilters({ brandId: id })"
								@update:optionsLoading="(value) => (brandsLoading = value)"
								@update:optionsList="(value) => (brandsList = value)"
							/>
						</div>
					</Filterbar>

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
						scrollTo=".brand-models-list"
						@setFilters="setFilters"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useBrandModelsStore } from '@/stores/BrandModelsStore';
import { useAuthStore } from '@/stores/AuthStore';

import Filterbar from '@/components/common/Filterbar.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'BrandModelsList',
});

const itemsTableRef = ref(null);
const brandsLoading = ref(false);
const brandsList = shallowRef([]);

const brandModelsStore = useBrandModelsStore();
const { filters } = storeToRefs(brandModelsStore);

const authStore = useAuthStore();
const brandModelsEntity = ENTITIES.BrandModels;
const brandsEntity = ENTITIES.Brands;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([brandModelsEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([brandModelsEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([brandModelsEntity.permissions.delete]));

const brandQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brands,
		params: { orderByColumn: 'name', orderByMethod: 'asc' },
	}),
);

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'BrandModels',
	itemStore: brandModelsStore,
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
				label: 'Part_Number',
				sortable: true,
			},
			{
				prop: 'brand.name',
				label: 'Brand',
				sortable: true,
				meta: {
					sortBy: 'brand_name',
				},
			},
			{
				prop: 'type.name',
				label: 'Type',
				sortable: true,
				meta: {
					sortBy: 'type_id',
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
	fetch_brands: createGetRequest(brandsEntity.apiBase),
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
};

useRequestsList({
	methodsMap,
	requestsToDoList: computed(() =>
		Object.freeze([
			/*{
				action: 'fetch_brands',
				localProp: brandsList,
				localLoadProp: brandsLoading,
				payload: {
					params: {
						max: -1,
						orderByColumn: 'name',
						orderByMethod: 'asc',
					},
				},
			},*/
		]),
	),
});

const { handleEvent } = useEventHandler(methodsMap);
</script>
