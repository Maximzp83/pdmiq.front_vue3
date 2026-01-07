<template>
	<div class="view-wrapper requisitions-dashboard">
		<div class="mcontainer">
			<div class="section-row roi-calculator-wrapper">
				<ROICalculatorBlock
					@event="handleEventNew"
					:usersList="usersList"
					:usersLoading="usersLoading"
					:calculationsStepEnabled="calculationsStepEnabled"
				/>
			</div>

			<div class="card section-row" v-if="calculationsStepEnabled">
				<!-- @submit="handleSubmitForm" -->
				<!-- :itemsList="resultWorkOrdersList" -->
				<WorkOrdersList
					@event="handleEventNew"
					preventSetNavbar
					:filters="appliedFilters"
					:usersList="usersList"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { /*WORK_ORDER_ROLES,*/ USER_ROLES_TYPES } from '@/constants/global';

import { eventHandler, requestsListMixin } from '@/mixins';
// import { MAINTENANCE_TYPES } from '@/constants/global';

export default {
	mixins: [eventHandler(), requestsListMixin()],
	// name: 'RequisitionPage',

	components: {
		WorkOrdersList: () => import('./ItemsList.vue'),
		ROICalculatorBlock: () => import('./ROICalculatorBlock.vue')
	},

	data() {
		return {
			// selectedWorkOrder: null,
			usersList: [],
			usersLoading: false,

			appliedFilters: {},
			calculationsStepEnabled: false,

			resultWorkOrdersList: []
		};
	},

	computed: {
		...mapState({
			filters: state => state.plant_requisitions.filters,
			authUser: state => state.auth.authUser,
			globalFilters: state => state.global.globalFilters
			// plantsList: state => state.global.globalPlantsList,
		}),

		itemsName() {
			return {
				one: this.$t('Work_Order'),
				mult: this.$t('Work_Orders')
			};
		},

		navbarSettings() {
			return {
				pageTitle: this.$t('phrases.Fab_Plant_Dashboard'),
				showFilter: true
			};
		},

		requestsToDoList: () =>
			Object.freeze([
				{
					action: 'fetch_users',
					payload: { params: { type: USER_ROLES_TYPES.CUSTOMER } },
					bindTo: [{ prop: 'globalFilters.plantId', param: 'plantId' }],
					localProp: 'usersList',
					localLoadProp: 'usersLoading'
				}
			])

		// MAINTENANCE_TYPES: () => MAINTENANCE_TYPES
	},

	methods: {
		...mapActions({
			fetch_users: 'users/fetch_users'
			// save_item: 'plant_requisitions/save_maintenance_log'
		}),

		setup_navbar(settings) {
			this.$store.dispatch('setup_navbar', settings);
		},

		applyFilters(filters) {
			this.appliedFilters = filters;
			this.calculationsStepEnabled = true;
		},

		toggleCalculationsStepEnabled(enabled) {
			this.calculationsStepEnabled = enabled;
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
