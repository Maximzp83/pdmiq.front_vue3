<template>
	<div class="view-wrapper requisitions-dashboard">
		<div class="mcontainer" v-if="globalFilters.plantId">
			<!-- <h1 class="title page-title">{{ pageTitle }}</h1> -->
			<div class="content-row mrow wrap flex">
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
					<ListItemDetailsBlock
						showDetailsButton
						:itemData="selectedWorkOrder"
						:usersList="usersList"
					/>
				</div>
			</div>

			<div class="card content-row">
				<!-- @submit="handleSubmitForm" -->
				<WorkOrdersList
					preventSetNavbar
					@event="handleEventNew"
					:pageType="pageType"
					:usersList="usersList"
				/>
			</div>
		</div>

		<div v-else class="mcontainer">
			<PageMockImg />
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { mapActions, mapState } from 'vuex';
import { scrollToElement } from '@/helpers/specialHelpers';

import { eventHandler, requestsListMixin } from '@/mixins';
// import { MAINTENANCE_TYPES } from '@/constants/global';

export default {
	mixins: [eventHandler(), requestsListMixin()],
	// name: 'RequisitionPage',

	components: {
		PageMockImg: () => import('@/components/common/PageMockImg.vue'),
		WorkOrdersList: () => import('./ItemsList.vue'),
		ListItemDetailsBlock: () => import('./ListItemDetailsBlock.vue'),
		CommonChartItemWrapper: () =>
			import('@/components/charts/CommonChartItemWrapper.vue')
	},

	data() {
		return {
			selectedWorkOrder: null,
			usersList: [],
			usersLoading: false
		};
	},

	computed: {
		...mapState({
			filters: state => state.plant_requisitions.filters,
			authUser: state => state.auth.authUser,
			isDeveloper: state => state.auth.isDeveloper,
			globalFilters: state => state.global.globalFilters
			// plantsList: state => state.global.globalPlantsList,
		}),

		chartProps: () => Object.freeze({ showWithoutStatistics: true }),

		analyticsFilters: that => ({
			daterange: [],
			plantId: that.globalFilters ? that.globalFilters.plantId : null
		}),

		itemsName() {
			return {
				one: this.$t('Work_Order'),
				mult: this.$t('Work_Orders')
			};
		},

		pageType() {
			const { role } = this.authUser;

			if (role && role.is_requisitioner) {
				return { isRequisitionsPage: true };
			} else if (role && role.is_fab_shop_manager) {
				return { isWOAssignedPage: true };
			}
			/*else if (this.isDeveloper) {
				return { isRequisitionsPage: true };
			}*/

			return {};
		},

		navbarSettings() {
			let title = this.$t('phrases.Fab_Plant_Dashboard');
			if (this.pageType.isRequisitionsPage) {
				title = this.$t('phrases.Requisition_Plant_Dashboard');
			} else if (this.pageType.isWOAssignedPage) {
				title = this.$t('phrases.Fab_Plant_Dashboard');
			} else if (this.pageType.isCorporateDashboard) {
				title = this.$t('phrases.Work_Order_Company_Overview');
			}

			return {
				pageTitle: title,
				showFilter: true
			};
		},

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_users',
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				}
			])

		// MAINTENANCE_TYPES: () => MAINTENANCE_TYPES
	},

	methods: {
		...mapActions({
			fetch_users: 'users/fetch_users'
			// fetch_item: 'plant_requisitions/fetch_requisition',
			// save_item: 'plant_requisitions/save_maintenance_log'
		}),

		setup_navbar(settings) {
			this.$store.dispatch('setup_navbar', settings);
		},

		handleShowDetails({ row }) {
			this.selectedWorkOrder = row;
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
