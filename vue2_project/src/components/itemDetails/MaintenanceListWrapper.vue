<template>
	<div class="mcol-xs-12 relative">
		<TabsBar
			notRound
			@switchTab="switchTab"
			:activeTab="activeTab"
			:tabsList="tabsList"
			:height="40"
			:buttonsType="'secondary'"
			:initialAutoSelect="0"
			className="like-in-browser-tabs radio-container"
		/>

		<div
			v-if="activeTab.prop == tabsList[0].prop"
			:key="tabsList[0].prop"
			class="tab-container"
		>
			<WorkOrdersList
				ref="WorkOrdersList"
				preventSetNavbar
				fromDashboard
				:propsFilters="woFilters"
				:usersList="usersList"
				:usersLoading="usersLoading"
				:hideDatepicker="hideDatepicker"
				:fromPlantDashboard="fromPlantDashboard"
			/>
		</div>

		<div
			v-if="activeTab.prop == tabsList[1].prop"
			:key="tabsList[1].prop"
			class="tab-container"
		>
			<MaintenanceLogsList
				ref="MaintenanceLogsList"
				preventSetNavbar
				fromDashboard
				:propsFilters="logFilters"
				:hideDatepicker="hideDatepicker"
			/>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { tabsMixin, fetchItemsHelper } from '@/mixins';

export default {
	mixins: [tabsMixin(), fetchItemsHelper()],
	// name: 'MaintenanceLogsPage',

	components: {
		TabsBar: () => import('@/components/common/TabsBar.vue'),
		WorkOrdersList: () => import('@/views/Maintenance/WorkOrders/ItemsList.vue'),
		MaintenanceLogsList: () => import('@/views/Maintenance/Logs/ItemsList.vue')
	},

	props: {
		woFilters: { type: Object, default: () => ({}) },
		logFilters: { type: Object, default: () => ({}) },
		hideDatepicker: Boolean,
		fromPlantDashboard: Boolean
	},

	data() {
		return {
			usersList: [],
			usersLoading: false
		};
	},

	computed: {
		tabsList: that =>
			Object.freeze(
				that.$translate([
					{ title: 'WORK_ORDERS', prop: 'woTab' },
					{ title: 'MAINTENANCE_LOGS', prop: 'logsTab' }
				])
			)
	},

	methods: {
		...mapActions({
			fetch_users: 'users/fetch_users'
		}),

		fetchUsers() {
			// const payload = { params: { plantId: , max: -1 } };

			this.doFetchAction(
				'fetch_users',
				'usersList',
				'usersLoading'
				// payload
			);
		}
	},

	created() {
		this.fetchUsers();
	}
};
</script>
