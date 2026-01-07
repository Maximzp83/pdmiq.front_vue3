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
			filters: state => state.equipment_types.filters
		}),

		itemsName() {
			return {
				one: `${this.$t('Item_Types')} ${this.$t('Category')}`,
				mult: `${this.$t('Item_Types')} ${this.$t('Categories')}`,
				instanceName: 'equipment_types'
			};
		},

		hasAccesToCreate: that =>
			that.$hasAccessTo(['create_equipment_types_categories']),
		hasAccesToEdit: that => that.$hasAccessTo(['edit_equipment_types_categories']),
		hasAccesToDelete: that =>
			that.$hasAccessTo(['delete_equipment_types_categories']),

		tableSettings() {
			let actions = [];

			if (this.hasAccesToEdit) {
				actions.push(standardTableOperations.edit);
			}
			if (this.hasAccesToDelete) {
				actions.push(standardTableOperations.delete);
			}

			return {
				columns: [
					{
						prop: 'name',
						label: this.tt('Name'),
						sortable: true
						// meta: { isButton: true, eventName: 'handleShowInfo' }
					}
				],
				operations: {
					actions: this.$translate(actions, { key: 'tooltip_text' })
				}
			};
		}
	},

	methods: {
		...mapActions({
			fetch_items: 'equipment_types_categories/fetch_equipment_types_categories',
			delete_item: 'equipment_types_categories/delete_equipment_type_category',
			set_filters:
				'equipment_types_categories/set_equipment_types_categories_filters'
		})
	}
};
</script>
