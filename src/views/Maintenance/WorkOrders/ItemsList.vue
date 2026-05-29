<template>
	<div class="view-list-wrapper work-orders-list">
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
					<div v-if="changeStatusOperationsList.length" class="change-wo-status-selector">
						<CustomSelectV2
							className="el-button el-button--primary inverted item-action-button"
							:optionsList="changeStatusOperationsList"
							idKey="label"
							labelKey="label"
							valueKey="actionName"
							:prefixText="tt('phrases.Change_Status')"
							@change="changeStatusOperation"
						/>
					</div>

					<div class="filter-item ml-auto">
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
							icon="icomoon icon-doc_xls"
							class="action-button inverted"
							native-type="button"
							@click="handleExportToExcel"
						/>
					</div>

					<div class="filter-item">
						<SearchBar :query="filters.q" clearable @submit="setFilters" />
					</div>
				</Filterbar>

				<DropdownFilterbar
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
										:value="filters.stage"
										@change="(id) => setFilters({ stage: id })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										clearable
										:optionsList="woFrequencyTypesList"
										:placeholder="tt('Frequency')"
										:value="filters.frequency"
										@change="(id) => setFilters({ frequency: id })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										multiple
										collapse-tags
										clearable
										:optionsList="workOrdersStatusesList"
										:placeholder="tt('Status')"
										:value="filters.status"
										@change="(ids) => setFilters({ status: ids })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										filterable
										clearable
										:optionsLoading="maintenanceCategoriesLoading"
										:optionsList="maintenanceCategoriesFiltersList"
										:placeholder="tt('Work_Order_Type')"
										:value="filters.categoryId"
										@change="(id) => setFilters({ categoryId: id, withoutCategory: id === 0 ? true : null })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-2">
									<CustomSelectV2
										filterable
										clearable
										:optionsLoading="productionLinesLoading"
										:optionsList="productionLinesList"
										:placeholder="tt('production_line')"
										:value="filters.productionLineId"
										@change="(id) => setFilters({ productionLineId: id, machineId: null, assetId: null, equipmentId: null })"
									/>
								</div>

								<div class="filter-item mcol-xs-6 mcol-sm-1">
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

								<div class="filter-item mcol-xs-6 mcol-sm-1">
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

								<div class="filter-item mcol-xs-6 mcol-sm-2">
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
							</div>
						</div>
					</div>
				</DropdownFilterbar>

				<CustomDataListTable
					ref="itemsTableRef"
					alwaysShowOperations
					:disableSelection="!hasBulkAccess"
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
	WORK_ORDER_STATUSES_TYPES,
	maintenanceTypesList,
	woFrequencyTypesList as getWoFrequencyTypesList,
	woStageTypesList as getWoStageTypesList,
	workOrdersStatusesList as getWorkOrdersStatusesList,
} from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { cleanDateString, findItemBy, getTimeDifference, getWOStatus, setupAssignedUsers } from '@/helpers';
import { Lang } from '@/localization';
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
import DropdownFilterbar from '@/components/common/DropdownFilterbar.vue';
import SearchBar from '@/components/common/SearchBar.vue';
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
	usersList: { type: Array, default: () => [] },
	usersLoading: Boolean,
	hideDatepicker: Boolean,
	fromPlantDashboard: Boolean,
	propsFilters: { type: Object, default: () => ({}) },
});

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const maintenanceStore = useMaintenanceStore();
const { globalFilters } = storeToRefs(globalStore);
const { filters_wo: filters } = storeToRefs(maintenanceStore);
const {
	setInWorkWorkOrders,
	completeWorkOrders,
	closeWorkOrders,
	closeWorkOrder,
	exportMaintenanceLogToExcel,
} = useMaintenance();

