<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<SimpleSpinner :active="exportingInProgress" />

					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:actionButtons="actionButtons"
						searchbarClass="ml-auto"
						@event="handleEvent"
					/>

					<CustomDataListTable
						ref="itemsTableRef"
						disableSelection
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
						@setFilters="setFilters"
					/>
				</div>
			</div>
		</div>

		<el-dialog
			v-model="deleteControllerDialogOpen"
			append-to-body
			center
			class="small dialog-decorate-header"
			:title="`${tt('Delete')} ${tt('Controller')}`"
		>
			<div v-if="deletingController" class="deleting-controller-dialog">
				<div class="content-row text-center">
					<div v-text="`${tt('Controller')} '${deletingController.name}'`"></div>
					<div v-text="`${tt('has')} ${deletingController.sensors_count} ${tt('phrases.devices_attached_to_it')}.`"></div>
					<div v-text="`${tt('phrases.Would_you_like_to_delete_it_anyway')}?`"></div>
					<div v-html="`${tt('phrases.Please_type')} <b>'delete'</b> ${tt('phrases.to_confirm')}.`"></div>
				</div>
				<div class="content-row">
					<CustomInput
						v-model="deletingConfirmQuery"
						:placeholder="tt('phrases.Type_delete_here')"
						className="placeholder-lowercase"
					/>
				</div>
			</div>

			<template #footer>
				<div class="dialog-footer section-row text-center">
					<el-button @click="deleteControllerDialogOpen = false">
						{{ tt('Cancel') }}
					</el-button>

					<el-button
						type="primary"
						class="capitalize"
						@click="handleConfirmDelete"
					>
						OK
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage, ElMessageBox } from 'element-plus';

import { api_request } from '@/api/request_provider';
import { ENTITIES } from '@/config/entities';
import { CONTROLLER_CONNECTION_TYPES, CONTROLLER_TYPES, controller_offline_icon, rebase_lines, rebase_wheel } from '@/constants/global';
import { standardTableOperations } from '@/constants/table';
import { setupGetParamsStr } from '@/utils/url-helpers';
import { Lang } from '@/localization';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { useControllersStore } from '@/stores/ControllersStore';

import Filterbar from '@/components/common/Filterbar.vue';
import SimpleSpinner from '@/components/common/SimpleSpinner.vue';
import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';

const { tt, translate } = Lang;

defineOptions({
	name: 'ControllersList',
});

const itemsTableRef = ref(null);
const exportingInProgress = ref(false);
const deleteControllerDialogOpen = ref(false);
const deletingController = ref(null);
const deletingConfirmQuery = ref('');

const authStore = useAuthStore();
const controllersStore = useControllersStore();
const { filters } = storeToRefs(controllersStore);
const { changeRoute } = useNavigation();

const controllersEntity = ENTITIES.Controllers;

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, deleteItem, prepareFilters } = useItemsData({
	entityKey: 'Controllers',
	itemStore: controllersStore,
	options: {
		tableRef: itemsTableRef,
		localCreateItem: ({ path } = {}) => {
			changeRoute({ path: `${controllersEntity.routeBase}${path || '/new'}` });
		},
	},
});

const hasAccessToCreate = computed(() => authStore.hasAccessTo([controllersEntity.permissions.create]));

const actionButtons = computed(() => {
	if (!hasAccessToCreate.value) return [];

	return translate([
		{
			id: 1,
			text: 'PDM',
			event: 'createItem',
			args: { path: `/new?type=${CONTROLLER_TYPES.BANNER}` },
			permissions: [controllersEntity.permissions.create],
		},
		{
			id: 2,
			text: 'Lubematrix',
			event: 'createItem',
			args: { path: `/new?type=${CONTROLLER_TYPES.ULTRA_SOUND}` },
			permissions: [controllersEntity.permissions.create],
		},
		{
			id: 3,
			text: 'sidebar_menu.OEE',
			event: 'createItem',
			args: { path: `/new?type=${CONTROLLER_TYPES.COUNTER}` },
			permissions: [controllersEntity.permissions.create],
		},
		{
			id: 6,
			text: 'NCD',
			event: 'createItem',
			args: { path: `/new?type=${CONTROLLER_TYPES.NCD}` },
			permissions: [controllersEntity.permissions.create],
		},
		{
			id: 5,
			text: 'Export',
			event: 'handleExport',
			without_icon: true,
			className: 'inverted',
		},
	], { key: 'text' });
});

const setupStatusCell = (isInactive) => {
	if (!isInactive) return ' ';

	return `<span class="table-cell-icon controller-offline-icon">
		<img src="${controller_offline_icon}" />
	</span>`;
};

