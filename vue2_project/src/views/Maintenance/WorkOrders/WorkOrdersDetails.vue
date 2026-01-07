<template>
	<div class="nested-view-content-wrapper">
		<div class="content-row mrow flex wrap">
			<div class="mcol-xs-12 mcol-sm-4">
				<div class="card overflowHidden statistic-block">
					<div class="card-header filled_2 ">
						<div class="title semi-bold uppercase">{{ tt('GRAPH') }}</div>
					</div>

					<div class="card-content">
						<CommonChartItemWrapper
							class="requisitions-dashboard-chart"
							ref="CommonChartItemWrapper"
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
				@event="handleEventNew"
				preventSetNavbar
				fromDashboard
				:propsFilters="predefinedFilters"
				:usersList="usersList"
				:usersLoading="usersLoading"
			/>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { MAINTENANCE_TYPES } from '@/constants/global';
import { scrollToElement } from '@/helpers/specialHelpers';

import { eventHandler, requestsListMixin } from '@/mixins';

export default {
	mixins: [eventHandler(), requestsListMixin()],
	// name: 'MaintenanceLogsPage',

	components: {
		ItemsList: () => import('./ItemsList.vue'),
		ListItemDetailsBlock: () => import('./statistics/ListItemDetailsBlock.vue'),
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	props: {
		rootFilters: {
			type: Object,
			default: () => ({})
		}
		// woFilters: { type: Object, default: () => ({}) },
	},

	data() {
		return {
			selectedWorkOrder: null,
			usersList: [],
			usersLoading: false
		};
	},

	computed: {
		globalFilters: that => that.$store.state.global.globalFilters,

		predefinedFilters: () => Object.freeze({ type: MAINTENANCE_TYPES.WORK_ORDER }),

		statisticsFilters: that => ({
			...that.rootFilters,
			page: null,
			max: null,
			plantId: that.globalFilters.plantId
		}),

		chartProps: () => Object.freeze({ showWithoutStatistics: true }),

		navbarSettings() {
			return Object.freeze({
				pageTitle: this.$t('Work_Orders'),
				showFilter: true
			});
		},

		perPageItems: () =>
			Object.freeze([
				{ value: 5, label: '5' },
				{ value: 10, label: '10' },
				{ value: 20, label: '20' },
				{ value: 50, label: '50' }
			]),

		requestsToDoList() {
			return Object.freeze([
				{
					action: 'fetch_users',
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				}
			]);
		}
	},

	methods: {
		...mapActions({
			setup_navbar: 'setup_navbar',
			fetch_users: 'users/fetch_users',

			set_global_state: 'set_global_state'
		}),

		handleShowDetails({ row }) {
			this.selectedWorkOrder = row;
			// console.log(row)
			scrollToElement('.details-block');
		}
	},

	beforeMount() {
		if (!this.preventSetNavbar) {
			this.setup_navbar(this.propsNavbarSettings || this.navbarSettings);
		}
	},

	beforeDestroy() {
		if (!this.preventSetNavbar) {
			this.setup_navbar({});
		}
	}
};
</script>
