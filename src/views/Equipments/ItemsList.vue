<template>
	<div class="view-wrapper view-list-wrapper equipments-list pt-0">
		<div :class="[{ card: !fromLayout }, 'content-row', { 'view-content-card': !fromDetailsPage }]">
			<div :class="['relative', { 'card-content': !fromLayout }, { 'dragndrop-active': !draggingLockedProp }]">
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

		<el-dialog
			v-model="showShotsCounterDialog"
			center
			:title="tt('phrases.cycles_counter')"
			:append-to-body="true"
			class="small report-item-dialog"
		>
			<ShotsCounterForm
				v-if="showShotsCounterDialog && shotsCounterData"
				:shotsCounterData="shotsCounterData"
				:visible="showShotsCounterDialog"
				@closeDialog="showShotsCounterDialog = false"
				@success="shotsCounterUpdated"
			/>
		</el-dialog>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { api_request } from '@/api/request_provider';
import { FFT_LOCK_STATUSES, SUBJECT_TYPES } from '@/constants/global';
import {
	LUBE_CYCLE_STATUSES,
	LUBE_PROCESSING_STATUSES,
} from '@/constants/ultrasound';
import { ITEMS_GRID_TYPES, standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { getValues } from '@/helpers';
import { useAuthStore } from '@/stores/AuthStore';
import { useEquipmentsStore } from '@/stores/EquipmentsStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useActionButtons } from '@/composables/mixins/useActionButtons';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useDashboardListsReorder } from '@/composables/mixins/useDashboardListsReorder';
import { useDragNdropSortable } from '@/composables/mixins/useDragNdropSortable';
import { useWebSocket } from '@/composables/mixins/useWebSocket';
import { useNotify } from '@/composables/useNotify';
import { useSensors } from '@/composables/useSensors';

import CustomDataListTable from '@/components/table/CustomDataListTable.vue';
import ItemsGridContainer from '@/components/gridTable/ItemsGridContainer.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import VueElementLoadingWrapper from '@/components/common/VueElementLoadingWrapper.vue';
import ShotsCounterForm from './ShotsCounterForm.vue';

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
const { globalFilters, compareList } = storeToRefs(globalStore);
const { changeRoute } = useNavigation();
const itemsTableRef = ref(null);
const isLoadingCards = ref(false);
const stateSocketReady = ref(false);
const showShotsCounterDialog = ref(false);
const shotsCounterData = ref(null);
const equipmentItemCardLoader = () => import('./Card/ItemCard.vue');
const additionalDataForCards = computed(() =>
	Object.freeze({
		equipmentTypesList: props.equipmentTypesList,
	}),
);
const socketChannel = computed(() =>
	authStore.authUser ? `user.${authStore.authUser.uuid}` : null,
);
const { setupWebSocket, closeWebSocket, webSocketSend } = useWebSocket();
const { confirmHelper } = useActionButtons({ emit });
const { Notify } = useNotify();
const {
	resetSensorRuntime: resetSensorRuntimeAction,
	toggleUltrasoundCommand,
	unlockFft,
} = useSensors();

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
	fetchItemsApiRoute: '/equipments/dashboard',
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
		successSubmitOptions: {
			refetchItemsList: true,
			closeModal: true,
		},
		additionalModalSettings: {
			// editModalProp: 'editModalClassic',
			instanceName: 'Equipments',
			multiform: true,
			componentFileLoader: () => import('@/views/Dashboard/MultiFormWrapper.vue'),
			...(props.additionalModalSettings || {}),
		},
		listUpdateKey: 'equipmentsList',
	},
});

const getSensorsIds = (equipments = []) => {
	const ids = [];
	equipments.forEach((equipment) => {
		if (equipment.dashboardSensors?.length) {
			ids.push(...getValues('id', equipment.dashboardSensors));
		}
	});
	return ids.join(',');
};

const updateSensorsCounters = (list, counterData = {}) => {
	const { equipment_id: equipmentId, sensor_id: sensorId, ...increments } = counterData;

	return list.map((equipment) => {
		if (
			(equipmentId && equipmentId === equipment.id) ||
			equipment.dashboardSensors?.some((sensor) => sensor.id === sensorId)
		) {
			equipment.dashboardSensors?.forEach((sensor) => {
				if (sensor.id !== sensorId) return;

				Object.entries(increments).forEach(([prop, value]) => {
					if (sensor[prop] !== undefined) {
						sensor[prop] += value;
					} else if (sensor.lubes?.[prop] !== undefined) {
						if (
							value > 0 ||
							(prop !== 'successCyclesCount' && prop !== 'failuresCyclesCount')
						) {
							sensor.lubes[prop] += value;
						}
					}
				});
			});
		}
		return equipment;
	});
};

const stateSocketCallback = ({ type, data } = {}) => {
	const safeData = data?.data || data || {};
	if (`${type || ''}`.toLowerCase() === 'counters') {
		itemsList.value = updateSensorsCounters(itemsList.value, safeData);
	}
};

