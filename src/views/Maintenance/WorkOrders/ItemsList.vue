<template>
	<div class="view-list-wrapper work-orders-list">
		<div class="card content-row">
			<div class="card-content">
				<Filterbar
					:itemsLoading="itemsLoading"
					:filters="filters"
					:itemsName="itemsName"
					:perPageItems="perPageItems"
					:actionButtons="filterbarActionButtons"
					hideSearchbar
					@event="handleEvent"
				>
					<div v-if="changeStatusOperationsList.length" class="change-wo-status-selector">
						<CustomSelectV2
							className="el-button el-button--primary inverted item-action-button"
							:optionsList="changeStatusOperationsList"
							idKey="label"
							labelKey="label"
							valueKey="actionName"
							:prefixText="tt('phrases.Change_Status')"
							placeholder=" "
							@change="changeStatusOperation"
						/>
					</div>

					<div v-if="!hideDatepicker" class="filter-item ml-auto">
						<Datepicker
							setupDaterangeFilter
							enableShortcuts
							:model-value="filters.daterange"
							type="daterange"
							clearable
							@update:model-value="(range) => setFilters({ daterange: range, daterange_setted_at: Date.now() })"
						/>
					</div>

					<div class="filter-item ml-auto">
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

					<template #last>
						<div class="filter-item toggle-additional-filters relative">
							<el-button
								type="primary"
								native-type="button"
								:class="['action-button inverted', { active: showFilterbar }]"
								@click="toggleFilterbar"
							>
								<i :class="`icomoon icon-${showFilterbar ? 'plus' : 'settings'}`"></i>
							</el-button>

							<span v-show="activeFiltersCount" class="round-counter wo-filters-count">
								{{ activeFiltersCount }}
							</span>
						</div>
					</template>
				</Filterbar>

				<DropdownFilterbar
					ref="dropdownFilterbarRef"
					hideToggleButton
					:itemsName="itemsName"
					filterbarDropdownId="woDropdownFilterbar"
					@event="handleEvent"
				>
					<div class="mcol-xs-12 flex wrap work-orders-dropdown-filters">
						<div class="filter-items-list relative">
							<div class="mrow flex wrap">
								<div class="mcol-xs-auto checkbox-item" v-if="authStore.isCustomer">
									<el-checkbox
										:model-value="filters.my"
										:false-label="null"
										@change="(val) => setFilters({ my: val })"
									>
										<b class="capitalize">{{ tt('phrases.assigned_to_me') }}</b>
									</el-checkbox>
								</div>

								<div class="mcol-xs-auto checkbox-item">
									<el-checkbox
										:model-value="filters.onlyFromRequest"
										:false-label="null"
										@change="(val) => setFilters({ onlyFromRequest: val })"
									>
										<b class="capitalize">{{ tt('phrases.From_Request') }}</b>
									</el-checkbox>
								</div>
							</div>
						</div>

						<div class="filter-items-list relative">
							<div class="mrow flex wrap">
								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										clearable
										:optionsList="woStageTypesList"
										:placeholder="tt('stage')"
										:model-value="filters.stage"
										@update:model-value="(id) => setFilters({ stage: id })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										clearable
										:optionsList="woFrequencyTypesList"
										:placeholder="tt('Frequency')"
										:model-value="filters.frequency"
										@update:model-value="(id) => setFilters({ frequency: id })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										multiple
										collapse-tags
										clearable
										:optionsList="workOrdersStatusesList"
										:placeholder="tt('Status')"
										:model-value="filters.status"
										@update:model-value="(ids) => setFilters({ status: ids })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										filterable
										clearable
										:optionsLoading="maintenanceCategoriesLoading"
										:optionsList="maintenanceCategoriesFiltersList"
										:placeholder="tt('Work_Order_Type')"
										:model-value="filters.categoryId"
										@update:model-value="(id) => setFilters({ categoryId: id, withoutCategory: id === 0 ? true : null })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										filterable
										clearable
										:optionsLoading="productionLinesLoading"
										:optionsList="productionLinesList"
										:placeholder="tt('production_line')"
										:model-value="filters.productionLineId"
										@update:model-value="(id) => setFilters({ productionLineId: id, machineId: null, assetId: null, equipmentId: null })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-1">
									<CustomSelectV2
										filterable
										clearable
										:optionsLoading="machinesLoading"
										:optionsList="machinesList"
										:placeholder="tt('Machine')"
										:model-value="filters.machineId"
										@update:model-value="(id) => setFilters({ machineId: id, assetId: null, equipmentId: null })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-1">
									<FetchByQuerySelect
										clearable
										enableLoadmore
										:loadmoreIsActive="assetsLoadmoreIsActive"
										:model-value="filters.assetId"
										:settings="assetQueryOptions"
										:placeholder="tt('Asset')"
										@update:model-value="(id) => setFilters({ assetId: id, equipmentId: null })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<FetchByQuerySelect
										clearable
										enableLoadmore
										:loadmoreIsActive="equipmentsLoadmoreIsActive"
										:model-value="filters.equipmentId"
										:settings="equipmentsQueryOptions"
										:placeholder="tt('item')"
										:setupLabelSettings="equipmentLabelOptions"
										@update:model-value="(id) => setFilters({ equipmentId: id })"
									/>
								</div>
							</div>
						</div>
					</div>
				</DropdownFilterbar>

				<CustomDataListTable
					ref="itemsTableRef"
					alwaysShowOperations
					:disableSelection="!hasBulkAccess"
					:itemsLoading="itemsLoading || usersLoading"
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
import { ElMessageBox, ElNotification } from 'element-plus';