const tableSettings = computed(() =>
	Object.freeze({
		columns: translate([
			{ prop: 'name', label: 'Name', sortable: true, min_width: 110 },
			{
				prop: 'company.name',
				label: 'Company',
				sortable: true,
				min_width: 110,
				meta: { sortBy: 'company' },
			},
			{
				prop: 'plant.name',
				label: 'Plant',
				sortable: true,
				min_width: 110,
				meta: { sortBy: 'plant' },
			},
			{ prop: 'mac_address', label: 'MAC_Address', max_width: 200 },
			{
				label: '',
				prop: 'is_inactive',
				width: 55,
				conditionSettings: {
					conditions: [{ prop: 'type', control_value: CONTROLLER_TYPES.NCD }],
				},
				meta: {
					cell_class: 'text-center',
					prepareValue: { localMethod: setupStatusCell },
				},
			},
		]),
		operations: {
			actions: translate([
				{
					name: 'handleMultipleFFT',
					icon: 'icomoon icon-fft',
					tooltip_text: 'fft',
					conditionSettings: {
						conditions: [
							{
								prop: 'type',
								method: '==',
								control_value: CONTROLLER_TYPES.BANNER,
							},
						],
					},
				},
				{
					name: 'handleMultipleRebaseline',
					tooltip_text: 'rebaseline',
					className: 'rebaselineButton',
					img: rebase_wheel,
					second_img: rebase_lines,
					conditionSettings: {
						conditions: [
							{
								prop: 'type',
								array_method: 'some',
								control_value: [CONTROLLER_TYPES.BANNER, CONTROLLER_TYPES.NCD],
							},
						],
					},
				},
				{
					name: 'reconnect',
					type: 'info',
					icon: 'icomoon icon-reboot',
					tooltip_text: 'Reconnect',
					conditionSettings: {
						conditions: [
							{
								prop: 'connection_type',
								method: '==',
								control_value: CONTROLLER_CONNECTION_TYPES.MULTIHOP,
							},
						],
					},
				},
				{
					name: 'showSensors',
					type: 'success',
					icon: 'icomoon icon-eye',
					tooltip_text: 'phrases.View_Sensors',
					conditionSettings: {
						conditions: [
							{
								prop: 'type',
								method: '==',
								control_value: CONTROLLER_TYPES.NCD,
							},
						],
					},
				},
				standardTableOperations.edit,
				{
					name: 'handleDeleteItemsLocal',
					type: 'danger',
					icon: 'icomoon icon-cross',
					tooltip_text: 'Delete',
				},
			], { key: 'tooltip_text' }),
		},
	})
);

const handleExport = () => {
	const params = prepareFilters(filters.value || {});
	const url = setupGetParamsStr(`${import.meta.env.VITE_API_BASE_URL || 'https://api.testmatrix.assetmatrix.com/api'}/controllers/export`, {
		...params,
		token: authStore.access_token,
	});

	if (!url) return;

	exportingInProgress.value = true;
	const link = document.createElement('a');
	link.href = url;
	link.target = '_blank';
	link.click();
	exportingInProgress.value = false;
};

const getConfirmMessage = ({ row, title }) =>
	`${tt('phrases.Do_you_really_want_to')} ${tt('phrases.do_this_action_for')} "${row[title] || row.name || row.title}". ${tt('Continue')}?`;

const showSensors = ({ row }) => {
	changeRoute({ path: `/ncd-sensors?controllerId=${row.id}` });
};

const handleDeleteItemsLocal = (data) => {
	const { row } = data;

	if (row.sensors_count > 0) {
		deletingController.value = row;
		deletingConfirmQuery.value = '';
		deleteControllerDialogOpen.value = true;
		return;
	}

	deleteItem({ ids: [row.id] });
};

const handleConfirmDelete = () => {
	if (deletingConfirmQuery.value !== 'delete') {
		ElMessage({
			type: 'warning',
			message: tt('phrases.Please_type_delete_to_confirm'),
		});
		return;
	}

	deleteItem({ ids: [deletingController.value.id] });
	deleteControllerDialogOpen.value = false;
};

const handleMultipleFFT = ({ row }) => {
	ElMessageBox.confirm(`${tt('aliases.mult_fft_confirm')} <b>${row.name}</b>?`, {
		dangerouslyUseHTMLString: true,
	})
		.then(() =>
			api_request.post(`/controllers/fft/${row.id}/group`, {
				resultMessage: {
					text: `${tt('controller')} ${tt('phrases.multiple_fft')} ${tt('success')}`,
				},
			})
		)
		.catch(() => {});
};

const handleMultipleRebaseline = ({ row }) => {
	ElMessageBox.confirm(`${tt('aliases.mult_rebaseline_confirm')} <b>${row.name}</b>?`, {
		dangerouslyUseHTMLString: true,
	})
		.then(() =>
			api_request.put('/sensors/rebaseline', {
				data: {
					controller_id: row.id,
				},
				resultMessage: {
					text: `${tt('rebaseline')} ${tt('phrases.for_sensors_on_controller')} ${row.name} ${tt('started')}`,
				},
			})
		)
		.catch(() => {});
};

const submitControllerAction = ({ actionName, row }) => {
	let formData = {};
	let resultMessage;

	switch (actionName) {
		case 'reconnect':
			formData = { is_reconnect: true };
			resultMessage = {
				text: `${tt('controller')} ${tt('reconnection')} ${tt('success')}`,
			};
			break;
		default:
			return;
	}

	api_request.put(`/controllers/${row.id}/cmd`, {
		data: formData,
		resultMessage,
	});
};

const reconnect = (rowData) => {
	ElMessageBox.confirm(getConfirmMessage(rowData))
		.then(() => {
			submitControllerAction({ actionName: 'reconnect', row: rowData.row });
		})
		.catch(() => {});
};

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	handleExport,
	handleDeleteItemsLocal,
	handleConfirmDelete,
	handleMultipleFFT,
	handleMultipleRebaseline,
	reconnect,
	showSensors,
};

const { handleEvent } = useEventHandler(methodsMap);
</script>