const setupEquipmentSocket = () => {
	setupWebSocket({
		socketName: 'state_socket',
		socketReadyRef: stateSocketReady,
		socketChannel: socketChannel.value,
		// resources,
		onMessage: stateSocketCallback,
	});
};

const reorderEquipment = (payload) => api_request.post('/equipments/reorder', { ...payload, notNotify: true });
const { reorderHandler, handleCreateWorkOrderButton } = useDashboardListsReorder({
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
const { setupDraggable, destroySortable } = useDragNdropSortable({
	wrapperSelector: '.equipments-list .drag-n-drop-wrapper',
	draggingLockedProp: computed(() => props.draggingLockedProp),
	reorderHandler: (event) => reorderHandler(event),
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
const compareClick = ({ row }) => {
	let newList = compareList.value.filter((sensorId) => sensorId !== row.id);

	if (newList.length === compareList.value.length && newList.length < 5) {
		newList.push(row.id);
	}

	globalStore.set_compare_list(newList);
};
const unblockLube = ({ row } = {}) => {
	if (!row?.id) return;

	return confirmHelper({
		insertToMessage: `<b>${tt('phrases.reset_cycle')}</b>`,
	})
		.then(() => {
			const payload = {
				url: `/ultrasound/commands/${row.id}/reset/cycle`,
				resultMessage: { text: '' },
			};

			if (
				row.lube_cycle_status === LUBE_CYCLE_STATUSES.BLOCKED ||
				row.lube_shot_status === LUBE_PROCESSING_STATUSES.UNSUCCESSFUL ||
				row.lube_shot_status === LUBE_PROCESSING_STATUSES.BLOCKED
			) {
				payload.url += '?resetLubeCycle=1';
				payload.resultMessage.text = tt('phrases.lube_cycle_was_reset');
			} else if (row.is_lubricator_empty) {
				payload.url += '?resetSpentShots=1&resetLubeCycle=0';
				payload.resultMessage.text = tt('phrases.spent_shots_was_reset');
			} else {
				payload.url += '?resetLubeCycle=0&resetSpentShots=1';
				payload.resultMessage.text = tt('phrases.grease_pack_was_reset');
			}

			return toggleUltrasoundCommand(payload);
		})
		.then(() => refetchItemsList())
		.catch(() => {});
};

const handleUnlockFFT = ({ row } = {}) => {
	if (!row?.id) return;

	return confirmHelper({
		insertToMessage: `<b>${tt('unlock')} FFT</b>`,
	})
		.then(() => unlockFft({ sensorId: row.id, notNotify: true }))
		.then(({ value }) => {
			if (value?.status !== FFT_LOCK_STATUSES.UNLOCKED) return;

			Notify({
				type: 'success',
				title: tt('constants.Success'),
				message: tt('phrases.FFT_successfully_unlocked'),
			});
			return refetchItemsList();
		})
		.catch(() => {});
};

const handleChangeShotsCount = ({ row } = {}) => {
	if (!row?.id) return;
	shotsCounterData.value = row;
	showShotsCounterDialog.value = true;
};

const shotsCounterUpdated = (sensor) => {
	if (!sensor?.id) return;

	itemsList.value = itemsList.value.map((equipment) => {
		const sensors = equipment.dashboardSensors || [];
		if (!sensors.some((item) => item.id === sensor.id)) return equipment;

		return {
			...equipment,
			dashboardSensors: sensors.map((item) =>
				item.id === sensor.id ? { ...item, ...sensor } : item,
			),
		};
	});
};

const resetSensorRuntime = (sensorId) => {
	if (!sensorId) return;

	return confirmHelper({
		insertToMessage: `<b>${tt('reset')} ${tt('runtime')}</b>`,
	})
		.then(() => resetSensorRuntimeAction({
			sensorId,
			resultMessage: { text: tt('phrases.runtime_was_reset') },
		}))
		.then(() => refetchItemsList())
		.catch(() => {});
};

const { handleEvent } = useEventHandler({
	setFilters,
	createItem,
	editItem,
	handleDeleteItems,
	handleCreateWorkOrderButton,
	handleShowDetails,
	handleAddToFavorites,
	unblockLube,
	handleUnlockFFT,
	compareClick,
	handleChangeShotsCount,
	resetSensorRuntime,
}, emit, 'itemsList');

watch(
	() => itemsList.value,
	(list) => {
		if (!list?.length || !socketChannel.value) return;

		const sensorIds = getSensorsIds(list);
		if (!sensorIds) return;

		if (!stateSocketReady.value) {
			setupEquipmentSocket();
		} else {
			webSocketSend({
				socketName: 'state_socket',
				// resources: sensorIds,
			});
		}
	},
	{ deep: true },
);

watch(
	[
		() => props.activeGrid,
		() => itemsLoading.value,
		() => itemsList.value.length,
	],
	() => {
		destroySortable();
		setupDraggable();
	},
	{ flush: 'post' },
);

onBeforeUnmount(() => {
	destroySortable();
	closeWebSocket({ socketName: 'state_socket' });
});

defineExpose({
	createItem,
	handleDeleteItems,
	refetchItemsList,
});

void props;
</script>
