<template>
	<div class="view-wrapper view-list-wrapper assets-list">
		<div :class="['card content-row', { 'view-content-card': !fromDetailsPage }]">
			<div v-if="showCardHeader" class="flex align-center card-header filled_2 relative">
				<h1 class="title page-title outside-bg-addition uppercase">{{ itemsName.mult }}</h1>
				<div
					v-if="showToggleListButton"
					:class="['ml-auto toggle-list-button', { active: !filters.isShowList }]"
				>
					<span>{{ !filters.isShowList ? tt('Show') : tt('Hide') }}</span>
					<i class="icomoon icon-path_2"></i>
					<div class="absolute stretch pointer" @click="setFilters({ isShowList: !filters.isShowList })"></div>
				</div>
			</div>

			<div v-if="showToggleListButton ? filters.isShowList : true" :class="['relative card-content', { 'dragndrop-active': !draggingLocked }]">
				<Filterbar
					:hideCreate="!hasAccessToCreate"
					:hideDelete="!hasAccessToDelete"
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:perPageItems="perPageItems"
					@event="handleEvent"
				>
					<template #last>
						<div :class="['filter-item grid-buttons flex', { wider: !disableDraggingFeature }]">
							<RadioButtonsBlock
								:model-value="activeGrid"
								:settings="gridSwitcherOptions"
								:optionsList="gridTypesList"
								@update:model-value="toggleItemsGrid"
								@onChange="toggleItemsGrid"
							/>

							<span v-if="!disableDraggingFeature">
								<el-button
									:class="['drag_n_drop-locker', { active: !draggingLocked }]"
									native-type="button"
									@click="globalFilters.plantId ? (draggingLocked = !draggingLocked) : null"
								>
									<i :class="['icomoon', draggingLocked ? 'icon-lock2' : 'icon-unlock']"></i>
								</el-button>
							</span>
						</div>

						<div v-if="!hideDropdownFilterbar" class="filter-item toggle-additional-filters">
							<el-button
								type="primary"
								native-type="button"
								:class="['action-button inverted', { active: showFilterbar }]"
								@click="toggleFilterbar"
							>
								<i :class="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"></i>
							</el-button>
						</div>
					</template>
				</Filterbar>

				<DropdownFilterbar
					v-if="!hideDropdownFilterbar"
					ref="dropdownFilterbarRef"
					hideToggleButton
					:itemsName="itemsName"
					filterbarDropdownId="assetsDropdownFilterbar"
					@event="handleEvent"
				>
					<template #prefixFilters>
						<div class="filter-item ml-auto">
							<el-button
								v-show="showClearFilters"
								class="small"
								type="primary"
								native-type="button"
								@click="setFilters({}, { clearableFiltersList })"
							>
								{{ tt('phrases.Clear_filters') }}
							</el-button>
						</div>
					</template>

					<div class="mrow filter-items-list relative">
						<div v-show="!globalFilters.plantId" class="disable-filters-ovelay">
							<div class="caption">{{ tt('phrases.select_plant_first') }}</div>
						</div>

						<div class="filter-item">
							<CustomSelectV2
								:model-value="filters.locationId"
								filterable
								clearable
								:optionsLoading="locationsLoading"
								:optionsList="locationsList"
								:placeholder="tt('Location')"
								@update:model-value="(id) => setFilters({ locationId: id })"
							/>
						</div>

						<div class="filter-item">
							<CustomSelectV2
								:model-value="filters.productionLineId"
								filterable
								clearable
								:optionsLoading="productionLinesLoading"
								:optionsList="productionLinesList"
								:placeholder="tt('Production_Line')"
								@update:model-value="(id) => setFilters({ productionLineId: id, machineId: null })"
							/>
						</div>

						<div class="filter-item">
							<CustomSelectV2
								:model-value="filters.machineId"
								filterable
								clearable
								:optionsLoading="machinesLoading"
								:optionsList="machinesList"
								:placeholder="tt('Machine')"
								@update:model-value="(id) => setFilters({ machineId: id })"
							/>
						</div>
					</div>
				</DropdownFilterbar>

				<VueElementLoadingWrapper
					class="section-block items-preloader"
					spinner="line-scale"
					:isLoading="itemsLoading"
					:itemsName="itemsName.mult"
				/>

				<CustomDataListTable
					v-if="activeGrid === ITEMS_GRID_TYPES.LIST"
					v-show="!itemsLoading"
					ref="itemsTableRef"
					:tableData="itemsList"
					:tableSettings="tableSettings"
					:itemsName="itemsName"
					@event="handleEvent"
				/>

				<ItemsGridContainer
					v-if="activeGrid === ITEMS_GRID_TYPES.GRID"
					v-show="!itemsLoading"
					ref="itemsTableRef"
					cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4 drag-n-drop-item"
					itemsListClassName="drag-n-drop-list"
					:itemsList="itemsList"
					:itemsName="itemsName"
					:instanceName="instanceName"
					:operationsSettings="cardOperationsSettings"
					@event="handleEvent"
				/>

				<PaginationContainer
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
					scrollTo=".assets-list"
					@setFilters="setFilters"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useAssetsStore } from '@/stores/AssetsStore';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSwitchGridView } from '@/composables/mixins/useSwitchGridView';
