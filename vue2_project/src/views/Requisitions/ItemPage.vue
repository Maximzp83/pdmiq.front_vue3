<template>
	<div>
		<VueElementLoadingWrapper
			:isLoading="itemLoading"
			:isSaving="itemSaving"
			:itemsName="itemsName.one"
		/>

		<div
			id="workOrderPage"
			class="workOrderPage view-wrapper item-page-wrapper requisitions-dashboard"
		>
			<div class="mcontainer">
				<div class="content-row mrow flex wrap" v-if="loadContent">
					<div class="mcol-xs-12 mcol-sm-4">
						<!-- :rootFilters="filters" -->
						<InfoBlock :itemData="itemData" />
					</div>

					<div class="mcol-xs-12 mcol-sm-8">
						<ListItemDetailsBlock :itemData="itemData" />
					</div>
				</div>

				<div class="content-row" v-if="loadContent">
					<WorkOrderDetails
						@event="handleEvent"
						ref="ItemFormComponent"
						:itemData="itemData"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import {
	navigation,
	itemPageMixin,
	initPageDataMixin,
	eventHandler
} from '@/mixins';
// import { MAINTENANCE_TYPES } from '@/constants/global';

export default {
	mixins: [navigation(), itemPageMixin(), initPageDataMixin(), eventHandler()],
	name: 'RequisitionPage',

	components: {
		WorkOrderDetails: () => import('./WorkOrderDetails.vue'),
		ListItemDetailsBlock: () => import('./ListItemDetailsBlock.vue'),
		InfoBlock: () => import('./InfoBlock.vue')
	},

	computed: {
		itemsName() {
			return {
				one: this.$t('Work_Order'),
				mult: this.$t('Work_Orders')
			};
		},

		navbarSettings() {
			return {
				pageTitle: this.$t('phrases.Work_Order_Details'),
				// showPlantName: { name: itemData.plant ? itemData.plant.name : '' }

				printButtonSettings: {
					querySelector: '.work-order-details .work-order-for-print-container'
				}
				// showStandardNavItem: { backButton: { path: '/requisitions' } }
				// showStandardNavItem: true
			};
		}

		// MAINTENANCE_TYPES: () => MAINTENANCE_TYPES
	},

	methods: {
		...mapActions({
			fetch_item: 'plant_requisitions/fetch_requisition'
			// save_item: 'plant_requisitions/save_maintenance_log'
		})
	}
};
</script>
