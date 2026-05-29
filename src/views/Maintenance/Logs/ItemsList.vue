<template>
	<div class="view-wrapper view-list-wrapper work-orders-list">
		<div class="card content-row">
			<div class="card-content">
				<Filterbar
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:actionButtons="filterbarActionButtons"
					hideSearchbar
					@event="handleEvent"
				>
					<div class="filter-item ml-auto">
						<CustomSelectV2
							filterable
							clearable
							:optionsLoading="productionLinesLoading"
							:optionsList="productionLinesList"
							:placeholder="tt('Production_Line')"
							:value="filters.productionLineId"
							@change="(id) => setFilters({ productionLineId: id, machineId: null, assetId: null, equipmentId: null })"
						/>
					</div>

					<div class="filter-item">
						<CustomSelectV2
							filterable
							clearable
							:optionsLoading="machinesLoading"
							:optionsList="machinesList"
							:placeholder="tt('Machine')"
							:value="filters.machineId"
							@change="(id) => setFilters({ machineId: id, assetId: null, equipmentId: null })"
						/>
					</div>

					<div class="filter-item">
						<FetchByQuerySelect
							clearable
							enableLoadmore
							:loadmoreIsActive="assetsLoadmoreIsActive"
							:value="filters.assetId"
							:settings="assetQueryOptions"
							:placeholder="tt('Asset')"
							@input="(id) => setFilters({ assetId: id, equipmentId: null })"
						/>
					</div>

					<div class="filter-item">
						<FetchByQuerySelect
							clearable
							enableLoadmore
							:loadmoreIsActive="equipmentsLoadmoreIsActive"
							:value="filters.equipmentId"
							:settings="equipmentsQueryOptions"
							:placeholder="tt('item')"
							:setupLabelSettings="equipmentLabelOptions"
							@input="(id) => setFilters({ equipmentId: id })"
						/>
					</div>

					<div class="filter-item ml-auto">
						<Datepicker
							v-if="!hideDatepicker"
							setupDaterangeFilter
							enableShortcuts
							:value="filters.daterange"
							type="daterange"
							clearable
							@input="(range) => setFilters({ daterange: range, daterange_setted_at: Date.now() })"
						/>
					</div>

					<div class="filter-item">
						<el-button
							type="success"
							icon="icomoon icon-doc_xls"
							class="action-button inverted"
							native-type="button"
							@click="handleExportToExcel"
						/>
					</div>

					<div class="filter-item">
						<SearchBar
							:query="filters.q"
							clearable
							@submit="setFilters"
						/>
					</div>
				</Filterbar>

				<CustomDataListTable
					ref="itemsTableRef"
					alwaysShowOperations
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
					scrollTo=".work-orders-list"
					@setFilters="setFilters"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';
import { ElNotification } from 'element-plus';

import {
	MAINTENANCE_TYPES,
	images_icon,
	maintenanceReasonTypesList,
	maintenanceTypesList,
	pdf_icon,
} from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { cleanDateString, convertMsToHours, findItemBy, prepareRangeParams } from '@/helpers';
import { setupTrueFalseCellIcon } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { api_request } from '@/api/request_provider';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { ENTITIES } from '@/config/entities';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useMaintenanceStore } from '@/stores/MaintenanceStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useMaintenance } from '@/composables/useMaintenance';

import Filterbar from '@/components/common/Filterbar.vue';
import SearchBar from '@/components/common/SearchBar.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'MaintenanceLogsItemsList',
});

const props = defineProps({
	perPageItems: { type: Array, default: () => [] },
	hideDatepicker: Boolean,
	propsFilters: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const maintenanceStore = useMaintenanceStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters } = storeToRefs(maintenanceStore);
const { completeWorkOrders, exportMaintenanceLogToExcel } = useMaintenance();
const itemsTableRef = ref(null);
const productionLinesList = shallowRef([]);
const productionLinesLoading = ref(false);
const machinesList = shallowRef([]);
const machinesLoading = ref(false);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_maintenance']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_maintenance']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_maintenance']));

const propsFiltersRef = computed(() => ({
	type: MAINTENANCE_TYPES.LOG,
	...props.propsFilters,
}));
const itemsNameRef = computed(() => {
	const item = findItemBy('id', propsFiltersRef.value.type, maintenanceTypesList());
	return Object.freeze({
		one: tt(item?.label || 'Maintenance_Log'),
		mult: tt(item?.label || 'Maintenance_Logs'),
		instanceName: 'maintenance',
	});
});

const methodsMap = {
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
	fetch_assets: createGetRequest(ENTITIES.Assets.apiBase),
	fetch_asset: createGetByIdRequest(ENTITIES.Assets.apiBase),
	fetch_equipments: createGetRequest(ENTITIES.Equipments.apiBase),
	fetch_equipment: createGetByIdRequest(ENTITIES.Equipments.apiBase),
};

const assetQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_assets,
		fetchByIdAction: methodsMap.fetch_asset,
		payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
		bindTo: [
			{ getValue: () => globalFilters.value?.plantId, param: 'plantId', withoutClean: true },
			{ getValue: () => filters.value.productionLineId, param: 'productionLineId' },
			{ getValue: () => filters.value.machineId, param: 'machineId' },
		],
	}),
);
const equipmentsQueryOptions = computed(() =>
	Object.freeze({
		fetchAction: methodsMap.fetch_equipments,
		fetchByIdAction: methodsMap.fetch_equipment,
		payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
		bindTo: [
			{ getValue: () => globalFilters.value?.plantId, param: 'plantId', withoutClean: true },
			{ getValue: () => filters.value.productionLineId, param: 'productionLineId' },
			{ getValue: () => filters.value.machineId, param: 'machineId' },
			{ getValue: () => filters.value.assetId, param: 'assetId' },
		],
	}),
);
const assetsLoadmoreIsActive = computed(() => !filters.value.machineId);
const equipmentsLoadmoreIsActive = computed(() => !filters.value.machineId && !filters.value.assetId);
const equipmentLabelOptions = Object.freeze({
	accessors: ['brand_name', 'machine_name', 'production_line_name', 'location_name'],
	delimeter: ',',
});

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
	entityKey: 'MaintenanceLogs',
	itemStore: maintenanceStore,
	itemsName: itemsNameRef,
	options: {
		tableRef: itemsTableRef,
		propsFilters: propsFiltersRef,
		predefinedFilters: {
			orderByColumn: 'created_at',
			orderByMethod: 'desc',
		},
		localCreateItem: () => editItem({ row: { id: 'new' } }),
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

const setupReason = (reasonType) => {
	const item = findItemBy('id', reasonType, maintenanceReasonTypesList());
	return item?.label || '';
};

const setupTotalTime = ({ total_time: totalTime, start_time: startTime, finish_time: finishTime } = {}) => {
	if (startTime && finishTime) {
		return `${startTime} - ${finishTime}`;
	}

	if (totalTime) {
		const { total_hours: totalHours, total_mins: totalMins } = convertMsToHours(totalTime * 1000);
		return `${totalHours} hr </br> ${totalMins} minutes`;
	}

	return '-';
};

const tableSettings = computed(() => {
	const settings = {
		tableClass: 'maintenanceLogsTable',
		columns: translate([
			{ label: 'Id', prop: 'id', width: 70 },
			{ label: 'Date', prop: 'created_at', sortable: true, min_width: 100, max_width: 155, meta: { prepareValue: { localMethod: cleanDateString } } },
			{ label: 'Machine', prop: 'machine.name', min_width: 100, max_width: 220 },
			{ label: 'Creator', prop: 'creator.full_name', min_width: 110, max_width: 120 },
			{ label: 'Log', prop: 'description', min_width: 300, max_width: 350, meta: { cellComponent: { componentPath: 'views/Maintenance/Logs/DescriptionTableCell' } } },
			{ label: 'Shift', prop: 'shift', max_width: 60 },
			{ label: 'Reason', prop: 'reason_type', min_width: 90, max_width: 90, meta: { prepareValue: { localMethod: setupReason } } },
			{ label: 'Time', prop: ' ', min_width: 105, max_width: 105, meta: { cell_class: 'text-center', prepareValue: { localMethod: setupTotalTime, useAllInstanceData: true } } },
			{ label: 'Solved', prop: 'is_problem_solved', width: 85, meta: { cell_class: 'text-center', prepareValue: { localMethod: setupTrueFalseCellIcon } } },
			{ label: 'phrases.Acknowledge_by_supervisor', prop: 'is_acknowledge_by_supervisor', width: 120, meta: { cell_class: 'text-center', prepareValue: { localMethod: setupTrueFalseCellIcon } } },
			{ label: 'phrases.Supervisor_notes', prop: 'supervisor_notes', min_width: 200, max_width: 260, meta: { cellComponent: { componentPath: 'views/Maintenance/Logs/DescriptionTableCell' } } },
			{
				label: 'Files',
				min_width: 110,
				max_width: 120,
				conditionSettings: {
					checkMethod: 'some',
					conditions: [
						{ prop: 'images', method: 'notEmpty' },
						{ prop: 'attachments', method: 'notEmpty' },
					],
				},
				meta: {
					additionalActions: [
						{
							name: 'togglePreviewModal',
							type: 'transparent',
							img: images_icon,
							className: 'borderless button-with-img',
							disablePopover: true,
							buttonContent: { component: { componentPath: 'views/Maintenance/Logs/fileButtonContent' } },
							conditionSettings: { conditions: [{ prop: 'images', method: 'notEmpty' }] },
						},
						{
							name: 'openFile',
							type: 'transparent',
							img: pdf_icon,
							className: 'borderless button-with-img',
							tooltip_text: ' ',
							tool_tip_class: 'files-list-popover',
							buttonContent: { component: { componentPath: 'views/Maintenance/Logs/fileButtonContent' } },
							popoverContent: { component: { componentPath: 'views/Maintenance/Logs/filePopoverContent' } },
							conditionSettings: { conditions: [{ prop: 'attachments', method: 'notEmpty' }] },
						},
					],
					emptyText: ' ',
				},
			},
			{
				label: 'Work_Order',
				max_width: 70,
				meta: {
					additionalActionsClassName: 'column',
					additionalActions: [
						{
							name: 'handleShowParentWO',
							className: 'vertical-fluid link underline info-color',
							disablePopover: true,
							conditionSettings: { conditions: [{ prop: 'parent', method: 'notEmpty' }] },
							buttonContent: { component: { componentPath: 'views/Maintenance/WorkOrders/WOButtonContent' } },
						},
					],
				},
			},
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
		settings.operations.actions.push(standardTableOperations.edit);
	}
	if (hasAccessToDelete.value) {
		settings.operations.actions.push(standardTableOperations.delete);
	}

	settings.operations.actions = translate(settings.operations.actions, { key: 'tooltip_text' });
	return Object.freeze(settings);
});

const handleCompleteItems = () => {
	const ids = itemsTableRef.value?.selectedIds || [];
	if (!ids.length) return;
	completeWorkOrders({ data: { ids } }).then(refetchItemsList);
};

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

const handleExportToExcel = () => {
	const { daterange } = filters.value;

	if (!daterange?.length) {
		ElNotification.warning({ message: tt('phrases.select_date_range_first') });
		return;
	}

	exportMaintenanceLogToExcel({
		...filters.value,
		...propsFiltersRef.value,
		...prepareRangeParams(daterange),
		plantId: globalFilters.value?.plantId,
	});
};

const openDetailsModal = ({ row, title, itemName, formComponentFileLoader }) => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: row,
		formComponentFileLoader,
		title,
		itemName,
		hideSubmitButtons: true,
		hideFooter: true,
		settings: {},
		additionalModalSettings: {
			productionLinesList: productionLinesList.value,
			maintenanceReasonTypesList: maintenanceReasonTypesList(),
		},
		headerActions: [],
		footerActions: [],
	});
};

