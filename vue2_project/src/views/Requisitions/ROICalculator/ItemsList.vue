<template>
	<div class="view-content-card card content-row">
		<div class="card-content">
			<CustomDataListTable
				ref="ItemsTableContainer"
				disableSelection
				@event="handleEventNew"
				:itemsLoading="itemsLoading"
				:tableData="itemsList"
				:tableSettings="tableSettings"
				:itemsName="itemsName"
			/>

			<!-- <PaginationContainer
						@setFilters="setFilters"
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
					/> -->
		</div>
	</div>

	<!-- <div class="pagination content-row card" v-if="!itemsLoading">
			</div> -->
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
import { cleanDateString, formatTime } from '@/helpers';
// import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		// Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue')
		// PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	props: {
		// itemsList: Array,
		filters: Object
	},

	computed: {
		...mapState({
			// filters: state => state.plant_requisitions.filters,
		}),

		// excludeGetParams: () => ['plantId'],

		itemsName() {
			return {
				one: this.$t('Requisition'),
				mult: this.$t('Requisitions'),
				instanceName: 'plant_requisitions'
			};
		},

		tableSettings() {
			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'id',
						label: 'WO',
						label_postfix: '#',
						width: 60
					},
					{
						prop: 'created_at',
						label: 'Date_Sent',
						width: 105,
						sortable: true,
						meta: {
							prepareValue: {
								localMethod: cleanDateString,
								args: { withoutTime: true }
							}
						}
					},
					{
						prop: 'complete_at',
						label: 'Requested_Date',
						width: 105,
						sortable: true,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						prop: 'estimated_started_at',
						label: 'Estimated_Start_Date',
						width: 105,
						sortable: true,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						prop: 'estimated_finished_at',
						label: 'Estimated_Completion_Date',
						width: 105,
						sortable: true,
						meta: {
							prepareValue: { localMethod: cleanDateString }
						}
					},
					{
						prop: 'requisitionPlant.name',
						label: 'Requisition_Plant',
						width: 160,
						sortable: true
						/*meta: {
							getItemValue: { prop: 'name', list: this.plantsList }
						}*/
					},
					{
						prop: 'requisition_details',
						label: 'Details',
						meta: {
							cell_class: 'ellipsis'
						},
						min_width: 150
					},
					{
						prop: 'technicians',
						label: 'Assigned',
						min_width: 200,
						// sortable: true,
						meta: {
							fromArray: { subProp: 'full_name', delimeter: ', ' /*inline: true*/ }
						}
					},
					{
						label: 'PO',
						label_postfix: '#',
						prop: 'po_number'
						// width: 120,
					},
					{
						prop: 'execution_total_time',
						label: 'Hours',
						// sortable: true,
						width: 90,
						meta: {
							prepareValue: { localMethod: formatTime, args: 'h:m' }
						}
					},
					{
						prop: 'proposed_cost',
						label: 'Budget',
						width: 70
					},
					{
						prop: 'actual_cost',
						label: 'Fab_Shop_Budget',
						width: 82
					},
					{
						prop: 'execution_cost',
						label: 'Running_Total',
						width: 70
					}
				]),
				operations: {
					actions: [
						{
							name: 'handleShowDetails',
							type: 'success',
							icon: 'icomoon icon-eye',
							tooltip_text: this.tt('Info')
						}
					]
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'plant_requisitions/fetch_requisitions',
			set_filters: 'plant_requisitions/set_requisitions_filters'
		}),

		handleShowDetails({ row }) {
			this.changeRoute({
				path: `/requisitions/${row.id}`
			});
		}
	}
};
</script>
