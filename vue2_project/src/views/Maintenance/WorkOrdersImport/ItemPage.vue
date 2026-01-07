<template>
	<div class="view-wrapper item-page-wrapper">
		<div class="mcontainer" v-if="globalFilters.plantId">
			<div class="form-wrapper card-content">
				<ImportContainer
					showRevert
					revertAction="maintenance_work_order_revert"
					enableProgressbar
					uploadSubmitActionProp="upload_work_order"
					componentPath="views/Maintenance/WorkOrdersImport/ImportOptionsContainer"
					:plantId="globalFilters.plantId"
				/>
			</div>
		</div>

		<div v-else class="mcontainer">
			<PageMockImg />
		</div>
	</div>
</template>

<script>
export default {
	name: 'WOImportPage',

	components: {
		ImportContainer: () => import('@/components/Import/ImportContainer.vue'),
		PageMockImg: () => import('@/components/common/PageMockImg.vue')
	},

	computed: {
		navbarSettings: that => ({
			showFilter: true,
			pageTitle: that.$t('sidebar_menu.Work_Order_Import')
		}),

		globalFilters() {
			return this.$store.state.global.globalFilters;
		}
	},

	methods: {
		setup_navbar(settings) {
			this.$store.dispatch('setup_navbar', settings);
		}
	},

	beforeMount() {
		this.setup_navbar(this.navbarSettings);
	},

	beforeDestroy() {
		this.setup_navbar({});
	}
};
</script>
