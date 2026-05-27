<template>
	<div :class="['view-wrapper view-list-wrapper brand-models-list', { 'pt-0': fromEquipmentsLayout }]">
		<div :class="[{ mcontainer: !fromEquipmentsLayout }]">
			<div :class="[{ card: !fromEquipmentsLayout }, 'content-row', { 'view-content-card': !fromDetailsPage }]">
				<div :class="[{ 'card-content': !fromEquipmentsLayout }]">
					<Filterbar
						v-if="!fromEquipmentsLayout"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="isStoreRoomItems || !hasAccessToCreate"
						:hideDelete="isStoreRoomItems || !hasAccessToDelete"
						@event="handleEvent"
					>	
						<!-- <div class="filter-item">{{testValue}}</div> -->
						<!-- <div class="filter-item ml-auto">
							<CustomSelectV2
								filterable
								clearable
								:optionsLoading="plantsLoading"
								:optionsList="plantsList"
								:placeholder="`${tt('plant')}`"
								:value="filters?.plantId"
								@change="(id) => setFilters({ plantId: id })"
							/>
						</div> -->
						
						<div v-if="!isStoreRoomItems" class="filter-item mcol-xs-12 mcol-sm-2 relative">
							<!-- <CustomSelectV2
								clearable
								filterable
								:optionsLoading="brandsLoading"
								:optionsList="brandsList"
								:placeholder="`${tt('Select')} ${tt('brand')}`"
								:value="filters?.brandId"
								@change="(id) => setFilters({ brandId: id })"
								@toggleDropdown="o=>handleToggleDropdown(o, 'brands')"
							/> -->
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

						<template v-if="storeroomItem" #middle>
							<div class="filter-item ml-auto">
								<CustomSelectV2
									filterable
									clearable
									:optionsList="storeRoomLocationsList"
									:placeholder="`${tt('all')} ${tt('storeroom')} ${tt('locations')}`"
									:value="filters?.storeroomLocationId"
									@change="(id) => setFilters({ storeroomLocationId: id })"
								/>
							</div>
						</template>
					</Filterbar>

					<CustomDataListTable
						ref="itemsTableRef"
						:disableSelection="fromEquipmentsLayout || !hasAccessToDelete"
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

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useBrandModelsStore } from '@/stores/BrandModelsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';

import Filterbar from '@/components/common/Filterbar.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'BrandModelsList',
});

const props = defineProps({
	fromEquipmentsLayout: Boolean,
	fromDetailsPage: Boolean,
	plantId: Number,
	isStoreRoomItems: Boolean,
	storeroomItem: { type: Object, default: null },
});

const itemsTableRef = ref(null);
const brandsLoading = ref(false);
const brandsList = shallowRef([]);
const equipmentTypesLoading = ref(false);
const equipmentTypesList = shallowRef([]);

// const testValue = ref(123);

const brandModelsStore = useBrandModelsStore();
const { filters } = storeToRefs(brandModelsStore);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);

const brandModelsEntity = ENTITIES.BrandModels;
const brandsEntity = ENTITIES.Brands;
const equipmentTypesEntity = ENTITIES.EquipmentTypes;

const plantsEntity = ENTITIES.Plants;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([brandModelsEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([brandModelsEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([brandModelsEntity.permissions.delete]));
const storeRoomLocationsList = computed(() => props.storeroomItem?.locations || []);

const brandQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_brands,
		fetchByIdAction: methodsMap.fetch_brand,
		params: { orderByColumn: 'name', orderByMethod: 'asc' },
		bindTo: [{ getValue: () => globalFilters.value?.plantId, param: 'plantId' }],
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
	};
});

const methodsMap = {
	fetch_plants: createGetRequest(plantsEntity.apiBase),
	fetch_brands: createGetRequest(brandsEntity.apiBase),
	fetch_brand: createGetByIdRequest(brandsEntity.apiBase),
	fetch_equipment_types: createGetRequest(equipmentTypesEntity.apiBase),
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
};

/*const { handleToggleDropdown } = */ useRequestsList({
	// methodsMap,
	requestsToDoList: computed(() =>
		Object.freeze([
			{
				action: methodsMap.fetch_equipment_types,
				localProp: equipmentTypesList,
				localLoadProp: equipmentTypesLoading,
			},
			/*...(!props.isStoreRoomItems
				? [
						{
							actionName: 'fetch_plants',
							localProp: plantsList,
							localLoadProp: plantsLoading,
							payload: {
								params: {
									orderByColumn: 'name',
									orderByMethod: 'asc',
								},
							},
						},
						{
							key: 'brands',
							action: methodsMap.fetch_brands,
							localProp: brandsList,
							localLoadProp: brandsLoading,
							payload: {
								params: {
									// plantId: () => globalFilters.value?.plantId,
									plantId: globalFilters.value?.plantId,
									orderByColumn: 'name',
									orderByMethod: 'asc',
									max: 5
								},
							},
							hasValueCase: {
								action: methodsMap.fetch_brand,
								getValue: () => filters.value?.brandId,
								// payload: {}
							},
							bindTo: [
								{
									getValue: () => globalFilters.value?.plantId,
									param: 'plantId',
									onTrigger: () => setFilters({ brandId: null }),
									// reset_values: [testValue],
									// fetchAnyWay: true,
									// noFetch: true,
								},
							],
						},
					]
				: []),*/
		]),
	),
});

const { handleEvent } = useEventHandler(methodsMap);
</script>
