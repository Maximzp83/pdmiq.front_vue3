<template>
	<div class="view-list-wrapper">
		<div class="card-content">
			<Filterbar
				:itemsLoading="itemsLoading"
				:filters="filters"
				:itemsName="itemsName"
				:actionButtons="actionButtons"
				hideSearchbar
				hideCreate
				hideDelete
				@event="handleEvent"
			>
				<template #middle>
					<div class="filter-item radio-buttons-wrapper fluid flex align-center mrow">
						<RadioButtonsBlock
							:model-value="activeRadioFilter"
							:settings="radioBlockOptions"
							:optionsList="radioButtonsList"
							@update:model-value="handleRadioFilters"
							@onChange="handleRadioFilters"
						/>
					</div>

					<div class="ml-auto filter-item">
						<CustomSelectV2
							:model-value="filters.category"
							filterable
							clearable
							:optionsList="requisitionCategoriesListOptions"
							:placeholder="tt('Category')"
							@update:model-value="(id) => setFilters({ category: id })"
						/>
					</div>

					<div class="filter-item export-buttons">
						<el-button
							type="success"
							class="inverted"
							size="small"
							native-type="button"
							@click="showExportDateRangeFilter = true"
						>
							<i class="icomoon icon-doc_xls"></i>
						</el-button>
					</div>

					<div v-show="showExportDateRangeFilter" class="filter-item text-right">
						<div class="flex mrow align-center exporting-item">
							<Datepicker v-model="exportDaterange" enableShortcuts type="daterange" />
							<el-button
								type="danger"
								size="small"
								native-type="button"
								:loading="exportingInProgress"
								@click="showExportDateRangeFilter = false"
							>
								<i class="icomoon icon-cross"></i>
							</el-button>
							<el-button
								type="success"
								size="small"
								native-type="button"
								:loading="exportingInProgress"
								@click="handleExportToExcel"
							>
								<i class="icomoon icon-check"></i>
							</el-button>
						</div>
					</div>
				</template>
			</Filterbar>

			<CustomDataListTable
				ref="itemsTableRef"
				disableSelection
				alwaysShowOperations
				:itemsLoading="itemsLoading"
				:tableData="itemsList"
				:tableSettings="tableSettings"
				:itemsName="itemsName"
				@event="handleEvent"
			/>

			<PaginationContainer :itemsName="itemsName" :filters="filters" :meta="meta" @setFilters="setFilters" />
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';

import {
	REQUISITION_STATUSES_TYPES,
	USER_ROLES_TYPES,
	requisitionCategoriesList,
	requisitionStatusesList,
} from '@/constants/global';
import { cleanDateString, formatTime, getWOStatus, prepareRangeParams } from '@/helpers';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { usePlantRequisitionsStore } from '@/stores/PlantRequisitionsStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { usePlantRequisitions } from '@/composables/usePlantRequisitions';

import Filterbar from '@/components/common/Filterbar.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import RadioButtonsBlock from '@/components/form/RadioButtonsBlock.vue';
import Datepicker from '@/components/common/Datepicker.vue';

const { tt, translate } = Lang;

defineOptions({ name: 'RequisitionsItemsList' });

const props = defineProps({
	pageType: { type: Object, default: () => ({}) },
	usersList: { type: Array, default: () => [] },
	filters: { type: Object, default: null },
	preventSetNavbar: Boolean,
});
const emit = defineEmits(['event']);

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const requisitionsStore = usePlantRequisitionsStore();
const { filters } = storeToRefs(requisitionsStore);
const { globalFilters } = storeToRefs(globalStore);
const { changeRoute } = useNavigation();
const {
	unapproveRequisition,
	holdOnRequisition,
	deleteRequisition,
	exportRequisitionsToExcel,
} = usePlantRequisitions();

const itemsTableRef = ref(null);
const showExportDateRangeFilter = ref(false);
const exportDaterange = ref([]);
const exportingInProgress = ref(false);

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_requisitions']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_requisitions']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_requisitions']));
const requisitionCategoriesListOptions = computed(() => Object.freeze(requisitionCategoriesList()));

const {
	itemsList,
	itemsLoading,
	itemsName,
	meta,
	setFilters,
	refetchItemsList,
	handleDeleteItems,
} = useItemsData({
	entityKey: 'Requisitions',
	itemStore: requisitionsStore,
	options: {
		tableRef: itemsTableRef,
		predefinedFilters: { daterange: [], technicians: [] },
		localDeleteItems: (payload) => handleDeleteRequisition(payload?.row?.id),
	},
});

