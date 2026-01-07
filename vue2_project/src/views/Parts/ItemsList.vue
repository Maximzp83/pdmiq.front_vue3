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
			filters: state => state.parts.filters,
			plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.$t('Part'),
				mult: this.$t('Parts'),
				instanceName: 'parts'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_misc_parts']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_misc_parts']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_misc_parts']),

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'part_number',
						label: 'Part_number',
						sortable: true
					},
					{
						prop: 'plant_id',
						label: 'Plant',
						min_width: 120,
						meta: {
							getItemValue: { prop: 'name', list: this.plantsList }
						}
					},
					{
						prop: 'type',
						label: 'Type',
						sortable: true
					},
					{
						prop: 'description',
						label: 'Description',
						min_width: 170
					},
					{
						prop: 'price',
						label: 'Price',
						width: 80,
						sortable: true
					},
					{
						prop: 'stock_quantity',
						label: 'Stock_Quantity',
						width: 90,
						sortable: true
					}
				]),
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			});
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'parts/fetch_parts',
			delete_item: 'parts/delete_part',
			set_filters: 'parts/set_parts_filters'
		})
	}
};
</script>