const handleShowDetails = ({ row }) => {
	openDetailsModal({
		row,
		title: tt('phrases.Maintenance_Log_Details'),
		itemName: tt('Maintenance_Log'),
		formComponentFileLoader: () => import('./ItemDetailsPreview.vue'),
	});
};

const handleShowParentWO = ({ row }) => {
	if (!row?.parent) return;

	openDetailsModal({
		row: row.parent,
		title: tt('phrases.Work_Order_Details'),
		itemName: tt('Work_Order'),
		formComponentFileLoader: () => import('../WorkOrders/ItemDetailsPreview.vue'),
	});
};

const togglePreviewModal = ({ row }) => {
	const images = row?.images || [];
	if (!images.length) return;

	emit('event', {
		eventName: 'togglePreviewModal',
		data: {
			pictureId: images[0].id,
			picturesList: images,
		},
		onward: true,
	});
};

const openFile = () => {};

const exportLog = ({ row }) => {
	api_request.get('/maintenance/export/pdf', {
		params: { ...filters.value, ids: row.id },
		resultMessage: tt('phrases.File_was_sent_on_your_email'),
	});
};

useRequestsList({
	methodsMap,
	requestsToDoList: computed(() =>
		Object.freeze([
			{
				actionName: 'fetch_production_lines',
				localProp: productionLinesList,
				localLoadProp: productionLinesLoading,
				payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
				bindTo: [{ getValue: () => globalFilters.value?.plantId, param: 'plantId' }],
			},
			{
				actionName: 'fetch_machines',
				localProp: machinesList,
				localLoadProp: machinesLoading,
				payload: { params: { orderByColumn: 'name', orderByMethod: 'asc' } },
				bindTo: [
					{ getValue: () => globalFilters.value?.plantId, param: 'plantId' },
					{ getValue: () => filters.value.productionLineId, param: 'productionLineId' },
				],
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
	handleCompleteItems,
	handleShowDetails,
	handleShowParentWO,
	togglePreviewModal,
	openFile,
	exportLog,
});
</script>
