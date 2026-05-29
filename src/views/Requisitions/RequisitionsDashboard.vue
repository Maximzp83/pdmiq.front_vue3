<template>
	<div class="view-wrapper requisitions-dashboard">
		<div v-if="globalFilters.plantId" class="mcontainer">
			<div class="content-row mrow wrap flex">
				<div class="mcol-xs-12 mcol-sm-4">
					<div class="card overflowHidden statistic-block">
						<div class="card-header filled_2">
							<div class="title semi-bold uppercase">{{ tt('GRAPH') }}</div>
						</div>
						<div class="card-content">
							<CommonChartItemWrapper
								class="requisitions-dashboard-chart"
								chartFactoryContainerName="MaintenanceChartFactoryContainer"
								chartFactoryName="RequisitionStatisticsChart"
								configsKey="maintenanceChartListsConfig"
								chartKey="main"
								:rootFilters="analyticsFilters"
								:additionalProps="chartProps"
							/>
						</div>
					</div>
				</div>

				<div class="mcol-xs-12 mcol-sm-8">
					<ListItemDetailsBlock showDetailsButton :itemData="selectedWorkOrder" />
				</div>
			</div>

			<div class="card content-row">
				<ItemsList preventSetNavbar :pageType="pageType" @event="handleEvent" />
			</div>
		</div>

		<div v-else class="mcontainer">
			<PageMockImg />
		</div>
	</div>
</template>

<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { Lang } from '@/localization';
import { useAuthStore } from '@/stores/AuthStore';
import { useGlobalStore } from '@/stores/GlobalStore';
import { useEventHandler } from '@/composables/mixins/useEmitter';

import PageMockImg from '@/components/common/PageMockImg.vue';
import CommonChartItemWrapper from '@/components/charts/CommonChartItemWrapper.vue';
import ItemsList from './ItemsList.vue';
import ListItemDetailsBlock from './ListItemDetailsBlock.vue';

const { tt } = Lang;

defineOptions({ name: 'RequisitionsDashboard' });

const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { globalFilters } = storeToRefs(globalStore);
const selectedWorkOrder = ref(null);

const chartProps = Object.freeze({ showWithoutStatistics: true });
const analyticsFilters = computed(() => ({
	daterange: [],
	plantId: globalFilters.value?.plantId || null,
}));
const pageType = computed(() => {
	const role = authStore.authUser?.role;
	if (role?.is_requisitioner) return { isRequisitionsPage: true };
	if (role?.is_fab_shop_manager) return { isWOAssignedPage: true };
	return {};
});
const navbarSettings = computed(() => {
	let pageTitle = tt('phrases.Fab_Plant_Dashboard');
	if (pageType.value.isRequisitionsPage) {
		pageTitle = tt('phrases.Requisition_Plant_Dashboard');
	}
	return { pageTitle, showFilter: true };
});

const handleShowDetails = ({ row }) => {
	selectedWorkOrder.value = row;
	document.querySelector('.details-block')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
const { handleEvent } = useEventHandler({ handleShowDetails });

onBeforeMount(() => {
	globalStore.setup_navbar(navbarSettings.value);
});
onBeforeUnmount(() => {
	globalStore.setup_navbar({});
});
</script>
