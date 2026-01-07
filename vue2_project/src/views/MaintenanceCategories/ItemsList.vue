<template>
	<div class="view-wrapper view-list-wrapper">
		<div class="mcontainer">
			<!-- <h1 class="title page-title">{{ itemsName.mult }}</h1> -->
			<div class="view-content-card card content-row">
				<div class="card-content">
					<Filterbar
						@event="handleEvent"
						:itemsLoading="itemsLoading"
						:filters="filters"
						:itemsName="itemsName"
						:hideCreate="!hasAccesToCreate"
						:hideDelete="!hasAccesToDelete"
					/>

					<CustomDataListTable
						ref="ItemsTableContainer"
						@event="handleEventNew"
						:disableSelection="!hasAccesToDelete"
						:itemsLoading="itemsLoading"
						:tableData="itemsList"
						:tableSettings="tableSettings"
						:itemsName="itemsName"
					/>

					<PaginationContainer
						@setFilters="setFilters"
						:itemsName="itemsName"
						:filters="filters"
						:meta="meta"
					/>
				</div>
			</div>

			<!-- <div class="pagination content-row card" v-if="!itemsLoading">
			</div> -->
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { itemsDataMixin, eventHandler, navigation } from '@/mixins';
import { standardTableOperations } from '@/constants/table';

export default {
	mixins: [itemsDataMixin(), eventHandler(), navigation()],
	components: {
		Filterbar: () => import('@/components/common/Filterbar.vue'),
		CustomDataListTable: () => import('@/components/table/CustomDataListTable.vue'),
		PaginationContainer: () => import('@/components/common/PaginationContainer.vue')
	},

	computed: {
		...mapState({
			filters: state => state.maintenance_categories.filters
			// plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.$t('Work_Order_Type'),
				mult: this.$t('Work_Order_Types'),
				instanceName: 'maintenance_categories'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_work_order_type']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_work_order_type']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_work_order_type']),

		tableSettings() {
			let actions = [
				/*{
				name: 'handleShowInfo',
				type: 'success',
				icon: 'icomoon icon-eye',
				tooltip_text: 'Info'
			}*/
			];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return Object.freeze({
				columns: [
					{
						prop: 'name',
						label: 'Name',
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					}
				],
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'maintenance_categories/fetch_maintenance_categories',
			delete_item: 'maintenance_categories/delete_maintenance_category',
			set_filters: 'maintenance_categories/set_maintenance_categories_filters'
		})
	}
};
</script>