import {
	MAINTENANCE_TYPES,
	WORK_ORDER_STATUSES_TYPES,
	maintenanceReasonTypesList,
	maintenanceTypesList,
	woFrequencyTypesList as getWoFrequencyTypesList,
	woStageTypesList as getWoStageTypesList,
	workOrdersStatusesList as getWorkOrdersStatusesList,
} from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { cleanDateString, findItemBy, getTimeDifference, getWOStatus, setupAssignedUsers, cloneDeep } from '@/helpers';
import { Lang } from '@/localization';
import { createGetByIdRequest, createGetRequest } from '@/api/request_factories';
import { api_request } from '@/api/request_provider';
import { ENTITIES } from '@/config/entities';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useMaintenanceStore } from '@/stores/MaintenanceStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';
import { useMaintenance } from '@/composables/useMaintenance';

import Filterbar from '@/components/common/Filterbar.vue';
import DropdownFilterbar from '@/components/common/DropdownFilterbar.vue';
import SearchBar from '@/components/common/SearchBar.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import Datepicker from '@/components/common/Datepicker.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import FetchByQuerySelect from '@/components/form/FetchByQuerySelect.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'WorkOrdersItemsList',
});

const props = defineProps({
	perPageItems: { type: Array, default: () => [] },
	preventSetNavbar: Boolean,
	fromDashboard: Boolean,
	insideOtherPage: Boolean,
	usersList: { type: Array, default: () => [] },
	usersLoading: Boolean,
	hideDatepicker: Boolean,
	fromPlantDashboard: Boolean,
	propsFilters: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const maintenanceStore = useMaintenanceStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters_wo: filters } = storeToRefs(maintenanceStore);
const {
	setInWorkWorkOrders,
	completeWorkOrders,
	closeWorkOrders,
	exportMaintenanceLogToExcel,
} = useMaintenance();

const itemsTableRef = ref(null);
const dropdownFilterbarRef = ref(null);
const showFilterbar = ref(false);
const productionLinesList = shallowRef([]);
const productionLinesLoading = ref(false);
const machinesList = shallowRef([]);
const machinesLoading = ref(false);
const maintenanceCategoriesList = shallowRef([]);
const maintenanceCategoriesLoading = ref(false);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_maintenance']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_maintenance']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_maintenance']));
const hasBulkAccess = computed(() => hasAccessToDelete.value || hasAccessToEdit.value);
const woStageTypesList = computed(() => Object.freeze(getWoStageTypesList()));
const woFrequencyTypesList = computed(() => Object.freeze(getWoFrequencyTypesList()));
const workOrdersStatusesList = computed(() =>
	Object.freeze(
		getWorkOrdersStatusesList().filter((item) =>
			item.permissions ? authStore.hasAccessTo(item.permissions) : true,
		),
	),
);
const maintenanceCategoriesFiltersList = computed(() =>
	Object.freeze([{ id: 0, name: 'Without Category' }, ...maintenanceCategoriesList.value]),
);
const activeFiltersCount = computed(() => {
	const exceptions = new Set([
		'page',
		'max',
		'daterange',
		'q',
		'orderByColumn',
		'orderByMethod',
		'daterange_setted_at',
	]);

	return Object.entries(filters.value || {}).filter(([key, value]) => {
		if (exceptions.has(key)) return false;
		if (Array.isArray(value)) return value.length > 0;
		return value !== null && value !== undefined && value !== false && value !== '';
	}).length;
});
const propsFiltersRef = computed(() => ({
	type: MAINTENANCE_TYPES.WORK_ORDER,
	...props.propsFilters,
}));
const itemsNameRef = computed(() => {
	const item = findItemBy('id', propsFiltersRef.value.type, maintenanceTypesList());
	return Object.freeze({
		one: item?.label || 'Work_Order',
		mult: item?.label || 'Work_Orders',
		instanceName: 'maintenance',
	});
});