const actionButtons = computed(() => {
	if (props.pageType.isRequisitionsPage && hasAccessToCreate.value) {
		return Object.freeze([
			{
				id: 1,
				text: `${tt('Create')} ${tt('phrases.Requisition_Form')}`,
				event: 'createRequisition',
			},
		]);
	}
	return Object.freeze([]);
});
const radioBlockOptions = computed(() =>
	Object.freeze({
		title: tt('status'),
		inline: true,
		hideTitle: true,
		buttonType: 'default',
		className: 'secondary',
	}),
);
const radioButtonsList = computed(() =>
	Object.freeze([
		{ id: undefined, title: tt('All') },
		...requisitionStatusesList().map((item) => ({ id: item.id, title: item.label })),
	]),
);
const activeRadioFilter = computed(() => {
	if (filters.value?.onHold) return REQUISITION_STATUSES_TYPES.ON_HOLD;
	return filters.value?.status ?? undefined;
});

const tableSettings = computed(() => {
	const actions = [];

	if (props.pageType.isWOAssignedPage && hasAccessToEdit.value) {
		actions.push(
			{
				name: 'handleHoldOn',
				type: 'info',
				button_text: 'On_Hold',
				disablePopover: true,
				className: 'width-auto',
				conditionSettings: {
					checkMethod: 'every',
					conditions: [
						{ prop: 'status', method: '!=', control_value: REQUISITION_STATUSES_TYPES.COMPLETED },
						{ prop: 'is_on_hold', control_value: false },
					],
				},
			},
			{
				name: 'handleHoldOn',
				type: 'info',
				button_text: 'Off_Hold',
				disablePopover: true,
				className: 'width-auto',
				conditionSettings: {
					checkMethod: 'every',
					conditions: [
						{ prop: 'status', method: '!=', control_value: REQUISITION_STATUSES_TYPES.COMPLETED },
						{ prop: 'is_on_hold', control_value: true },
					],
				},
			},
			{
				name: 'handleUnapprove',
				type: 'success',
				icon: 'icomoon icon-lock2',
				className: 'inverted',
				tooltip_text: 'Unapprove',
				conditionSettings: {
					conditions: [
						{ prop: 'can_change_requisition', method: '==', control_value: false },
						{ prop: 'status', method: '==', control_value: REQUISITION_STATUSES_TYPES.APPROVED },
					],
				},
			},
		);
	}

	actions.push(
		{ name: 'handleShowDetails', type: 'success', icon: 'icomoon icon-docs', tooltip_text: 'Details' },
		{ name: 'handleGotoDetails', type: 'success', icon: 'icomoon icon-eye', tooltip_text: 'phrases.Open_Details' },
	);

	if (hasAccessToDelete.value) {
		actions.push({
			...standardTableOperations.delete,
			conditionSettings: {
				checkMethod: 'some',
				conditions: [
					{
						controlObj: authStore.authUser?.role,
						array_method: 'some',
						prop: 'type',
						control_value: [USER_ROLES_TYPES.INDUSTRIAL_MATRIX, USER_ROLES_TYPES.DEVELOPER],
					},
					{ controlObj: authStore.authUser?.role, prop: 'is_fab_shop_manager', control_value: true },
					{
						controlObj: authStore.authUser?.role,
						prop: 'is_requisitioner',
						control_value: true,
						next_conditions: [
							{ prop: 'requisition_user_id', control_value: authStore.authUser?.id },
							{ prop: 'status', control_value: REQUISITION_STATUSES_TYPES.PENDING },
						],
					},
				],
			},
		});
	}

	return Object.freeze({
		tableClass: 'bolded-cells requisitions-table',
		columns: translate([
			{ prop: 'id', label: 'WO', label_postfix: '#', width: 60 },
			{
				prop: 'created_at',
				label: 'phrases.Date_Sent',
				width: 105,
				sortable: true,
				meta: { prepareValue: { localMethod: cleanDateString, args: { withoutTime: true } } },
			},
			{
				prop: 'complete_at',
				label: 'phrases.Requested_Date',
				width: 105,
				sortable: true,
				meta: { prepareValue: { localMethod: cleanDateString } },
			},
			{ prop: 'estimated_started_at', label: 'phrases.Estimated_Start_Date', width: 105, sortable: true },
			{ prop: 'estimated_finished_at', label: 'phrases.Estimated_Completion_Date', width: 105, sortable: true },
			{ prop: 'requisitionPlant.name', label: 'Requisition_Plant', width: 160, sortable: true },
			{ prop: 'requisition_details', label: 'Details', min_width: 150, meta: { cell_class: 'ellipsis' } },
			{ prop: 'technicians', label: 'Assigned', min_width: 200, meta: { fromArray: { subProp: 'full_name', delimeter: ', ' } } },
			{ label: 'PO', label_postfix: '#', prop: 'po_number' },
			{ prop: 'status', label: 'Status', width: 120, meta: { prepareValue: { localMethod: getWOStatus, args: { list: requisitionStatusesList() } } } },
			{ prop: 'actual_time', label: 'Hours', width: 90, meta: { prepareValue: { localMethod: formatTime, args: 'h:m' } } },
			{ prop: 'proposed_cost', label: 'Budget', width: 70 },
			{ prop: 'actual_cost', label: 'Fab_Shop_Budget', width: 82 },
			{ label: 'phrases.Running_Total_Materials', prop: 'execution_materials_cost', width: 70 },
			{ label: 'phrases.Running_Total_Hours', prop: 'execution_total_time', width: 70 },
			{ label: 'Categories', prop: 'category', min_width: 180, meta: { getItemValue: { prop: 'name', list: requisitionCategoriesListOptions.value } } },
		]),
		operations: {
			actions: translate(translate(actions, { key: 'tooltip_text' }), { key: 'button_text' }),
		},
	});
});

