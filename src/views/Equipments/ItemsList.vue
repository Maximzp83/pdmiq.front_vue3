<template>
	<div class="view-wrapper view-list-wrapper equipments-list pt-0">
		<div :class="[{ card: !fromLayout }, 'content-row', { 'view-content-card': !fromDetailsPage }]">
			<div :class="[{ 'card-content': !fromLayout }, { 'dragndrop-active': !draggingLockedProp }]">
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
					:itemsLoading="isLoadingCards"
					cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4 drag-n-drop-item"
					itemsListClassName="drag-n-drop-list"
					:itemsList="itemsList"
					:itemsName="itemsName"
					instanceName="Equipments"
					:operationsSettings="cardOperationsSettings"
					:componentFileLoader="equipmentItemCardLoader"
					:additionalProps="additionalDataForCards"
					@event="handleEvent"
				/>

				<PaginationContainer
					:itemsName="itemsName"
					:filters="filters"
					:meta="meta"
					scrollTo=".equipments-layout"
					:scrollToTimeout="270"
					@setFilters="setFilters"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { api_request } from '@/api/request_provider';
import { SUBJECT_TYPES } from '@/constants/global';
import { ITEMS_GRID_TYPES, standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useDashboardListsReorder } from '@/composables/mixins/useDashboardListsReorder';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import ItemsGridContainer from '@/components/gridTable/ItemsGridContainer.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'EquipmentsItemsList' });

