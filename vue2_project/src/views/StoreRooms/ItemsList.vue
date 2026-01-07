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
			filters: state => state.store_rooms.filters,
			plantsList: state => state.global.globalPlantsList
		}),

		itemsName() {
			return {
				one: this.$t('Storeroom'),
				mult: this.$t('StoreRooms'),
				instanceName: 'store_rooms'
			};
		},

		hasAccesToCreate: that => that.$hasAccessTo(['create_storerooms']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_storerooms']),
		hasAccesToDelete: that => that.$hasAccessTo(['delete_storerooms']),

		tableSettings() {
			let actions = [];

			if (this.$hasAccessTo(['view_storerooms'])) {
				actions.push({
					name: 'handleShowBrandModels',
					type: 'success',
					icon: 'icomoon icon-eye',
					tooltip_text: 'Storerooms'
				});
			}

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return Object.freeze({
				columns: this.$translate([
					{
						prop: 'name',
						label: 'Name',
						sortable: true
					},
					{
						prop: 'plant_id',
						label: 'Plant',
						meta: {
							getItemValue: { prop: 'name', list: this.plantsList }
						}
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
			fetch_items: 'store_rooms/fetch_store_rooms',
			delete_item: 'store_rooms/delete_store_room',

			set_filters: 'store_rooms/set_store_rooms_filters'
		}),

		handleShowBrandModels({ row }) {
			this.changeRoute({ path: `/store-rooms/${row.id}/items` });
		}
	}
};
</script>
