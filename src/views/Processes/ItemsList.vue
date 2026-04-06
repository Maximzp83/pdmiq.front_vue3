<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="!hasAccessToCreate"
						:hideDelete="!hasAccessToDelete"
						@event="handleEvent"
					>
						<div class="filter-item mcol-xs-12 mcol-sm-auto">
							<Datepicker
								v-model="statisticsFilters.daterange"
								setupDaterangeFilter
								enableShortcuts
								type="daterange"
							/>
						</div>
					</Filterbar>

					<ItemsGridContainer
						ref="itemsTableRef"
						:itemsLoading="itemsLoading"
						:itemsList="itemsList"
						:itemsName="itemsName"
						:instanceName="instanceName"
						cardClassName="mcol-xs-12 mcol-sm-6 mcol-lg-4 process-card-item"
						:operationsSettings="cardActionsSettings"
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
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';

import { DOWNTIME_ORIGIN_TYPES } from '@/constants/global';
import { getDateRange, getValues } from '@/helpers';
import { standardTableOperations } from '@/constants/table';
import { Lang } from '@/localization';
import { api_request } from '@/api/request_provider';
import { useItemsData } from '@/composables/mixins/useItemsData';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useNavigation } from '@/composables/mixins/useNavigation';
import { useWebSocket } from '@/composables/mixins/useWebSocket';
import { useProcessesStore } from '@/stores/ProcessesStore';
import { useAuthStore } from '@/stores/AuthStore';

import Filterbar from '@/components/common/Filterbar.vue';
import ItemsGridContainer from '@/components/gridTable/ItemsGridContainer.vue';
import PaginationContainer from '@/components/common/PaginationContainer.vue';
import Datepicker from '@/components/common/Datepicker.vue';

const { tt } = Lang;

defineOptions({
	name: 'ProcessesList',
});

const itemsTableRef = ref(null);
const stateSocketReady = ref(false);

const processesStore = useProcessesStore();
const { filters } = storeToRefs(processesStore);

const authStore = useAuthStore();
const { changeRoute } = useNavigation();
const { setupWebSocket, closeWebSocket, webSocketSend } = useWebSocket();

const statisticsFilters = ref({
	daterange: getDateRange('last_7_days', {
		getDateString: true,
	}),
	daterange_setted_at: Date.now(),
});

const instanceName = 'Processes';

const itemsName = computed(() => ({
	one: tt('Process'),
	mult: tt('Processes'),
	instanceName: 'processes',
}));

const hasAccessToCreate = computed(() => authStore.hasAccessTo(['create_oee']));
const hasAccessToEdit = computed(() => authStore.hasAccessTo(['edit_oee']));
const hasAccessToDelete = computed(() => authStore.hasAccessTo(['delete_oee']));

const localPrepareFilters = (currentFilters) => ({
	...currentFilters,
	...statisticsFilters.value,
});

const { itemsList, itemsLoading, meta, setFilters, fetchItems } = useItemsData({
	apiRoute: '/plants/conveyor/processes',
	filters,
	itemsName,
	options: {
		localPrepareFilters,
	},
});

const cardActionsSettings = computed(() => {
	let actions = [
		{
			name: 'handleShowDetails',
			type: 'info',
			icon: 'icomoon icon-graphic',
			tooltip_text: 'Details',
		},
	];

	if (hasAccessToEdit.value) {
		actions = actions.concat([standardTableOperations.edit]);
	}
	if (hasAccessToDelete.value) {
		actions = actions.concat([standardTableOperations.delete]);
	}

	return Object.freeze({
		actions,
		allowDelete: hasAccessToDelete.value,
	});
});

const socketChannel = computed(() =>
	authStore.authUser ? `live.conveyor.processes.${authStore.authUser.uuid}` : null
);

const updateProcessData = ({ process_id, actualCapacity, totalDowntime, downtime }) =>
	itemsList.value.map((processItem) => {
		if (processItem.id !== process_id) {
			return processItem;
		}

		const modifiedData = {};

		if (actualCapacity) {
			modifiedData.actual_capacity = actualCapacity;
		} else if (totalDowntime) {
			modifiedData.totalDowntimes = totalDowntime;
		}

		if (downtime && downtime.origin_type === DOWNTIME_ORIGIN_TYPES.DEVIATION) {
			modifiedData.loss_count = (processItem.loss_count || 0) + (downtime.loss_count || 0);
		}

		return {
			...processItem,
			...modifiedData,
		};
	});

const stateSocketCallback = (answer) => {
	const { type } = answer || {};
	if (type === 'job' || type === 'downtime') {
		itemsList.value = updateProcessData(answer);
	}
};

const setupProcessSocket = (resources) => {
	if (!socketChannel.value || !resources) return;

	setupWebSocket({
		socketName: 'state_socket',
		socketReadyRef: stateSocketReady,
		socketChannel: socketChannel.value,
		resources,
		onMessage: stateSocketCallback,
	});
};

const handleShowDetails = ({ row }) => {
	if (!row?.id) return;
	changeRoute({ path: `/processes/${row.id}` });
};

const createItem = () => {
	changeRoute({ path: '/processes/create' });
};

const editItem = ({ row }) => {
	if (!row?.id) return;
	changeRoute({ path: `/processes/${row.id}` });
};

const deleteProcess = async ({ row }) => {
	if (!row?.id) return;

	await ElMessageBox.confirm(
		tt('phrases.delete_confirmation') || 'Delete this item?',
		tt('Delete') || 'Delete',
		{
			confirmButtonText: tt('Delete') || 'Delete',
			cancelButtonText: tt('CANCEL') || 'Cancel',
			type: 'warning',
		}
	);

	await api_request.delete(`/plants/conveyor/processes/${row.id}`, {
		itemName: itemsName.value.one,
	});

	await fetchItems({
		...filters.value,
	});
};

const handleDeleteItems = async ({ row }) => {
	if (!row?.id) return;
	await deleteProcess({ row });
};

const methodsMap = {
	setFilters,
	createItem,
	editItem,
	handleShowDetails,
	handleDeleteItems,
};

const { handleEvent } = useEventHandler(methodsMap);

watch(
	() => statisticsFilters.value,
	() => {
		setFilters({ page: 1 });
	},
	{ deep: true }
);

watch(
	() => itemsList.value,
	(list) => {
		if (!list?.length) return;

		const processIds = getValues('id', list).join(',');
		if (!processIds.length) return;

		if (!stateSocketReady.value) {
			setupProcessSocket(processIds);
		} else {
			webSocketSend({
				socketName: 'state_socket',
				resources: processIds,
			});
		}
	},
	{ deep: true }
);

onBeforeUnmount(() => {
	closeWebSocket({ socketName: 'state_socket' });
});
</script>