const methodsMap = {
	fetch_production_lines: createGetRequest(ENTITIES.ProductionLines.apiBase),
	fetch_machines: createGetRequest(ENTITIES.Machines.apiBase),
	fetch_maintenance_categories: createGetRequest(ENTITIES.MaintenanceCategories.apiBase),
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
	entityKey: 'WorkOrders',
	itemStore: maintenanceStore,
	itemsName: itemsNameRef,
	options: {
		filtersStateProp: 'filters_wo',
		tableRef: itemsTableRef,
		propsFilters: propsFiltersRef,
		fromDashboard: props.fromDashboard || props.insideOtherPage,
		preventSetNavbar: props.preventSetNavbar,
		formComponentFileLoader: () => import('../MaintenanceFormWrapper.vue'),
		additionalModalSettings: {
			editModalProp: 'editModalClassic',
			className: 'maintenance-modal',
			modalClassName: 'fixed-header-footer small-header small-footer',
			additionalSettings: {
				switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.WORK_ORDER },
				plantId: globalFilters.value?.plantId,
				...propsFiltersRef.value,
			},
			callback: () => {
				refetchItemsList();
				globalStore.show_edit_modal({ show: false, editModalProp: 'editModalClassic' });
			},
		},
		localModalSettingsHook: ({ itemData, modalSettings }) => {
			let newModalSettings = cloneDeep(modalSettings);
			if (itemData && itemData.is_periodic) {
				// console.log(itemData.is_periodic)
				newModalSettings.additionalModalSettings.switchTabTo = {
					key: 'isRecurring',
					value: true
				};
			}
			/*if (modalSettings.callback) {
				newModalSettings.callback = modalSettings.callback;
			}*/
			return newModalSettings;			
		},
		localDeleteItems: (payload) => deleteWorkOrders(payload),
		/*predefinedFilters: {
			orderByColumn: 'created_at',
			orderByMethod: 'desc',
		},*/
	},
});

const filterbarActionButtons = computed(() => {
	const buttons = [];
	if (hasAccessToCreate.value) {
		buttons.push({ id: 1, text: 'Add', event: 'createItemCheckPlant' });
	}
	if (hasAccessToDelete.value) {
		buttons.push({ id: 2, text: 'Delete', event: 'handleDeleteWorkOrders', isDelete: true });
	}
	return Object.freeze(translate(buttons, { key: 'text' }));
});

const changeStatusOperationsList = computed(() => {
	const list = [{ label: 'phrases.In_Work', actionName: 'handleInWorkItems' }];

	if (hasAccessToEdit.value) {
		list.push({ label: 'Complete', actionName: 'handleCompleteItems' });
	}
	if (hasAccessToDelete.value) {
		list.push({ label: 'Close', actionName: 'handleCloseItems' });
	}
	return Object.freeze(translate(list, { key: 'label' }));
});

