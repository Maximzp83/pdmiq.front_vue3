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

						<template v-if="storeroomItem" #last>
							<div class="filter-item grid-buttons mcol-sm-2 mcol-md-1">
								<RadioButtonsBlock
									:settings="gridSwitcherOptions"
									:optionsList="gridTypesList"
									:value="activeGrid"
									@onChange="toggleItemsGrid"
								/>
							</div>
						</template>
					</Filterbar>

					<template v-if="activeGrid === ITEMS_GRID_TYPES.LIST">
						<CustomDataListTable
							ref="itemsTableRef"
							:disableSelection="fromEquipmentsLayout || !hasAccessToDelete"
							:itemsLoading="itemsLoading"
							:tableData="itemsList"
							:tableSettings="tableSettings"
							:itemsName="itemsName"
							@event="handleEvent"
						/>
					</template>

					<template v-if="activeGrid === ITEMS_GRID_TYPES.GRID">
						<ItemsGridContainer
							ref="itemsTableRef"
							cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4"
							:itemsLoading="itemsLoading"
							:itemsList="itemsList"
							:itemsName="itemsName"
							instanceName="BrandModels"
							:operationsSettings="cardOperationsSettings"
							:additionalProps="equipmentTypesListData"
							@event="handleEvent"
						/>
					</template>

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
import { computed, onBeforeMount, onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { ITEMS_GRID_TYPES, gridTypesList, standardTableOperations } from '@/constants/table';
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
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import ItemsGridContainer from '@/components/gridTable/ItemsGridContainer.vue';

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
	fromDashboard: Boolean,
	preventSetNavbar: Boolean,
	perPageItems: Array,
	propsFilters: { type: Object, default: () => ({}) },
	watchPropsFiltersOnly: Boolean,
});

const itemsTableRef = ref(null);
const brandsLoading = ref(false);
const brandsList = shallowRef([]);
const equipmentTypesLoading = ref(false);
const equipmentTypesList = shallowRef([]);

const router = useRouter();
const brandModelsStore = useBrandModelsStore();
const { filters, storeroom_brand_models_filters: storeroomBrandModelsFilters } = storeToRefs(brandModelsStore);

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
const showGridSwitcher = computed(() => !!props.storeroomItem);
const activeGrid = computed(() =>
	props.fromEquipmentsLayout
		? storeroomBrandModelsFilters.value?.items_active_grid_type
		: filters.value?.items_active_grid_type,
);
const gridSwitcherOptions = computed(() =>
	Object.freeze({
		hideTitle: true,
		buttonType: 'primary',
		className: 'full-height',
		group: true,
	}),
);
const equipmentTypesListData = computed(() =>
	Object.freeze({
		equipmentTypesList: equipmentTypesList.value || [],
		plantId: props.plantId,
	}),
);

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
		propsFilters: computed(() => props.propsFilters),
		watchPropsFiltersOnly: props.watchPropsFiltersOnly,
		fromDashboard: props.fromDashboard,
		preventSetNavbar: props.preventSetNavbar,
	},
});

const tableSettings = computed(() => {
	const settings = {
		columns: [
			{
				prop: 'name',
				label: 'Part_Number',
				sortable: true,
			},
		],
		operations: {
			actions: [],
		},
	};

	if (props.fromEquipmentsLayout) {
		settings.columns.push({
			label: 'QTY',
			prop: 'equipments_storeroom_count',
			sortable: true,
		});

		settings.operations.actions = translate([
			{
				name: 'handleShowInfo',
				type: 'success',
				icon: 'icomoon icon-eye',
				tooltip_text: 'Details',
			},
		], { key: 'tooltip_text' });
	} else {
		const actions = [];

		if (hasAccessToEdit.value) {
			actions.push(standardTableOperations.edit);
		}
		if (hasAccessToDelete.value) {
			actions.push(standardTableOperations.delete);
		}

		settings.operations.actions = translate(actions, { key: 'tooltip_text' });
	}

	settings.columns.push(
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
	);

	return {
		...settings,
		columns: translate(settings.columns),
	};
});

const cardOperationsSettings = computed(() => {
	const settings = {
		titles: [{ prop: 'name' }],
		buttons: [],
	};

	if (authStore.hasAccessTo(['view_storerooms'])) {
		settings.buttons.push({
			disablePopover: true,
			className: 'locations-button uniq-button el-button el-button--primary',
			containerClassName: 'flex align-center',
			prefixContent: { html: 'QTY: ', className: 'semi-bold mr-10' },
			linkSettings: {
				linkTextProp: 'equipments_storeroom_count',
				emptyValueText: '0',
				linkRoute: `brand-models/:id/details?plantId=${props.plantId}`,
			},
		});
	}

	return Object.freeze(settings);
});

const setActiveGridType = (value, settings = {}) => {
	if (props.fromEquipmentsLayout) {
		brandModelsStore.set_storerooms_filters({
			...storeroomBrandModelsFilters.value,
			items_active_grid_type: value,
			...(settings.preventResetPage ? {} : { page: 1 }),
		});
		return;
	}

	setFilters({ items_active_grid_type: value }, settings);
};

const toggleItemsGrid = (value) => {
	setActiveGridType(value);
};

const handleShowInfo = ({ row }) => {
	router.push({ path: `/brand-models/${row.id}/details`, query: { plantId: props.plantId } });
};

onBeforeMount(() => {
	if (!props.fromEquipmentsLayout && !props.isStoreRoomItems) {
		setActiveGridType(ITEMS_GRID_TYPES.LIST);
	}
});

onMounted(() => {
	if (!activeGrid.value) {
		setActiveGridType(ITEMS_GRID_TYPES.GRID);
	}
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
	handleShowInfo,
};

useRequestsList({
	requestsToDoList: computed(() =>
		Object.freeze([
			{
				action: methodsMap.fetch_equipment_types,
				localProp: equipmentTypesList,
				localLoadProp: equipmentTypesLoading,
			},
		]),
	),
});

const { handleEvent } = useEventHandler(methodsMap);
</script>