const props = defineProps({
	disableDraggingFeature: Boolean,
	showCardHeader: Boolean,
	fromDetailsPage: Boolean,
	plantId: Number,
	fromLayout: Boolean,
	draggingLockedProp: Boolean,
	perPageItems: { type: Array, default: () => [] },
	activeGrid: Number,
	equipmentTypesList: { type: Array, default: () => [] },
	hideDatepicker: Boolean,
	fromDashboard: Boolean,
	preventSetNavbar: Boolean,
	additionalModalSettings: Object,
	propsFilters: { type: Object, default: () => ({}) },
	watchPropsFiltersOnly: Boolean,
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const equipmentsStore = useEquipmentsStore();
const { filters } = storeToRefs(equipmentsStore);
const { globalFilters } = storeToRefs(globalStore);
const { changeRoute } = useNavigation();
const itemsTableRef = ref(null);
const isLoadingCards = ref(false);
const equipmentItemCardLoader = () => import('./Card/ItemCard.vue');
const additionalDataForCards = computed(() =>
	Object.freeze({
		equipmentTypesList: props.equipmentTypesList,
	}),
);

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
	refetchItemsList,
} = useItemsData({
	entityKey: 'Equipments',
	apiRoute: '/equipments/dashboard',
	itemStore: equipmentsStore,
	options: {
		tableRef: itemsTableRef,
		fromDashboard: props.fromDashboard,
		propsFilters: computed(() => props.propsFilters || {}),
		watchPropsFiltersOnly: props.watchPropsFiltersOnly,
		preventSetNavbar: props.preventSetNavbar,
		localPrepareFilters: (filters) => ({
			...filters,
			orderByColumn: 'asset_id',
			orderByMethod: 'asc',
			plantId: props.plantId || globalFilters.value?.plantId,
		}),
		fetchItemsPayload: { prepareData: 'prepareEquipmentsList' },
		requestOptions: {
			storeName: 'equipmentsStore',
			stateProp: 'itemsList',
			loadingProp: 'isLoading',
		},
		additionalModalSettings: {
			// editModalProp: 'editModalClassic',
			instanceName: 'Equipments',
			multiform: true,
			componentPath: 'Dashboard/MultiFormWrapper',
			callback: () => refetchItemsList(),
			...(props.additionalModalSettings || {}),
		},
	},
});

const reorderEquipment = (payload) => api_request.post('/equipments/reorder', { ...payload, notNotify: true });
const { handleCreateWorkOrderButton } = useDashboardListsReorder({
	tt,
	emit,
	itemsList,
	reorderAction: reorderEquipment,
	filters,
	itemsLoading,
	globalFilters,
	fromDetailsPage: computed(() => props.fromDetailsPage),
	showEditModal: globalStore.show_edit_modal,
});

const tableSettings = computed(() => {
	const actions = [
		{
			name: 'handleAddToFavorites',
			type: 'success',
			icon: 'icomoon icon-eye',
			tooltip_text: 'Add To Favorites',
			subjectType: SUBJECT_TYPES.USER,
		},
		{
			name: 'handleShowDetails',
			type: 'success',
			icon: 'icomoon icon-eye',
			tooltip_text: 'Details',
			options: { page_path: '' },
		},
	];

	if (authStore.hasAccessTo(['create_maintenance'])) {
		actions.unshift({
			name: 'handleCreateWorkOrderButton',
			formSetup: [
				{ formKey: 'production_line_id', valKey: 'production_line_id' },
				{ formKey: 'machine_id', valKey: 'machine_id' },
				{ formKey: 'asset_id', valKey: 'asset_id' },
				{ formKey: 'equipment_id', valKey: 'id' },
			],
			type: 'success',
			tooltip_text: 'phrases.Create_Work_Order',
			button_text: '+WO',
		});
	}

	if (authStore.hasAccessTo(['edit_dashboard'])) {
		actions.push({ ...standardTableOperations.edit, isDisabled: !props.plantId && !globalFilters.value?.plantId });
	}

	if (authStore.hasAccessTo(['delete_dashboard'])) {
		actions.push(standardTableOperations.delete);
	}

	return Object.freeze({
		columns: translate([
			{ prop: 'machine_name', label: 'Machine' },
			{ prop: 'asset_name', label: 'Asset' },
			{
				label: 'Brand',
				meta: {
					additionalActions: [
						{
							linkSettings: { linkRoute: 'equipments/:id/details/main', linkTextProp: 'brand_name' },
							className: 'table-link',
							disablePopover: true,
						},
					],
				},
			},
			{
				label: 'Part Number',
				meta: {
					additionalActions: [
						{
							linkSettings: { linkRoute: 'equipments/:id/details/main', linkTextProp: 'brand_model_name' },
							className: 'table-link',
							disablePopover: true,
						},
					],
				},
			},
			{ prop: 'production_line_name', label: 'Production_Line' },
			{ prop: 'location_name', label: 'Location', sortable: true },
			{ prop: 'equipment_type_name', label: 'Item_type' },
		]),
		operations: { actions: translate(actions, { key: 'tooltip_text' }) },
	});
});
const cardOperationsSettings = computed(() => {
	const buttons = [
		{
			disablePopover: true,
			buttonContent: {
				component: { componentFileLoader: () => import('@/components/common/addToFavoriteButton.vue') },
			},
		},
	];

	if (authStore.hasAccessTo(['create_maintenance'])) {
		buttons.push({
			name: 'handleCreateWorkOrderButton',
			formSetup: [
				{ formKey: 'production_line_id', valKey: 'production_line_id' },
				{ formKey: 'machine_id', valKey: 'machine_id' },
				{ formKey: 'asset_id', valKey: 'asset_id' },
				{ formKey: 'equipment_id', valKey: 'id' },
			],
			tooltip_text: tt('phrases.Create_Work_Order'),
			className: 'create-wo-button inverted',
			type: 'primary',
			buttonContent: { component: { componentFileLoader: () => import('@/components/itemDetails/CreateWOButton.vue') } },
		});
	}

	if (authStore.hasAccessTo(['edit_dashboard'])) {
		buttons.push({
			name: 'editItem',
			icon: 'icomoon icon-pencil',
			type: 'primary',
			className: 'inverted',
			tooltip_text: tt('phrases.Edit_Item'),
		});
	}

	return Object.freeze({
		titles: [
			{ prop: 'machine_name', className: 'primary-color' },
			{ prop: 'id', className: 'primary-color' },
		],
		buttons,
		allowDelete: authStore.hasAccessTo(['delete_dashboard']),
	});
});

const handleShowDetails = ({ row, options, column }) => {
	const settings = options || column?.meta?.options || { page_path: '' };
	changeRoute({ path: `/equipments/${row.id}/details${settings.page_path}` });
};
const handleAddToFavorites = ({ row, subjectType = SUBJECT_TYPES.USER }) => {
	const isPersonal = subjectType === SUBJECT_TYPES.USER;
	const isFavorite = isPersonal ? row.is_my_favorite : row.is_company_favorite;
	isLoadingCards.value = true;
	api_request(`/equipments/${row.id}/favorite`, {
		method: isFavorite ? 'DELETE' : 'POST',
		notNotify: true,
		data: { subject_type: subjectType },
		alternateResponseProp: 'data',
	})
		.then(({ value }) => {
			if (value?.status === 'ok') {
				itemsList.value = itemsList.value.map((item) =>
					item.id === value.equipment_id
						? { ...item, is_my_favorite: value.is_my_favorite, is_company_favorite: value.is_company_favorite }
						: item,
				);
			}
		})
		.finally(() => {
			isLoadingCards.value = false;
		});
};

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
	handleCreateWorkOrderButton,
	handleShowDetails,
	handleAddToFavorites,
}, emit, 'itemsList');

defineExpose({
	createItem,
	handleDeleteItems,
	refetchItemsList,
});

void props;
</script>
