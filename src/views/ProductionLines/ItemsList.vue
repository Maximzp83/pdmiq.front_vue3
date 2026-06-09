<template>
	<div :class="['view-wrapper view-list-wrapper', isUtility ? 'utilities-list' : 'production_lines-list']">
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

			<div v-if="showToggleListButton ? filters.isShowList : true" :class="['card-content', { 'dragndrop-active': !draggingLocked }]">
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
						<div class="filter-item flex grid-buttons wider">
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
					:filterbarDropdownId="`${isUtility ? 'utility' : 'prodLine'}DropdownFilterbar`"
					@event="handleEvent"
				>
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
					:componentFileLoader="productionLineItemCardLoader"
					:operationsSettings="cardOperationsSettings"
					:additionalProps="additionalProps"
					@event="handleEvent"
				/>

				<PaginationContainer
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
					:scrollTo="isUtility ? '.utilities-list' : '.production_lines-list'"
					@setFilters="setFilters"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { PRODUCTION_LINES_TYPES } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useProductionLinesStore } from '@/stores/ProductionLinesStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useSwitchGridView } from '@/composables/mixins/useSwitchGridView';
import { useDragNdropSortable } from '@/composables/mixins/useDragNdropSortable';
import { useDashboardListsReorder } from '@/composables/mixins/useDashboardListsReorder';
import { useProductionLines } from '@/composables/useProductionLines';
import { useMachinesStore } from '@/stores/MachinesStore';
import { useAssetsStore } from '@/stores/AssetsStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';

import Filterbar from '@/components/common/Filterbar.vue';
import DropdownFilterbar from '@/components/common/DropdownFilterbar.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import ItemsGridContainer from '@/components/gridTable/ItemsGridContainer.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'ProductionLinesItemsList' });

const props = defineProps({
	plantId: Number,
	showCardHeader: Boolean,
	disableDraggingFeature: Boolean,
	hideDropdownFilterbar: Boolean,
	productionLineType: { type: Number, default: PRODUCTION_LINES_TYPES.PRODUCTION_LINE },
	showToggleListButton: Boolean,
	fromDetailsPage: Boolean,
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const productionLinesStore = useProductionLinesStore();
const machinesStore = useMachinesStore();
const assetsStore = useAssetsStore();
const equipmentsStore = useEquipmentsStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters: productionLineFilters, utility_filters: utilityFilters } = storeToRefs(productionLinesStore);
const { reorderProductionLine } = useProductionLines();
const { doFetchAction } = useRequestsList();

const itemsTableRef = ref(null);
const dropdownFilterbarRef = ref(null);
const showFilterbar = ref(false);
const locationsList = ref([]);
const locationsLoading = ref(false);
const fetchLocationsRequest = createGetRequest('/locations');

const isUtility = computed(() => props.productionLineType === PRODUCTION_LINES_TYPES.UTILITY);
const isProdLine = computed(() => props.productionLineType === PRODUCTION_LINES_TYPES.PRODUCTION_LINE);
const filters = computed(() => (isUtility.value ? utilityFilters.value : productionLineFilters.value));
const filtersStateProp = computed(() => (isUtility.value ? 'utility_filters' : 'filters'));
const filtersStorageKey = computed(() =>
	isUtility.value ? 'production_lines_utility_filters' : ENTITIES.ProductionLines.filtersStorageKey,
);
const instanceName = 'ProductionLines';
const productionLineItemCardLoader = () => import('@/views/ProductionLines/ItemCard.vue');
const additionalProps = computed(() => ({ isUtility: isUtility.value, isProdLine: isProdLine.value }));
const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_dashboard']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_dashboard']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_dashboard']));
const itemsNameLocal = computed(() =>
	isUtility.value
		? { one: tt('Utility'), mult: tt('Utilities'), instanceName: 'production_lines' }
		: { one: tt('Production_line'), mult: tt('Production_lines'), instanceName: 'production_lines' },
);

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
	entityKey: 'ProductionLines',
	itemStore: productionLinesStore,
	itemsName: itemsNameLocal,
	options: {
		tableRef: itemsTableRef,
		editInModal: true,
		filtersStateProp: filtersStateProp.value,
		predefinedFilters: { type: props.productionLineType || PRODUCTION_LINES_TYPES.PRODUCTION_LINE },
		additionalModalSettings: {
			editModalProp: 'editModalClassic',
			instanceName: isProdLine.value ? 'ProductionLines' : 'Utilities',
			multiform: true,
			componentPath: 'Dashboard/MultiFormWrapper',
			callback: () => refetchItemsList(),
		},
		formComponentFileLoader: () => import('./ItemForm.vue'),
		relatedFiltersStoresMap: {
			machines: {
				store: machinesStore,
				stateProp: 'filters',
				storageKey: 'machines_filters',
			},
			assets: {
				store: assetsStore,
				stateProp: 'filters',
				storageKey: 'assets_filters',
			},
			equipments: {
				store: equipmentsStore,
				stateProp: 'filters',
				storageKey: 'equipments_filters',
			},
		},
	},
	itemFiltersName: filtersStorageKey.value,
});

