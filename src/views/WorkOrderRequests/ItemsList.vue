<template>
	<div class="view-wrapper view-list-wrapper work-orders-list">
		<div class="mcontainer">
			<div class="card content-row">
				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:perPageItems="perPageItems"
						:actionButtons="filterbarActionButtons"
						@event="handleEvent"
					/>

					<CustomDataListTable
						ref="itemsTableRef"
						alwaysShowOperations
						:disableSelection="!hasAccessToDelete"
						:itemsLoading="itemsLoading || productionLinesLoading"
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
import { computed, ref, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessageBox, ElNotification } from 'element-plus';

import { MAINTENANCE_TYPES } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useMaintenanceStore } from '@/stores/MaintenanceStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useMaintenance } from '@/composables/useMaintenance';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'WorkOrderRequestsItemsList',
});

const props = defineProps({
	perPageItems: { type: Array, default: () => [] },
	preventSetNavbar: Boolean
});

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const maintenanceStore = useMaintenanceStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters_requests: filters } = storeToRefs(maintenanceStore);
const { rejectMaintenanceRequest } = useMaintenance();

const itemsTableRef = ref(null);
const productionLinesLoading = ref(false);
const productionLinesList = shallowRef([]);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_work_order_requests']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_work_order_requests']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_work_order_requests']));
const propsFiltersRef = computed(() => ({
	type: MAINTENANCE_TYPES.REQUEST,
	plantId: globalFilters.value?.plantId,
}));

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
	refetchItemsList,
	createItem,
	editItem,
	handleDeleteItems,
} = useItemsData({
	entityKey: 'WorkOrders',
	itemStore: maintenanceStore,
	options: {
		preventSetNavbar: props.preventSetNavbar,
		filtersStateProp: 'filters_requests',
		tableRef: itemsTableRef,
		propsFilters: propsFiltersRef,
		localCreateItem: () => openRequestForm(),
		localEditItem: ({ row }) => openRequestForm(row),
	},
});

const filterbarActionButtons = computed(() => {
	const buttons = [];
	if (hasAccessToCreate.value) {
		buttons.push({ id: 1, text: 'Add', event: 'createItemCheckPlant' });
	}
	if (hasAccessToDelete.value) {
		buttons.push({ id: 2, text: 'Delete', event: 'handleDeleteItems', isDelete: true });
	}
	return Object.freeze(translate(buttons, { key: 'text' }));
});

const tableSettings = computed(() => {
	const settings = {
		columns: translate([
			{ label: 'WO_Request', label_postfix: ' #', prop: 'serial_number', width: 130 },
			{ label: 'Name', prop: 'title', sortable: true },
			{ label: 'Submitted', prop: 'creator.full_name' },
			{
				label: 'Production_Line',
				prop: 'production_line_id',
				sortable: true,
				meta: {
					sortBy: 'production_line_name',
					getItemValue: { prop: 'name', list: productionLinesList.value },
				},
			},
			{ label: 'Machine', prop: 'machine.name', sortable: true, meta: { sortBy: 'machine_name' } },
			{ label: 'Asset', prop: 'asset.name', sortable: true, meta: { sortBy: 'asset_name' } },
		]),
		operations: {
			actions: [
				{
					name: 'handleShowDetails',
					type: 'success',
					icon: 'icomoon icon-eye',
					tooltip_text: 'Details',
				},
			],
		},
	};

	if (hasAccessToEdit.value) {
		settings.operations.width = 220;
		settings.operations.actions.push(
			{
				name: 'convertItem',
				type: 'success',
				disablePopover: true,
				button_text: 'CONVERT',
				className: 'width-auto',
			},
			{
				name: 'rejectItem',
				type: 'danger',
				disablePopover: true,
				button_text: 'REJECT',
				className: 'width-auto',
			},
			standardTableOperations.edit,
		);
	}

	if (hasAccessToDelete.value) {
		settings.operations.actions.push(standardTableOperations.delete);
	}

	settings.operations.actions = translate(settings.operations.actions, { key: 'button_text' });
	settings.operations.actions = translate(settings.operations.actions, { key: 'tooltip_text' });

	return Object.freeze(settings);
});

const createItemCheckPlant = () => {
	if (globalFilters.value?.plantId) {
		createItem();
		return;
	}

	ElNotification.warning({
		title: tt('phrases.creation_is_not_allowed'),
		message: tt('phrases.select_plant_first'),
	});
};

const openRequestForm = (row = null) => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: row,
		formComponentFileLoader: () => import('./ItemForm.vue'),
		itemName: itemsName.value.one,
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		additionalModalSettings: {
			plantId: row?.plant_id || globalFilters.value?.plantId,
		},
		successSubmitOptions: {
			refetchItemsList,
			closeModal: true,
		},
	});
};

const handleShowDetails = ({ row }) => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: row,
		formComponentFileLoader: () => import('./ItemDetailsPreview.vue'),
		title: tt('phrases.see_work_order_request'),
		itemName: `${tt('Work Order')} ${tt('Request')}`,
		hideSubmitButtons: true,
		hideFooter: !hasAccessToEdit.value,
		settings: { showJustInfo: true },
		headerActions: hasAccessToEdit.value
			? translate([
					{
						name: 'editItem',
						type: 'transparent',
						icon: 'icomoon icon-pencil',
						tooltip_text: 'Edit',
					},
				], { key: 'tooltip_text' })
			: [],
		footerActions: hasAccessToEdit.value
			? [
					{
						name: 'convertItem',
						button_text: tt('CONVERT'),
						disablePopover: true,
						type: 'primary',
						className: 'item-action-button',
					},
					{
						name: 'rejectItem',
						button_text: tt('REJECT'),
						disablePopover: true,
						className: 'item-action-button',
					},
				]
			: [],
	});
};

const convertItem = ({ row }) => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: row,
		formComponentFileLoader: () => import('./ConvertForm.vue'),
		title: `${tt('Convert')} ${tt('Work_Order')} ${tt('Request')}`,
		itemName: `${tt('Work_Order')} ${tt('Request')}`,
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		hideSubmitButtons: true,
		footerActions: [
			{
				name: 'validateForm',
				button_text: tt('CONVERT'),
				disablePopover: true,
				type: 'primary',
			},
		],
		successSubmitOptions: {
			refetchItemsList,
			closeModal: true,
		},
	});
};

const rejectItem = ({ row }) => {
	ElMessageBox.confirm(`${tt('phrases.reject_this_work_order_request')}?`, {
		confirmButtonText: tt('REJECT'),
		cancelButtonText: tt('CANCEL'),
		type: 'warning',
	}).then(() =>
		rejectMaintenanceRequest({ itemId: row.id }).then(() => {
			refetchItemsList();
			globalStore.show_edit_modal({ show: false, editModalProp: 'editModalClassic' });
		}),
	);
};

useRequestsList({
	methodsMap: {
		fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	},
	requestsToDoList: computed(() =>
		Object.freeze([
			{
				actionName: 'fetch_production_lines',
				localProp: productionLinesList,
				localLoadProp: productionLinesLoading,
				payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
				bindTo: [{ getValue: () => globalFilters.value?.plantId, param: 'plantId' }],
			},
		])
	),
});

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	createItemCheckPlant,
	editItem,
	handleDeleteItems,
	handleShowDetails,
	convertItem,
	rejectItem,
});
</script>
