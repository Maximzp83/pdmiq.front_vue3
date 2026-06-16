<template>
	<div class="mcol-xs-12 relative">
		<TabsBar
			notRound
			className="like-in-browser-tabs radio-container"
			:activeTab="activeTab"
			:tabsList="tabsList"
			:height="40"
			buttonsType=""
			buttonsClass="secondary"
			:initialAutoSelect="0"
			@switchTab="switchTab"
		/>

		<div v-if="activeTab.prop === tabsList[0].prop" :key="tabsList[0].prop" class="tab-container">
			<WorkOrdersList
				ref="workOrdersListRef"
				insideOtherPage
				:propsFilters="woFilters"
				:hideDatepicker="hideDatepicker"
				preventSetNavbar
			/>
		</div>

		<div v-if="activeTab.prop === tabsList[1].prop" :key="tabsList[1].prop" class="tab-container">
			<MaintenanceLogsList
				ref="maintenanceLogsListRef"
				insideOtherPage
				:propsFilters="logFilters"
				:hideDatepicker="hideDatepicker"
				preventSetNavbar
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue';

import { Lang } from '@/localization';
import { useTabs } from '@/composables/mixins/useTabs';

const TabsBar = defineAsyncComponent(() => import('@/components/common/TabsBar.vue'));
const WorkOrdersList = defineAsyncComponent(() => import('@/views/Maintenance/WorkOrders/ItemsList.vue'));
const MaintenanceLogsList = defineAsyncComponent(() => import('@/views/Maintenance/Logs/ItemsList.vue'));

defineProps({
	woFilters: { type: Object, default: () => ({}) },
	logFilters: { type: Object, default: () => ({}) },
	hideDatepicker: Boolean,
	fromPlantDashboard: Boolean,
});

const tabsList = computed(() =>
	Object.freeze(
		Lang.translate([
			{ title: 'WORK_ORDERS', prop: 'woTab' },
			{ title: 'MAINTENANCE_LOGS', prop: 'logsTab' },
		])
	)
);

const { activeTab, switchTab } = useTabs({ tabsList });

const workOrdersListRef = ref(null);
const maintenanceLogsListRef = ref(null);

defineExpose({
	WorkOrdersList: workOrdersListRef,
	MaintenanceLogsList: maintenanceLogsListRef,
});
</script>
