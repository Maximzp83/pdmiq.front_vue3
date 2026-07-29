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
							@change="(id) => setFilters({ productionLineId: id, machineId: null })"
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
							@change="(id) => setFilters({ machineId: id })"
						/>
					</div>

					<div v-if="!hideDatepicker" class="filter-item">
						<Datepicker
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
							class="action-button inverted"
							native-type="button"
							@click="handleExportToExcel"
						>
							<i class="icomoon icon-doc_xls"></i>
						</el-button>
					</div>

					<div class="filter-item ml-auto">
						<el-popover placement="bottom" trigger="click" width="200" :close-delay="0">
							<template #reference>
								<el-button
									type=""
									class="action-button inverted"
									native-type="button"
								>
									<i class="icomoon icon-search"></i>
								</el-button>
							</template>

							<div class="search-block-wrapper relative">
								<SimpleSpinner :active="itemsLoading" />
								<SearchBar
									class="search-block"
									:query="filters.q"
									clearable
									@submit="(data) => setFilters(data)"
								/>
							</div>
						</el-popover>
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
import SearchBar from '@/components/common/SearchBar.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'MaintenanceLogsItemsList',
});

const props = defineProps({
	perPageItems: { type: Array, default: () => [] },
	hideDatepicker: Boolean,
	preventSetNavbar: Boolean,
	fromDashboard: Boolean,
	insideOtherPage: Boolean,
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
		one: item?.label || 'Maintenance Log',
		mult: item?.label || 'Maintenance Logs',
		instanceName: 'maintenance',
	});
});

const methodsMap = {
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
};

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
		fromDashboard: props.fromDashboard || props.insideOtherPage,
		preventSetNavbar: props.preventSetNavbar,
		formComponentFileLoader: () => import('../MaintenanceFormWrapper.vue'),
		successSubmitOptions: {
			refetchItemsList: true,
			closeModal: true,
		},
		additionalModalSettings: {
			editModalProp: 'editModalClassic',
			className: 'maintenance-modal',
			modalClassName: 'fixed-header-footer small-header small-footer',
			additionalSettings: {
				switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.LOG },
				plantId: globalFilters.value?.plantId,
				...propsFiltersRef.value,
			},
		},
		predefinedFilters: {
			orderByColumn: 'created_at',
			orderByMethod: 'desc',
		},
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
	// console.log(reasonType,item, maintenanceReasonTypesList());
	return item?.name || '';
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
			{ label: 'Log', prop: 'description', min_width: 300, max_width: 350, meta: { cellComponent: { componentFileLoader: () => import('./DescriptionTableCell.vue') } } },
			{ label: 'Shift', prop: 'shift', max_width: 60 },
			{ label: 'Reason', prop: 'reason_type', min_width: 90, max_width: 90, meta: { prepareValue: { localMethod: setupReason } } },
			{ label: 'Time', prop: ' ', min_width: 105, max_width: 105, meta: { cell_class: 'text-center', prepareValue: { localMethod: setupTotalTime, useAllInstanceData: true } } },
			{ label: 'Solved', prop: 'is_problem_solved', width: 85, meta: { cell_class: 'text-center', prepareValue: { localMethod: setupTrueFalseCellIcon } } },
			{ label: 'phrases.Acknowledge_by_supervisor', prop: 'is_acknowledge_by_supervisor', width: 120, meta: { cell_class: 'text-center', prepareValue: { localMethod: setupTrueFalseCellIcon } } },
			{ label: 'phrases.Supervisor_notes', prop: 'supervisor_notes', min_width: 200, max_width: 260, meta: { cellComponent: { componentFileLoader: () => import('./DescriptionTableCell.vue') } } },
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
							className: 'el-button--transparent',
							img: images_icon,
							className: 'borderless button-with-img',
							disablePopover: true,
							buttonContent: { component: { componentFileLoader: () => import('./fileButtonContent.vue') } },
							conditionSettings: { conditions: [{ prop: 'images', method: 'notEmpty' }] },
						},
						{
							name: 'openFile',
							className: 'el-button--transparent',
							img: pdf_icon,
							className: 'borderless button-with-img',
							tooltip_text: ' ',
							tool_tip_class: 'files-list-popover',
							buttonContent: { component: { componentFileLoader: () => import('./fileButtonContent.vue') } },
							popoverContent: { component: { componentFileLoader: () => import('./filePopoverContent.vue') } },
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
							buttonContent: { component: { componentFileLoader: () => import('../WorkOrders/WOButtonContent.vue') } },
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

const openDetailsModal = ({
	row,
	title,
	itemName,
	formComponentFileLoader,
	headerActions = [],
	footerActions = [],
	hideFooter = true,
	additionalModalSettings = {},
}) => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: row,
		formComponentFileLoader,
		title,
		itemName,
		hideSubmitButtons: true,
		hideFooter,
		settings: {},
		additionalSettings: {
			productionLinesList: productionLinesList.value,
			maintenanceReasonTypesList: maintenanceReasonTypesList(),
			...additionalModalSettings,
		},
		headerActions,
		footerActions,
	});
};

