<template>
	<div class="mcol-xs-12 relative">
		<TabsBar
			notRound
			className="like-in-browser-tabs radio-container"
			:activeTab="activeTab"
			:tabsList="tabsList"
			:height="40"
			:buttonsType="'secondary'"
			:initialAutoSelect="0"
			@switchTab="switchTab"
		/>

		<div v-if="activeTab.prop === tabsList[0].prop" :key="tabsList[0].prop" class="tab-container">
			<WorkOrdersList
				ref="workOrdersList"
				preventSetNavbar
				fromDashboard
				:propsFilters="woFilters"
				:usersList="usersList"
				:usersLoading="usersLoading"
				:hideDatepicker="hideDatepicker"
				:fromPlantDashboard="fromPlantDashboard"
			/>
		</div>

		<div v-if="activeTab.prop === tabsList[1].prop" :key="tabsList[1].prop" class="tab-container">
			<MaintenanceLogsList
				ref="maintenanceLogsList"
				preventSetNavbar
				fromDashboard
				:propsFilters="logFilters"
				:hideDatepicker="hideDatepicker"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';

import { Lang } from '@/localization';
import { api_request } from '@/api/request_provider';
import { useTabs } from '@/composables/mixins/useTabs';

const TabsBar = defineAsyncComponent(() => import('@/components/common/TabsBar.vue'));
const WorkOrdersList = defineAsyncComponent(() => import('@/views/Maintenance/WorkOrders/ItemsList.vue'));
const MaintenanceLogsList = defineAsyncComponent(() => import('@/views/Maintenance/Logs/ItemsList.vue'));

const props = defineProps({
	woFilters: { type: Object, default: () => ({}) },
	logFilters: { type: Object, default: () => ({}) },
	hideDatepicker: Boolean,
	fromPlantDashboard: Boolean,
});

const usersList = ref([]);
const usersLoading = ref(false);

const tabsList = computed(() =>
	Object.freeze(
		Lang.translate([
			{ title: 'WORK_ORDERS', prop: 'woTab' },
			{ title: 'MAINTENANCE_LOGS', prop: 'logsTab' },
		])
	)
);

const { activeTab, switchTab } = useTabs({ tabsList });

const fetchUsers = async () => {
	usersLoading.value = true;
	try {
		const response = await api_request.get('/users', {
			params: { max: -1 },
			notNotify: true,
		});
		usersList.value = response?.value || [];
	} catch (error) {
		console.warn(error);
	} finally {
		usersLoading.value = false;
	}
};

onMounted(() => {
	fetchUsers();
});

void props;
</script>