import { useDragNdropSortable } from '@/composables/mixins/useDragNdropSortable';
import { useDashboardListsReorder } from '@/composables/mixins/useDashboardListsReorder';
import { useAssets } from '@/composables/useAssets';

import Filterbar from '@/components/common/Filterbar.vue';
import DropdownFilterbar from '@/components/common/DropdownFilterbar.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import ItemsGridContainer from '@/components/gridTable/ItemsGridContainer.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'AssetsList' });

const props = defineProps({
	hideDropdownFilterbar: Boolean,
	disableDraggingFeature: Boolean,
	showCardHeader: Boolean,
	fromDetailsPage: Boolean,
	plantId: Number,
	fromDashboard: Boolean,
	showToggleListButton: Boolean,
	propsFilters: { type: Object, default: () => ({}) },
	preventSetNavbar: Boolean,
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const assetsStore = useAssetsStore();
const equipmentsStore = useEquipmentsStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters } = storeToRefs(assetsStore);
const { reorderAsset } = useAssets();

const itemsTableRef = ref(null);
const dropdownFilterbarRef = ref(null);
const showFilterbar = ref(false);
const locationsList = shallowRef([]);
const locationsLoading = ref(false);
const productionLinesList = shallowRef([]);
const productionLinesLoading = ref(false);
const machinesList = shallowRef([]);
const machinesLoading = ref(false);
const fetchLocationsRequest = createGetRequest(ENTITIES.Locations.apiBase);
const fetchProductionLinesRequest = createGetRequest(ENTITIES.ProductionLines.apiBase);
const fetchMachinesRequest = createGetRequest(ENTITIES.Machines.apiBase);

const instanceName = 'Assets';
const clearableFiltersList = Object.freeze(['productionLineId', 'machineId', 'locationId', 'q']);
const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_dashboard']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_dashboard']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_dashboard']));
const showClearFilters = computed(() =>
	clearableFiltersList.some((key) => filters.value?.[key] !== undefined && filters.value?.[key] !== null && filters.value?.[key] !== ''),
);
const requestsToDoList = computed(() =>
	Object.freeze([
		{
			action: fetchLocationsRequest,
			bindTo: [{ getValue: () => props.plantId || globalFilters.value?.plantId, param: 'plantId' }],
			localProp: locationsList,
			localLoadProp: locationsLoading,
		},
		{
			action: fetchProductionLinesRequest,
			bindTo: [{ getValue: () => props.plantId || globalFilters.value?.plantId, param: 'plantId' }],
			localProp: productionLinesList,
			localLoadProp: productionLinesLoading,
		},
		{
			action: fetchMachinesRequest,
			bindTo: [
				{ getValue: () => filters.value?.productionLineId, param: 'productionLineId' },
				{ getValue: () => props.plantId || globalFilters.value?.plantId, param: 'plantId' },
			],
			localProp: machinesList,
			localLoadProp: machinesLoading,
		},
	]),
);
const { initiateRequestsToDoList } = useRequestsList({ requestsToDoList });
initiateRequestsToDoList.value = false;

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters: setBaseFilters,
	createItem,
	editItem,
	handleDeleteItems,
	handleShowNextInstanceItem,
	refetchItemsList,
} = useItemsData({
	entityKey: 'Assets',
	itemStore: assetsStore,
	options: {
		tableRef: itemsTableRef,
		fromDashboard: props.fromDashboard,
		editInModal: props.fromDashboard,
		propsFilters: computed(() => props.propsFilters || {}),
		showToggleListButton: props.showToggleListButton,
		preventSetNavbar: props.preventSetNavbar,
		additionalModalSettings: {
			editModalProp: 'editModalClassic',
			instanceName: 'Assets',
			multiform: true,
			componentFileLoader: () => import('@/views/Dashboard/MultiFormWrapper.vue'),
			successSubmitCallback: () => {
				refetchItemsList();
				globalStore.show_edit_modal({ show: false });
			},
		},
		formComponentFileLoader: () => import('./ItemForm.vue'),
		relatedFiltersStoresMap: {
			equipments: {
				store: equipmentsStore,
				stateProp: 'filters',
				storageKey: 'equipments_filters',
			},
		},
	},
});