const handleShowDetails = ({ row }) => {
	const headerActions = translate([
		{
			name: 'exportLog',
			className: 'el-button--transparent',
			icon: 'icomoon icon-pdf',
			tooltip_text: 'phrases.Export_To_PDF',
		},
	], { key: 'tooltip_text' });

	if (hasAccessToEdit.value) {
		headerActions.push(...translate([{ ...standardTableOperations.edit, className: 'el-button--transparent' }], { key: 'tooltip_text' }));
	}

	const footerActions = [];
	if (hasAccessToCreate.value && hasAccessToEdit.value) {
		footerActions.push({
			name: 'handleCreateRequest',
			button_text: tt('phrases.CREATE_WORK_ORDER_REQUEST'),
			disablePopover: true,
			type: 'primary',
			className: 'item-action-button',
			parentLog: row,
		});
	}

	openDetailsModal({
		row,
		title: tt('phrases.Maintenance_Log_Details'),
		itemName: tt('Maintenance_Log'),
		formComponentFileLoader: () => import('./ItemDetailsPreview.vue'),
		headerActions,
		footerActions,
		hideFooter: !footerActions.length,
	});
};

const handleShowParentWO = ({ row }) => {
	if (!row?.parent) return;

	const headerActions = translate([
		{
			name: 'handlePrintWO',
			className: 'el-button--transparent',
			icon: 'icomoon icon-printer',
			tooltip_text: 'Print',
		},
	], { key: 'tooltip_text' });

	if (hasAccessToEdit.value) {
		headerActions.push(...translate([
			{
				name: 'editWOFromLogsList',
				icon: 'icomoon icon-pencil',
				tooltip_text: 'Edit',
				className: 'el-button--transparent',
				conditionSettings: {
					checkMethod: 'some',
					conditions: [
						{
							prop: 'is_periodic',
							control_value: true,
							next_conditions: [{ prop: 'is_closed', control_value: false }],
						},
						{
							prop: 'is_periodic',
							method: '!=',
							control_value: true,
							next_conditions: [{ prop: 'is_closed', control_value: false }],
						},
					],
				},
			},
		], { key: 'tooltip_text' }));
	}

	const footerActions = [];
	if (row.parent.is_closed && hasAccessToDelete.value) {
		footerActions.push({
			name: 'handleUnlockWorkOrder',
			button_text: tt('UNLOCK'),
			disablePopover: true,
			type: 'primary',
		});
	}

	openDetailsModal({
		row: row.parent,
		title: tt('phrases.Work_Order_Details'),
		itemName: tt('Work_Order'),
		formComponentFileLoader: () => import('../WorkOrders/ItemDetailsPreview.vue'),
		headerActions,
		footerActions,
		hideFooter: !footerActions.length,
		additionalModalSettings: {
			productionLinesList: productionLinesList.value,
		},
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
