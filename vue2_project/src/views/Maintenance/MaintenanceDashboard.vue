<template>
	<div class="view-wrapper maintenance-dashboard">
		<div class="mcontainer">
			<div class="content-row 1flex">
				<ButtonsNavbar card inline bold :itemsList="navbarList" />
				<!-- <Datepicker
					class="ml-auto"
					setupDaterangeFilter
					enableShortcuts
					@input="range => set_filters({ ...filters, daterange: range })"
					:value="filters.daterange"
					type="daterange"
				/> -->
				<!-- clearingTo="last_7_days" -->
			</div>

			<div class="content-row relative">
				<transition name="standard-fade" mode="out-in">
					<router-view
						ref="nestedViewContent"
						@event="handleEventNew"
						:key="detailsComponentKey"
						:rootFilters="filters"
					/>
					<!-- :rootFilters="{...filters, daterange: ['2023-03-03', '2023-05-05']}" -->
				</transition>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
Vue.use(HighchartsVue);

import { mapState, mapActions } from 'vuex';
// import { MAINTENANCE_TYPES } from '@/constants/global';

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	components: {
		ButtonsNavbar: () => import('@/components/common/ButtonsNavbar.vue')
		// Datepicker: () => import('@/components/common/Datepicker.vue'),
	},

	data: () => ({
		detailsComponentKey: 1
	}),

	computed: {
		...mapState({
			filters: state => state.maintenance.filters
		}),

		navbarList() {
			return Object.freeze(
				this.$translate([
					{ id: 1, path: '/maintenance/work-orders', label: 'Work_Orders' },
					{ id: 2, path: '/maintenance/logs', label: 'Maintenance_Logs' }
				])
			);
		}
	},

	methods: {
		...mapActions({
			set_filters: 'maintenance/set_maintenance_logs_filters'
		})
	}
};
</script>