const setFilters = (value, settings = {}) => {
	const clearList = settings.clearableFiltersList;
	const nextValue = clearList ? Object.fromEntries(clearList.map((key) => [key, null])) : value;
	setBaseFilters(nextValue, settings);
};
const {
	perPageItems,
	activeGrid,
	gridTypesList,
	ITEMS_GRID_TYPES,
	gridSwitcherOptions,
	toggleItemsGrid,
	gridViewBeforeMount,
} = useSwitchGridView({ filters, setFilters });
const { draggingLocked } = useDragNdropSortable({
	wrapperSelector: '.drag-n-drop-wrapper',
	reorderHandler: (event) => reorderHandler(event),
});
const { reorderHandler, handleCreateWorkOrderButton } = useDashboardListsReorder({
	tt,
	emit,
	itemsList,
	reorderAction: reorderAsset,
	filters,
	itemsLoading,
	globalFilters,
	fromDetailsPage: computed(() => props.fromDetailsPage),
	showEditModal: globalStore.show_edit_modal,
});

const tableSettings = computed(() => {
	const actions = [
		{
			name: 'handleShowNextInstanceItem',
			type: 'success',
			icon: 'icomoon icon-assets',
			tooltip_text: 'phrases.show_binding_items',
			path: '/dashboard/equipments',
			nextInstanceName: 'Equipments',
			setFilters: [
				{
					action: 'equipments/set_equipments_filters',
					params: ['assetId'],
				},
			],
		},
	];
	if (authStore.hasAccessTo(['create_maintenance'])) {
		actions.unshift({
			name: 'handleCreateWorkOrderButton',
			formSetup: [
				{ formKey: 'production_line_id', valKey: 'machine.production_line_id' },
				{ formKey: 'machine_id', valKey: 'machine_id' },
				{ formKey: 'asset_id', valKey: 'id' },
			],
			type: 'success',
			tooltip_text: 'phrases.create_work_order',
			button_text: '+WO',
		});
	}
	if (hasAccessToEdit.value) {
		actions.push({ ...standardTableOperations.edit, isDisabled: !props.plantId && !globalFilters.value?.plantId });
	}
	if (hasAccessToDelete.value) {
		actions.push(standardTableOperations.delete);
	}
	return Object.freeze({
		tableClass: 'drag-n-drop-wrapper',
		columns: translate([
			{
				prop: 'name',
				label: 'Name',
				sortable: true,
				meta: {
					action: {
						linkSettings: { linkRoute: 'assets/:id/details', linkTextProp: 'name' },
						className: 'table-link',
						disablePopover: true,
					},
				},
			},
			{ prop: 'machine.productionLine.name', label: 'Production Line' },
			{ prop: 'machine.name', label: 'Machine', sortable: true, meta: { sortBy: 'machine_id' } },
			{ prop: 'location.name', label: 'Location' },
		]),
		operations: { actions: translate(actions, { key: 'tooltip_text' }) },
	});
});
const cardOperationsSettings = computed(() => {
	const buttons = [
		{
			name: 'handleShowNextInstanceItem',
			type: 'primary',
			className: 'inverted',
			icon: 'icomoon icon-assets',
			tooltip_text: tt('phrases.show_binding_items'),
			path: '/dashboard/equipments',
			nextInstanceName: 'Equipments',
			setFilters: [
				{
					action: 'equipments/set_equipments_filters',
					params: ['assetId'],
				},
			],
		},
	];
	if (authStore.hasAccessTo(['create_maintenance'])) {
		buttons.unshift({
			name: 'handleCreateWorkOrderButton',
			formSetup: [
				{ formKey: 'production_line_id', valKey: 'machine.production_line_id' },
				{ formKey: 'machine_id', valKey: 'machine_id' },
				{ formKey: 'asset_id', valKey: 'id' },
			],
			tooltip_text: tt('phrases.Create_Work_Order'),
			className: 'create-wo-button inverted',
			type: 'primary',
			buttonContent: { component: { componentFileLoader: () => import('@/components/itemDetails/CreateWOButton.vue') } },
		});
	}
	if (hasAccessToEdit.value) {
		buttons.push({
			name: 'editItem',
			icon: 'icomoon icon-pencil',
			type: 'primary',
			className: 'inverted',
			tooltip_text: `${tt('Edit')} ${tt('Asset')}`,
		});
	}
	return Object.freeze({
		titles: [{ prop: 'name' }],
		buttons,
		allowDelete: hasAccessToDelete.value,
	});
});

const toggleFilterbar = (event) => {
	dropdownFilterbarRef.value?.toggleFilterbar?.(event);
	initiateRequestsToDoList.value = true;
	showFilterbar.value = !showFilterbar.value;
};
watch(
	() => globalFilters.value?.plantId,
	(id) => {
		if (!id) {
			locationsList.value = [];
			productionLinesList.value = [];
			machinesList.value = [];
			draggingLocked.value = true;
		}
	},
);

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
	handleCreateWorkOrderButton,
	handleShowNextInstanceItem,
}, emit);

onBeforeMount(gridViewBeforeMount);
</script>