const tableSettings = computed(() => {
	const settings = {
		tableClass: 'maintenance-table',
		columns: translate([
			{ label: 'WO', label_postfix: '#', prop: 'serial_number', width: 80 },
			{ label: 'Date', prop: 'created_at', sortable: true, min_width: 120, meta: { prepareValue: { localMethod: cleanDateString } } },
			{ label: 'Due_Date', prop: 'finish_date', sortable: true, min_width: 120, meta: { prepareValue: { localMethod: setupTotalDays, useAllInstanceData: true } } },
			{ label: 'Status', prop: 'status', width: 120, meta: { prepareValue: { localMethod: getWOStatus, args: { list: getWorkOrdersStatusesList() } } } },
			{ label: 'phrases.Machine_name', prop: 'machine.name', min_width: 110, meta: { sortBy: 'company' } },
			{ label: 'phrases.WO_Name', prop: 'title', sortable: true, min_width: 120 },
			{ label: 'phrases.Required_items', prop: 'parts', min_width: 120, meta: { prepareValue: { localMethod: setupRequiredItems, useAllInstanceData: true } } },
			{ label: 'Assigned', prop: 'mock', min_width: 120, meta: { prepareValue: { localMethod: setupAssignedUsers, useAllInstanceData: true, args: { usersList: props.usersList, max: 1 } } } },
			{
				label: 'Logs',
				max_width: 70,
				meta: {
					additionalActionsClassName: 'column',
					additionalActions: [
						{
							className: 'vertical-fluid link underline info-color',
							disablePopover: true,
							conditionSettings: {
								conditions: [{ prop: 'logs', method: 'notEmpty' }],
							},
							buttonContent: {
								component: {
									componentFileLoader: () => import('./LogsButtonContent.vue'),
								},
							},
						},
						{
							name: 'handleCreateLog',
							type: 'success',
							icon: 'icomoon icon-plus',
							disablePopover: true,
						},
					],
				},
			},
		]),
		operations: { actions: [] },
	};

	if (!props.fromPlantDashboard) {
		settings.operations.actions.push({
			name: 'handleShowDetails',
			type: 'success',
			icon: 'icomoon icon-doc3',
			tooltip_text: 'Details',
		});
	}

	settings.operations.actions.push({
		name: 'handleShowDetailsPreview',
		type: 'success',
		popoverPlacement: 'top',
		icon: 'icomoon icon-eye',
		tooltip_text: 'phrases.Open_Details',
	});

	if (hasAccessToDelete.value) {
		settings.operations.actions.push({ ...standardTableOperations.delete, name: 'handleDeleteWorkOrders' });
	}

	settings.operations.actions = translate(settings.operations.actions, { key: 'tooltip_text' });
	return Object.freeze(settings);
});

const createItemCheckPlant = () => {
	if (globalFilters.value?.plantId) {
		createItem();
		return;
	}

	ElNotification.warning({
		title: tt('phrases.Creation_is_not_allowed'),
		message: tt('phrases.select_plant_first'),
	});
};

const setupTotalDays = (row) => {
	const { finish_date: finishDate, status } = row || {};
	let result = `<span>${cleanDateString(finishDate)}</span> </br>`;

	if (finishDate && status !== WORK_ORDER_STATUSES_TYPES.CLOSED) {
		const finishDateEnd = new Date(new Date(finishDate).setHours(23, 59, 59, 0));
		const { days, lessZero } = getTimeDifference({ from: new Date(), to: finishDateEnd });
		const absDays = Math.abs(days);
		const overdueToday = absDays === 0;
		const color = overdueToday ? '#009C67' : lessZero ? '#BF1E2E' : days <= 7 ? '#FFA500' : '#606266';
		result += `<span style="color: ${color}">${
			overdueToday ? tt('Today') : `${absDays} ${tt(absDays === 1 ? 'day' : 'days')}`
		}</span>`;
	}

	return result;
};

