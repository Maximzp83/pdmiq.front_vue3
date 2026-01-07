<template>
	<div class="nested-view-content-wrapper">
		<div class="content-row">
			<BreakdownMachinesList preventSetNavbar :perPageItems="perPageItems" />
		</div>

		<div class="">
			<ItemsList
				@event="handleEventNew"
				preventSetNavbar
				fromDashboard
				:propsFilters="predefinedFilters"
			/>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { MAINTENANCE_TYPES } from '@/constants/global';

import { eventHandler } from '@/mixins';

export default {
	mixins: [eventHandler()],
	// name: 'MaintenanceLogsPage',

	components: {
		BreakdownMachinesList: () => import('./BreakdownMachinesList.vue'),
		ItemsList: () => import('./ItemsList.vue')
	},

	props: {
		// woFilters: { type: Object, default: () => ({}) },
	},

	computed: {
		predefinedFilters: () => Object.freeze({ type: MAINTENANCE_TYPES.LOG }),

		navbarSettings() {
			return Object.freeze({
				pageTitle: this.$t('Maintenance_Logs'),
				showFilter: true
			});
		},

		perPageItems: () =>
			Object.freeze([
				{ value: 5, label: '5' },
				{ value: 10, label: '10' },
				{ value: 20, label: '20' },
				{ value: 50, label: '50' }
			])
	},

	methods: {
		...mapActions({
			setup_navbar: 'setup_navbar',
			set_global_state: 'set_global_state'
		})
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
