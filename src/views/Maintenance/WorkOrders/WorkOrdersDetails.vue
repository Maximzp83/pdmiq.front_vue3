<template>
	<div class="nested-view-content-wrapper">
		<div class="content-row mrow flex wrap">
			<div class="mcol-xs-12 mcol-sm-4">
				<div class="card overflowHidden statistic-block">
					<div class="card-header filled_2">
						<div class="title semi-bold uppercase">{{ tt('GRAPH') }}</div>
					</div>

					<div class="card-content">
						<CommonChartItemWrapper
							ref="chartWrapperRef"
							class="requisitions-dashboard-chart"
							chartFactoryContainerName="MaintenanceChartFactoryContainer"
							chartFactoryName="WOStatisticsChart"
							configsKey="maintenanceChartListsConfig"
							chartKey="main"
							:rootFilters="statisticsFilters"
							:additionalProps="chartProps"
						/>
					</div>
				</div>
			</div>

			<div class="mcol-xs-12 mcol-sm-8">
				<ListItemDetailsBlock
					showDetailsButton
					:itemData="selectedWorkOrder"
					:usersList="usersList"
				/>
			</div>
		</div>

		<div class="content-row">
			<ItemsList
				preventSetNavbar
				fromDashboard
				:propsFilters="predefinedFilters"
				:usersList="usersList"
				:usersLoading="usersLoading"
				@event="handleEvent"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';

import { MAINTENANCE_TYPES } from '@/constants/global';
import { ENTITIES } from '@/config/entities';
import { createGetRequest } from '@/api/request_factories';
import { scrollToElement } from '@/helpers/specialHelpers';
import { Lang } from '@/localization';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';
import { useRequestsList } from '@/composables/mixins/useRequestsList';

import ItemsList from './ItemsList.vue';
import ListItemDetailsBlock from './statistics/ListItemDetailsBlock.vue';
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';

const props = defineProps({
	rootFilters: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['event']);

defineOptions({
	name: 'WorkOrdersDetails',
});

const { tt } = Lang;
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);

const selectedWorkOrder = ref(null);
const usersList = shallowRef([]);
const usersLoading = ref(false);
const chartWrapperRef = ref(null);

const predefinedFilters = Object.freeze({ type: MAINTENANCE_TYPES.WORK_ORDER });
const chartProps = Object.freeze({ showWithoutStatistics: true });
const statisticsFilters = computed(() => ({
	...props.rootFilters,
	page: null,
	max: null,
	plantId: globalFilters.value?.plantId,
}));

const methodsMap = {
	fetch_users: createGetRequest(ENTITIES.Users.apiBase),
	handleShowDetails: ({ row }) => {
		selectedWorkOrder.value = row;
		scrollToElement('.details-block');
	},
};

useRequestsList({
	methodsMap,
	requestsToDoList: computed(() =>
		Object.freeze([
			{
				actionName: 'fetch_users',
				localProp: usersList,
				localLoadProp: usersLoading,
			},
		])
	),
});

const { handleEvent } = useEventHandler(methodsMap, emit);
</script>