const setupRequiredItems = ({ taskProcedure, parts = [] } = {}) => {
	if (!parts.length) return '-';

	return parts
		.map((partItem) => {
			let sum = partItem.quantity || 0;

			if (taskProcedure?.processes?.length) {
				taskProcedure.processes.forEach((processItem) => {
					const procedurePart = findItemBy('part_id', partItem.part_id, processItem.parts || []);
					if (procedurePart) sum += procedurePart.quantity || 0;
				});
			}

			if (!partItem.stock) return '';
			return `<div>${partItem.stock.part_number} - <b>${sum}</b></div>`;
		})
		.filter(Boolean)
		.join('') || '-';
};

const getSelectedIds = () => itemsTableRef.value?.selectedIds || [];
const changeStatusOperation = (actionName) => {
	const handlers = {
		handleInWorkItems,
		handleCompleteItems,
		handleCloseItems,
	};
	handlers[actionName]?.();
};

const confirmSelectedStatusAction = ({ confirmButtonText, confirmMessage, action }) => {
	const ids = getSelectedIds();
	if (!ids.length) return;

	ElMessageBox.confirm(confirmMessage, {
		confirmButtonText,
		cancelButtonText: tt('CANCEL'),
		type: 'warning',
	}).then(() => action({ data: { ids } }).then(refetchItemsList));
};

const handleInWorkItems = () => {
	confirmSelectedStatusAction({
		confirmButtonText: tt('phrases.In_Work'),
		confirmMessage: `${tt('phrases.this_will_set_in_work_status_to_selected_workorders')}. ${tt('Continue')}?`,
		action: setInWorkWorkOrders,
	});
};
const handleCompleteItems = () => {
	confirmSelectedStatusAction({
		confirmButtonText: tt('Complete'),
		confirmMessage: `${tt('phrases.this_will_complete_selected_workorders')}. ${tt('Continue')}?`,
		action: completeWorkOrders,
	});
};
const handleCloseItems = () => {
	confirmSelectedStatusAction({
		confirmButtonText: tt('Close'),
		confirmMessage: `${tt('phrases.this_will_close_selected_workorders')}. ${tt('Continue')}?`,
		action: closeWorkOrders,
	});
};
const handleExportToExcel = () => {
	if (!globalFilters.value?.plantId) {
		ElNotification.warning({ message: tt('phrases.select_plant_first') });
		return;
	}

	exportMaintenanceLogToExcel({
		...filters.value,
		...propsFiltersRef.value,
		plantId: globalFilters.value.plantId,
	});
};

const handleShowDetails = ({ row }) => {
	emit('event', {
		eventName: 'handleShowDetails',
		data: { row },
		onward: true,
	});
};

const handleCreateLog = ({ row }) => {
	createItem({
		modal_settings: {
			title: tt('phrases.Create_Maintenance_log'),
			formSettings: {
				parent_id: row.id,
				production_line_id: row.production_line_id,
				machine_id: row.machine_id,
				asset_id: row.asset_id,
				equipment_id: row.equipment_id,
				status: row.status,
			},
			settings: {
				parentOrderData: row,
			},
			additionalModalSettings: {
				disableTabs: !hasAccessToCreate.value,
				switchTabTo: { key: 'item_type', value: MAINTENANCE_TYPES.LOG },
				plantId: row.plant_id,
				...propsFiltersRef.value,
			},
		},
	});
};