const setFilters = (value, settings = {}) => {
	setBaseFilters(value, {
		toLocalStorage: { prop: filtersStorageKey.value },
		...settings,
	});
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
	reorderAction: reorderProductionLine,
	filters,
	itemsLoading,
	globalFilters,
	fromDetailsPage: computed(() => props.fromDetailsPage),
	showEditModal: globalStore.show_edit_modal,
});

const tableSettings = computed(() => {
	const actions = [];
	if (props.fromDetailsPage && authStore.hasAccessTo(['create_maintenance'])) {
		actions.push({
			name: 'handleCreateWorkOrderButton',
			formSetup: [{ formKey: 'production_line_id', valKey: 'id' }],
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
						linkSettings: { linkRoute: 'production-lines/:id/details', linkTextProp: 'name' },
						className: 'table-link',
						disablePopover: true,
					},
				},
			},
			{ prop: 'plant.name', label: 'Plant', sortable: true },
			{ prop: 'locations', label: 'Locations', meta: { fromArray: { subProp: 'name', delimeter: ', ', inline: true } } },
			{
				label: 'View',
				max_width: 130,
				show_anyway: true,
				meta: {
					additionalActions: [
						{
							name: 'handleShowNextInstanceItem',
							type: 'success',
							button_text: tt('phrases.view_machines'),
							tooltip_text: tt('phrases.show_binding_machines'),
							path: '/dashboard/machines',
							nextInstanceName: 'Machines',
							className: 'width-auto',
							setFilters: [
								{
									action: 'machines/set_machines_filters',
									params: ['productionLineId'],
								},
							],
						},
					],
				},
			},
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
			tooltip_text: tt('phrases.show_binding_machines'),
			path: '/dashboard/machines',
			nextInstanceName: 'Machines',
			setFilters: [
				{
					action: 'machines/set_machines_filters',
					params: ['productionLineId'],
				},
				{
					action: 'assets/set_assets_filters',
					params: ['productionLineId'],
				},
				{
					action: 'equipments/set_equipments_filters',
					params: ['productionLineId'],
				},
			],
		},
	];
	if (authStore.hasAccessTo(['create_maintenance'])) {
		buttons.unshift({
			name: 'handleCreateWorkOrderButton',
			formSetup: [{ formKey: 'production_line_id', valKey: 'id' }],
			tooltip_text: tt('phrases.create_work_order'),
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
			tooltip_text: tt('phrases.edit_line'),
		});
	}
	return Object.freeze({
		titles: [{ prop: 'name' }],
		buttons,
		allowDelete: hasAccessToDelete.value,
	});
});

const fetchLocations = () => {
	const plantId = props.plantId || globalFilters.value?.plantId;
	if (!plantId) return;
	doFetchAction(fetchLocationsRequest, locationsList, locationsLoading, { params: { plantId, max: -1 } });
};
const toggleFilterbar = (event) => {
	dropdownFilterbarRef.value?.toggleFilterbar?.(event);
	showFilterbar.value = !showFilterbar.value;
	if (showFilterbar.value && !locationsList.value.length) {
		window.setTimeout(fetchLocations, 300);
	}
};

watch(
	() => globalFilters.value?.plantId,
	(id) => {
		if (!id) {
			locationsList.value = [];
			setFilters({ locationId: null });
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