const itemsTableRef = ref(null);
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
const propsFiltersRef = computed(() => ({
	type: MAINTENANCE_TYPES.WORK_ORDER,
	...props.propsFilters,
}));
const itemsNameRef = computed(() => {
	const item = findItemBy('id', propsFiltersRef.value.type, maintenanceTypesList());
	return Object.freeze({
		one: tt(item?.label || 'Work_Order'),
		mult: tt(item?.label || 'Work_Orders'),
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
		buttons.push({ id: 2, text: 'Delete', event: 'handleDeleteWorkOrders', isDelete: true });
	}
	return Object.freeze(translate(buttons, { key: 'text' }));
});

const changeStatusOperationsList = computed(() =>
	Object.freeze(
		translate([
			{ label: 'phrases.Set_In_Work', actionName: 'setInWorkSelected' },
			{ label: 'Complete', actionName: 'completeSelected' },
			{ label: 'Close', actionName: 'closeSelected' },
		], { key: 'label' }),
	)
);

const tableSettings = computed(() => {
	const settings = {
		tableClass: 'maintenance-table',
		columns: translate([
			{ label: 'WO', label_postfix: '#', prop: 'serial_number', width: 80 },
			{ label: 'Date', prop: 'created_at', sortable: true, min_width: 120, meta: { prepareValue: { localMethod: cleanDateString } } },
			{ label: 'Due_Date', prop: 'finish_date', sortable: true, min_width: 120, meta: { prepareValue: { localMethod: setupTotalDays, useAllInstanceData: true } } },
			{ label: 'Status', prop: 'status', width: 120, meta: { prepareValue: { localMethod: getWOStatus } } },
			{ label: 'phrases.Machine_name', prop: 'machine.name', min_width: 110, meta: { sortBy: 'company' } },
			{ label: 'phrases.WO_Name', prop: 'title', sortable: true, min_width: 120 },
			{ label: 'phrases.Required_items', prop: 'parts', min_width: 120, meta: { prepareValue: { localMethod: setupRequiredItems, useAllInstanceData: true } } },
			{ label: 'Assigned', prop: 'mock', min_width: 120, meta: { prepareValue: { localMethod: setupAssignedUsers, useAllInstanceData: true, args: { usersList: props.usersList, max: 1 } } } },
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

	if (hasAccessToEdit.value) {
		settings.operations.actions.push(
			{
				name: 'closeSingleWorkOrder',
				type: 'warning',
				icon: 'icomoon icon-check',
				tooltip_text: 'Close',
				conditionSettings: {
					conditions: [{ prop: 'status', method: '!=', control_value: WORK_ORDER_STATUSES_TYPES.CLOSED }],
				},
			},
			standardTableOperations.edit,
		);
	}
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
		setInWorkSelected,
		completeSelected,
		closeSelected,
	};
	handlers[actionName]?.();
};
const setInWorkSelected = () => {
	const ids = getSelectedIds();
	if (ids.length) setInWorkWorkOrders({ data: { ids } }).then(refetchItemsList);
};
const completeSelected = () => {
	const ids = getSelectedIds();
	if (ids.length) completeWorkOrders({ data: { ids } }).then(refetchItemsList);
};
const closeSelected = () => {
	const ids = getSelectedIds();
	if (ids.length) closeWorkOrders({ data: { ids } }).then(refetchItemsList);
};
const closeSingleWorkOrder = ({ row }) => {
	closeWorkOrder({ itemId: row.id }).then(refetchItemsList);
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
	editItem({ row });
};

const handleShowDetailsPreview = ({ row }) => {
	editItem({
		row,
		modal_settings: {
			componentPath: 'Maintenance/WorkOrders/ItemDetailsPreview',
			title: `${tt('Work_Order')} ${tt('Details')}`,
			hideFooter: true,
			hideSubmitButtons: true,
			settings: {},
			itemName: tt('Work_Order'),
			headerActions: [],
			footerActions: [],
		},
	});
};

const handleDeleteWorkOrders = (payload) => handleDeleteItems(payload);

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
			{
				actionName: 'fetch_maintenance_categories',
				localProp: maintenanceCategoriesList,
				localLoadProp: maintenanceCategoriesLoading,
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
	handleDeleteWorkOrders,
	changeStatusOperation,
	closeSingleWorkOrder,
	handleShowDetails,
	handleShowDetailsPreview,
});
</script>
