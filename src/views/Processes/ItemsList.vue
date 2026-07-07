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

import { ENTITIES } from '@/config/entities';
import { DOWNTIME_ORIGIN_TYPES } from '@/constants/global';
import { getDateRange, getValues } from '@/helpers';
import { standardTableOperations } from '@/constants/table';
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
const processesEntity = ENTITIES.Processes;

const hasAccessToCreate = computed(() => authStore.hasAccessTo([processesEntity.permissions.create]));
const hasAccessToEdit = computed(() => authStore.hasAccessTo([processesEntity.permissions.edit]));
const hasAccessToDelete = computed(() => authStore.hasAccessTo([processesEntity.permissions.delete]));

const localPrepareFilters = (currentFilters) => ({
	...currentFilters,
	...statisticsFilters.value,
});

const { itemsList, itemsLoading, itemsName, meta, setFilters, createItem, editItem, handleDeleteItems } = useItemsData({
	entityKey: 'Processes',
	itemStore: processesStore,
	options: {
		localPrepareFilters,
		tableRef: itemsTableRef,
		editInModal: true,
		formComponentFileLoader: () => import('./ItemForm.vue'),
		successSubmitOptions: {
			closeModal: true,
		},
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
	authStore.authUser ? `live.conveyor.processes.${authStore.authUser.uuid}` : null,
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
	const { type, data } = answer || {};
	const normalizedType = `${type || ''}`.toLowerCase();
	if (normalizedType === 'job' || normalizedType === 'downtime') {
		itemsList.value = updateProcessData(data);
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
	changeRoute({ path: `${processesEntity.routeBase}/${row.id}/details` });
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
	{ deep: true },
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
	{ deep: true },
);

onBeforeUnmount(() => {
	closeWebSocket({ socketName: 'state_socket' });
});
</script>