const createRequisition = () => {
	globalStore.show_edit_modal({
		show: true,
		editModalProp: 'editModalClassic',
		formComponentFileLoader: () => import('./ItemForm.vue'),
		itemName: itemsName.value.one,
		title: `${tt('Create')} ${tt('phrases.Requisition_Form')}`,
		className: 'maintenance-modal',
		modalClassName: 'fixed-header-footer small-header small-footer',
		successSubmitOptions: {
			refetchItemsList,
			closeModal: true,
		},
	});
};
const handleShowDetails = ({ row }) => emit('event', 'handleShowDetails', { row });
const handleGotoDetails = ({ row }) => changeRoute({ path: `/requisitions/${row.id}` });
const handleRadioFilters = (value) => {
	if (value === REQUISITION_STATUSES_TYPES.ON_HOLD) {
		setFilters({ status: null, onHold: true });
		return;
	}
	setFilters({ status: value, onHold: null });
};
const confirmAction = (message) =>
	ElMessageBox.confirm(message, { confirmButtonText: tt('OK'), cancelButtonText: tt('CANCEL'), type: 'warning' });
const handleUnapprove = ({ row }) =>
	confirmAction(`${tt('Unapprove')} ${tt('phrases.this_order')}?`).then(() =>
		unapproveRequisition({ itemId: row.id }).then(refetchItemsList),
	);
const handleHoldOn = ({ row }) =>
	confirmAction(`${row.is_on_hold ? tt('Off_Hold') : tt('On_Hold')} ${tt('phrases.this_order')}?`).then(() =>
		holdOnRequisition({ itemId: row.id, data: { enable: !row.is_on_hold } }).then(refetchItemsList),
	);
const handleDeleteRequisition = (id) => {
	if (!id) return handleDeleteItems();
	return confirmAction(`${tt('phrases.Do_you_really_want_to')} ${tt('phrases.delete_this_requisition')}?`).then(() =>
		deleteRequisition({ data: { ids: [id] } }).then(refetchItemsList),
	);
};
const closeDialog = () => globalStore.show_edit_modal({ show: false, editModalProp: 'editModalClassic' });
const successModalSubmit = () => {
	closeDialog();
	refetchItemsList();
};
const handleExportToExcel = () => {
	exportingInProgress.value = true;
	const params = {
		...globalFilters.value,
		...filters.value,
		...(exportDaterange.value?.length ? prepareRangeParams(exportDaterange.value) : {}),
	};
	exportRequisitionsToExcel(params).finally(() => {
		exportingInProgress.value = false;
		showExportDateRangeFilter.value = false;
	});
};

watch(
	() => props.filters,
	(newFilters) => {
		if (!newFilters || !Object.keys(newFilters).length) return;
		setFilters({ ...newFilters });
	},
	{ immediate: true },
);

const { handleEvent } = useEventHandler({
	createRequisition,
	handleShowDetails,
	handleGotoDetails,
	handleRadioFilters,
	handleUnapprove,
	handleHoldOn,
	handleDeleteItems: handleDeleteRequisition,
	handleDeleteRequisition,
	closeDialog,
	successModalSubmit,
	setFilters,
});
</script>