const handleShowDetailsPreview = ({ row }) => {
	const headerActions = translate([
		{
			name: 'handlePrintWO',
			type: 'transparent',
			icon: 'icomoon icon-printer',
			tooltip_text: 'Print',
		},
	], { key: 'tooltip_text' });

	if (hasAccessToEdit.value && !row.has_trashed_entities) {
		headerActions.push(...translate([
			{
				name: 'editItem',
				type: 'transparent',
				icon: 'icomoon icon-pencil',
				tooltip_text: 'Edit',
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
	if (row.is_closed && hasAccessToDelete.value) {
		footerActions.push({
			name: 'handleUnlockWorkOrder',
			button_text: tt('UNLOCK'),
			disablePopover: true,
			type: 'primary',
		});
	}

	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: row,
		formComponentFileLoader: () => import('./ItemDetailsPreview.vue'),
		title: `${tt('Work_Order')} ${tt('Details')}`,
		hideFooter: !footerActions.length,
		hideSubmitButtons: true,
		settings: {},
		itemName: tt('Work_Order'),
		headerActions,
		footerActions,
		additionalModalSettings: {
			productionLinesList: productionLinesList.value,
		},
		callback: refetchItemsList,
	});
};

const handleShowLog = ({ order, log }) => {
	const headerActions = [];
	if (hasAccessToEdit.value) {
		headerActions.push(...translate([{ ...standardTableOperations.edit, type: 'transparent', name: 'editLogFromWOList' }], { key: 'tooltip_text' }));
	}

	const footerActions = [];
	if (hasAccessToCreate.value && hasAccessToEdit.value) {
		footerActions.push({
			name: 'handleCreateRequest',
			button_text: tt('phrases.CREATE_WORK_ORDER_REQUEST'),
			disablePopover: true,
			type: 'primary',
			className: 'item-action-button',
			parentLog: log,
		});
	}

	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		instanceData: log,
		formComponentFileLoader: () => import('../Logs/ItemDetailsPreview.vue'),
		title: `${tt('Maintenance_Log')} ${tt('Details')}`,
		hideFooter: !footerActions.length,
		hideSubmitButtons: true,
		settings: {
			showJustInfo: true,
			parentOrderData: order,
		},
		itemName: tt('Maintenance_Log'),
		headerActions,
		footerActions,
		additionalModalSettings: {
			plantId: order.plant_id,
			parentWO: order,
			maintenanceReasonTypesList: maintenanceReasonTypesList(),
			productionLinesList: productionLinesList.value,
			taskProcedure: order.taskProcedure,
			...propsFiltersRef.value,
		},
	});
};

const deleteWorkOrders = ({ row, ids, with_siblings: withSiblings } = {}) => {
	const deleteIds = row?.id ? [row.id] : (ids?.length ? ids : getSelectedIds());
	if (!deleteIds.length) return Promise.resolve();

	return ElMessageBox.confirm(
		`${tt('phrases.this_will_permanently_delete_selected')} ${itemsName.value.mult}. ${tt('Continue')}?`,
		{
			confirmButtonText: tt('Delete'),
			cancelButtonText: tt('CANCEL'),
			type: 'warning',
		},
	).then(() =>
		api_request.delete('/maintenance', {
			data: {
				ids: deleteIds,
				...(withSiblings ? { with_siblings: true } : {}),
			},
			itemName: itemsName.value.one,
		}).then(refetchItemsList)
	);
};

const handleDeleteWorkOrders = (payload = {}) => {
	if (payload?.row?.is_periodic) {
		ElMessageBox.confirm(
			`${tt('phrases.apply_this_action_to_all_reccurring_orders_or_only_this_one')}?`,
			{
				confirmButtonText: tt('phrases.To_all'),
				cancelButtonText: tt('phrases.only_this_one'),
				type: 'warning',
				distinguishCancelAndClose: true,
			},
		)
			.then(() => deleteWorkOrders({ ...payload, with_siblings: true }))
			.catch((action) => {
				if (action === 'cancel') deleteWorkOrders(payload);
			});
		return;
	}

	deleteWorkOrders(payload);
};

const { initiateRequestsToDoList } = useRequestsList({
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
			{
				actionName: 'fetch_maintenance_categories',
				localProp: maintenanceCategoriesList,
				localLoadProp: maintenanceCategoriesLoading,
			},
		])
	),
});
initiateRequestsToDoList.value = false;

const toggleFilterbar = (event) => {
	dropdownFilterbarRef.value?.toggleFilterbar?.(event);
	initiateRequestsToDoList.value = true;
	showFilterbar.value = !showFilterbar.value;
};

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	createItemCheckPlant,
	editItem,
	handleDeleteItems,
	handleDeleteWorkOrders,
	changeStatusOperation,
	handleInWorkItems,
	handleCompleteItems,
	handleCloseItems,
	handleShowDetails,
	handleShowDetailsPreview,
	handleCreateLog,
	handleShowLog,
	toggleFilterbar,
});
</script>
